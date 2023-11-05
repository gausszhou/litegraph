function ObjectKeys() {
  this.addInput("obj", "");
  this.addOutput("keys", "array");
  this.size = [140, 30];
}

ObjectKeys.title = "Object keys";
ObjectKeys.desc = "Outputs an array with the keys of an object";

ObjectKeys.prototype.onExecute = function () {
  var data = this.getInputData(0);
  if (data != null) {
    this.setOutputData(0, Object.keys(data));
  }
};