export default function MathNoise() {
  this.addInput("in", "number");
  this.addOutput("out", "number");
  this.addProperty("min", 0);
  this.addProperty("max", 1);
  this.addProperty("smooth", true);
  this.addProperty("seed", 0);
  this.addProperty("octaves", 1);
  this.addProperty("persistence", 0.8);
  this.addProperty("speed", 1);
  this.size = [90, 30];
}

MathNoise.title = "Noise";
MathNoise.desc = "Random number with temporal continuity";
MathNoise.data = null;

MathNoise.getValue = function (f, smooth) {
  if (!MathNoise.data) {
    MathNoise.data = new Float32Array(1024);
    for (var i = 0; i < MathNoise.data.length; ++i) {
      MathNoise.data[i] = Math.random();
    }
  }
  f = f % 1024;
  if (f < 0) {
    f += 1024;
  }
  var f_min = Math.floor(f);
  f = f - f_min;
  var r1 = MathNoise.data[f_min];
  var r2 = MathNoise.data[f_min == 1023 ? 0 : f_min + 1];
  if (smooth) {
    f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  }
  return r1 * (1 - f) + r2 * f;
};

MathNoise.prototype.onExecute = function () {
  var f = this.getInputData(0) || 0;
  var iterations = this.properties.octaves || 1;
  var r = 0;
  var amp = 1;
  var seed = this.properties.seed || 0;
  f += seed;
  var speed = this.properties.speed || 1;
  var total_amp = 0;
  for (var i = 0; i < iterations; ++i) {
    r += MathNoise.getValue(f * (1 + i) * speed, this.properties.smooth) * amp;
    total_amp += amp;
    amp *= this.properties.persistence;
    if (amp < 0.001) break;
  }
  r /= total_amp;
  var min = this.properties.min;
  var max = this.properties.max;
  this._last_v = r * (max - min) + min;
  this.setOutputData(0, this._last_v);
};

MathNoise.prototype.onDrawBackground = function (ctx) {
  //show the current value
  this.outputs[0].label = (this._last_v || 0).toFixed(3);
};
