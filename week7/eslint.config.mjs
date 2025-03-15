import globals from "globals";
import pluginJs from "@eslint/js";
import prettierConfig from "eslint-config-prettier";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.js"], languageOptions: {sourceType: "commonjs"}},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  {
    rules: {
      // 添加未使用變數警告規則
      'no-unused-vars': ['warn', { 
        vars: 'all', 
        args: 'after-used',
        ignoreRestSiblings: false 
      }]
    }
  },
  prettierConfig
];
