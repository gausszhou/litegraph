import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

// 分阶段收紧：当前先把「能自动修的 JS 时代写法」降为 off/warn，
// 保留真正可能导致运行时问题的规则为 error，后续版本再逐步收紧。
export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "docs/.vitepress/cache/**",
      "docs/.vitepress/dist/**",
      "apps/editor/public/**",
      "packages/core/nodes_data/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // 历史代码仍是 var / function 风格，待类型收紧后再统一迁移
      "no-var": "off",
      "prefer-const": "off",
      "prefer-rest-params": "off",
      "prefer-spread": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-explicit-any": "off",
      // 泛型里用 `{}` 表示「无额外选项」是既有约定，等类型参数收敛后再启用
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { args: "none", caughtErrors: "none", varsIgnorePattern: "^_" },
      ],
      "no-useless-assignment": "warn",
      "no-empty": ["warn", { allowEmptyCatch: true }],
    },
  },
);
