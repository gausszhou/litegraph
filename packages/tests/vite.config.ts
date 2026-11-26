import { createRequire } from "node:module"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from 'vitest/config'

const packagesRoot = fileURLToPath(new URL("..", import.meta.url))
const repoRoot = fileURLToPath(new URL("../..", import.meta.url))
const requireFromTests = createRequire(import.meta.url)
// 覆盖率 provider 需要在 tests 包内解析（根目录不保证安装）
const coveragePkg = requireFromTests.resolve("@vitest/coverage-c8/package.json")
const coverageProvider = join(dirname(coveragePkg), "dist/index.js")

export default defineConfig({
    root: packagesRoot,
    resolve: {
        alias: {
            // 直接指向源码，保证覆盖率统计覆盖 core 而不是 node_modules 软链
            "@gausszhou/litegraph-core": join(packagesRoot, "core/src/index.ts"),
            "@vitest/coverage-c8": coverageProvider,
        },
    },
    test: {
        // 缓存与报告统一放回仓库根目录，避免在 packages/ 下产生临时目录
        cache: { dir: join(repoRoot, "node_modules/.vitest") },
        include: ["tests/src/main.ts"],
        setupFiles: [
            join(packagesRoot, "tests/src/setup/jsdom-setup.ts"),
            join(packagesRoot, "tests/src/setup/webaudio.ts"),
        ],
        coverage: {
            provider: "c8",
            all: true,
            // 核心路径：图/节点/连接/子图/序列化与工具，不含画布渲染与 UI 层
            include: [
                "core/src/LGraph.ts",
                "core/src/LGraphNode.ts",
                "core/src/LLink.ts",
                "core/src/nodes/Subgraph.ts",
                "core/src/nodes/GraphInput.ts",
                "core/src/nodes/GraphOutput.ts",
                "core/src/utils.ts",
                "core/src/types.ts",
            ],
            exclude: ["**/*.d.ts", "core/src/index.ts"],
            reportsDirectory: join(repoRoot, "coverage"),
            reporter: ["text", "lcov"],
            thresholds: { lines: 70, statements: 70, branches: 60, functions: 66 },
        },
    },
})
