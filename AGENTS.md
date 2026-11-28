# AGENTS.md

面向在本仓库工作的编码代理。只记录读代码不容易直接得到的约定；完整介绍见 [README.md](README.md)，贡献流程见 [docs/guide/contributing.md](docs/guide/contributing.md)。

## 项目速览

LiteGraph 是基于 Canvas2D 的节点图引擎（TypeScript，pnpm monorepo）：图可编辑、可执行、可序列化为 JSON。仓库同时提供可插拔节点包、示例应用与中英双语文档站。

| 路径 | 职责 | 关键约束 |
| --- | --- | --- |
| `packages/core` | 引擎核心：`LGraph`、`LGraphNode`、`LGraphCanvas`（渲染/UI/事件拆三个文件）、`LLink`、`Subgraph` | 不依赖任何 `nodes-*`；入口不隐式访问 `window`、不引入 CSS |
| `packages/nodes-*` | 10 个节点包，各 `export default install` | 只依赖 core，不互相依赖；样式只在 core |
| `packages/litegraph` | 聚合包：依次 `LiteGraph.use()` 全部节点包并重导出 core | 不写业务逻辑；`sideEffects` 必须保留，避免摇树删掉注册 |
| `apps/editor`、`apps/example-minimal` | Demo 编辑器 / 最小集成示例 | 可依赖聚合包 |
| `packages/tests` | Vitest 测试与示例快照 | 跨包契约测试的位置 |
| `docs` | VitePress 双语站；`docs/nodes/*.md` 由脚本生成 | 改文档要同时改中英两版 |
| `openspec` | 行为契约基线 `specs/`，变更计划放 `changes/` | 见下文 OpenSpec |

## 常用命令

```bash
pnpm install
pnpm --filter @litegraph/editor dev     # 编辑器 Demo
pnpm build                              # 拓扑序构建 packages/* → apps/*
pnpm lint                               # ESLint 10 flat config
pnpm typecheck                          # 各包 tsc --noEmit
pnpm test                               # vitest（含示例快照）
pnpm test:coverage                      # 核心路径覆盖率门槛
pnpm nullcheck                          # strictNullChecks 基线棘轮
pnpm size                               # 产物体积（raw / gzip）
pnpm verify-umd                         # VM 中加载 core 与节点包 UMD
pnpm verify-pack                        # pnpm pack 并校验 tarball
pnpm demo:smoke                         # 无头 Chrome 冒烟（-- --screenshots 存图）
pnpm docs:dev                           # 生成节点目录 + API 后启动文档站
pnpm docs:nodes                         # 重新生成中英文节点目录
pnpm docs:nodes:check                   # 只校验目录是否与源码一致（CI 用）
pnpm new-node math Square --title "Square" --desc "Squares its input"
pnpm spec:list / pnpm spec:validate / pnpm spec:view
```

Node：日常开发 ≥ 18；`pnpm spec:*` 通过 `pnpm dlx` 固定运行 OpenSpec 2.2.0，需要 Node ≥ 22.20。

## 硬性约定

- **分层**：core → nodes-* → 聚合包 → apps。core 不能依赖节点包；节点包不能互相依赖。
- **TypeScript strict**：全部包开启 `strict`；`nullcheck-baseline.json` 只允许收紧，不允许新增条目。
- **生成物**：`docs/nodes/*.md` 由 `scripts/gen-node-catalog.mjs` 生成，不要手改；改了节点源码就运行 `pnpm docs:nodes` 并提交生成结果。`docs/api/` 由 Typedoc 生成且已在 `.gitignore` 中，不提交。
- **锁文件**：依赖变更必须提交 `pnpm-lock.yaml`，不要删除或绕过。
- **提交**：Conventional Commits（`feat:` / `fix:` / `test:` / `docs:` / `chore:` / `ci:`）；一个 PR 做一件事。
- **序列化**：改动序列化格式或示例数据时，先明确兼容性，再更新 `packages/tests/src/__snapshots__` 并说明原因。
- **不要提交**：`dist/`、`docs/api/`、`artifacts/`、`node_modules/`。

## 常见任务

### 新增节点

```bash
pnpm new-node math Square --title "Square" --desc "Squares its input"
pnpm typecheck && pnpm test && pnpm docs:nodes
```

脚手架会创建节点类、在包内 `install.ts` 追加 `registerNodeType` 并在 `index.ts` 导出。节点契约测试会自动发现新注册的类型（创建 + serialize/configure 往返），通常不用单独写用例；有执行逻辑或状态时才补测试。新节点优先用 `static slotLayout` + `override onExecute()` 的写法。

### 修改核心

- 渲染/交互按职责改 `LGraphCanvas_Rendering.ts` / `_UI.ts` / `_Events.ts`，不要往 `LGraphCanvas.ts` 继续堆实现。
- 核心路径受覆盖率门槛约束（行/语句 ≥ 70%、分支 ≥ 60%、函数 ≥ 66%），新增分支要补测试。
- 改公开 API 时检查 `packages/core/src/index.ts` 的导出面，并考虑 `docs`、聚合包与 UMD 的影响。

### 改文档

- 中文在 `docs/guide/`，英文在 `docs/en/guide/`，两版结构保持一致。
- 节点目录页不要手改；只改 `scripts/gen-node-catalog.mjs` 后重新生成。
- 文档站构建：`pnpm docs:build`（会先跑节点目录与 API 生成）。

### OpenSpec（规格驱动）

- `openspec/specs/<capability>/spec.md` 是当前行为基线。改变可观察行为（新节点、API/序列化、交互）应先在 `openspec/changes/<change>/` 写 `proposal.md`、`specs/`、`design.md`、`tasks.md`，实现完成后用 `archive` 合并回基线。
- 纯重构、工具链、文档修正可跳过规格，但需在变更的 `.openspec.yaml` 中写 `skip_specs: true`。
- 规格正文用简体中文，但 `## Requirements` / `### Requirement:` / `#### Scenario:` 与 SHALL/MUST 保持英文（见 `openspec/config.yaml`），否则 `--strict` 校验不过。
- 提交前运行 `pnpm spec:validate`。代理 skills 装在本机即可（`pnpm dlx @fission-ai/openspec@2.2.0 init --scope global --tools dsh`），不提交进仓库。

## CI 与验收

`check` job（Node 20）按顺序跑：`install --frozen-lockfile` → `lint` → `typecheck` → `test` → `test:coverage` → `nullcheck` → `build` → `size` → `demo:smoke` → `verify-umd` → `verify-pack` → `docs:nodes:check` → `docs:build`；另有 `specs` job（Node 22）跑 `pnpm spec:validate`。`master` 上两者全绿后 `deploy` 才发布 `gh-pages`。

## 已知差异与坑

- CSS 不随入口隐式注入：使用方必须 `import "@gausszhou/litegraph-core/style.css"`（聚合包为 `@gausszhou/litegraph/style.css`）。
- 源码态 `main`/`types` 指向 `src`；`pnpm pack`/`publish` 时由 `publishConfig` 切到 `dist`。未构建时 `dist` 不存在是正常现象。
- `verify-umd` 只覆盖 `packages/nodes-*`；聚合包 UMD 未纳入该冒烟。
- README 把 knob/panel 列为 widget 类型；实际它们是 `packages/nodes-widget` 里的节点类，内置 widget 只有 number/slider/combo/string/text/toggle/button。
- Live 模式实现只隐藏分组、连线与节点编辑 UI，并不隐藏网格与画布边框；以 `LGraphCanvas_Rendering.ts` 为准。
- `apps/editor/public/demodata` 约 10 MB，用于 GitHub Pages，不要为瘦身删除。
