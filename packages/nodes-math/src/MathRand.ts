export default function MathRand() {
  this.addOutput("value", "number");
  this.addProperty("min", 0);
  this.addProperty("max", 1);
  this.size = [80, 30];
}

MathRand.title = "Rand";
MathRand.desc = "Random number";

MathRand.prototype.onExecute = function() {
  if (this.inputs) {
      for (var i = 0; i < this.inputs.length; i++) {
          var input = this.inputs[i];
          var v = this.getInputData(i);
          if (v === undefined) {
              continue;
          }
          this.properties[input.name] = v;
      }
  }

  var min = this.properties.min;
  var max = this.properties.max;
  this._last_v = Math.random() * (max - min) + min;
  this.setOutputData(0, this._last_v);
};

MathRand.prototype.onDrawBackground = function(ctx) {
  this.outputs[0].label = (this._last_v || 0).toFixed(3);
};

MathRand.prototype.onGetInputs = function() {
  return [["min", "number"], ["max", "number"]];
};
