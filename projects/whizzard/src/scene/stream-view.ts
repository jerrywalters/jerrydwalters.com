import * as THREE from 'three';
import { DropletPool } from '../sim/pool';

const DROP_GEO = new THREE.SphereGeometry(0.018, 6, 5);
const DROP_MAT = new THREE.MeshStandardMaterial({ color: '#f0d24e', roughness: 0.25, emissive: new THREE.Color('#4a3a00'), emissiveIntensity: 0.4 });
const PUDDLE_GEO = new THREE.CircleGeometry(1, 20);
const PUDDLE_MAT = new THREE.MeshStandardMaterial({ color: '#b89a2e', roughness: 0.2, transparent: true, opacity: 0.55 });

interface Puddle { mesh: THREE.Mesh; x: number; z: number; r: number }

/** Renders the live droplet pool as a single InstancedMesh, plus growing floor puddles. */
export class StreamView {
  readonly group = new THREE.Group();
  private mesh: THREE.InstancedMesh;
  private dummy = new THREE.Object3D();
  private puddles: Puddle[] = [];

  constructor(cap: number) {
    this.mesh = new THREE.InstancedMesh(DROP_GEO, DROP_MAT, cap);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.group.add(this.mesh);
  }

  /** Write one instance matrix per alive droplet; hide the rest by setting count. */
  sync(pool: DropletPool) {
    let n = 0;
    const drops = pool.droplets;
    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      if (!d.alive) continue;
      this.dummy.position.set(d.px, d.py, d.pz);
      this.dummy.scale.setScalar(d.scale);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(n++, this.dummy.matrix);
    }
    this.mesh.count = n;
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  /** Grow a nearby puddle or spawn a new one at a floor spill point. */
  addPuddle(x: number, z: number, volume: number) {
    const grow = Math.min(0.05, volume * 0.01);
    for (const p of this.puddles) {
      if ((p.x - x) ** 2 + (p.z - z) ** 2 < p.r * p.r) {
        p.r = Math.min(0.6, p.r + grow);
        p.mesh.scale.setScalar(p.r);
        return;
      }
    }
    if (this.puddles.length > 80) return; // hard cap
    const mesh = new THREE.Mesh(PUDDLE_GEO, PUDDLE_MAT);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, 0.002, z);
    const r = 0.06 + grow;
    mesh.scale.setScalar(r);
    this.group.add(mesh);
    this.puddles.push({ mesh, x, z, r });
  }

  /** Remove all puddles (called on level (re)load). */
  clearPuddles() {
    for (const p of this.puddles) this.group.remove(p.mesh);
    this.puddles.length = 0;
  }

  dispose() {
    DROP_GEO.dispose();
    PUDDLE_GEO.dispose();
    this.mesh.dispose();
  }
}
