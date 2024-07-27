import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
    {
        languageOptions: {
            parserOptions: {
                project: true,
            },
            globals: globals.node,
        },
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
        rules: {
          "@typescript-eslint/prefer-for-of": "off",
          "@typescript-eslint/no-unsafe-assignment": "off",
          "@typescript-eslint/no-unsafe-member-access": "off",
          "@typescript-eslint/no-var-requires": "off",
          "@typescript-eslint/no-unsafe-argument": "off",
          "@typescript-eslint/no-unsafe-call": "off",
          "prefer-const": "off"
        }
    },
    {
        ignores: ["*", "!src/"],
    },
];
