import { clamp } from "@gausszhou/litegraph-core";

export default function GraphicsPlot() {
  this.addInput("A", "Number");
  this.addInput("B", "Number");
  this.addInput("C", "Number");
  this.addInput("D", "Number");

  this.values = [[], [], [], []];
  this.properties = { scale: 2 };
}

GraphicsPlot.title = "Plot";
GraphicsPlot.desc = "Plots data over time";
GraphicsPlot.colors = ["#FFF", "#F99", "#9F9", "#99F"];

GraphicsPlot.prototype.onExecute = function(ctx) {
  if (this.flags.collapsed) {
      return;
  }

  var size = this.size;

  for (var i = 0; i < 4; ++i) {
      var v = this.getInputData(i);
      if (v == null) {
          continue;
      }
      var values = this.values[i];
      values.push(v);
      if (values.length > size[0]) {
          values.shift();
      }
  }
};

GraphicsPlot.prototype.onDrawBackground = function(ctx) {
  if (this.flags.collapsed) {
      return;
  }

  var size = this.size;

  var scale = (0.5 * size[1]) / this.properties.scale;
  var colors = GraphicsPlot.colors;
  var offset = size[1] * 0.5;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, size[0], size[1]);
  ctx.strokeStyle = "#555";
  ctx.beginPath();
  ctx.moveTo(0, offset);
  ctx.lineTo(size[0], offset);
  ctx.stroke();

  if (this.inputs) {
      for (var i = 0; i < 4; ++i) {
          var values = this.values[i];
          if (!this.inputs[i] || !this.inputs[i].link) {
              continue;
          }
          ctx.strokeStyle = colors[i];
          ctx.beginPath();
          var v = values[0] * scale * -1 + offset;
          ctx.moveTo(0, clamp(v, 0, size[1]));
          for (var j = 1; j < values.length && j < size[0]; ++j) {
              var v = values[j] * scale * -1 + offset;
              ctx.lineTo(j, clamp(v, 0, size[1]));
          }
          ctx.stroke();
      }
  }
};

