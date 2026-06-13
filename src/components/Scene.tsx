import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// One floating object per section, arranged in a shared orbit. Mapping + materials
// are locked per docs/superpowers/specs/2026-06-12-landing-3d-orbit-nav-design.md.
interface SectionDef {
  id: string;
  route: string;
  label: string;
  url: string;
  scale: number;
  orient: [number, number, number];
  angle: number; // position on the orbit ring (radians)
}

const ORBIT_R = 2.7;
const SECTIONS: SectionDef[] = [
  { id: 'about', route: '/about', label: 'About', url: '/models/ranuelphe.glb', scale: 0.95, orient: [0, 0, -Math.PI / 2], angle: Math.PI / 2 },
  { id: 'physical', route: '/physical', label: 'Physical projects', url: '/models/radiator.glb', scale: 1.0, orient: [0, 0, 0], angle: (Math.PI * 7) / 6 },
  { id: 'digital', route: '/digital', label: 'Digital projects', url: '/models/cd.glb', scale: 1.15, orient: [Math.PI / 2.2, 0, 0], angle: -Math.PI / 6 },
];

// Materials applied in-scene (assets carry geometry only, except the CD which keeps
// its own reflective textures). Signed off 2026-06-12.
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
      // Keep the CD's own textured materials; just let the env map shine through.
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat) mat.envMapIntensity = 1.3;
    }
  });
}

function Model({ def, hovered, setHovered }: { def: SectionDef; hovered: string | null; setHovered: (id: string | null) => void }) {
  const { scene } = useGLTF(def.url);
  const spin = useRef<THREE.Group>(null);

  const { obj, center, norm } = useMemo(() => {
    const root = scene.clone(true);
    applyMaterials(root, def.id);
    // Auto-normalize: recenter + uniform-scale the longest axis to ~2 units, so
    // every source model (whatever its native units) shares a consistent size.
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const norm = 2 / Math.max(size.x, size.y, size.z);
    return { obj: root, center, norm };
  }, [scene, def.id]);

  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.y += dt * 0.4;
  });

  const x = Math.cos(def.angle) * ORBIT_R;
  const y = Math.sin(def.angle) * ORBIT_R * 0.5; // flatten the ring vertically
  const isHover = hovered === def.id;
  const s = def.scale * (isHover ? 1.08 : 1);

  return (
    <group
      position={[x, y, 0]}
      scale={s}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(def.id);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(null);
        document.body.style.cursor = '';
      }}
      onClick={(e) => {
        e.stopPropagation();
        // TODO(section-view): trigger the in-place split view instead of a hard nav.
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

// Generate a no-network studio environment so the metals actually reflect.
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
  const [hovered, setHovered] = useState<string | null>(null);

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
          <Model key={def.id} def={def} hovered={hovered} setHovered={setHovered} />
        ))}
      </Suspense>
    </Canvas>
  );
}
