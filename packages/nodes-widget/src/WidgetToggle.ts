import { BuiltInSlotType } from "@gausszhou/litegraph-core/src/types";

export  default  function WidgetToggle() {
  this.addInput("", "boolean");
  this.addInput("e", BuiltInSlotType.ACTION);
  this.addOutput("v", "boolean");
  this.addOutput("e", BuiltInSlotType.EVENT);
  this.properties = { font: "", value: false };
  this.size = [160, 44];
}

WidgetToggle.title = "Toggle";
WidgetToggle.desc = "Toggles between true or false";

WidgetToggle.prototype.onDrawForeground = function (ctx) {
  if (this.flags.collapsed) {
    return;
  }

  var size = this.size[1] * 0.5;
  var margin = 0.25;
  var h = this.size[1] * 0.8;
  ctx.font = this.properties.font || (size * 0.8).toFixed(0) + "px Arial";
  var w = ctx.measureText(this.title).width;
  var x = (this.size[0] - (w + size)) * 0.5;

  ctx.fillStyle = "#AAA";
  ctx.fillRect(x, h - size, size, size);

  ctx.fillStyle = this.properties.value ? "#AEF" : "#000";
  ctx.fillRect(x + size * margin, h - size + size * margin, size * (1 - margin * 2), size * (1 - margin * 2));

  ctx.textAlign = "left";
  ctx.fillStyle = "#AAA";
  ctx.fillText(this.title, size * 1.2 + x, h * 0.85);
  ctx.textAlign = "left";
};

WidgetToggle.prototype.onAction = function (action) {
  this.properties.value = !this.properties.value;
  this.trigger("e", this.properties.value);
};

WidgetToggle.prototype.onExecute = function () {
  var v = this.getInputData(0);
  if (v != null) {
    this.properties.value = v;
  }
  this.setOutputData(0, this.properties.value);
};

WidgetToggle.prototype.onMouseDown = function (e, local_pos) {
  if (local_pos[0] > 1 && local_pos[1] > 1 && local_pos[0] < this.size[0] - 2 && local_pos[1] < this.size[1] - 2) {
    this.properties.value = !this.properties.value;
    this.graph._version++;
    this.trigger("e", this.properties.value);
    return true;
  }
};
