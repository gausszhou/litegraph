
function ObjectProperty() {
  this.addInput("obj", "object");
  this.addOutput("property", 0);
  this.addProperty("value", 0);
  this.widget = this.addWidget("text", "prop.", "", this.setValue.bind(this));
  this.widgets_up = true;
  this.size = [140, 30];
  this._value = null;
}

ObjectProperty.title = "Object property";
ObjectProperty.desc = "Outputs the property of an object";

ObjectProperty.prototype.setValue = function (v) {
  this.properties.value = v;
  this.widget.value = v;
};

ObjectProperty.prototype.getTitle = function () {
  if (this.flags.collapsed) {
    return "in." + this.properties.value;
  }
  return this.title;
};

ObjectProperty.prototype.onPropertyChanged = function (name, value) {
  this.widget.value = value;
};

ObjectProperty.prototype.onExecute = function () {
  var data = this.getInputData(0);
  if (data != null) {
    this.setOutputData(0, data[this.properties.value]);
  }
};
