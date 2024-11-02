export  default  function WidgetProgress() {
  this.size = [160, 26];
  this.addInput("", "number");
  this.properties = { min: 0, max: 1, value: 0, color: "#AAF" };
}

WidgetProgress.title = "Progress";
WidgetProgress.desc = "Shows data in linear progress";

WidgetProgress.prototype.onExecute = function () {
  const v = this.getInputData(0);
  if (v != undefined) {
    this.properties["value"] = v;
  }
};

WidgetProgress.prototype.onDrawForeground = function (ctx) {
  // border
  ctx.lineWidth = 1;
  ctx.fillStyle = this.properties.color;
  let v = (this.properties.value - this.properties.min) / (this.properties.max - this.properties.min);
  v = Math.min(1, v);
  v = Math.max(0, v);
  ctx.fillRect(2, 2, (this.size[0] - 4) * v, this.size[1] - 4);
};
