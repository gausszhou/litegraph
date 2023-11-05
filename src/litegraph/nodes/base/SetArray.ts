function SetArray() {
  this.addInput("arr", "array");
  this.addInput("value", "");
  this.addOutput("arr", "array");
  this.properties = { index: 0 };
  this.widget = this.addWidget("number", "i", this.properties.index, "index", { precision: 0, step: 10, min: 0 });
}

SetArray.title = "Set Array";
SetArray.desc = "Sets index of array";

SetArray.prototype.onExecute = function () {
  var arr = this.getInputData(0);
  if (!arr) return;
  var v = this.getInputData(1);
  if (v === undefined) return;
  if (this.properties.index) arr[Math.floor(this.properties.index)] = v;
  this.setOutputData(0, arr);
};