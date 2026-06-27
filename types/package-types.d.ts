/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Ambient type declarations for packages that export type paths in their
 * package.json but don't ship the actual .d.ts files in the npm tarball.
 *
 * framer-motion v12.34.4  — declares types: dist/types/index.d.ts → not shipped
 * better-auth  v1.5.0     — declares types: ./dist/...d.mts → not shipped
 */
// ---------------------------------------------------------------------------
// framer-motion
// ---------------------------------------------------------------------------
declare module "framer-motion" {
  export const motion: any;
  export const AnimatePresence: any;
  export const useAnimation: any;
  export const useMotionValue: any;
  export const useTransform: any;
  export const useScroll: any;
  export const useSpring: any;
  export const useInView: any;
  export const useReducedMotion: any;
  export const LayoutGroup: any;
  export const Reorder: any;
  export const isValidMotionProp: any;
  export const animate: any;
  export const stagger: any;
  export const delay: any;
  export const spring: any;
  export type Variants = any;
  export type Transition = any;
  export type AnimationControls = any;
  export type TargetAndTransition = any;
  export type MotionProps = any;
  export type MotionStyle = any;
  export type MotionValue<T> = any;
  export function useMotionValueEvent(value: any, event: string, callback: any): void;
  export default any;
}

// ---------------------------------------------------------------------------
// @polar-sh/nextjs
// ---------------------------------------------------------------------------
declare module "@polar-sh/nextjs" {
  export function Webhooks(config: any): any;
}
