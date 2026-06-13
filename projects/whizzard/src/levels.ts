import type { Container, Rect } from './sim/types';

/** A roomba-style mover: the container oscillates between two XZ points. */
export interface MoverPath { axis: 'x' | 'z'; from: number; to: number; period: number }

export interface Level {
  id: number;
  name: string;
  flavor: string;          // one wizard-flavored line for the intro card
  bladder: number;         // total volume available
  stars: [number, number, number]; // capture-% thresholds for ★, ★★, ★★★ (0..1)
  containers: Container[];
  hazards: Rect[];
  /** Fraction of bladder allowed to land on hazards before the level fails. 0/undefined = any drop fails. */
  hazardTolerance?: number;
  movers: Record<string, MoverPath>; // keyed by container id
}

const cup = (id: string, x: number, z: number, over: Partial<Container> = {}): Container => ({
  id, kind: 'cup', px: x, py: 0, pz: z, rimRadius: 0.16, rimHeight: 0.22, capacity: 40, fill: 0, ...over,
});

export const LEVELS: Level[] = [
  {
    id: 1, name: 'Porcelain 101',
    flavor: 'Every whizzard begins at the throne.',
    bladder: 120, stars: [0.4, 0.65, 0.85], hazards: [], movers: {},
    containers: [{ id: 'toilet', kind: 'toilet', px: 0, py: 0, pz: 1.8, rimRadius: 0.34, rimHeight: 0.42, capacity: 200, fill: 0 }],
  },
  {
    id: 2, name: "World's Best Cup",
    flavor: 'A modest vessel, cruelly off-center.',
    bladder: 100, stars: [0.4, 0.65, 0.85], hazards: [], movers: {},
    containers: [cup('cup', 0.7, 2.6, { capacity: 50 })],
  },
  {
    id: 3, name: 'Das Boot',
    flavor: 'Fill the boot. Do not ask why.',
    bladder: 110, stars: [0.4, 0.65, 0.85], hazards: [], movers: {},
    containers: [{ id: 'boot', kind: 'boot', px: -0.4, py: 0, pz: 5.2, rimRadius: 0.18, rimHeight: 0.5, capacity: 70, fill: 0 }],
  },
  {
    id: 4, name: 'Droop Sweep',
    flavor: 'One charge. Three cups. Ride the decline.',
    bladder: 150, stars: [0.4, 0.6, 0.8], hazards: [], movers: {},
    containers: [cup('c1', -0.5, 4.6), cup('c2', 0.1, 3.2), cup('c3', 0.6, 1.9)],
  },
  {
    id: 5, name: 'The Persian Rug',
    flavor: 'Mind the rug. It tolerates a little. Not a lot.',
    bladder: 110, stars: [0.4, 0.65, 0.85],
    hazards: [{ x0: -1.1, z0: 2.3, x1: 1.1, z1: 4.0 }],
    hazardTolerance: 0.2, // up to 20% of the bladder may hit the rug before it fails
    movers: {},
    containers: [cup('cup', 0, 4.6, { capacity: 45 })],
  },
  {
    id: 6, name: 'Roomba Finale',
    flavor: 'It moves. You must lead it. Good luck, whizzard.',
    bladder: 130, stars: [0.35, 0.55, 0.75], hazards: [],
    movers: { 'roomba': { axis: 'x', from: -1.4, to: 1.4, period: 6 } },
    containers: [cup('roomba', -1.4, 3.4, { kind: 'roomba-cup', rimRadius: 0.17, capacity: 50 })],
  },
];
