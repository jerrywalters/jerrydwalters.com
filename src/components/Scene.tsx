import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_URL = '/models/ranuelphe.glb';

// Tweakables — change these to recolor / resize / reorient the model.
const COLOR = '#73726d'; // space-rock grey
const SCALE = 1.55;
const ORIENT: [number, number, number] = [0, 0, -Math.PI / 2]; // stand it upright

function Model() {
  const spin = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_URL);

  // Clone the loaded scene and give every mesh one material we control.
  const model = useMemo(() => {
    const root = scene.clone(true);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(COLOR),
      roughness: 0.95,
      metalness: 0.04,
      flatShading: true, // hard facets → reads as rough rock
    });
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) mesh.material = mat;
    });
    return root;
  }, [scene]);

  // Mostly-horizontal spin, with a slow multi-frequency tumble so it drifts
  // off-axis over time — like a statue adrift in space.
  useFrame((state, delta) => {
    const g = spin.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.rotation.y += delta * 0.4; // primary horizontal spin
    g.rotation.x = 0.22 * Math.sin(t * 0.11) + 0.12 * Math.sin(t * 0.27 + 1.3);
    g.rotation.z = 0.2 * Math.sin(t * 0.09 + 2.1) + 0.1 * Math.sin(t * 0.23 + 0.5);
  });

  return (
    <group ref={spin}>
      <group rotation={ORIENT} scale={SCALE}>
        <primitive object={model} />
      </group>
    </group>
  );
}

useGLTF.preload(MODEL_URL);

export default function Scene() {
  return (
    <Canvas
      camera={{ position: [2.2, 1.0, 8.5], fov: 30 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 3]} intensity={1.6} />
      <directionalLight position={[-5, 2, -3]} intensity={0.4} color="#9bb4d6" />

      <Suspense fallback={null}>
        <Model />
      </Suspense>

      <OrbitControls
        target={[0, 0, 0]}
        enablePan={false}
        enableZoom={false}
        minPolarAngle={0.4}
        maxPolarAngle={Math.PI / 1.9}
      />
    </Canvas>
  );
}
