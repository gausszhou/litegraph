import Circuit from "./Circuit";
function Decoder() {
  this.addInput("0", "Boolean");
  this.addInput("1", "Boolean");
  this.addInput("2", "Boolean");
  this.addInput("3", "Boolean");
  this.addInput("4", "Boolean");
  this.addInput("5", "Boolean");
  this.addInput("6", "Boolean");
  this.addInput("7", "Boolean");
  this.result = 0;
}

// node.constructor.title_color
Decoder.shape = 1;
Decoder.title = "译码器";
Decoder.title_color = "#012";
Decoder.registerType = "circuit/decoder";
// prototype
Decoder.prototype = Object.create(Circuit.prototype);
Decoder.prototype.constructor = Decoder;

Decoder.prototype.onDrawBackground = function (ctx, area) {
  if (this.flags.collapsed) return;
  ctx.save();
  ctx.font = "normal 16px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ff0000";
  ctx.fillText(this.result, this.size[0] / 2, this.size[1] / 2);
  ctx.restore();
};

Decoder.prototype.onExecute = function () {
  let s = 0;
  for (let i = 0; i < 8; i++) {
    let a = this.getInputData(i) || 0;
    s += a * Math.pow(2, i);
  }
  this.result = s;
  this.setDirtyCanvas(true, true);
};

export default Decoder;
