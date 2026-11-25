# 路线图

本文档记录 LiteGraph 的发布计划、各阶段的交付物与验收标准。路线图随进展更新，完成一项勾选一项。

现状速览：代码结构与功能主体已经成型（core 拆分、节点插件化、编辑器与文档站可运行），但「可发布、可验证、可上手」三件事还没闭环——缺少 CI 与锁文件、包元数据与产物未按 npm 规范配置、测试仅覆盖两个套件、文档仍停留在上游 litegraph.js 的用法。

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
- [ ] Demo 资源瘦身：`apps/editor/public/demodata` 约 10 MB（video/webm 4.3 MB、wav/mp3 合计 5 MB）提交在 git 中，迁到 LFS 或外部托管。

**验收**：干净 clone 下 `pnpm install && pnpm build && pnpm test` 全绿；`pnpm verify-pack` 校验全部 tarball；已在独立 Vite 工程中验证 core / nodes-basic / 聚合包的 import、类型与 CSS。

## v0.2 类型与 API 稳定

- [x] 清理 `packages/core/src/index.ts` 中的自引用导出（`export * from "./index"`）。
- [x] 解除入口对 CSS 与 `window` 的强绑定：CSS 改为显式 `style.css` 入口；浏览器全局仅在 `typeof window !== "undefined"` 时挂载，Node / vitest 可直接 `import`。
- [x] 节点包改为从 core 包根导入（不再依赖 `@gausszhou/litegraph-core/src/*` 深路径），core 的 `exports` 只暴露根入口与样式。
- [x] 去掉编辑器里与 core 重复且已分叉的样式副本，editor 改为引用 `@gausszhou/litegraph-core/style.css`。
- [x] core 开启 `noImplicitAny` / `noImplicitThis` / `strictBindCallApply` / `alwaysStrict` / `strictFunctionTypes` / `useUnknownInCatchVariables`，清理了 245 处隐式 `any`、`Function`/`Boolean` 包装类型与事件处理函数签名。
- [x] 全部库包与两个 app 均已开启同一组 flag，`tsc --noEmit` 在 10 个节点包、聚合包与 app 上全部通过。
- [ ] 开启 `strictNullChecks`。采用「基线 + 棘轮」：`pnpm nullcheck` 以 `nullcheck-baseline.json` 为闸门，先禁止新增问题，再按文件清理存量。
  - core 已从 529 降到 305；`LGraphCanvas` 与 `LGraphCanvas_Events` 也已清零，目前只剩 `LGraphCanvas_UI`、`Subgraph`、`LGraphCanvas_Rendering` 三个文件。
  - core 剩余：`LGraphCanvas_UI.ts` 226、`Subgraph.ts` 41、`LGraphCanvas_Rendering.ts` 38。
  - 节点包自身合计 73 处（basic 15、events 18、input 15、strings 12、midi 6、math 5、audio 1、widget 1），待 core 清零后按同样方式推进。
- [ ] 开启 `strictPropertyInitialization`，并把各包统一为 `"strict": true`。
- [x] 接入 ESLint 10 flat config（`eslint.config.mjs`）+ `typescript-eslint`，CI 执行 `pnpm lint`；`var` / `prefer-const` / `any` 等历史写法暂时关闭，保留 `no-undef` / `no-fallthrough` / `valid-typeof` 为 error。
- [ ] 重构 `LGraphCanvas` 的 mixin 写法：当前是「一个类 `implements` 三个类 + `this: LGraphCanvas` 伪类型」，改为正式 mixin 或组合，保证类型安全。

**验收**：各包 `tsc --noEmit --strict` 通过（含 `strictNullChecks`，`pnpm nullcheck` 基线归零）；Node 脚本中仅 import core 即可序列化/反序列化图，不出现 `window is not defined`。

## v0.3 测试与稳定

- [ ] `LGraph`：连接/断开、删除节点、序列化往返、执行顺序与 `_version` 变更。
- [ ] `LGraphNode`：插槽增删、widget 序列化、属性变更回调、clone。
- [ ] 修复 `SubgraphTests` 中带 `XXX data not changed` 的待定断言。
- [ ] 节点包契约测试：每个 `install` 后可创建、可序列化、可反序列化。
- [ ] 交互测试（jsdom + pointer 事件）：选中、拖拽节点、连线、缩放、右键菜单。
- [x] 统一测试入口：移除 core 中无依赖的 `jest` 脚本，测试统一走 `packages/tests` 的 vitest（`pnpm test`，非 watch 模式）。
- [ ] CI 覆盖率门槛。

**验收**：核心路径覆盖率 ≥ 70%，无 `XXX` 待定断言、无用例跳过。

## v0.4 文档与示例

- [ ] 按本仓库重写 `docs/`：包名、pnpm 用法、Vite 集成；清除上游 `litegraph.js` / `tamats.com` 等外链。
- [ ] 由源码生成 API 文档（Typedoc 或 VitePress 插件），覆盖 core 公共 API。
- [ ] 节点目录页：95 个节点的分类清单与参数说明（从各 `install.ts` 提取，避免手工维护）。
- [ ] 示例页与回归：`apps/editor` 的内置 demo 与 `public/examples/*.json` 纳入加载快照测试；`apps/example-minimal` 已恢复样式引入，可一并作为快照基线。
- [ ] 贡献指南 + 新节点模板（脚手架或 plop 生成器）。

**验收**：新人按文档 10 分钟内跑通最小示例，并写出一个自定义节点。

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
