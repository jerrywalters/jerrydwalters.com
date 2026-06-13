import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// One floating object per section. The focused one sits centered & zoomed (the hero);
// the other two hang back as smaller "planets" with x-spread + z-depth. Clicking a
// background object brings it to center. See the design spec (2026-06-12).
interface SectionDef {
  id: string;
  route: string;
  label: string;
  url: string;
  scale: number; // per-model fine-tune on top of the slot scale
  orient: [number, number, number];
}

const SECTIONS: SectionDef[] = [
  { id: 'about', route: '/about', label: 'About', url: '/models/ranuelphe.glb', scale: 1.0, orient: [0, 0, -Math.PI / 2] },
  { id: 'physical', route: '/physical', label: 'Physical projects', url: '/models/radiator.glb', scale: 1.0, orient: [0, 0, 0] },
  { id: 'digital', route: '/digital', label: 'Digital projects', url: '/models/cd.glb', scale: 1.05, orient: [Math.PI / 2.4, 0, 0] },
];

// Layout slots. CENTER = focused hero; the other two recede with depth on the x-axis.
interface Slot {
  position: [number, number, number];
  scale: number;
}
const CENTER: Slot = { position: [0, -0.1, 0.4], scale: 1.7 };
const BG_LEFT: Slot = { position: [-3.9, 0.5, -4.5], scale: 0.48 };
const BG_RIGHT: Slot = { position: [3.9, -0.5, -4.5], scale: 0.48 };

// Materials applied in-scene. Iron/brass + statue signed off 2026-06-12; the CD keeps
// its own textures and gets a true thin-film iridescent foil for the rainbow shimmer.
const IRON = new THREE.MeshStandardMaterial({ color: '#86888d', metalness: 0.82, roughness: 0.5 });
const BRASS = new THREE.MeshStandardMaterial({ color: '#9c8348', metalness: 0.9, roughness: 0.45 });
const STATUE = new THREE.MeshStandardMaterial({ color: '#73726d', roughness: 0.8, metalness: 0.07, flatShading: true });

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
          envMapIntensity: 1.9,
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

function Model({ def, slot, isFocused, onSelect }: { def: SectionDef; slot: Slot; isFocused: boolean; onSelect: (id: string) => void }) {
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

  useFrame((_, dt) => {
    const g = grp.current;
    if (!g) return;
    const ts = slot.scale * def.scale;
    if (!placed.current) {
      // Start already arranged — no fly-in on load.
      g.position.set(slot.position[0], slot.position[1], slot.position[2]);
      g.scale.setScalar(ts);
      placed.current = true;
    } else {
      // Ease position + scale toward the current slot on focus change (framerate-independent).
      const k = 1 - Math.pow(0.0016, Math.min(dt, 0.05));
      g.position.lerp(_pos.set(slot.position[0], slot.position[1], slot.position[2]), k);
      g.scale.lerp(_scale.set(ts, ts, ts), k);
    }
    if (spin.current) spin.current.rotation.y += dt * (isFocused ? 0.35 : 0.5);
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

// No-network studio environment so the metals and the CD foil actually reflect.
function StudioEnv() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
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
      <ambientLight intensity={0.3} />
      <directionalLight position={[4, 6, 3]} intensity={1.6} />
      <directionalLight position={[-5, 2, -3]} intensity={0.5} color="#9bb4d6" />

      <Suspense fallback={null}>
        {SECTIONS.map((def) => (
          <Model key={def.id} def={def} slot={slotOf(def.id)} isFocused={focused === def.id} onSelect={setFocused} />
        ))}
      </Suspense>
    </Canvas>
  );
}
