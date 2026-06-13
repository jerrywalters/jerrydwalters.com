import * as THREE from 'three';
import type { Container } from '../sim/types';
import type { Level } from '../levels';

const PORCELAIN = () => new THREE.MeshStandardMaterial({ color: '#cfd2d8', roughness: 0.4, metalness: 0, side: THREE.DoubleSide });
const LEATHER = () => new THREE.MeshStandardMaterial({ color: '#6b4a2f', roughness: 0.7, side: THREE.DoubleSide });
const ROOMBA = () => new THREE.MeshStandardMaterial({ color: '#2a2a30', roughness: 0.5, metalness: 0.3 });
const LIQUID = () => new THREE.MeshStandardMaterial({ color: '#e9c84a', roughness: 0.3, metalness: 0, emissive: new THREE.Color('#3a2f00'), emissiveIntensity: 0.3 });

interface Entry { root: THREE.Group; fill: THREE.Mesh; innerDepth: number }

/** Procedural meshes for a level's containers, plus the rising liquid fill disc and
 * roomba movement. All positions are world-space; `root` of each container sits at its XZ. */
export class ContainerViews {
  readonly group = new THREE.Group();
  private entries = new Map<string, Entry>();
  private geometries: THREE.BufferGeometry[] = [];
  private materials: THREE.Material[] = [];

  /** Track a material so it's disposed on level reload (factories make one per container). */
  private mat<T extends THREE.Material>(m: T): T {
    this.materials.push(m);
    return m;
  }

  constructor(level: Level) {
    for (const c of level.containers) {
      const root = new THREE.Group();
      root.position.set(c.px, 0, c.pz);
      const { body, fill, innerDepth } = this.buildContainer(c);
      root.add(body, fill);
      this.group.add(root);
      this.entries.set(c.id, { root, fill, innerDepth });
    }
  }

  /** Advance movers; writes the new world XZ back into the matching Container. */
  update(containers: Container[], movers: Level['movers'], time: number) {
    for (const [id, path] of Object.entries(movers)) {
      const e = this.entries.get(id);
      const con = containers.find((c) => c.id === id);
      if (!e || !con || path.period <= 0) continue; // period 0 would divide-by-zero → NaN position
      const k = 0.5 - 0.5 * Math.cos((2 * Math.PI * time) / path.period); // smooth ping-pong 0..1
      const p = path.from + (path.to - path.from) * k;
      if (path.axis === 'x') { con.px = p; e.root.position.x = p; }
      else { con.pz = p; e.root.position.z = p; }
    }
  }

  /** Raise each fill disc to match fill/capacity. */
  syncFill(containers: Container[]) {
    for (const con of containers) {
      const e = this.entries.get(con.id);
      if (!e) continue;
      const frac = con.capacity > 0 ? Math.min(1, con.fill / con.capacity) : 0;
      e.fill.visible = frac > 0;
      e.fill.scale.y = Math.max(0.0001, frac);          // base mesh is innerDepth tall
      e.fill.position.y = (frac * e.innerDepth) / 2;
    }
  }

  dispose() {
    for (const g of this.geometries) g.dispose();
    for (const m of this.materials) m.dispose();
    this.geometries.length = 0;
    this.materials.length = 0;
  }

  private buildContainer(c: Container): { body: THREE.Object3D; fill: THREE.Mesh; innerDepth: number } {
    const innerDepth = c.rimHeight;
    // Inset below the narrowest (bottom) inner radius — bodies taper to ~0.7–0.8·rimRadius,
    // so a wider disc would poke through the lower wall when the fill is shallow.
    const fillRadius = c.rimRadius * 0.65;
    let body: THREE.Object3D = new THREE.Group();

    switch (c.kind) {
      case 'cup':
      case 'roomba-cup': {
        const geo = new THREE.CylinderGeometry(c.rimRadius, c.rimRadius * 0.8, c.rimHeight, 24, 1, true);
        this.geometries.push(geo);
        const cup = new THREE.Mesh(geo, this.mat(PORCELAIN()));
        cup.position.y = c.rimHeight / 2;
        if (c.kind === 'roomba-cup') {
          const grp = new THREE.Group();
          const rg = new THREE.CylinderGeometry(c.rimRadius * 2.4, c.rimRadius * 2.4, 0.06, 24);
          this.geometries.push(rg);
          const disc = new THREE.Mesh(rg, this.mat(ROOMBA()));
          disc.position.y = 0.03;
          grp.add(disc, cup);
          body = grp;
        } else {
          body = cup;
        }
        break;
      }
      case 'toilet': {
        const grp = new THREE.Group();
        const bowlGeo = new THREE.CylinderGeometry(c.rimRadius, c.rimRadius * 0.7, c.rimHeight, 24, 1, true);
        const tankGeo = new THREE.BoxGeometry(c.rimRadius * 2.2, c.rimHeight * 1.2, 0.18);
        this.geometries.push(bowlGeo, tankGeo);
        const bowl = new THREE.Mesh(bowlGeo, this.mat(PORCELAIN()));
        bowl.position.y = c.rimHeight / 2;
        const tank = new THREE.Mesh(tankGeo, this.mat(PORCELAIN()));
        tank.position.set(0, c.rimHeight * 0.6, c.rimRadius + 0.09);
        grp.add(bowl, tank);
        body = grp;
        break;
      }
      case 'boot': {
        const grp = new THREE.Group();
        const shaftGeo = new THREE.CylinderGeometry(c.rimRadius, c.rimRadius, c.rimHeight, 20, 1, true);
        const footGeo = new THREE.BoxGeometry(c.rimRadius * 2, c.rimRadius * 1.4, c.rimRadius * 3.2);
        this.geometries.push(shaftGeo, footGeo);
        const shaft = new THREE.Mesh(shaftGeo, this.mat(LEATHER()));
        shaft.position.y = c.rimHeight / 2;
        const foot = new THREE.Mesh(footGeo, this.mat(LEATHER()));
        foot.position.set(0, c.rimRadius * 0.7, c.rimRadius * 1.0);
        grp.add(shaft, foot);
        body = grp;
        break;
      }
    }

    const fillGeo = new THREE.CylinderGeometry(fillRadius, fillRadius, innerDepth, 24);
    this.geometries.push(fillGeo);
    const fill = new THREE.Mesh(fillGeo, this.mat(LIQUID()));
    fill.position.y = innerDepth / 2;
    fill.scale.y = 0.0001;
    fill.visible = false;
    return { body, fill, innerDepth };
  }
}
