import Circuit from "./Circuit";
function Or() {
  this.addInput("A", "Boolean");
  this.addInput("B", "Boolean");
  this.addOutput("A|B", "Boolean");
}

// node.constructor.title_color
Or.title = "或门";
Or.shape = 1;
Or.title_color = "#012";
Or.registerType = "circuit/or";
// prototype
Or.prototype = Object.create(Circuit.prototype);
Or.prototype.constructor = Or;

Or.prototype.onExecute = function () {
  let a = this.getInputData(0);
  let b = this.getInputData(1);
  let c = a || b;
  this.setOutputData(0, c);
};
export default Or;
