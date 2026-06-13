export interface Intents {
  aimDir: number;             // -1 (left) .. +1 (right) from keys held this frame
  aimAbsolute: number | null; // normalized -1..1 from pointer X this frame, or null
  pressed: boolean;           // charge button rising edge since last read()
  released: boolean;          // charge button falling edge since last read()
  held: boolean;              // charge button currently down
}

type Binding = [EventTarget, string, (e: Event) => void];

/** Collects raw keyboard/mouse/touch and exposes per-frame intents via read(). */
export class Input {
  private left = false;
  private right = false;
  private down = false;
  private pressedEdge = false;
  private releasedEdge = false;
  private pointerX: number | null = null;
  private readonly bindings: Binding[] = [];

  constructor(private target: HTMLElement) {
    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.left = down;
      else if (e.code === 'ArrowRight' || e.code === 'KeyD') this.right = down;
      else if (e.code === 'Space') { this.setCharge(down); e.preventDefault(); }
    };
    this.bind(window, 'keydown', onKey(true) as (e: Event) => void);
    this.bind(window, 'keyup', onKey(false) as (e: Event) => void);
    this.bind(target, 'pointerdown', ((e: PointerEvent) => {
      this.setCharge(true); this.aimFrom(e); target.setPointerCapture?.(e.pointerId);
    }) as (e: Event) => void);
    this.bind(window, 'pointerup', (() => this.setCharge(false)) as (e: Event) => void);
    this.bind(target, 'pointermove', ((e: PointerEvent) => {
      if (e.buttons & 1) this.aimFrom(e);
    }) as (e: Event) => void);
    this.bind(target, 'contextmenu', ((e: Event) => e.preventDefault()));
    // A pointerup may never arrive if a touch gesture is cancelled, capture is lost, or the
    // window loses focus / is hidden mid-charge — release everything so charge can't stick on.
    this.bind(window, 'pointercancel', (() => this.setCharge(false)) as (e: Event) => void);
    this.bind(target, 'lostpointercapture', (() => this.setCharge(false)) as (e: Event) => void);
    this.bind(window, 'blur', (() => this.releaseAll()) as (e: Event) => void);
    this.bind(document, 'visibilitychange', (() => { if (document.hidden) this.releaseAll(); }) as (e: Event) => void);
  }

  /** Drop all held state — used when focus/visibility is lost and key/pointer-up may not fire. */
  private releaseAll() {
    this.left = false;
    this.right = false;
    this.setCharge(false);
  }

  private setCharge(down: boolean) {
    if (down && !this.down) this.pressedEdge = true;
    if (!down && this.down) this.releasedEdge = true;
    this.down = down;
  }

  private aimFrom(e: PointerEvent) {
    const r = this.target.getBoundingClientRect();
    this.pointerX = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
  }

  private bind(t: EventTarget, type: string, fn: (e: Event) => void) {
    t.addEventListener(type, fn, { passive: false });
    this.bindings.push([t, type, fn]);
  }

  /** Returns intents accumulated since the previous call and clears the per-frame edges. */
  read(): Intents {
    const intents: Intents = {
      aimDir: (this.right ? 1 : 0) - (this.left ? 1 : 0),
      aimAbsolute: this.pointerX,
      pressed: this.pressedEdge,
      released: this.releasedEdge,
      held: this.down,
    };
    this.pressedEdge = false;
    this.releasedEdge = false;
    this.pointerX = null;
    return intents;
  }

  dispose() {
    for (const [t, type, fn] of this.bindings) t.removeEventListener(type, fn);
    this.bindings.length = 0;
  }
}
