import { BuiltInSlotType } from "@gausszhou/litegraph-core/src/types";

export default function WidgetButton() {
  this.addOutput("", BuiltInSlotType.EVENT);
  this.addOutput("", "boolean");
  this.addProperty("text", "click me");
  this.addProperty("font_size", 30);
  this.addProperty("message", "");
  this.size = [164, 84];
  this.clicked = false;
}

WidgetButton.title = "Button";
WidgetButton.desc = "Triggers an event";

WidgetButton.font = "Arial";
WidgetButton.prototype.onDrawForeground = function (ctx) {
  if (this.flags.collapsed) {
    return;
  }
  var margin = 10;
  ctx.fillStyle = "black";
  ctx.fillRect(
    margin + 1,
    margin + 1,
    this.size[0] - margin * 2,
    this.size[1] - margin * 2
  );
  ctx.fillStyle = "#AAF";
  ctx.fillRect(
    margin - 1,
    margin - 1,
    this.size[0] - margin * 2,
    this.size[1] - margin * 2
  );
  ctx.fillStyle = this.clicked ? "white" : this.mouseOver ? "#668" : "#334";
  ctx.fillRect(
    margin,
    margin,
    this.size[0] - margin * 2,
    this.size[1] - margin * 2
  );

  if (this.properties.text || this.properties.text === 0) {
    var font_size = this.properties.font_size || 30;
    ctx.textAlign = "center";
    ctx.fillStyle = this.clicked ? "black" : "white";
    ctx.font = font_size + "px " + WidgetButton.font;
    ctx.fillText(
      this.properties.text,
      this.size[0] * 0.5,
      this.size[1] * 0.5 + font_size * 0.3
    );
    ctx.textAlign = "left";
  }
};

WidgetButton.prototype.onMouseDown = function (e, local_pos) {
  if (
    local_pos[0] > 1 &&
    local_pos[1] > 1 &&
    local_pos[0] < this.size[0] - 2 &&
    local_pos[1] < this.size[1] - 2
  ) {
    this.clicked = true;
    this.setOutputData(1, this.clicked);
    this.triggerSlot(0, this.properties.message);
    return true;
  }
};

WidgetButton.prototype.onExecute = function () {
  this.setOutputData(1, this.clicked);
};

WidgetButton.prototype.onMouseUp = function (e) {
  this.clicked = false;
};
