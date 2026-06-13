import * as THREE from 'three';
import { buildRoom, buildNozzle } from './scene/room';
import { CameraRig } from './scene/camera';
import { StreamView } from './scene/stream-view';
import { Input } from './input';
import { Hud, loadRecords, saveRecord, type HudCallbacks } from './hud/hud';
import { Game } from './game';
import { LEVELS } from './levels';
import { PARTICLE_CAP } from './tuning';

const app = document.getElementById('app')!;

let renderer: THREE.WebGLRenderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true });
} catch {
  app.innerHTML =
    '<div class="wz-fallback">Whizzard needs WebGL, which your browser has disabled or doesn’t support.</div>';
  throw new Error('whizzard: WebGL unavailable');
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#0a0a0e');
scene.add(buildRoom());
const nozzle = buildNozzle();
scene.add(nozzle);

const rig = new CameraRig(window.innerWidth / window.innerHeight);
const stream = new StreamView(PARTICLE_CAP);
const input = new Input(renderer.domElement);

let game: Game;
let hud: Hud;
let currentLevelId = 1;

const select = (id: number) => {
  currentLevelId = id;
  game.loadLevel(LEVELS[id - 1]);
};

const callbacks: HudCallbacks = {
  onSelectLevel: select,
  onStart: () => game.start(),
  onRetry: () => {
    game.loadLevel(LEVELS[currentLevelId - 1]);
    game.start();
  },
  onNext: () => {
    const next = currentLevelId + 1;
    if (next <= LEVELS.length) select(next);
    else hud.showLevelSelect(loadRecords());
  },
  onMenu: () => hud.showLevelSelect(loadRecords()),
};

hud = new Hud(app, callbacks);
game = new Game({ renderer, scene, rig, stream, nozzle, input, hud });
game.onComplete = (id, stars) => saveRecord(id, stars);

addEventListener('resize', () => {
  rig.resize(window.innerWidth / window.innerHeight);
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Avoid a giant dt spike when the tab regains focus (the loop also clamps internally).
let last = performance.now();
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) last = performance.now();
});

renderer.setAnimationLoop(() => {
  const now = performance.now();
  const dt = (now - last) / 1000;
  last = now;
  game.frame(dt);
});

hud.showLevelSelect(loadRecords());
