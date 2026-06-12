import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

/**
 * A plunger, modeled from primitives — no asset files:
 *  - the rubber suction cup is a LatheGeometry (a 2D bell profile revolved 360°)
 *  - the handle is a turned cylinder with a rounded cap
 * It spins about its own axis; drag to orbit the view.
 */
function Plunger() {
  const group = useRef<THREE.Group>(null);

  // Profile of the cup, from the wide bottom rim up to the narrow neck.
  // Each point is (radius, height); revolving it makes the bell shape.
  const cupProfile = useMemo(
    () =>
      (
        [
          [1.02, 0.0],
          [1.0, 0.1],
          [0.92, 0.28],
          [0.8, 0.45],
          [0.64, 0.6],
          [0.46, 0.73],
          [0.32, 0.85],
          [0.26, 0.97],
        ] as const
      ).map(([r, y]) => new THREE.Vector2(r, y)),
    []
  );

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.6;
  });

  return (
    <group ref={group} position={[0, -1.25, 0]} rotation={[0, 0, 0.06]}>
      {/* rubber suction cup */}
      <mesh>
        <latheGeometry args={[cupProfile, 72]} />
        <meshStandardMaterial
          color="#c0392b"
          roughness={0.55}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* wooden handle */}
      <mesh position={[0, 1.85, 0]}>
        <cylinderGeometry args={[0.11, 0.13, 1.9, 28]} />
        <meshStandardMaterial color="#9a6a3a" roughness={0.85} />
      </mesh>

      {/* rounded handle cap */}
      <mesh position={[0, 2.82, 0]}>
        <sphereGeometry args={[0.13, 28, 28]} />
        <meshStandardMaterial color="#86592f" roughness={0.85} />
      </mesh>
    </group>
  );
}

export default function Scene() {
  return (
    <Canvas
      camera={{ position: [2.2, 1.0, 8.5], fov: 30 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 3]} intensity={1.5} />
      <directionalLight position={[-5, 2, -3]} intensity={0.5} />

      <Plunger />

      <ContactShadows
        position={[0, -1.3, 0]}
        opacity={0.35}
        scale={7}
        blur={2.6}
        far={3.2}
      />

      <OrbitControls
        target={[0, 0.2, 0]}
        enablePan={false}
        enableZoom={false}
        minPolarAngle={0.4}
        maxPolarAngle={Math.PI / 1.9}
      />
    </Canvas>
  );
}
