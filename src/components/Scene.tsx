import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { EffectComposer, Outline, Select, Selection, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { Project } from '../lib/projects';

// One floating object per section. Overview: the focused object is the centered hero,
// the other two recede as background "planets" (stacked vertically on mobile). Clicking
// ANY object zooms it to the hero slot AND opens its section — the model slides to a
// left slot while a content panel slides in on the right (full overlay on mobile).
// Clicking empty space, Esc, or "← back" returns to overview. Section open/close also
// syncs the URL (/about, /physical, /digital) so sections are deep-linkable.
// See docs/superpowers/specs/2026-06-12-landing-3d-orbit-nav-design.md.
interface SectionDef {
  id: string;
  route: string;
  label: string;
  url: string;
  scale: number;
  orient: [number, number, number];
  spin: number;
  tilt: [number, number];
}

const SECTIONS: SectionDef[] = [
  { id: 'about', route: '/about', label: 'About', url: '/models/ranuelphe.glb', scale: 1.0, orient: [0, 0, -Math.PI / 2], spin: 0.26, tilt: [0.1, -0.05] },
  { id: 'physical', route: '/physical', label: 'Physical projects', url: '/models/radiator.glb', scale: 0.8, orient: [0, 0, 0], spin: 0.5, tilt: [-0.08, 0.13] },
  { id: 'digital', route: '/digital', label: 'Digital projects', url: '/models/cd.glb', scale: 0.84, orient: [Math.PI / 2.4, 0, 0], spin: 0.72, tilt: [0.18, 0.06] },
];

interface Slot {
  position: [number, number, number];
  scale: number;
}
// Desktop slots.
const CENTER: Slot = { position: [0, -0.1, 0.4], scale: 1.7 };
const BG_LEFT: Slot = { position: [-3.9, 0.5, -4.5], scale: 0.48 };
const BG_RIGHT: Slot = { position: [3.9, -0.5, -4.5], scale: 0.48 };
const LEFT_HERO: Slot = { position: [-2.1, -0.1, 0.4], scale: 1.5 }; // centered in the left half (panel takes the right 50%)
const HIDE_LEFT: Slot = { position: [-8, 1.5, -7], scale: 0.05 };
const HIDE_RIGHT: Slot = { position: [8, -1.5, -7], scale: 0.05 };
// Mobile slots — the background pair sits below the hero (x-spread would run off a narrow screen).
const M_CENTER: Slot = { position: [0, 0.35, 0], scale: 0.95 };
const M_BG_LEFT: Slot = { position: [-0.72, -1.45, -0.5], scale: 0.4 };
const M_BG_RIGHT: Slot = { position: [0.72, -1.45, -0.5], scale: 0.4 };

const IRON = new THREE.MeshStandardMaterial({ color: '#86888d', metalness: 0.82, roughness: 0.5, envMapIntensity: 1.6 });
const BRASS = new THREE.MeshStandardMaterial({ color: '#9c8348', metalness: 0.9, roughness: 0.45, envMapIntensity: 1.6 });
// The statue ignores the environment map so it keeps the dramatic, directional lighting.
const STATUE = new THREE.MeshStandardMaterial({ color: '#73726d', roughness: 0.8, metalness: 0.07, flatShading: true, envMapIntensity: 0 });

function applyMaterials(root: THREE.Object3D, id: string) {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    if (id === 'about') {
      mesh.material = STATUE;
    } else if (id === 'physical') {
      const name = `${mesh.name} ${mesh.parent?.name ?? ''}`;
      mesh.material = /brass/i.test(name) ? BRASS : IRON;
    } else if (id === 'digital') {
      const mat = mesh.material as THREE.MeshStandardMaterial | undefined;
      if (/foil|metal/i.test(mesh.name)) {
        mesh.material = new THREE.MeshPhysicalMaterial({
          map: mat?.map ?? null,
          metalness: 1,
          roughness: 0.1,
          iridescence: 1,
          iridescenceIOR: 1.32,
          iridescenceThicknessRange: [120, 520],
          envMapIntensity: 3.2,
        });
      } else if (mat) {
        mat.envMapIntensity = 1.3;
        if (mat.roughness != null) mat.roughness = Math.min(mat.roughness, 0.35);
      }
    }
  });
}

const _pos = new THREE.Vector3();
const _scale = new THREE.Vector3();

function Model({ def, slot, isFocused, isHovered, index, onSelect, onHover }: { def: SectionDef; slot: Slot; isFocused: boolean; isHovered: boolean; index: number; onSelect: (id: string) => void; onHover: (id: string | null) => void }) {
  const { scene } = useGLTF(def.url);
  const grp = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const placed = useRef(false);

  const { obj, center, norm } = useMemo(() => {
    const root = scene.clone(true);
    applyMaterials(root, def.id);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const norm = 2 / Math.max(size.x, size.y, size.z);
    return { obj: root, center, norm };
  }, [scene, def.id]);

  useFrame((state, dt) => {
    const g = grp.current;
    if (!g) return;
    const ts = slot.scale * def.scale;
    if (!placed.current) {
      g.position.set(slot.position[0], slot.position[1], slot.position[2]);
      g.scale.setScalar(ts);
      placed.current = true;
    } else {
      const k = 1 - Math.pow(0.0016, Math.min(dt, 0.05));
      g.position.lerp(_pos.set(slot.position[0], slot.position[1], slot.position[2]), k);
      g.scale.lerp(_scale.set(ts, ts, ts), k);
    }
    const s = spin.current;
    if (s) {
      s.rotation.y += dt * def.spin * (isFocused ? 0.85 : 1);
      const t = state.clock.elapsedTime;
      const wob = 0.4 + index * 0.18;
      const ph = index * 2.1;
      s.rotation.x = def.tilt[0] + 0.07 * Math.sin(t * wob + ph);
      s.rotation.z = def.tilt[1] + 0.06 * Math.sin(t * wob * 0.8 + ph * 1.4);
    }
  });

  return (
    <group
      ref={grp}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(def.id);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
        document.body.style.cursor = '';
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(def.id);
      }}
    >
      <Select enabled={isHovered}>
        <group ref={spin}>
          <group scale={norm} rotation={def.orient}>
            <group position={[-center.x, -center.y, -center.z]}>
              <primitive object={obj} />
            </group>
          </group>
        </group>
      </Select>
    </group>
  );
}

function StudioEnv() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.3;
    return () => {
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

const EXPERIENCE = [
  {
    org: 'Postscript',
    roles: [
      { title: 'Senior Engineering Manager', dates: 'Apr 2025 – Present' },
      { title: 'Engineering Manager', dates: 'Jul 2022 – Apr 2025' },
      { title: 'Staff Software Engineer', dates: 'Mar 2021 – Jul 2022' },
    ],
  },
  {
    org: 'Robin',
    roles: [
      { title: 'Senior Software Engineer', dates: 'Apr 2019 – Mar 2021' },
      { title: 'Software Engineer', dates: 'May 2018 – Apr 2019' },
    ],
  },
  { org: 'Alley', roles: [{ title: 'Front End Engineer', dates: 'Jun 2017 – May 2018' }] },
  { org: 'Capital One', roles: [{ title: 'Front End Engineer', dates: 'May 2015 – Jun 2017' }] },
];

const EDUCATION = {
  school: 'Virginia Commonwealth University',
  detail: 'Bachelor of Fine Arts (BFA), Sculpture & Extended Media',
  dates: '2010 – 2015',
};

function PanelBody({ id, projects }: { id: string; projects: Project[] }) {
  if (id === 'about') {
    return (
      <>
        <p>Engineer and engineering manager with a sculpture degree — currently Senior Engineering Manager at Postscript.</p>
        <p className="about-links">
          <a href="https://github.com/jerrywalters" target="_blank" rel="noreferrer">
            GitHub
          </a>{' '}
          ·{' '}
          <a href="https://www.linkedin.com/in/jerrydwalters/" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </p>
        <div className="resume">
          <h3 className="resume-h">Experience</h3>
          {EXPERIENCE.map((g) => (
            <div className="resume-group" key={g.org}>
              <div className="resume-org">{g.org}</div>
              <div className={g.roles.length > 1 ? 'resume-roles has-rail' : 'resume-roles'}>
                {g.roles.map((r) => (
                  <div className="resume-role" key={r.title}>
                    <span className="resume-title">{r.title}</span>
                    <span className="resume-dates">{r.dates}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <h3 className="resume-h">Education</h3>
          <div className="resume-group">
            <div className="resume-org">{EDUCATION.school}</div>
            <div className="resume-role">
              <span className="resume-title">{EDUCATION.detail}</span>
              <span className="resume-dates">{EDUCATION.dates}</span>
            </div>
          </div>
        </div>
      </>
    );
  }
  if (id === 'physical') {
    return <p>Physical builds — a grid of things made by hand. Images get added here over time.</p>;
  }
  return (
    <>
      <ul className="proj-list">
        {projects.map((p) => (
          <li key={p.slug}>
            <a href={`/${p.slug}/`}>
              <span className="proj-title">{p.title}</span>
              {p.blurb && <span className="proj-blurb">{p.blurb}</span>}
            </a>
          </li>
        ))}
      </ul>
      <a className="proj-all" href="/projects">Browse all projects →</a>
    </>
  );
}

SECTIONS.forEach((s) => useGLTF.preload(s.url));

const idFromPath = (path: string): string | null => SECTIONS.find((s) => s.route === path)?.id ?? null;
const pushUrl = (id: string | null) => {
  const path = id ? (SECTIONS.find((s) => s.id === id)?.route ?? '/') : '/';
  if (window.location.pathname !== path) window.history.pushState(null, '', path);
};

export default function Scene({ projects = [], initialSection }: { projects?: Project[]; initialSection?: string }) {
  const [focused, setFocused] = useState(initialSection ?? 'about');
  const [hovered, setHovered] = useState<string | null>(null);
  const [open, setOpen] = useState(!!initialSection);
  const [isMobile, setIsMobile] = useState(false);

  const others = SECTIONS.filter((s) => s.id !== focused);
  const focusedDef = SECTIONS.find((s) => s.id === focused)!;

  const slotOf = (id: string): Slot => {
    const isLeft = others[0]?.id === id;
    if (id === focused) {
      if (open) return isMobile ? M_CENTER : LEFT_HERO;
      return isMobile ? M_CENTER : CENTER;
    }
    if (open) return isLeft ? HIDE_LEFT : HIDE_RIGHT;
    if (isMobile) return isLeft ? M_BG_LEFT : M_BG_RIGHT;
    return isLeft ? BG_LEFT : BG_RIGHT;
  };

  const openSection = (id: string) => {
    setFocused(id);
    setOpen(true);
    pushUrl(id);
  };
  const closeSection = () => {
    setOpen(false);
    pushUrl(null);
  };

  // Let global chrome (site-name / bottom link) react to the panel being open.
  useEffect(() => {
    document.documentElement.dataset.panel = open ? 'open' : '';
  }, [open]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 700px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSection();
    };
    const onPop = () => {
      const id = idFromPath(window.location.pathname);
      if (id) {
        setFocused(id);
        setOpen(true);
      } else {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  return (
    <>
      <Canvas
        camera={{ position: [0, 0, 9], fov: 34 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        style={{ width: '100%', height: '100%' }}
        onPointerMissed={() => {
          if (open) closeSection();
        }}
      >
        <Selection>
          <StudioEnv />
          <ambientLight intensity={0.04} />
          <directionalLight position={[-7, 4, 2]} intensity={2.0} />
          <directionalLight position={[6, 1, -2]} intensity={0.25} color="#9bb4d6" />

          <Suspense fallback={null}>
            {SECTIONS.map((def, i) => (
              <Model
                key={def.id}
                def={def}
                index={i}
                slot={slotOf(def.id)}
                isFocused={focused === def.id}
                isHovered={hovered === def.id}
                onSelect={openSection}
                onHover={setHovered}
              />
            ))}
          </Suspense>

          <EffectComposer autoClear={false} multisampling={4}>
            <Outline blur edgeStrength={6} pulseSpeed={0} visibleEdgeColor={0xcf9bf0} hiddenEdgeColor={0x4a2f63} xRay={false} />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          </EffectComposer>
        </Selection>
      </Canvas>

      <aside className="section-panel" data-open={open} aria-hidden={!open}>
        <button className="section-back" type="button" onClick={closeSection}>
          ← back
        </button>
        <h2>{focusedDef.label}</h2>
        <PanelBody id={focused} projects={projects} />
      </aside>
    </>
  );
}
