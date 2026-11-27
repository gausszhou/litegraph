# 路线图

本文档记录 LiteGraph 的发布计划、各阶段的交付物与验收标准。路线图随进展更新，完成一项勾选一项。

现状速览：v0.1~v0.3 已完成，工程基线、类型收紧与测试门槛都已闭环；v0.4 已完成：文档站重写为面向本仓库的中英双语站点，API 与节点目录改为源码生成，示例纳入快照回归。剩下的是功能补齐（v0.5）与正式发布（v1.0）。

| 版本 | 主题 | 关键交付 |
| --- | --- | --- |
| 0.1 | 工程基线 | 可发布产物、CI、锁文件、LICENSE、体积基线 |
| 0.2 | 类型与 API | 开启 strict、SDK 化入口（CSS/全局解耦）、导出面收敛 |
| 0.3 | 测试与稳定 | 核心与节点契约测试、交互测试、覆盖率门槛 |
| 0.4 | 文档与示例 | 面向本仓库重写文档、API 文档、节点目录、贡献指南 |
| 0.5 | 功能补齐 | 触屏交互、撤销/重做、WebGL 渲染、i18n、自动布局 |
| 1.0 | 首个正式版 | 语义化版本发布、迁移指南、性能基线 |

## v0.1 工程基线

- [x] 补充 `LICENSE`（MIT）。
- [x] 提交 `pnpm-lock.yaml`；用 `onlyBuiltDependencies` 放行 esbuild 安装脚本，保证本地与 CI 一致。
- [x] 修正包元数据：`author` / `homepage` / `bugs` / `repository` 指向本仓库，并补 `description` / `keywords` / `sideEffects`。
- [x] 打通发布链路：源码内 `main` / `types` 指向 `src`（便于 workspace 开发），发布时由 `publishConfig` 切到 `dist`；补 `exports` / `files`。
- [x] 产出类型声明：每个包构建时用 `tsc --emitDeclarationOnly` 生成 `.d.ts`。
- [x] 样式产物：core 入口不再隐式引入 CSS，构建时复制为 `dist/litegraph.css`，通过 `style.css` 子路径导入。
- [x] 节点包补充 UMD 产物：core 以 `window.litegraph` 全局外置，`pnpm verify-umd` 在 VM 中校验 10 个包共享同一个 LiteGraph 实例。
- [x] 接入 GitHub Actions（`.github/workflows/ci.yml`）：lint + typecheck + test + build + 体积报告 + UMD 冒烟 + `pnpm pack` 产物校验。
- [x] `pnpm size` 输出各产物 gzip 体积，CI 中执行。
- [x] ~~Demo 资源瘦身~~：2026-11 决定不做。`apps/editor/public/demodata` 约 10 MB 仍保留在仓库——GitHub Pages 不解析 LFS 指针，外置托管/构建注入的收益不足以抵消改动成本。

**验收**：干净 clone 下 `pnpm install && pnpm build && pnpm test` 全绿；`pnpm verify-pack` 校验全部 tarball；已在独立 Vite 工程中验证 core / nodes-basic / 聚合包的 import、类型与 CSS。

## v0.2 类型与 API 稳定

- [x] 清理 `packages/core/src/index.ts` 中的自引用导出（`export * from "./index"`）。
- [x] 解除入口对 CSS 与 `window` 的强绑定：CSS 改为显式 `style.css` 入口；浏览器全局仅在 `typeof window !== "undefined"` 时挂载，Node / vitest 可直接 `import`。
- [x] 节点包改为从 core 包根导入（不再依赖 `@gausszhou/litegraph-core/src/*` 深路径），core 的 `exports` 只暴露根入口与样式。
- [x] 去掉编辑器里与 core 重复且已分叉的样式副本，editor 改为引用 `@gausszhou/litegraph-core/style.css`。
- [x] core 开启 `noImplicitAny` / `noImplicitThis` / `strictBindCallApply` / `alwaysStrict` / `strictFunctionTypes` / `useUnknownInCatchVariables`，清理了 245 处隐式 `any`、`Function`/`Boolean` 包装类型与事件处理函数签名。
- [x] 全部库包与两个 app 均已开启同一组 flag，`tsc --noEmit` 在 10 个节点包、聚合包与 app 上全部通过。
- [x] 开启 `strictNullChecks`。采用「基线 + 棘轮」：`pnpm nullcheck` 以 `nullcheck-baseline.json` 为闸门，先禁止新增问题，再按文件清理存量；core 529 处、节点包 73 处已全部清零，基线归零并覆盖全部包。
- [x] 开启 `strictPropertyInitialization`，并把各包统一为 `"strict": true`；未在构造器内赋值的字段使用明确赋值断言或补上初始化。
- [x] 接入 ESLint 10 flat config（`eslint.config.mjs`）+ `typescript-eslint`，CI 执行 `pnpm lint`；`var` / `prefer-const` / `any` 等历史写法暂时关闭，保留 `no-undef` / `no-fallthrough` / `valid-typeof` 为 error。
- [x] 重构 `LGraphCanvas` 的 mixin 写法：移除 42 个手写包装方法与 `implements` 子句，改为「类 + interface 声明合并 + `applyMixins` 复制原型方法」，并补了原型表面回归测试。

**验收**：各包 `tsc --noEmit --strict` 通过（含 `strictNullChecks`，`pnpm nullcheck` 基线归零）；Node 脚本中仅 import core 即可序列化/反序列化图，不出现 `window is not defined`。

## v0.3 测试与稳定

- [x] `LGraph`：连接/断开、删除节点/链接、序列化往返、执行顺序、`_version` 变更、图输入输出与分组。
- [x] `LGraphNode`：插槽增删与移动、widget/属性序列化、属性变更回调、clone、数据传递与连接回调。
- [x] 修复 `SubgraphTests` 中带 `XXX data not changed` 的待定断言（明确为「类型变更保留已写入数据」并移除标记）。
- [x] 节点包契约测试：10 个包安装后逐一验证节点注册、创建与 serialize/configure 往返（共 95 种节点）。
- [x] 交互测试（jsdom + pointer 事件）：选中、拖拽节点、连线、缩放、右键菜单。
- [x] 统一测试入口：移除 core 中无依赖的 `jest` 脚本，测试统一走 `packages/tests` 的 vitest（`pnpm test`，非 watch 模式）。
- [x] CI 覆盖率门槛：`pnpm test:coverage` 统计核心路径（LGraph/LGraphNode/LLink/Subgraph/GraphInput/GraphOutput/utils/types），行/语句 ≥ 70%、分支 ≥ 60%、函数 ≥ 66%，当前行覆盖 71.26%（244 个用例）。

**验收**：核心路径覆盖率 ≥ 70%（`pnpm test:coverage` 门槛生效），无 `XXX` 待定断言、无用例跳过；节点契约覆盖全部 10 个包。

## v0.4 文档与示例

- [x] 按本仓库重写 `docs/`：以「core + 可插拔节点包 + 示例应用」为主线，覆盖 pnpm/workspace 用法、Vite 集成、按需引入与 UMD；清除上游 `litegraph.js` / `tamats.com` 的安装与 Demo 外链。站点提供简体中文与 English 两套页面（`docs/` 与 `docs/en/`），导航、侧边栏、搜索与页脚均本地化。
- [x] 由源码生成 API 文档：接入 Typedoc + `typedoc-plugin-markdown`（`typedoc.json`），从 `packages/core/src/index.ts` 生成 `docs/api/` 与 `docs/en/api/`（两份内容相同，供语言切换），`pnpm docs:api` 可重跑；产物不提交，构建时生成。
- [x] 节点目录页：`scripts/gen-node-catalog.mjs` 用 TypeScript AST 从各 `install.ts` 与 core 内建节点提取 95 个节点（类型、标题、说明、输入/输出/控件/属性、源码链接），生成中英文 `docs/nodes/*.md`；`pnpm docs:nodes:check` 在 CI 校验生成物是否与源码一致。
- [x] 示例页与回归：`apps/editor` 的 10 个内置 demo 与 `public/examples/*.json` 全部纳入加载快照测试，另以 `apps/example-minimal` 的 ConstantNumber → Watch 作为最小示例基线；共 18 个用例，校验无缺失节点、节点数量、序列化往返稳定并固化快照；另有 `pnpm demo:smoke` 用无头 Chrome 逐个加载示例，校验画布非空白、节点/连线存在且无控制台错误。
- [x] 贡献指南 + 节点模板：`docs/guide/contributing.md` 说明分层约定、测试与文档流程；`scripts/new-node.mjs`（`pnpm new-node <pack> <Class>`）生成节点类并自动补 `install.ts` 注册与 `index.ts` 导出，支持 `--dry-run`。

**验收**：`pnpm docs:build` 在干净 clone 下通过（节点目录 + API 文档 + VitePress 双语站点）；新人按文档 10 分钟内跑通最小示例并写出一个自定义节点；`pnpm docs:nodes:check` 保证节点目录不漂移。

## v0.5 功能补齐

- [ ] 触屏/移动端：`LGraphCanvas` 中 touch 事件整段被注释，目前只走 pointer 映射，需补齐手势与长按菜单。
- [ ] 撤销/重做：core 只有 `beforeChange` / `afterChange` 钩子，没有历史栈，提供可选的历史管理器（增删节点、连线、属性修改）。
- [ ] WebGL 渲染：`enableWebGL()` 仍为空实现。
- [ ] 多语言：节点标题、右键菜单、属性面板的 i18n。
- [ ] 自动布局：节点自动重排。
- [ ] 样式主题化：CSS 变量化，并清理 core 与 editor 之间的样式重复。

**验收**：移动端浏览器可完成建图；撤销/重做覆盖三类操作；主题切换生效。

## v1.0 首个正式版

- [ ] 版本管理：changesets + CHANGELOG + 语义化版本。
- [ ] npm 发布 core / 各节点包 / 聚合包，demo 与文档按同一版本部署。
- [ ] 迁移指南：从 `jagenjo/litegraph.js` 与 `litegraph.ts` 迁移到本仓库包名与 API。
- [ ] 性能基线：千节点图的渲染 FPS、执行耗时、序列化耗时报告。

**验收**：外部工程 `npm install` 后约 5 行代码出图；文档、demo 与 npm 包版本一致。
