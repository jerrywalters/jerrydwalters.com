import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// One floating object per section. The focused one is the centered, zoomed hero; the
// other two recede as smaller background "planets". Clicking a background object brings
// it to center. See docs/superpowers/specs/2026-06-12-landing-3d-orbit-nav-design.md.
interface SectionDef {
  id: string;
  route: string;
  label: string;
  url: string;
  scale: number; // per-model fine-tune on top of the slot scale
  orient: [number, number, number]; // base "stand it up" orientation
  spin: number; // base Y spin speed (rad/s)
  tilt: [number, number]; // resting lean on x / z, so each spins at its own angle
}

const SECTIONS: SectionDef[] = [
  { id: 'about', route: '/about', label: 'About', url: '/models/ranuelphe.glb', scale: 1.0, orient: [0, 0, -Math.PI / 2], spin: 0.26, tilt: [0.1, -0.05] },
  { id: 'physical', route: '/physical', label: 'Physical projects', url: '/models/radiator.glb', scale: 1.0, orient: [0, 0, 0], spin: 0.5, tilt: [-0.08, 0.13] },
  { id: 'digital', route: '/digital', label: 'Digital projects', url: '/models/cd.glb', scale: 1.05, orient: [Math.PI / 2.4, 0, 0], spin: 0.72, tilt: [0.18, 0.06] },
];

// Layout slots. CENTER = focused hero; the other two recede with depth on the x-axis.
interface Slot {
  position: [number, number, number];
  scale: number;
}
const CENTER: Slot = { position: [0, -0.1, 0.4], scale: 1.7 };
const BG_LEFT: Slot = { position: [-3.9, 0.5, -4.5], scale: 0.48 };
const BG_RIGHT: Slot = { position: [3.9, -0.5, -4.5], scale: 0.48 };

const IRON = new THREE.MeshStandardMaterial({ color: '#86888d', metalness: 0.82, roughness: 0.5, envMapIntensity: 1.6 });
const BRASS = new THREE.MeshStandardMaterial({ color: '#9c8348', metalness: 0.9, roughness: 0.45, envMapIntensity: 1.6 });
// The statue ignores the environment map (envMapIntensity 0) so it keeps the original
// dramatic, directional lighting instead of the flat image-based wash.
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
        // The reflective data side: sharp metal + thin-film iridescence = CD shimmer.
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

function Model({ def, slot, isFocused, index, onSelect }: { def: SectionDef; slot: Slot; isFocused: boolean; index: number; onSelect: (id: string) => void }) {
  const { scene } = useGLTF(def.url);
  const grp = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const placed = useRef(false);

  const { obj, center, norm } = useMemo(() => {
    const root = scene.clone(true);
    applyMaterials(root, def.id);
    // Auto-normalize: recenter + scale longest axis to ~2 units, so any source size works.
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
      // Start already arranged — no fly-in on load.
      g.position.set(slot.position[0], slot.position[1], slot.position[2]);
      g.scale.setScalar(ts);
      placed.current = true;
    } else {
      // Ease position + scale toward the current slot on focus change.
      const k = 1 - Math.pow(0.0016, Math.min(dt, 0.05));
      g.position.lerp(_pos.set(slot.position[0], slot.position[1], slot.position[2]), k);
      g.scale.lerp(_scale.set(ts, ts, ts), k);
    }
    const s = spin.current;
    if (s) {
      s.rotation.y += dt * def.spin * (isFocused ? 0.85 : 1);
      // Per-object resting tilt + a slow, phase-offset wobble so none spin alike.
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
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = '';
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(def.id);
      }}
    >
      <group ref={spin}>
        <group scale={norm} rotation={def.orient}>
          <group position={[-center.x, -center.y, -center.z]}>
            <primitive object={obj} />
          </group>
        </group>
      </group>
    </group>
  );
}

// No-network studio environment so the metals and the CD foil reflect (the statue opts out).
function StudioEnv() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.3; // reflections only — let the side key light carry the drama
    return () => {
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

SECTIONS.forEach((s) => useGLTF.preload(s.url));

export default function Scene() {
  const [focused, setFocused] = useState('about');
  const others = SECTIONS.filter((s) => s.id !== focused);
  const slotOf = (id: string): Slot => {
    if (id === focused) return CENTER;
    return others[0]?.id === id ? BG_LEFT : BG_RIGHT;
  };

  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 34 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ width: '100%', height: '100%' }}
    >
      <StudioEnv />
      <ambientLight intensity={0.14} />
      {/* Key light rakes in from the upper-left side, not from the camera. */}
      <directionalLight position={[-7, 4, 2]} intensity={2.9} />
      {/* Subtle cool fill from the opposite side so shadows aren't pure black. */}
      <directionalLight position={[6, 1, -2]} intensity={0.35} color="#9bb4d6" />

      <Suspense fallback={null}>
        {SECTIONS.map((def, i) => (
          <Model key={def.id} def={def} index={i} slot={slotOf(def.id)} isFocused={focused === def.id} onSelect={setFocused} />
        ))}
      </Suspense>
    </Canvas>
  );
}
