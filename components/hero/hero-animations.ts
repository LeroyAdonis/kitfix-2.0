import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

export interface TearZone {
  x: number;
  y: number;
}

export const TEAR_ZONES: TearZone[] = [
  { x: 318, y: 250 },
  { x: 478, y: 290 },
  { x: 268, y: 370 },
];

export function createScatterPositions(
  count: number,
  width: number,
  height: number
): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < count; i++) {
    positions.push({
      x: Math.random() * width,
      y: Math.random() * height,
    });
  }
  return positions;
}

export function createSwarmPath(
  startX: number,
  startY: number,
  tearZone: TearZone
): Array<{ x: number; y: number }> {
  const midX = (startX + tearZone.x) / 2 + (Math.random() - 0.5) * 80;
  const midY = (startY + tearZone.y) / 2 + (Math.random() - 0.5) * 80;
  return [
    { x: startX, y: startY },
    { x: midX, y: midY },
    { x: tearZone.x + (Math.random() - 0.5) * 20, y: tearZone.y + (Math.random() - 0.5) * 20 },
  ];
}
