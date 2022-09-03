# Litgraph Node

我们按照 ES5 的原型继承封装一个节点类

## 封装一个电路的基类

```js
// Circuit.js
function Circuit() {}
export default Circuit;
```

## 封装一个电路的子类 晶振类

```js
// Oscillator.js
import Circuit from "./Circuit";
function Oscillator() {
  this.addOutput("O", "Boolean");
  this.value = true;
  this.time = Date.now();
  this.properties = {
    freq: 20 // 1Hz
  };
  this.value_widget = this.addWidget("number", "Freq", this.properties.freq, "freq", { min: 1, max: 20, step: 10 });
}
// node.constructor.title_color
Oscillator.title = "晶振";
Oscillator.shape = 1;
Oscillator.title_color = "#012";
Oscillator.registerType = "circuit/oscillator";
Oscillator.filter = "is_filter";
// prototype
Oscillator.prototype = Object.create(Circuit.prototype);
Oscillator.prototype.constructor = Oscillator;
Oscillator.prototype.onExecute = function () {
  let now = Date.now();
  if (now - this.time > 1000 / this.properties.freq) {
    this.time = now;
    this.value = !this.value;
    this.setOutputData(0, this.value);
    this.setDirtyCanvas(true, true);
  }
};
export default Oscillator;
```

## 封装一个电路的子类 LED 类

```js
// LED.js
import Circuit from "./Circuit";
function LED() {
  this.addInput("O", "Boolean");
  this.value = false;
}

// node.constructor.title_color
LED.shape = 1;
LED.title = "LED";
LED.title_color = "#012";
LED.registerType = "circuit/led";
LED.filter = "is_filter";
// prototype
LED.prototype = Object.create(Circuit.prototype);
LED.prototype.constructor = LED;
//
LED.prototype.onExecute = function () {
  let flag = this.getInputData(0);
  this.value = flag;
};

LED.prototype.onDrawBackground = function (ctx, area) {
  if (this.flags.collapsed) return;
  ctx.save();
  ctx.fillStyle = this.value ? "red" : "#fff";
  ctx.fillRect(0, 0, this.size[0], this.size[1]);
  ctx.restore();
};

export default LED;
```

## 注册节点

```js
import Oscillator from "./nodes/circuits/Oscillator";
import LED from "./nodes/circuits/LED";
import Topo from "./litegraph-topo/index.js";
const registerList = [Oscillator LED];
registerList.forEach(device => {
  Topo.registerNodeType(device.registerType, device);
});
```

## 基本例子

```vue
<template>
  <div class="topo">
    <div class="topo-toolbar">
      <button class="tool-btn" @click="onPlayButton">{{ play_status ? "Stop" : "Play" }}</button>
    </div>
    <!-- 类名不能少 不然样式会出错-->
    <div class="litegraph-topo litegraph litegraph-editor" style="padding:0">
      <canvas id="canvas"></canvas>
    </div>
  </div>
</template>
```

```vue
<script>
import Oscillator from "./litegraph-topo/nodes/circuits/Oscillator.js";
import LED from "./litegraph-topo/nodes/circuits/LED.js";
import Topo from "./litegraph-topo/index.js";
export default {
  name: "demo1",
  data() {
    return {
      topo: null,
      play_status: false
    };
  },
  mounted() {
    this.initCanvas();
    this.initRegister();
    this.getCanvasRect();
    window.onresize = () => {
      this.getCanvasRect();
    };
  },
  methods: {
    initCanvas() {
      this.topo = new Topo("#canvas");
      let a = this.topo.addNode({
        type: "circuit/oscillator",
        pos: [50, 200]
      });
      let b = this.topo.addNode({
        type: "circuit/led",
        pos: [500, 100]
      });
      a.connect(0, b, 0);
      this.topo.graph.start();
      this.play_status = true;
    },
    initRegister() {
      const registerList = [Oscillator, LED];
      registerList.forEach((device) => {
        Topo.registerNodeType(device.registerType, device);
      });
    },
    getCanvasRect() {
      this.topo.canvas.resize();
    },
    onPlayButton() {
      let graph = this.topo.graph;
      if (graph.status == Topo.LGraph.STATUS_STOPPED) {
        graph.start();
        this.play_status = true;
      } else {
        graph.stop();
        this.play_status = false;
      }
    }
  }
};
</script>
```
