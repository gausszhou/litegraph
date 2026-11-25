import type { MouseEventExt } from "@gausszhou/litegraph-core";
import { LiteUtils } from "@gausszhou/litegraph-core";

  //Widget H SLIDER
  export default function WidgetHSlider(this: any) {
    this.size = [160, 26];
    this.addOutput("", "number");
    this.properties = { color: "#7AF", min: 0, max: 1, value: 0.5 };
    this.value = -1;
  }

  WidgetHSlider.title = "H.Slider";
  WidgetHSlider.desc = "Linear slider controller";

  WidgetHSlider.prototype.onDrawForeground = function (this: any, ctx: CanvasRenderingContext2D) {
    if (this.value == -1) {
      this.value = (this.properties.value - this.properties.min) / (this.properties.max - this.properties.min);
    }

    //border
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
    ctx.fillStyle = "#000";
    ctx.fillRect(2, 2, this.size[0] - 4, this.size[1] - 4);

    ctx.fillStyle = this.properties.color;
    ctx.beginPath();
    ctx.rect(4, 4, (this.size[0] - 8) * this.value, this.size[1] - 8);
    ctx.fill();
  };

  WidgetHSlider.prototype.onExecute = function (this: any) {
    this.properties.value = this.properties.min + (this.properties.max - this.properties.min) * this.value;
    this.setOutputData(0, this.properties.value);
    this.boxcolor = LiteUtils.colorToString([this.value, this.value, this.value]);
  };

  WidgetHSlider.prototype.onMouseDown = function (this: any, e: MouseEventExt) {
    if (e.canvasY - this.pos[1] < 0) {
      return false;
    }

    this.oldmouse = [e.canvasX - this.pos[0], e.canvasY - this.pos[1]];
    this.captureInput(true);
    return true;
  };

  WidgetHSlider.prototype.onMouseMove = function (this: any, e: MouseEventExt) {
    if (!this.oldmouse) {
      return;
    }

    var m = [e.canvasX - this.pos[0], e.canvasY - this.pos[1]];

    var v = this.value;
    var delta = m[0] - this.oldmouse[0];
    v += delta / this.size[0];
    if (v > 1.0) {
      v = 1.0;
    } else if (v < 0.0) {
      v = 0.0;
    }

    this.value = v;

    this.oldmouse = m;
    this.setDirtyCanvas(true);
  };

  WidgetHSlider.prototype.onMouseUp = function (this: any, e: MouseEventExt) {
    this.oldmouse = null;
    this.captureInput(false);
  };

  WidgetHSlider.prototype.onMouseLeave = function (this: any, e: MouseEventExt) {
    //this.oldmouse = null;
  };

