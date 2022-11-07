import Circuit from "./Circuit";
function ToBool() {
  this.addInput("A", "Any");
  this.addOutput("B", "Boolean");
}
// node.constructor.title_color
ToBool.shape = 1;
ToBool.title = "ToBool";
ToBool.title_color = "#012";
ToBool.registerType = "circuit/toBool";
// prototype
ToBool.prototype = Object.create(Circuit.prototype);
ToBool.prototype.constructor = ToBool;
// methods
ToBool.prototype.onExecute = function () {
  let a = this.getInputData(0);
  let b = new Boolean(a);
  this.setOutputData(0, b);
};
export default ToBool;
