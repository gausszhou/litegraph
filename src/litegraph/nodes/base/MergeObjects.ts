function MergeObjects() {
  this.addInput("A", "object");
  this.addInput("B", "object");
  this.addOutput("out", "object");
  this._result = {};
  var that = this;
  this.addWidget("button", "clear", "", function () {
    that._result = {};
  });
  this.size = this.computeSize();
}

MergeObjects.title = "Merge Objects";
MergeObjects.desc = "Creates an object copying properties from others";

MergeObjects.prototype.onExecute = function () {
  var A = this.getInputData(0);
  var B = this.getInputData(1);
  var C = this._result;
  if (A) for (var i in A) C[i] = A[i];
  if (B) for (var i in B) C[i] = B[i];
  this.setOutputData(0, C);
};
