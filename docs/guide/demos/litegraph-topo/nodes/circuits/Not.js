import Circuit from "./Circuit";
function Not() {
  this.addInput("A", "Boolean");
  this.addOutput("!A", "Boolean");
}

// node.constructor.title_color
Not.title = "非门";
Not.shape = 1;
Not.title_color = "#012";
Not.registerType = "circuit/not";
// prototype
Not.prototype = Object.create(Circuit.prototype);
Not.prototype.constructor = Not;

Not.prototype.onExecute = function () {
  let a = this.getInputData(0);
  let b = !a;
  this.setOutputData(0, b);
};
export default Not;
