// Convex functions run in a Node-like runtime; the convex/ tsconfig doesn't
// include node types, so declare `process` here for the typechecker.
declare const process: {
  env: Record<string, string | undefined>;
  [key: string]: unknown;
};
