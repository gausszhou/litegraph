# 贡献指南

本文档面向想改代码、加节点或修文档的贡献者。仓库的 CI 会把下面所有检查跑一遍，本地提前跑通可以少走弯路。

## 开发环境

```bash
git clone https://github.com/gausszhou/litegraph.git
cd litegraph
pnpm install
pnpm --filter @litegraph/editor dev
```

- Node.js ≥ 18，pnpm 12；
- 首次安装会按 `pnpm-lock.yaml` 解析依赖，请提交 lockfile 的变更而不是删除它；
- 提交前至少跑 `pnpm lint && pnpm typecheck && pnpm test`。

## 代码分层约定

| 位置 | 约束 |
| --- | --- |
| `packages/core` | 不能依赖任何 `nodes-*` 包；入口不得隐式访问 `window` 或引入 CSS |
| `packages/nodes-*` | 只依赖 core；节点通过 `install(LiteGraph)` 注册；样式只能在 core |
| `packages/litegraph` | 聚合包，只做安装与重新导出，不写业务逻辑 |
| `apps/*` | 可以依赖聚合包；示例应用里的节点插件放各自 `src` 下 |
| `packages/tests` | 跨包测试；不参与发布 |

TypeScript 已开启 `strict`，`pnpm nullcheck` 维护 `nullcheck-baseline.json`：存量问题按文件记录，**不允许新增**。如果修掉了某处，记得同步收紧基线。

## 新增一个节点

### 1. 生成脚手架

```bash
pnpm new-node math Square --title "Square" --desc "Squares its input"
```

脚本会：

1. 创建 `packages/nodes-math/src/Square.ts`（基于 `slotLayout` 的现代写法）；
2. 在 `src/install.ts` 末尾追加 import 与 `registerNodeType({ class, title, desc, type })`；
3. 在 `src/index.ts` 增加 `export { default as Square }`。

默认类型是 `<pack>/<kebab-case 类名>`，可以用 `--type math/square` 覆盖；加 `--dry-run` 只打印不落盘。

### 2. 实现节点

```ts
import { type SlotLayout, type Vector2 } from "@gausszhou/litegraph-core";
import { LGraphNode } from "@gausszhou/litegraph-core";

export default class Square extends LGraphNode {
  static slotLayout: SlotLayout = {
    inputs: [{ name: "in", type: "number" }],
    outputs: [{ name: "out", type: "number" }],
  };

  override size: Vector2 = [140, 30];

  override onExecute() {
    const value = this.getInputData(0);
    if (value == null) return;
    this.setOutputData(0, value * value);
  }
}
```

常用扩展点：

- `static slotLayout` / `static propertyLayout`：声明式定义插槽与可编辑属性；
- `override onExecute()`：每帧执行逻辑；
- `override onDrawForeground(ctx)` / `onDrawBackground(ctx)`：自定义绘制；
- `override onAction(action, param)`：接收事件端口；
- `override onPropertyChanged(name, value)`：属性变更回调；
- `onConnect` / `onDisconnect` / `onAdded` / `onRemoved`：生命周期回调。

老式写法（构造函数里 `this.addInput()`、`Class.title = ...` 的工厂函数）仍然支持，但新节点建议用类 + `slotLayout`。

### 3. 验证

```bash
pnpm typecheck
pnpm test          # NodeContractsTests 会自动发现新注册的类型并做 create/serialize 往返
pnpm docs:nodes    # 重新生成中英文节点目录（必须提交）
```

节点契约测试会遍历每个包新增的注册类型，因此一般不需要为新节点单独写测试；只有行为复杂（执行逻辑、状态机、绘制）时才需要补单元测试。

## 修改核心

核心路径（`LGraph`、`LGraphNode`、`LLink`、`Subgraph`、`GraphInput`、`GraphOutput`、`utils`、`types`）有覆盖率门槛：

```bash
pnpm test:coverage
```

门槛为行/语句 ≥ 70%、分支 ≥ 60%、函数 ≥ 66%。如果新增分支，请补对应测试；如果改了序列化格式，先更新示例快照并说明原因。

测试写法是自定义的 minitest 风格：

```ts
import { expect } from "vitest";
import UnitTest from "./UnitTest";

export default class MyTests extends UnitTest {
  test__category__shouldDoSomething() {
    expect(1 + 1).toBe(2);
  }
}
```

在 `packages/tests/src/testSuite.ts` 中导出类即可被 `main.ts` 注册；方法名里的 `__` 会拆成 describe 分组。

## 文档

文档是**中英双语**的：

| 路径 | 语言 |
| --- | --- |
| `docs/guide/*.md`、`docs/index.md` | 简体中文 |
| `docs/en/guide/*.md`、`docs/en/index.md` | English |
| `docs/nodes/*.md`、`docs/en/nodes/*.md` | 由脚本生成，不要手改 |
| `docs/api/*.md`、`docs/en/api/*.md` | 由 Typedoc 生成，不提交（构建时生成） |

改动文档时请同时更新中英文两版，并保持代码块、链接与表格结构一致。改完跑：

```bash
pnpm docs:build    # 生成节点目录 + API 文档 + VitePress 构建
```

只改节点源码时，记得跑 `pnpm docs:nodes` 并把生成的目录一起提交；CI 的 `pnpm docs:nodes:check` 会校验生成物是否与源码一致。`pnpm docs:api` 会同时生成中英文两份 API 文档（内容相同，供语言切换使用），产物已在 `.gitignore` 中。

## 提交与 PR

- 提交信息使用 Conventional Commits：`feat:` / `fix:` / `test:` / `docs:` / `style:` / `chore:`；
- 一个 PR 只做一件事；格式化/重命名类改动不要和功能改动混在一起；
- PR 描述里写清楚动机、行为变化与验证方式；
- CI 必须全绿：`lint` → `typecheck` → `test` → `test:coverage` → `nullcheck` → `build` → `size` → `verify-umd` → `verify-pack` → `docs:build`。

## 路线图

发布计划与各阶段验收标准见仓库根目录的 [ROADMAP.md](https://github.com/gausszhou/litegraph/blob/master/ROADMAP.md)。当前 v0.1~v0.4 已完成，接下来是 v0.5 功能补齐（触屏、撤销/重做、WebGL、i18n、自动布局）与 v1.0 发布。
