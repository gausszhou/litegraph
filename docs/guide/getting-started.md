# Getting Started

以下是使用 LiteGraph 时的有用信息列表。

## Structure 结构

这个库分为四个层级：

- **LGraph**：由节点制成的整个图形的容器
- **LGraphNode**：节点的基类（此库使用是自己的继承系统）
- **LGraphCanvas**：与浏览器中的节点的呈现/交互的类。
  在 SRC /文件夹中还有另一个类：
  **Litegraph.Editor**：Lgraphcanvas 周围的包装器添加了它周围的按钮。

> 三个基本的接口类 挂载在 LiteGraph 上

global.LiteGraph
global.LiteGraph.LGraph
global.LiteGraph.LGraphNode
global.LiteGraph.LGraphCanvas

> 两层 canvas 一层前景用于交互，一层背景用于绘制图像

`canvas.dirty_canvas`, `canvas.dirty_bgcanvas`

## LGraphNode 节点类

**LGraphNode** 是用于所有节点类的基类。
为了扩展其他类，`LGraphNode.prototype` 中包含的所有方法在注册时都会复制到类中。

当你创建一个新的节点类型时，你不必从那个类继承，当节点被注册时，所有的方法都被复制到你的节点原型中。 这是在函数内部`LiteGraph.registerNodeType(...)`完成的

以下是如何创建自己的节点的示例：

```js
//your node constructor class
function MyAddNode() {
  //add some input slots
  this.addInput("A", "number");
  this.addInput("B", "number");
  //add some output slots
  this.addOutput("A+B", "number");
  //add some properties 可编辑属性
  this.properties = { precision: 1 };
}

//name to show on the canvas
MyAddNode.title = "Sum";

//function to call when the node is executed
MyAddNode.prototype.onExecute = function () {
  //retrieve data from inputs
  var A = this.getInputData(0);
  if (A === undefined) A = 0;
  var B = this.getInputData(1);
  if (B === undefined) B = 0;
  //assing data to otputs
  this.setOutputData(0, A + B);
};

//register in the system
LiteGraph.registerNodeType("basic/sum", MyAddNode);
```

## LGraphNode 节点实例设置

每个节点可以定义或修改多个设置：

- **size**: `[width,height` 节点内部区域的大小（不包括标题）。每一行都是 LiteGraph.NODE_SLOT_HEIGHT 像素高度。
- **properties**：包含用户可以配置的属性的对象，并在保存图形时序列化
- **shape**：对象的形状（可以是 LiteGraph.BOX_SHAPE,LiteGraph.ROUND_SHAPE,LiteGraph.CARD_SHAPE）
- **flags**：用户可以更改的标志，序列化时将被存储
  - **collapsed**：如果值为 true 则 node 显示为折叠(small)
- **redraw_on_mouse**：如果鼠标经过小部件，则强制重绘
- **widgets_up**：小部件不在插槽之后启动
- **widgets_start_y**：小部件应该从这个 Y 开始绘制
- **clip_area**：在渲染节点时裁剪内容
- **resizable**：如果可以拖动角调整大小
- **horizontal**：如果插槽应该水平放置在节点的顶部和底部

---

```js
// node 继承自 LGraphNode
{
  flags: Object;
  graph: LGraph;
  id: 1;
  mode: 0;
  order: 0;
  outputs: Array(2);
  pos: Array(2);
  properties: Object;
  properties_info: Array(0);
  shape: undefined;
  size: Float32Array(2);
  title: "摄像头";
  type: "device/camera";
}
```

用户可以定义给`node`几个回调：

- onAdded：添加到图形时调用
- onRemoved：从图形中删除时调用
- onStart：图表开始播放时调用
- onStop：图表停止播放时调用
- onDrawBackground：在画布上渲染自定义节点内容（在实时模式下不可见）
- onDrawForeground：在画布上渲染自定义节点内容（在插槽顶部）
- onMouseDownnMouseMove,onMouseUp,onMouseEnter,onMouseLeave\*\* 捕捉鼠标事件
- onDblClick：在编辑器中双击
- onExecute：在执行节点时调用
- onPropertyChanged：当面板中的属性发生更改时（返回 true 以跳过默认行为）
- onGetInputs：以 [ ["name","type"], [...], [...] ] 的形式返回可能输入的数组
- onGetOutputs：返回可能的输出数组
- onSerialize：在序列化之前，接收一个存储数据的对象
- onSelected：在编辑器中选中，接收一个对象在哪里读取数据
- onDeselected：从编辑器中取消选择
- onDropItem: 当 DOM 被拖放到节点上
- onDropFile: 文件拖放到节点上
- onConnectInput：如果返回 false，传入的连接将被取消
- onConnectionsChange：连接已更改（新连接或已删除）（`LiteGraph.INPUT` 或 `LiteGraph.OUTPUT`、`slot`、如果已连接则为 `true`、`link_info`、`input_info`）
- onAction：通过插槽事件触发动作时
- getExtraMenuOptions：右键菜单添加配置

### Slot 节点插槽

每个节点可以有多个槽，存储在 `node.inputs` 和 `node.outputs` 中。

您可以通过调用 `node.addInput()` 或 `node.addOutput()` 添加新插槽

> 注意：输入和输出之间的主要区别在于，一个输入只能有一个连接链接，而输出可以有多个连接链接。

要获取有关插槽的信息，您可以访问 `node.inputs[ slot_index ]` 或 `node.outputs[ slot_index ]`

插槽 slot 具有以下信息：

- name：带有插槽名称的字符串（也用于在画布中显示）
- type：指定通过此链接传输的数据类型的字符串
- link 或 links：取决于插槽是输入还是输出，包含链接 node 的 id 或 id 数组
- label：可选，用于重命名画布中显示的名称的字符串。
- dir：可选，可以是 `LiteGraph.UP`、`LiteGraph.RIGHT`、`LiteGraph.DOWN`、`LiteGraph.LEFT`
- color_on：连接时渲染的颜色
- color_off：未连接时渲染的颜色

要检索通过链接传输的数据，您可以调用 `node.getInputData()` 或 `node.getOutputData()`

```js
getInputData(slot, force_update);
```

如果设置`force_update`为`true`，它将强制此插槽的连接节点将数据输出到此链接

### Define Node 定义你的图形节点

在为图形节点创建类时，这里有一些有用的点：

- 构造函数应该创建默认的输入和输出（使用 `addInput` 和 `addOutput`）
- 可以编辑的属性存储在`this.properties = {};`
- `onExecute` 是执行图形时将调用的方法
- 您可以通过定义 `onPropertyChanged` 来捕捉属性是否已更改
- 您必须使用 `LiteGraph.registerNodeType("type/name", MyGraphNodeClass);` 注册您的节点
- 您可以通过定义 `MyGraphNodeClass.priority`（默认为 0）来更改执行的默认优先级
- 您可以使用 `onDrawBackground` 和 `onDrawForeground` 覆盖节点的渲染方式

### Appearance 自定义节点外形

如果您希望它与正文颜色不同，您可以配置节点形状或标题颜色：

```js
MyNodeClass.title_color = "#345";
MyNodeClass.shape = LiteGraph.ROUND_SHAPE;
```

您可以使用回调 `onDrawForeground` 和 `onDrawBackground` 在节点内绘制一些东西。 唯一的区别是 `onDrawForeground` 在实时模式下被调用，而 `onDrawBackground` 不会。

这两个函数都接收 `CanvasRenderingContext2D` 和正在渲染节点的 `LGraphCanvas` 实例。 前者用于绘制图像，后者用于交互。

您不必担心坐标系，(0,0) 是节点内容区域的左上角（不是标题）。

```js
node.onDrawForeground = function (ctx, graphcanvas) {
  if (this.flags.collapsed) return;
  ctx.save();
  ctx.fillColor = "#123";
  ctx.fillRect(0, 0, 10, this.size[1]);
  ctx.restore();
};
```

### Behaviour 自定义节点行为

如果您的节点具有某种特殊的交互性，您还可以从鼠标获取事件。

第二个参数是节点坐标中的位置，其中 0,0 表示节点内容的左上角（标题下方）。

```js
node.onMouseDown = function (event, pos, graphcanvas) {
  return true; //return true is the event was used by your node, to block other behaviours
};
```

Other methods are:

- onMouseMove
- onMouseUp
- onMouseEnter
- onMouseLeave
- onKey

### Widgets 节点内的小部件

您可以在节点内添加小部件以编辑文本、值等。

为此，您必须通过调用 `node.addWidget` 在构造函数中创建它们，返回的值是包含有关小部件的所有信息的对象，如果您想更改该值，可以方便地存储它 后来从代码。

这是支持的小部件列表：
| 名称 | 作用类比 |
| ------ | ---- |
| number | 数字 |
| slider | 滑块 |
| combo | 选择 |
| string | 文本 |
| text | 文本 |
| toggle | 开关 |
| button | 按钮 |

语法是：

```js
function MyNodeType()
{
  this.slider_widget = this.addWidget(
    type, // 小部件的注册的类型 // type
    name,  // 小部件在节点中显示的名称 // name
    value, // 小部件的值 // value
    function(value, widget, node){ /* do something with the value */ } // 一个可选的回调函数 和 options 二选一
    options // 一个可选的配置
    );
}
```

---

- **number** 改变一个数字的值，语法为

---

```js
this.addWidget("number", "Number", current_value, callback, { min: 0, max: 100, step: 1 });
```

- **slider** 通过鼠标拖动来改变数字，语法与数字相同。

---

```js
this.addWidget(
  "slider",
  "Slider",
  0.5,
  function (value, widget, node) {
    /* do something with the value */
  },
  { min: 0, max: 1 }
);
```

- **combo** 在多个选项之间进行选择，语法为：

---

```js
this.addWidget("combo", "Combo", "red", callback, { values: ["red", "green", "blue"] });
```

或者如果你想使用对象：

```js
this.addWidget(
  "combo",
  "Combo",
  value1,
  callback,
  { values: { "title1":value1, "title2":value2 }
);
```

- **text** 编辑短字符串
- **toggle** 就像一个复选框 checkbox
- **button** 普普通通的一个按钮

Widget 的值在存储节点状态时默认不序列化，但如果您想存储小部件的值，只需将 `serialize_widgets` 设置为 `true`：

---

```js
function MyNode() {
  this.addWidget("text", "name", "");
  this.serialize_widgets = true;
}
```

或者，`如果要将小部件与节点的属性相关联，请在选项中指定它`：

---

```js
function MyNode() {
  this.properties = { surname: "smith" };
  this.addWidget("text", "Surname", "", { property: "surname" }); //this will modify the node.properties
}
```

### Link Tooltips 自定义连接提示

将鼠标悬停在将两个节点连接在一起的链接上时，将显示一个工具提示，允许用户查看从一个节点输出到另一个节点的数据。

有时，您可能有一个输出对象的节点，而不是可以轻松表示的原始值（如字符串）。 在这些情况下，工具提示将默认显示“[Object]”。

如果您需要更具描述性的工具提示，您可以通过向对象添加 `toToolTip` 函数来实现此目的，该函数返回您希望在工具提示中显示的文本。

例如，为了确保来自输出槽 0 的链接显示 `"有用的描述"`，输出对象将如下所示：

```js
this.setOutputData(0, {
  complexDataTypeObject: {
    yes: true
  },
  toToolTip: () => "有用的描述"
});
```

## Execution Flow 执行流程

要执行图形，您必须调用 `graph.runStep()`。

此函数将为图中的每个节点调用方法 `node.onExecute()`。

执行的顺序`_nodes_executable`由系统根据图的形态决定（没有输入的节点被认为是 0 级，然后连接到 0 级节点的节点是 1 级，以此类推）。 仅当图形形态发生变化（创建新节点，连接发生变化）时才计算此顺序。

由开发人员决定如何处理节点内部的输入和输出。

使用 `this.setOutputData(0,data)` 通过输出发送的数据存储在链接中，因此如果通过该链接连接的节点执行 `this.getInputData(0)` 它将接收 发送的数据相同。

对于渲染，节点根据它们在 `graph._nodes` 数组中的顺序执行，当用户与 GraphCanvas 交互时，该数组会发生变化（单击的节点移动到数组的后面，因此它们在最后渲染 ）。

### Events 执行事件

当我们在图中运行一个步骤时（使用 `graph.runStep`）每个节点的 onExecute 方法都会被调用。
但是有时您希望仅在激活某个触发器时执行操作，对于这种情况，您可以使用事件。
仅当从一个节点分派事件时，事件才允许在节点中触发执行。

要为节点定义插槽，您必须对输入使用 `LiteGraph.ACTION` 类型，对输出使用 `LiteGraph.EVENT` 类型：

---

```js
function MyNode() {
  this.addInput("play", LiteGraph.ACTION);
  this.addInput("pause", LiteGraph.ACTION);
  this.addInput("onFinish", LiteGraph.EVENT);
}
```

现在要在`从输入插槽接收到事件时`执行一些代码，您必须定义 onAction 方法：

---

```js
MyNode.prototype.onAction = function (action, data) {
  if (action == "play") {
    //do your action...
  }
  if (action == "pause") {
    //do your action...
  }
};
```

最后一件事是`在节点中发生某些事情时`触发事件。 您可以从 onExecute 内部或任何其他交互中触发它们：

---

```js
MyNode.prototype.onAction = function (action, data) {
  if (this.button_was_clicked) this.triggerSlot(0); //triggers event in slot 0
};
```

已经有一些节点可用于处理事件，例如延迟、计数等。
