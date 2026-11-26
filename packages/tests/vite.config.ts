import { createRequire } from "node:module"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from 'vitest/config'

const repoRoot = fileURLToPath(new URL("../..", import.meta.url))
const requireFromTests = createRequire(import.meta.url)
// 覆盖率 provider 在 monorepo 根目录下解析不到，显式指向 tests 包内的安装
const coveragePkg = requireFromTests.resolve("@vitest/coverage-c8/package.json")
const coverageProvider = join(dirname(coveragePkg), "dist/index.js")

export default defineConfig({
    root: repoRoot,
    resolve: {
        alias: {
            "@gausszhou/litegraph-core": fileURLToPath(new URL("../core/src/index.ts", import.meta.url)),
            "@vitest/coverage-c8": coverageProvider,
        },
    },
    test: {
        include: ["packages/tests/src/main.ts"],
        environment: "jsdom",
        setupFiles: ["packages/tests/src/setup/webaudio.ts"],
        coverage: {
            provider: "c8",
            all: true,
            // 核心路径：图/节点/连接/子图/序列化与工具，不含画布渲染与 UI 层
            include: [
                "packages/core/src/LGraph.ts",
                "packages/core/src/LGraphNode.ts",
                "packages/core/src/LLink.ts",
                "packages/core/src/nodes/Subgraph.ts",
                "packages/core/src/nodes/GraphInput.ts",
                "packages/core/src/nodes/GraphOutput.ts",
                "packages/core/src/utils.ts",
                "packages/core/src/types.ts",
            ],
            exclude: ["**/*.d.ts", "packages/core/src/index.ts"],
            reporter: ["text", "lcov"],
            thresholds: { lines: 70, statements: 70, branches: 60, functions: 66 },
        },
    },
})
