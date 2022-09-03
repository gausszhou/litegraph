<template>
  <div class="topo">
    <!-- 类名不能少 不然样式会出错-->
    <div class="litegraph-topo litegraph litegraph-editor" style="padding: 0">
      <canvas id="canvas"></canvas>
    </div>
  </div>
</template>

<script>
import "./lib/litegraph-topo/styles/index.css"; // vuepress
import Topo from "./lib/litegraph-topo/index.js";
export default {
  name: "demo1",
  data() {
    return {
      topo: null
    };
  },
  created() {},
  mounted() {
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
    },
    getCanvasRect() {
      this.topo.canvas.resize();
      // dosomething
    }
  }
};
</script>

<style scoped>
.topo {
  width: 740px;
  height: 500px;
}
#canvas {
  width: 100%;
  height: 500px;
}
</style>
s
