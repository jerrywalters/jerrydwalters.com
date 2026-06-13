import { describe, it, expect } from 'vitest';
import { initialPressure, stepPressure, isFlowing } from '../src/sim/pressure';
import type { PressureInput, PressureState } from '../src/sim/types';
import { CHARGE_TIME, FLOW_PRESSURE_DECAY, OVERCHARGE_FUSE, CLENCH_TIME } from '../src/tuning';

const hold: PressureInput = { pressed: false, released: false, held: true };
const idle: PressureInput = { pressed: false, released: false, held: false };
const press: PressureInput = { pressed: true, released: false, held: true };
const release: PressureInput = { pressed: false, released: true, held: false };

function run(s: PressureState, input: PressureInput, seconds: number, dt = 1 / 120) {
  let st = s;
  for (let t = 0; t < seconds; t += dt) st = stepPressure(st, input, dt);
  return st;
}

describe('pressure model', () => {
  it('starts idle at zero pressure', () => {
    const s = initialPressure();
    expect(s.phase).toBe('idle');
    expect(s.pressure).toBe(0);
  });

  it('press starts charging', () => {
    const s = stepPressure(initialPressure(), press, 1 / 120);
    expect(s.phase).toBe('charging');
  });

  it('charges toward 1 over CHARGE_TIME and clamps', () => {
    let s = stepPressure(initialPressure(), press, 1 / 120);
    s = run(s, hold, CHARGE_TIME * 0.5);
    expect(s.pressure).toBeGreaterThan(0.45);
    expect(s.pressure).toBeLessThan(0.55);
    s = run(s, hold, CHARGE_TIME);
    expect(s.pressure).toBe(1);
  });

  it('release transitions charging → flowing', () => {
    let s = stepPressure(initialPressure(), press, 1 / 120);
    s = run(s, hold, 0.5);
    s = stepPressure(s, release, 1 / 120);
    expect(s.phase).toBe('flowing');
    expect(isFlowing(s)).toBe(true);
  });

  it('pressure decays while flowing (the droop)', () => {
    let s = stepPressure(initialPressure(), press, 1 / 120);
    s = run(s, hold, CHARGE_TIME);            // pressure = 1
    s = stepPressure(s, release, 1 / 120);    // flowing
    const before = s.pressure;
    s = run(s, idle, 1.0);
    expect(s.pressure).toBeCloseTo(before - FLOW_PRESSURE_DECAY * 1.0, 1);
  });

  it('flow ends (→ idle) when pressure reaches zero', () => {
    let s = stepPressure(initialPressure(), press, 1 / 120);
    s = run(s, hold, CHARGE_TIME);
    s = stepPressure(s, release, 1 / 120);
    s = run(s, idle, 1 / FLOW_PRESSURE_DECAY + 0.1); // long enough to fully drain
    expect(s.phase).toBe('idle');
    expect(s.pressure).toBe(0);
  });

  it('pressing during flow starts a clench, then returns to idle', () => {
    let s = stepPressure(initialPressure(), press, 1 / 120);
    s = run(s, hold, CHARGE_TIME);
    s = stepPressure(s, release, 1 / 120);    // flowing
    s = stepPressure(s, press, 1 / 120);      // clench begins
    expect(s.phase).toBe('clenching');
    s = run(s, idle, CLENCH_TIME + 0.05);
    expect(s.phase).toBe('idle');
    expect(s.pressure).toBe(0);
  });

  it('overcharge: holding above threshold past the fuse force-releases with panic', () => {
    let s = stepPressure(initialPressure(), press, 1 / 120);
    s = run(s, hold, CHARGE_TIME + OVERCHARGE_FUSE + 0.1); // charge full, keep holding
    expect(s.phase).toBe('flowing');
    expect(s.panicTimer).toBeGreaterThan(0);
  });

  it('a tap (press+release in one tick) does not strand in charging → no panic blast', () => {
    const tap: PressureInput = { pressed: true, released: true, held: false };
    let s = stepPressure(initialPressure(), tap, 1 / 120);
    // The tap must not leave us charging; it resolves to a (negligible) flow that ends.
    expect(s.phase).not.toBe('charging');
    s = run(s, idle, OVERCHARGE_FUSE + CHARGE_TIME + 0.5); // let plenty of time pass
    expect(s.phase).toBe('idle');
    expect(s.panicTimer).toBe(0); // crucially, no delayed overcharge panic
  });
});
