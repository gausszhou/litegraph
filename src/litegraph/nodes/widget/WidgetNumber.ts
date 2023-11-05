


  /* Number ****************/

  function WidgetNumber() {
    this.addOutput("", "number");
    this.size = [80, 60];
    this.properties = { min: -1000, max: 1000, value: 1, step: 1 };
    this.old_y = -1;
    this._remainder = 0;
    this._precision = 0;
    this.mouse_captured = false;
  }

  WidgetNumber.title = "Number";
  WidgetNumber.desc = "Widget to select number value";

  WidgetNumber.pixels_threshold = 10;
  WidgetNumber.markers_color = "#666";

  WidgetNumber.prototype.onDrawForeground = function (ctx) {
    var x = this.size[0] * 0.5;
    var h = this.size[1];
    if (h > 30) {
      ctx.fillStyle = WidgetNumber.markers_color;
      ctx.beginPath();
      ctx.moveTo(x, h * 0.1);
      ctx.lineTo(x + h * 0.1, h * 0.2);
      ctx.lineTo(x + h * -0.1, h * 0.2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x, h * 0.9);
      ctx.lineTo(x + h * 0.1, h * 0.8);
      ctx.lineTo(x + h * -0.1, h * 0.8);
      ctx.fill();
      ctx.font = (h * 0.7).toFixed(1) + "px Arial";
    } else {
      ctx.font = (h * 0.8).toFixed(1) + "px Arial";
    }

    ctx.textAlign = "center";
    ctx.font = (h * 0.7).toFixed(1) + "px Arial";
    ctx.fillStyle = "#EEE";
    ctx.fillText(this.properties.value.toFixed(this._precision), x, h * 0.75);
  };

  WidgetNumber.prototype.onExecute = function () {
    this.setOutputData(0, this.properties.value);
  };

  WidgetNumber.prototype.onPropertyChanged = function (name, value) {
    var t = (this.properties.step + "").split(".");
    this._precision = t.length > 1 ? t[1].length : 0;
  };

  WidgetNumber.prototype.onMouseDown = function (e, pos) {
    if (pos[1] < 0) {
      return;
    }

    this.old_y = e.canvasY;
    this.captureInput(true);
    this.mouse_captured = true;

    return true;
  };

  WidgetNumber.prototype.onMouseMove = function (e) {
    if (!this.mouse_captured) {
      return;
    }

    var delta = this.old_y - e.canvasY;
    if (e.shiftKey) {
      delta *= 10;
    }
    if (e.metaKey || e.altKey) {
      delta *= 0.1;
    }
    this.old_y = e.canvasY;

    var steps = this._remainder + delta / WidgetNumber.pixels_threshold;
    this._remainder = steps % 1;
    steps = steps | 0;

    var v = Math.clamp(this.properties.value + steps * this.properties.step, this.properties.min, this.properties.max);
    this.properties.value = v;
    this.graph._version++;
    this.setDirtyCanvas(true);
  };

  WidgetNumber.prototype.onMouseUp = function (e, pos) {
    if (e.click_time < 200) {
      var steps = pos[1] > this.size[1] * 0.5 ? -1 : 1;
      this.properties.value = Math.clamp(
        this.properties.value + steps * this.properties.step,
        this.properties.min,
        this.properties.max
      );
      this.graph._version++;
      this.setDirtyCanvas(true);
    }

    if (this.mouse_captured) {
      this.mouse_captured = false;
      this.captureInput(false);
    }
  };

