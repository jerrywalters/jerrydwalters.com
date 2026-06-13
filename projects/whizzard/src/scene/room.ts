import * as THREE from 'three';
import { NOZZLE_HEIGHT, NOZZLE_FORWARD, LAUNCH_PITCH_DEG } from '../tuning';

/** The static room: tiled floor, three dark walls, key/fill/ambient lights. */
export function buildRoom(): THREE.Group {
  const g = new THREE.Group();

  const tex = makeGridTexture();
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 16),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, metalness: 0 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = 4;
  g.add(floor);

  const wallMat = new THREE.MeshStandardMaterial({ color: '#15151b', roughness: 1 });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(16, 6), wallMat);
  back.position.set(0, 3, 9); back.rotation.y = Math.PI;
  g.add(back);
  const left = new THREE.Mesh(new THREE.PlaneGeometry(16, 6), wallMat);
  left.position.set(-4, 3, 4); left.rotation.y = Math.PI / 2;
  g.add(left);
  const right = new THREE.Mesh(new THREE.PlaneGeometry(16, 6), wallMat);
  right.position.set(4, 3, 4); right.rotation.y = -Math.PI / 2;
  g.add(right);

  g.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xfff2d8, 1.1); key.position.set(3, 6, 2); g.add(key);
  const fill = new THREE.DirectionalLight(0x9bb4d6, 0.35); fill.position.set(-4, 3, 5); g.add(fill);

  return g;
}

/** A crude "player" nozzle near the camera, low-center of frame. Game rotates the
 * returned object about +Y by the aim yaw so it points where you aim. Sits behind
 * the HUD censor div. */
export function buildNozzle(): THREE.Object3D {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: '#caa3a0', roughness: 0.7 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.22, 4, 8), mat);
  body.rotation.x = Math.PI / 2 - (LAUNCH_PITCH_DEG * Math.PI) / 180; // tilt up at launch pitch
  body.position.set(0, NOZZLE_HEIGHT, NOZZLE_FORWARD);
  g.add(body);
  return g;
}

function makeGridTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#1b1b22';
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = '#2c2c36';
  ctx.lineWidth = 4;
  for (let i = 0; i <= 256; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0); ctx.lineTo(i, 256);
    ctx.moveTo(0, i); ctx.lineTo(256, i);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  return tex;
}
