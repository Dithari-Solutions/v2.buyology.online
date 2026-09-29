import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // macOS AppleDouble sidecars. This tree sits on an exFAT volume, so the OS spills extended
    // attributes into a "._Foo.tsx" beside any file it writes. They carry no source, but ._Foo.tsx
    // matches the same glob as Foo.tsx, so `npm run lint` parsed them and reported phantom errors
    // against files that do not exist — 7 extra problems over baseline, from files nobody wrote.
    "**/._*",
  ]),
]);

export default eslintConfig;
