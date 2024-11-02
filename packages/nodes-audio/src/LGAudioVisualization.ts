export default function LGAudioVisualization() {
  this.properties = {
    continuous: true,
    mark: -1,
  };

  this.addInput("data", "array");
  this.addInput("mark", "number");
  this.size = [300, 200];
  this._last_buffer = null;
}

LGAudioVisualization.prototype.onExecute = function () {
  this._last_buffer = this.getInputData(0);
  var v = this.getInputData(1);
  if (v !== undefined) {
    this.properties.mark = v;
  }
  this.setDirtyCanvas(true, false);
};

LGAudioVisualization.prototype.onDrawForeground = function (ctx) {
  if (!this._last_buffer) {
    return;
  }

  var buffer = this._last_buffer;

  //delta represents how many samples we advance per pixel
  var delta = buffer.length / this.size[0];
  var h = this.size[1];

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, this.size[0], this.size[1]);
  ctx.strokeStyle = "white";
  ctx.beginPath();
  var x = 0;

  if (this.properties.continuous) {
    ctx.moveTo(x, h);
    for (var i = 0; i < buffer.length; i += delta) {
      ctx.lineTo(x, h - (buffer[i | 0] / 255) * h);
      x++;
    }
  } else {
    for (var i = 0; i < buffer.length; i += delta) {
      ctx.moveTo(x + 0.5, h);
      ctx.lineTo(x + 0.5, h - (buffer[i | 0] / 255) * h);
      x++;
    }
  }
  ctx.stroke();

  if (this.properties.mark >= 0) {
    var samplerate = LGAudio.getAudioContext().sampleRate;
    var binfreq = samplerate / buffer.length;
    var x = (2 * (this.properties.mark / binfreq)) / delta;
    if (x >= this.size[0]) {
      x = this.size[0] - 1;
    }
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(x, h);
    ctx.lineTo(x, 0);
    ctx.stroke();
  }
};
