import Circuit from "./Circuit";
function And() {
  this.addInput("A", "Boolean");
  this.addInput("B", "Boolean");
  this.addOutput("A&B", "Boolean");
}

// node.constructor.title_color
And.shape = 1;
And.title = "与门";
And.title_color = "#012";
And.registerType = "circuit/and";
// prototype
And.prototype = Object.create(Circuit.prototype);
And.prototype.constructor = And;

And.prototype.onExecute = function () {
  let a = this.getInputData(0);
  let b = this.getInputData(1);
  let c = a && b;
  this.setOutputData(0, c);
};
export default And;
