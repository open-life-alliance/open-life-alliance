import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  { ignores: [".next/**", "out/**", "node_modules/**", "next-env.d.ts", "public/**"] },
  ...nextVitals,
  ...nextTs,
];

export default config;

