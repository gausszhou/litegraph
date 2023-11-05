
function ConstantString() {
  this.addOutput("string", "string");
  this.addProperty("value", "");
  this.widget = this.addWidget("text", "value", "", "value"); //link to property value
  this.widgets_up = true;
  this.size = [180, 30];
}

ConstantString.title = "Const String";
ConstantString.desc = "Constant string";

ConstantString.prototype.getTitle = ConstantNumber.prototype.getTitle;

ConstantString.prototype.onExecute = function () {
  this.setOutputData(0, this.properties["value"]);
};

ConstantString.prototype.setValue = ConstantNumber.prototype.setValue;

ConstantString.prototype.onDropFile = function (file) {
  var that = this;
  var reader = new FileReader();
  reader.onload = function (e) {
    that.setProperty("value", e.target.result);
  };
  reader.readAsText(file);
};