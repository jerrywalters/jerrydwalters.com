import * as THREE from 'three';
import type { Vec3 } from '../sim/types';

const AIM_COLOR = '#7fe3ff';

/** A preview of where the stream will go: a polyline arc + a ring on the floor at the
 * predicted landing point. Updated each frame from the current pressure/aim while charging. */
export class TrajectoryView {
  readonly group = new THREE.Group();
  private readonly maxPts: number;
  private readonly positions: Float32Array;
  private readonly geom: THREE.BufferGeometry;
  private readonly line: THREE.Line;
  private readonly ring: THREE.Mesh;

  constructor(maxPts = 96) {
    this.maxPts = maxPts;
    this.positions = new Float32Array(maxPts * 3);
    this.geom = new THREE.BufferGeometry();
    this.geom.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geom.setDrawRange(0, 0);
    this.line = new THREE.Line(
      this.geom,
      new THREE.LineBasicMaterial({ color: AIM_COLOR, transparent: true, opacity: 0.55 }),
    );
    this.line.frustumCulled = false;
    this.group.add(this.line);

    this.ring = new THREE.Mesh(
      new THREE.RingGeometry(0.13, 0.18, 28),
      new THREE.MeshBasicMaterial({ color: AIM_COLOR, transparent: true, opacity: 0.7, side: THREE.DoubleSide }),
    );
    this.ring.rotation.x = -Math.PI / 2;
    this.group.add(this.ring);

    this.group.visible = false;
  }

  /** points[0] = nozzle, points[last] = landing on the floor. */
  update(points: Vec3[]) {
    const n = Math.min(points.length, this.maxPts);
    for (let i = 0; i < n; i++) {
      this.positions[i * 3] = points[i].x;
      this.positions[i * 3 + 1] = points[i].y;
      this.positions[i * 3 + 2] = points[i].z;
    }
    (this.geom.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    this.geom.setDrawRange(0, n);
    const last = points[points.length - 1];
    this.ring.position.set(last.x, 0.02, last.z);
  }

  setVisible(v: boolean) {
    this.group.visible = v;
  }

  dispose() {
    this.geom.dispose();
    (this.line.material as THREE.Material).dispose();
    this.ring.geometry.dispose();
    (this.ring.material as THREE.Material).dispose();
  }
}
