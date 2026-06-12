import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_URL = '/models/ranuelphe.glb';

// Tweakables — change these to recolor / resize / reorient the model.
const COLOR = '#b5793a'; // statue bronze
const SCALE = 1.55;
const ORIENT: [number, number, number] = [0, 0, Math.PI / 2]; // stand the model upright

function Model() {
  const spin = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_URL);

  // Clone the loaded scene and give every mesh one material we control.
  const model = useMemo(() => {
    const root = scene.clone(true);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(COLOR),
      roughness: 0.5,
      metalness: 0.45,
    });
    root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) mesh.material = mat;
    });
    return root;
  }, [scene]);

  useFrame((_, delta) => {
    if (spin.current) spin.current.rotation.y += delta * 0.5;
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
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 3]} intensity={1.5} />
      <directionalLight position={[-5, 2, -3]} intensity={0.5} />

      <Suspense fallback={null}>
        <Model />
      </Suspense>

      <ContactShadows position={[0, -1.6, 0]} opacity={0.32} scale={8} blur={2.6} far={4} />

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
