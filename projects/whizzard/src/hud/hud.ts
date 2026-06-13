import './hud.css';
import { LEVELS } from '../levels';

const STORAGE_KEY = 'whizzard.progress.v1';

export interface HudCallbacks {
  onSelectLevel: (id: number) => void; // a level chosen from the select grid
  onStart: () => void;                 // intro card "Begin"
  onRetry: () => void;                 // results / fail "Retry"
  onNext: () => void;                  // results "Next level"
  onMenu: () => void;                  // results / fail "Menu"
}

/** id → best star count (0..3). */
export function loadRecords(): Record<number, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<number, number>) : {};
  } catch {
    return {};
  }
}

/** Persist a level result, keeping the best star count. Returns the updated records. */
export function saveRecord(id: number, stars: number): Record<number, number> {
  const recs = loadRecords();
  if (!recs[id] || stars > recs[id]) recs[id] = stars;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recs));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
  return recs;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function stars(n: number): string {
  return '★★★'.slice(0, n) + '☆☆☆'.slice(0, 3 - n);
}

function ctl(key: string, desc: string): HTMLDivElement {
  const row = el('div', 'wz-ctl');
  row.append(el('span', 'wz-key', key), el('span', 'wz-cdesc', desc));
  return row;
}

/**
 * DOM overlay: always-on play HUD (bladder, pressure, censor) plus a single-card
 * overlay for level-select / intro / results / fail. Pure presentation — it fires
 * callbacks and never touches game state.
 */
export class Hud {
  private gameLayer: HTMLDivElement;
  private overlay: HTMLDivElement;
  private bladderFill: SVGRectElement;
  private pressure: HTMLDivElement;
  private pressureFill: HTMLDivElement;
  private censor: HTMLDivElement;

  constructor(private root: HTMLElement, private cb: HudCallbacks) {
    this.gameLayer = el('div', 'wz-game');

    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'wz-bladder');
    svg.setAttribute('viewBox', '0 0 40 52');
    svg.setAttribute('aria-label', 'bladder');
    const shape = 'M20 4 C30 4 36 14 36 26 C36 42 28 50 20 50 C12 50 4 42 4 26 C4 14 10 4 20 4 Z';
    svg.innerHTML =
      `<defs><clipPath id="wz-bclip"><path d="${shape}"/></clipPath></defs>` +
      `<rect class="wz-bfill" x="0" y="0" width="40" height="52" fill="#e9c84a" clip-path="url(#wz-bclip)"/>` +
      `<path d="${shape}" fill="none" stroke="#f3f3ef" stroke-width="2"/>`;
    this.gameLayer.appendChild(svg);
    this.bladderFill = svg.querySelector('.wz-bfill') as unknown as SVGRectElement;

    this.pressure = el('div', 'wz-pressure');
    this.pressureFill = el('div', 'wz-pfill');
    this.pressure.appendChild(this.pressureFill);
    this.gameLayer.appendChild(this.pressure);

    this.censor = el('div', 'wz-censor');
    this.gameLayer.appendChild(this.censor);

    // Fixed "how to play" panel, top-left — these are prototypes, so teach the controls inline.
    const controls = el('div', 'wz-controls');
    controls.append(
      el('div', 'wz-ctitle', 'How to play'),
      ctl('Space / click', 'hold to charge, release to fire'),
      ctl('← →  ·  A D', 'aim left / right (or drag)'),
      ctl('Space / click', 'tap while flowing to clench'),
    );
    this.gameLayer.appendChild(controls);

    this.overlay = el('div', 'wz-overlay');

    this.root.appendChild(this.gameLayer);
    this.root.appendChild(this.overlay);
  }

  /** 0..1 bladder remaining; fills from the bottom of the silhouette. */
  setBladder(fraction: number) {
    const h = Math.max(0, Math.min(1, fraction)) * 52;
    this.bladderFill.setAttribute('y', String(52 - h));
    this.bladderFill.setAttribute('height', String(h));
  }

  /** 0..1 pressure; `overcharge` flips the bar into the pulsing red danger zone. */
  setPressure(fraction: number, overcharge: boolean) {
    const f = Math.max(0, Math.min(1, fraction));
    this.pressureFill.style.height = `${Math.round(f * 100)}%`;
    this.pressure.classList.toggle('red', overcharge);
  }

  /** Position the censor blur over the nozzle's current screen rect (pixels). */
  setCensor(left: number, top: number, width: number, height: number) {
    const s = this.censor.style;
    s.left = `${left}px`;
    s.top = `${top}px`;
    s.width = `${width}px`;
    s.height = `${height}px`;
  }

  private showCard(node: HTMLElement) {
    this.overlay.replaceChildren(node);
    this.overlay.classList.add('show');
    this.gameLayer.style.display = 'none';
  }

  /** Leave a card and reveal the play HUD. */
  hideOverlays() {
    this.overlay.classList.remove('show');
    this.overlay.replaceChildren();
    this.gameLayer.style.display = '';
  }

  showLevelSelect(records: Record<number, number>) {
    const card = el('div', 'wz-card');
    card.append(
      el('h1', 'wz-title', 'Whizzard'),
      el('p', 'wz-sub', 'Charge, aim, release. Fill the vessel, spare the floor.'),
    );
    const grid = el('div', 'wz-grid');
    for (const lv of LEVELS) {
      const btn = el('button', 'wz-lvl');
      btn.append(
        el('span', 'wz-lname', `${lv.id}. ${lv.name}`),
        el('span', 'wz-stars', stars(records[lv.id] ?? 0)),
      );
      btn.addEventListener('click', () => this.cb.onSelectLevel(lv.id));
      grid.appendChild(btn);
    }
    card.appendChild(grid);
    this.showCard(card);
  }

  showIntro(name: string, flavor: string, targetPct: number) {
    const card = el('div', 'wz-card');
    const begin = el('button', 'wz-btn wz-primary', 'Begin');
    begin.addEventListener('click', () => this.cb.onStart());
    card.append(
      el('h2', 'wz-title', name),
      el('p', 'wz-flavor', flavor),
      el('p', 'wz-sub', `Capture at least ${Math.round(targetPct * 100)}% to pass.`),
      begin,
    );
    this.showCard(card);
  }

  showResults(capturedPct: number, spilledPct: number, starCount: number) {
    const card = el('div', 'wz-card');
    card.append(
      el('h2', 'wz-title', starCount > 0 ? 'Level clear' : 'Not enough'),
      el('div', 'wz-bigstars', stars(starCount)),
    );

    const bar = el('div', 'wz-splitbar');
    const cap = el('div', 'wz-cap');
    cap.style.width = `${Math.round(Math.min(1, capturedPct) * 100)}%`;
    const spl = el('div', 'wz-spl');
    spl.style.width = `${Math.round(Math.min(1, spilledPct) * 100)}%`;
    bar.append(cap, spl);
    card.append(
      bar,
      el('p', 'wz-sub', `Captured ${Math.round(capturedPct * 100)}% · spilled ${Math.round(spilledPct * 100)}%`),
    );

    const row = el('div', 'wz-row');
    const retry = el('button', 'wz-btn', 'Retry');
    retry.addEventListener('click', () => this.cb.onRetry());
    const menu = el('button', 'wz-btn', 'Menu');
    menu.addEventListener('click', () => this.cb.onMenu());
    row.append(retry, menu);
    if (starCount > 0) {
      const next = el('button', 'wz-btn wz-primary', 'Next');
      next.addEventListener('click', () => this.cb.onNext());
      row.appendChild(next);
    }
    card.appendChild(row);
    this.showCard(card);
  }

  showFail(reason: string) {
    const card = el('div', 'wz-card');
    const retry = el('button', 'wz-btn wz-primary', 'Retry');
    retry.addEventListener('click', () => this.cb.onRetry());
    const menu = el('button', 'wz-btn', 'Menu');
    menu.addEventListener('click', () => this.cb.onMenu());
    const row = el('div', 'wz-row');
    row.append(retry, menu);
    card.append(el('h2', 'wz-title', 'Failed'), el('p', 'wz-flavor', reason), row);
    this.showCard(card);
  }
}
