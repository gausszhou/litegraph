export default function WidgetText() {
  this.addInputs("", 0);
  this.properties = {
    value: "...",
    font: "Arial",
    fontsize: 18,
    color: "#AAA",
    align: "left",
    glowSize: 0,
    decimals: 1
  };
}

WidgetText.title = "Text";
WidgetText.desc = "Shows the input value";
WidgetText.widgets = [
  { name: "resize", text: "Resize box", type: "button" },
  { name: "led_text", text: "LED", type: "minibutton" },
  { name: "normal_text", text: "Normal", type: "minibutton" }
];

WidgetText.prototype.onDrawForeground = function (ctx) {

  ctx.fillStyle = this.properties["color"];
  var v = this.properties["value"];

  if (this.properties["glowSize"]) {
    ctx.shadowColor = this.properties.color;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = this.properties["glowSize"];
  } else {
    ctx.shadowColor = "transparent";
  }

  var fontsize = this.properties["fontsize"];

  ctx.textAlign = this.properties["align"];
  ctx.font = fontsize.toString() + "px " + this.properties["font"];
  this.str = typeof v == "number" ? v.toFixed(this.properties["decimals"]) : v;

  if (typeof this.str == "string") {
    var lines = this.str.replace(/[\r\n]/g, "\\n").split("\\n");
    for (var i = 0; i < lines.length; i++) {
      ctx.fillText(
        lines[i],
        this.properties["align"] == "left" ? 15 : this.size[0] - 15,
        fontsize * -0.15 + fontsize * (parseInt(`${i}`) + 1)
      );
    }
  }

  ctx.shadowColor = "transparent";
  this.last_ctx = ctx;
  ctx.textAlign = "left";
};

WidgetText.prototype.onExecute = function () {
  var v = this.getInputData(0);
  if (v != null) {
    this.properties["value"] = v;
  }
  //this.setDirtyCanvas(true);
};

WidgetText.prototype.resize = function () {
  if (!this.last_ctx) {
    return;
  }

  var lines = this.str.split("\\n");
  this.last_ctx.font = this.properties["fontsize"] + "px " + this.properties["font"];
  var max = 0;
  for (var i = 0; i < lines.length; i++) {
    var w = this.last_ctx.measureText(lines[i]).width;
    if (max < w) {
      max = w;
    }
  }
  this.size[0] = max + 20;
  this.size[1] = 4 + lines.length * this.properties["fontsize"];

  this.setDirtyCanvas(true);
};

WidgetText.prototype.onPropertyChanged = function (name, value) {
  this.properties[name] = value;
  this.str = typeof value == "number" ? value.toFixed(3) : value;
  //this.resize();
  return true;
};

