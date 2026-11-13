import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [".next/**", "node_modules/**", "public/**", "drizzle/**", "next-env.d.ts"],
  },
  {
    rules: {
      // Formatting was never enforced (this config didn't load) and the code
      // mixes styles, so these stay off until a formatter is chosen.
      "semi": "off",
      "quotes": "off",
      // React Compiler checks from eslint-plugin-react-hooks v6: warnings for now.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
      "arrow-spacing": ["error", { "before": true, "after": true }],
      "no-console": "warn",
      "react/jsx-no-undef": "off",
      "@next/next/no-sync-scripts": "off",
      "@next/next/no-img-element": "off",
      "react-hooks/exhaustive-deps": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-unused-vars": "off"
    },
  },
];

export default eslintConfig;
