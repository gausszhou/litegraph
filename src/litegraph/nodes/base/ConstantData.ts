// to store json objects

function ConstantData() {
  this.addOutput("data", "object");
  this.addProperty("value", "");
  this.widget = this.addWidget("text", "json", "", "value");
  this.widgets_up = true;
  this.size = [140, 30];
  this._value = null;
}

ConstantData.title = "Const Data";
ConstantData.desc = "Constant Data";

ConstantData.prototype.onPropertyChanged = function (name, value) {
  this.widget.value = value;
  if (value == null || value == "") {
    return;
  }

  try {
    this._value = JSON.parse(value);
    this.boxcolor = "#AEA";
  } catch (err) {
    this.boxcolor = "red";
  }
};

ConstantData.prototype.onExecute = function () {
  this.setOutputData(0, this._value);
};


ConstantData.prototype.setValue =  function(v: string | number) {
  this.setProperty("value", v);
};