import * as THREE from 'three';
import { EYE_HEIGHT } from '../tuning';

/** First-person, fixed-position camera pitched down at the floor; aim = yaw only. */
export class CameraRig {
  readonly camera: THREE.PerspectiveCamera;
  private yaw = 0;

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(58, aspect, 0.1, 100);
    this.camera.position.set(0, EYE_HEIGHT, -0.15);
    this.apply();
  }

  setYaw(yaw: number) { this.yaw = yaw; this.apply(); }

  resize(aspect: number) { this.camera.aspect = aspect; this.camera.updateProjectionMatrix(); }

  private apply() {
    const dist = 3;
    const tx = Math.sin(this.yaw) * dist;
    const tz = Math.cos(this.yaw) * dist + this.camera.position.z;
    this.camera.lookAt(tx, 0.2, tz);
  }
}
