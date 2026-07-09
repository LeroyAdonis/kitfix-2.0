import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Allow underscore-prefixed variables for intentional unused (e.g. destructure-to-omit)
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // CI / skill scripts (CommonJS, not part of the app)
    ".github/**",
    // Vercel build output (generated, not source)
    ".vercel/**",
    // E2E test scripts (CommonJS, not part of the app)
    "e2e/*.js",
    "scripts/*.js",
  ]),
]);

export default eslintConfig;
