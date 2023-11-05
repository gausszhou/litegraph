// to store json objects
function ConstantArray() {
  this._value = [];
  this.addInput("json", "");
  this.addOutput("arrayOut", "array");
  this.addOutput("length", "number");
  this.addProperty("value", "[]");
  this.widget = this.addWidget("text", "array", this.properties.value, "value");
  this.widgets_up = true;
  this.size = [140, 50];
}

ConstantArray.title = "Const Array";
ConstantArray.desc = "Constant Array";

ConstantArray.prototype.onPropertyChanged = function (name, value) {
  this.widget.value = value;
  if (value == null || value == "") {
    return;
  }

  try {
    if (value[0] != "[") this._value = JSON.parse("[" + value + "]");
    else this._value = JSON.parse(value);
    this.boxcolor = "#AEA";
  } catch (err) {
    this.boxcolor = "red";
  }
};

ConstantArray.prototype.onExecute = function () {
  var v = this.getInputData(0);
  if (v && v.length) {
    //clone
    if (!this._value) this._value = new Array();
    this._value.length = v.length;
    for (var i = 0; i < v.length; ++i) this._value[i] = v[i];
  }
  this.setOutputData(0, this._value);
  this.setOutputData(1, this._value ? this._value.length || 0 : 0);
};

ConstantArray.prototype.setValue = function(v){
  this.setProperty("value", v)
}