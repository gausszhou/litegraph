
function SetObject() {
  this.addInput("obj", "");
  this.addInput("value", "");
  this.addOutput("obj", "");
  this.properties = { property: "" };
  this.name_widget = this.addWidget("text", "prop.", this.properties.property, "property");
}

SetObject.title = "Set Object";
SetObject.desc = "Adds propertiesrty to object";

SetObject.prototype.onExecute = function () {
  var obj = this.getInputData(0);
  if (!obj) return;
  var v = this.getInputData(1);
  if (v === undefined) return;
  if (this.properties.property) obj[this.properties.property] = v;
  this.setOutputData(0, obj);
};