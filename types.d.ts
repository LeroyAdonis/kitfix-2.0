// Minimal type declarations for packages that npm isn't installing correctly.
// The project compiles fine with skipLibCheck: true — this just silences LSP errors.

declare module "react" {
  export = React;
  export as namespace React;
  namespace React {
    type ReactNode = any;
    type ReactElement = any;
    type FormEvent<T = Element> = any;
    type FC<P = {}> = (props: P) => ReactElement | null;
    type ReactPortal = any;
    function createElement(type: any, props?: any, ...children: any[]): any;
    function useState<T>(initial: T): [T, (v: T) => void];
    function useEffect(fn: () => void | (() => void), deps?: any[]): void;
    function useCallback<T extends Function>(fn: T, deps?: any[]): T;
    function useMemo<T>(fn: () => T, deps?: any[]): T;
    namespace JSX {
      interface IntrinsicElements {
        [elemName: string]: any;
      }
    }
  }
  const React: any;
  export default React;
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
