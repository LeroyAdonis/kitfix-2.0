// Minimal type declarations for packages that npm isn't installing correctly.
// The project compiles fine with skipLibCheck: true — this just silences LSP errors.
// This file exists because @types/react doesn't install correctly on this VPS.

declare namespace React {
  type ReactNode = any;
  type ReactElement = any;
  type ReactPortal = any;
  type FC<P = {}> = (props: P) => ReactElement | null;
  type DetailedHTMLProps<E, T> = { children?: ReactNode; [key: string]: any };
  type HTMLAttributes<T> = { [key: string]: any };
  type FormEvent<T = Element> = any;
  type MouseEvent<T = Element> = any;
  type Dispatch<T> = (value: T) => void;
  type SetStateAction<T> = T | ((prev: T) => T);

  function createElement(type: any, props?: any, ...children: any[]): any;
  function useState<T>(initial: T): [T, Dispatch<SetStateAction<T>>];
  function useEffect(fn: () => void | (() => void), deps?: any[]): void;
  function useCallback<T extends Function>(fn: T, deps?: any[]): T;
  function useMemo<T>(fn: () => T, deps?: any[]): T;
  function useRef<T>(initial: T): { current: T };

  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

declare module "react" {
  export = React;
}

declare module "react/jsx-runtime" {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module "next/link" {
  import { ReactNode } from "react";
  interface LinkProps {
    href: string;
    children?: ReactNode;
    className?: string;
    [key: string]: any;
  }
  const Link: (props: LinkProps) => any;
  export default Link;
}

declare module "next/navigation" {
  export function redirect(url: string): never;
  export function useRouter(): { push: (url: string) => void; replace: (url: string) => void; back: () => void };
  export function useParams<T = Record<string, string>>(): T;
  export function usePathname(): string;
}

declare module "next/headers" {
  export function cookies(): Promise<{
    get: (name: string) => { value: string } | undefined;
    set: (name: string, value: string, opts?: any) => void;
    has: (name: string) => boolean;
    delete: (name: string) => void;
  }>;
  export function headers(): Promise<Headers>;
}

declare module "convex/react" {
  export function useQuery(fn: any, args?: any): any;
  export function useMutation(fn: any): any;
  export const ConvexProvider: any;
  export const ConvexReactClient: any;
}

declare module "convex/values" {
  export const v: {
    id: (table: string) => any;
    string: () => any;
    number: () => any;
    boolean: () => any;
    array: (t: any) => any;
    union: (...types: any[]) => any;
    literal: (val: string) => any;
    optional: (t: any) => any;
    object: (shape: Record<string, any>) => any;
  };
}

declare module "convex/server" {
  export function defineSchema(schema: Record<string, any>): any;
  export function defineTable(schema: Record<string, any>): any & {
    index: (name: string, fields: string[]) => any;
  };
}

declare module "@/convex/_generated/server" {
  export const mutation: any;
  export const query: any;
  export const action: any;
}

declare module "@/convex/_generated/api" {
  export const api: any;
}

declare module "@/convex/_generated/dataModel" {
  export type DataModel = any;
}

declare var process: {
  env: Record<string, string | undefined>;
  [key: string]: any;
};

declare module "better-auth" {
  const betterAuth: any;
  export { betterAuth };
  export default betterAuth;
}

declare module "better-auth/minimal" {
  export const betterAuth: any;
}

declare module "better-auth/react" {
  export function createAuthClient(opts?: any): any;
}

declare module "better-auth/client" {
  export function createAuthClient(opts?: any): any;
}

declare module "@convex-dev/better-auth" {
  export function createClient(dataModel: any): any;
  export type GenericCtx<D> = any;
}

declare module "@convex-dev/better-auth/convex.config" {
  const betterAuth: any;
  export default betterAuth;
}

declare module "@convex-dev/better-auth/auth-config" {
  export function getAuthConfigProvider(): any;
}

declare module "@convex-dev/better-auth/plugins" {
  export function convex(opts?: any): any;
}

declare module "@convex-dev/better-auth/react" {
  export const ConvexBetterAuthProvider: any;
}

declare module "@convex-dev/better-auth/nextjs" {
  export function convexBetterAuthNextJs(opts: any): {
    handler: any;
    preloadAuthQuery: any;
    isAuthenticated: any;
    getToken: any;
    fetchAuthQuery: any;
    fetchAuthMutation: any;
    fetchAuthAction: any;
  };
}

declare module "@convex-dev/better-auth/nextjs/client" {
  export function usePreloadedAuthQuery(query: any): any;
}

declare module "@convex-dev/better-auth/client/plugins" {
  export function convexClient(): any;
}
