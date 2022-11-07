import Circuit from "./Circuit";
function Acc() {
  this.addInput("A", "Boolean");
  this.addOutput("0", "Boolean");
  this.addOutput("1", "Boolean");
  this.addOutput("2", "Boolean");
  this.addOutput("3", "Boolean");
  this.addOutput("4", "Boolean");
  this.addOutput("5", "Boolean");
  this.addOutput("6", "Boolean");
  this.addOutput("7", "Boolean");
  this.value = false;
  this.result = 0;
}

// node.constructor.title_color
Acc.shape = 1;
Acc.title = "上升沿累加器";
Acc.title_color = "#012";
Acc.registerType = "circuit/acc";

// prototype
Acc.prototype = Object.create(Circuit.prototype);
Acc.prototype.constructor = Acc;

Acc.prototype.onDrawBackground = function (ctx, lgcanvas) {
  if (this.flags.collapsed) return;
  ctx.save();
  ctx.font = "normal 16px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ff0000";
  ctx.fillText(this.result, this.size[0] / 2, this.size[1] / 2);
  ctx.restore();
};

function dec2bin(dec) {
  return (dec >>> 0).toString(2);
}

Acc.prototype.onExecute = function () {
  let a = this.getInputData(0);
  if (this.value == false && a == true) {
    this.result++;
    if (this.result >= 255) {
      this.result = 0;
    }
    let str = dec2bin(this.result);
    let arr = str.split("").reverse();
    for (let i = 0; i < 8; i++) {
      this.setOutputData(i, Boolean(Number(arr[i])) || false);
    }
  }
  this.value = a;
};

export default Acc;
