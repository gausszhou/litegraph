function ConstantObject() {
  this.addOutput("obj", "object");
  this.size = [120, 30];
  this._object = {};
}

ConstantObject.title = "Const Object";
ConstantObject.desc = "Constant Object";

ConstantObject.prototype.onExecute = function () {
  this.setOutputData(0, this._object);
};