# 示例应用

仓库里有两个可直接运行的应用：一个功能完整的编辑器，一个最小集成示例。它们同时也是示例快照测试的输入——图能不能被加载、序列化是否稳定，都由 `pnpm test` 兜底。

## 完整编辑器 `apps/editor`

```bash
pnpm --filter @litegraph/editor dev
```

编辑器在最小示例之上补齐了这些能力：

- 工具栏：运行/暂停、保存/加载、清空、最大化、小窗预览、live mode 切换；
- 示例下拉框：内置 demo 与 `public/examples/*.json` 都可以一键加载，加载后自动缩放到整张图；
- 本地恢复：关闭页面时自动备份当前图到 `localStorage`，下次打开自动恢复（也可从下拉框手动切回）；
- 节点搜索框：按类型/标题搜索节点，拖到画布即创建；
- 右键菜单、属性面板、widget 交互、框选、对齐吸附、分组；
- 两个编辑器专属插件：`features/*`（插槽/控件/形状等演示节点）与 `circuit/*`（振荡器、LED），在 `apps/editor/src/Editor.ts` 中通过 `LiteGraph.use()` 安装。

### 内置 demo

| 名称 | 内容 |
| --- | --- |
| `Basic1` | 一个常量接一个 watch |
| `Basic2` | 两个常量分别接 watch |
| `Basic3` | 两个常量 + 数学运算 + 三个 watch |
| `Widgets` | 旋钮 → 进度条、开关 → watch、按钮事件 → 日志 |
| `Events` | 定时器 → 计数器 → watch，并记录每次 change 事件 |
| `Audio1` | `audio/source` → `audio/destination` |
| `Audio2` | 音源 + 旋钮 + 分析器 + 可视化 |
| `Audio3` | 在 Audio2 基础上加示波器 |
| `Circuit1` | `circuit/oscillator` → `circuit/led` |

### 内置 JSON 示例

这些文件位于 `apps/editor/public/examples/`，由编辑器通过 `graph.load(url)` 加载：

| 文件 | 内容 |
| --- | --- |
| `features.json` | `features/slots`、`features/widgets`、`features/shape` 等插槽/控件/形状示例 |
| `benchmark.json` | 大量节点与连线的性能基准图 |
| `subgraph.json` | 子图与 `graph/input`、`graph/output` |
| `audio.json` | 较完整的音频处理链 |
| `audio_delay.json` | 延迟节点示例 |
| `audio_reverb.json` | 混响节点示例 |
| `midi_generation.json` | MIDI 生成、量化与播放 |

### live mode

编辑器工具栏右侧的 `LIVE` 按钮切换 `graphCanvas.live_mode`：隐藏网格、节点边框、插槽与标题栏，只保留节点自绘内容。适合把编辑器当作运行时界面使用，例如做音频可视化或参数面板。

## 最小示例 `apps/example-minimal`

```bash
pnpm --filter @litegraph/example-minimal dev
```

`src/main.ts` 只有几十行：引入 core 与 `basic` 节点包、引入样式、创建 `LGraph` 与 `LGraphCanvas`、放一个 `ConstantNumber` 和一个 `Watch`、连线并 `graph.start()`。它演示了：

- 显式引入 `@gausszhou/litegraph-core/style.css`；
- 用类而不是类型字符串创建节点（`LiteGraph.createNode(ConstantNumber)`）；
- 在 `onAfterExecute` 中重绘画布；
- 监听窗口 resize 并调用 `graphCanvas.resize()`。

这份示例也是快照基线之一：测试里按相同方式构造 `ConstantNumber(4.5) → Watch`，断言 2 个节点、1 条连接，并序列化做快照。

## 导入与导出图

编辑器保存出来的就是 `graph.serialize()` 的结果；在任何环境下都可以这样恢复：

```ts
const graph = new LGraph();
graph.configure(JSON.parse(json));
```

加载一个包含未知节点类型的图不会抛异常：`configure()` 会返回 `true`，并用错误节点替换缺失的节点。想提前发现缺包，可以检查返回值：

```ts
if (graph.configure(data)) {
  console.warn("图里有未注册的节点类型，请安装对应节点包");
}
```

## 示例快照回归

`packages/tests/src/ExamplesSnapshotTests.ts` 把示例纳入自动化回归，覆盖 17 个用例：

- `apps/editor/public/examples/*.json` 中的全部 JSON：`configure()` 返回 `false`、节点数量与文件一致、序列化 → 再 `configure()` → 再序列化的结果深相等；
- `apps/editor/src/demos.ts` 中的 9 个函数式 demo：构建后节点数 > 0 且序列化稳定；
- 最小示例基线：`ConstantNumber(4.5) → Watch`。

```bash
pnpm test          # 全量
pnpm --filter @gausszhou/litegraph-tests test
```

快照文件在 `packages/tests/src/__snapshots__/main.ts.snap`。**只有在确认序列化格式的变更是有意为之**时才更新快照：

```bash
pnpm --filter @gausszhou/litegraph-tests exec vitest run -u
```

新增示例的步骤：

1. 把图 JSON 放进 `apps/editor/public/examples/`；
2. 在 `apps/editor/src/main.ts` 的 `addDemo(...)` 列表里注册；
3. 如果用到编辑器专属节点（`features/*`、`circuit/*`），确认对应插件已在 `Editor.ts` 中安装；
4. 跑 `pnpm test`，首次会为新增文件生成快照；再跑一次确认稳定后提交快照。
