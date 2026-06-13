import type { PressureInput, PressureState } from './types';
import {
  CHARGE_TIME, FLOW_PRESSURE_DECAY, OVERCHARGE_THRESHOLD, OVERCHARGE_FUSE,
  PANIC_TIME, CLENCH_TIME,
} from '../tuning';

export function initialPressure(): PressureState {
  return { phase: 'idle', pressure: 0, overchargeTimer: 0, clenchTimer: 0, clenchFrom: 0, panicTimer: 0 };
}

/** True when liquid should be emitted (flowing or mid-clench). */
export function isFlowing(s: PressureState): boolean {
  return s.phase === 'flowing' || s.phase === 'clenching';
}

export function stepPressure(s: PressureState, input: PressureInput, dt: number): PressureState {
  // Work on a copy so callers can diff prev vs next.
  const n: PressureState = { ...s };
  if (n.panicTimer > 0) n.panicTimer = Math.max(0, n.panicTimer - dt);

  switch (n.phase) {
    case 'idle': {
      if (input.pressed) {
        n.phase = 'charging'; n.pressure = 0; n.overchargeTimer = 0;
        // If a press and release coalesce into the same tick (a very fast tap, or a slow
        // frame), honor the release now — otherwise we'd strand in charging with no further
        // input and silently climb to an overcharge panic blast seconds later.
        if (input.released) n.phase = 'flowing';
      }
      break;
    }
    case 'charging': {
      n.pressure = Math.min(1, n.pressure + dt / CHARGE_TIME);
      if (n.pressure >= OVERCHARGE_THRESHOLD) n.overchargeTimer += dt; else n.overchargeTimer = 0;
      if (n.overchargeTimer >= OVERCHARGE_FUSE) {
        // Involuntary full release.
        n.phase = 'flowing'; n.panicTimer = PANIC_TIME;
      } else if (input.released) {
        n.phase = 'flowing';
      }
      break;
    }
    case 'flowing': {
      n.pressure = Math.max(0, n.pressure - FLOW_PRESSURE_DECAY * dt);
      if (input.pressed) { n.phase = 'clenching'; n.clenchTimer = 0; n.clenchFrom = n.pressure; }
      else if (n.pressure <= 0) { n.phase = 'idle'; }
      break;
    }
    case 'clenching': {
      n.clenchTimer += dt;
      const k = Math.min(1, n.clenchTimer / CLENCH_TIME);
      n.pressure = n.clenchFrom * (1 - k);
      if (n.clenchTimer >= CLENCH_TIME) { n.phase = 'idle'; n.pressure = 0; }
      break;
    }
  }
  return n;
}
