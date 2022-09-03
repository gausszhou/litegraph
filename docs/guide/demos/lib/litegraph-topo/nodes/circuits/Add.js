import Circuit from "./Circuit";
function Add() {
  this.addInput("A", "Boolean");
  this.addInput("B", "Boolean");
  this.addInput("C", "Boolean"); // 低位进位
  this.addOutput("S", "Boolean");
  this.addOutput("O", "Boolean");
}

// node.constructor.title_color
Add.shape = 1;
Add.title = "全加器";
Add.title_color = "#012";
Add.registerType = "circuit/add";
// prototype
Add.prototype = Object.create(Circuit.prototype);
Add.prototype.constructor = Add;

Add.prototype.onExecute = function () {
  let a = this.getInputData(0);
  let b = this.getInputData(1);
  let c = this.getInputData(2);
  let s = a ^ b ^ c;
  let o = (a && b) + (b && c) + (a && c);
  this.setOutputData(0, s);
  this.setOutputData(1, o);
};

export default Add;
