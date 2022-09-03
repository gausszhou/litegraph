<template>
  <div class="topo">
    <div class="topo-toolbar">
      <button class="tool-btn" @click="onPlayButton">{{ play_status ? "Stop" : "Play" }}</button>
    </div>
    <!-- 类名不能少 不然样式会出错-->
    <div class="litegraph-topo litegraph litegraph-editor" style="padding: 0">
      <canvas id="canvas"></canvas>
    </div>
  </div>
</template>

<script>
import "./lib/litegraph-topo/styles/index.css"; // vuepress
import Oscillator from "./lib/litegraph-topo/nodes/circuits/Oscillator.js";
import LED from "./lib/litegraph-topo/nodes/circuits/LED.js";
import Topo from "./lib/litegraph-topo/index.js";
export default {
  name: "demo1",
  data() {
    return {
      topo: null,
      play_status: false
    };
  },
  created() {},
  mounted() {
    this.initRegister();
    this.initCanvas();
    this.getCanvasRect();
    window.onresize = () => {
      this.getCanvasRect();
    };
  },
  methods: {
    initCanvas() {
      this.topo = new Topo("#canvas");
      // dosomething
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
      registerList.forEach(device => {
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

<style scoped>
.topo {
  width: 740px;
  height: 500px;
  position: relative;
}
#canvas {
  width: 100%;
  height: 500px;
}
.topo-toolbar {
  width: 100%;
  padding: 5px;
  display: flex;
  justify-content: center;
}
</style>
