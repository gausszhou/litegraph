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

- [ ] 补充 `LICENSE`（文档声明 MIT，但仓库内没有该文件）。
- [ ] 提交 `pnpm-lock.yaml`（当前 `.gitignore` 忽略锁文件，依赖版本不可复现）。
- [ ] 修正包元数据：`author` / `homepage` / `bugs` / `repository` 仍指向 `jagenjo/litegraph.js`。
- [ ] 打通发布链路：`main` / `types` 指向 `dist`，补 `exports`、`files`、`sideEffects`，用 `vite-plugin-dts`（devDependencies 已声明但未配置）产出 `.d.ts`。
- [ ] 修正 `files` 中的 CSS 路径（实际位于 `src/css/litegraph.css`）。
- [ ] 接入 GitHub Actions（当前无 `.github`）：lint + `tsc --noEmit` + vitest + build，发布前 `pnpm pack` 冒烟。
- [ ] Demo 资源瘦身：`apps/editor/public/demodata` 约 10 MB（video/webm 4.3 MB、wav/mp3 合计 5 MB）提交在 git 中，迁到 LFS 或外部托管。
- [ ] CI 输出各包 gzip 体积，作为发布说明与 README 的数据来源。

**验收**：干净 clone 下 `pnpm install && pnpm -r build && pnpm -r test` 全绿；任一包 `pnpm pack` 后的 tarball 能被一个 Vite 工程 `import`，类型正常。

## v0.2 类型与 API 稳定

- [ ] 清理 `packages/core/src/index.ts` 中的自引用导出（`export * from "./index"`）。
- [ ] 解除入口对 CSS 与 `window` 的强绑定：`index.ts` 不再 `import "./css/litegraph.css"`，改为显式样式入口；去掉 `(window as any).LiteGraph = LiteGraph` 或加环境守卫，使 Node / jsdom 可直接 `import`。
- [ ] 去掉编辑器里与 core 重复且已分叉的样式副本（`apps/editor/public/css/litegraph.css`）。
- [ ] 逐包开启 `strict` / `strictNullChecks`（core → nodes-*），清理隐式 `any`。
- [ ] 收敛公共 API：明确的 `exports` 子路径（core / nodes-* / css），区分内部与公开类型。
- [ ] 重构 `LGraphCanvas` 的 mixin 写法：当前是「一个类 `implements` 三个类 + `this: LGraphCanvas` 伪类型」，改为正式 mixin 或组合，保证类型安全。

**验收**：`tsc --noEmit --strict` 通过；Node 脚本中仅 import core 即可序列化/反序列化图，不出现 `window is not defined`。

## v0.3 测试与稳定

- [ ] `LGraph`：连接/断开、删除节点、序列化往返、执行顺序与 `_version` 变更。
- [ ] `LGraphNode`：插槽增删、widget 序列化、属性变更回调、clone。
- [ ] 修复 `SubgraphTests` 中带 `XXX data not changed` 的待定断言。
- [ ] 节点包契约测试：每个 `install` 后可创建、可序列化、可反序列化。
- [ ] 交互测试（jsdom + pointer 事件）：选中、拖拽节点、连线、缩放、右键菜单。
- [ ] 统一测试入口：core 的 `test` 脚本仍是 `jest`（未安装也无配置），改用 vitest 并纳入 workspace 统一命令。
- [ ] CI 覆盖率门槛。

**验收**：核心路径覆盖率 ≥ 70%，无 `XXX` 待定断言、无用例跳过。

## v0.4 文档与示例

- [ ] 按本仓库重写 `docs/`：包名、pnpm 用法、Vite 集成；清除上游 `litegraph.js` / `tamats.com` 等外链。
- [ ] 由源码生成 API 文档（Typedoc 或 VitePress 插件），覆盖 core 公共 API。
- [ ] 节点目录页：95 个节点的分类清单与参数说明（从各 `install.ts` 提取，避免手工维护）。
- [ ] 示例页与回归：`apps/editor` 的内置 demo 与 `public/examples/*.json` 纳入加载快照测试；恢复 `apps/example-minimal` 对 CSS 的正常引入（当前被注释）。
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
