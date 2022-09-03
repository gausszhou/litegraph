import Circuit from "./Circuit";
function LED() {
  this.addInput("O", "Boolean");
  this.value = false;
}

// node.constructor.title_color
LED.shape = 1;
LED.title = "LED";
LED.title_color = "#012";
LED.registerType = "circuit/led";

// prototype
LED.prototype = Object.create(Circuit.prototype);
LED.prototype.constructor = LED;
//
LED.prototype.onExecute = function () {
  let flag = this.getInputData(0);
  this.value = flag;
};

LED.prototype.onDrawBackground = function (ctx, area) {
  if (this.flags.collapsed) return;
  ctx.save();
  ctx.fillStyle = this.value ? "red" : "#fff";
  ctx.fillRect(0, 0, this.size[0], this.size[1]);
  ctx.restore();
};

export default LED;
