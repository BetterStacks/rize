import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "semi": ["error", "never"],
      "quotes": ["error", "single"],
      "arrow-spacing": ["error", { "before": true, "after": true }],
      "no-console": "warn",
      // "indent": ["error", "tab"],
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
