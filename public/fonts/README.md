# Local website fonts

Raleway and Geist Mono are redistributed under their adjacent SIL Open Font License files.
The variable fonts were subset to Latin, Latin Extended (including Azerbaijani), punctuation, and currency symbols on 16 October 2026 using fontTools 4.60.2 and Brotli 1.2.0. Family and PostScript names were changed to Buyology Sans Latin / Buyology Mono Latin to respect reserved font names. Original copyrights and license metadata are retained. Arabic uses the existing system-font fallback.

- `raleway-latin-variable.woff2`: 65948 bytes; source SHA-256 `8bbcc3eb8275c388f4bcd998832f8a4b943eadbaf6a595205312774b5951aefb`. Source: https://github.com/google/fonts/tree/main/ofl/raleway.
- `geistmono-latin-variable.woff2`: 28112 bytes; source SHA-256 `d00e590b8eb3a59acc329b2d044fd143ae935090b7da33199ebee27cc7de8196`. Source: https://github.com/google/fonts/tree/main/ofl/geistmono.

The application serves these committed WOFF2 files through next/font/local; deployment does not fetch fonts or need Python tools.
