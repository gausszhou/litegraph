function ArrayElement() {
  this.addInput("array", "array,table,string");
  this.addInput("index", "number");
  this.addOutput("value", "");
  this.addProperty("index", 0);
}

ArrayElement.title = "Array[i]";
ArrayElement.desc = "Returns an element from an array";

ArrayElement.prototype.onExecute = function () {
  var array = this.getInputData(0);
  var index = this.getInputData(1);
  if (index == null) index = this.properties.index;
  if (array == null || index == null) return;
  this.setOutputData(0, array[Math.floor(Number(index))]);
};