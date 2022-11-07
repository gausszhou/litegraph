<template>
  <div class="topo">
    <!-- 类名不能少 不然样式会出错-->
    <div class="litegraph-topo litegraph litegraph-editor" style="padding: 0">
      <canvas id="canvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import "./litegraph-topo/styles/index.css"; // vuepress
import Topo from "./litegraph-topo/index.js";
const topo = new Topo("#canvas");

window.onresize = () => {
  this.getCanvasRect();
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
