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
// better-auth — server
// ---------------------------------------------------------------------------
declare module "better-auth" {
  export function betterAuth(config?: any): any;
  export type BetterAuthOptions = any;
}

declare module "better-auth/adapters/drizzle" {
  export function drizzleAdapter(db: any, schema: any): any;
}

declare module "better-auth/plugins" {
  export const admin: any;
  export const bearer: any;
  export const apiKey: any;
  export const twoFactor: any;
  export const username: any;
  export const magicLink: any;
  export const emailOTP: any;
  export const phoneNumber: any;
  export const anonymous: any;
  export const multiSession: any;
  export const organization: any;
}

declare module "better-auth/next-js" {
  export function nextCookies(): any;
  export function toNextJsHandler(auth: any): any;
}

declare module "better-auth/crypto" {
  export function generateId(length?: number): string;
  export function generateSecret(length?: number): string;
  export function hashPassword(password: string): Promise<string>;
  export function verifyPassword(password: string, hash: string): Promise<boolean>;
}

// ---------------------------------------------------------------------------
// better-auth — client
// ---------------------------------------------------------------------------
declare module "better-auth/react" {
  export function createAuthClient(config?: any): any;
  export type AuthClient = any;
}

declare module "better-auth/client/plugins" {
  export const adminClient: any;
  export const polarClient: any;
}

// ---------------------------------------------------------------------------
// @polar-sh/better-auth
// ---------------------------------------------------------------------------
declare module "@polar-sh/better-auth" {
  export const polar: any;
  export const checkout: any;
  export const portal: any;
  export const webhooks: any;
  export const polarClient: any;
}

// ---------------------------------------------------------------------------
// @polar-sh/nextjs
// ---------------------------------------------------------------------------
declare module "@polar-sh/nextjs" {
  export function Webhooks(config: any): any;
}
