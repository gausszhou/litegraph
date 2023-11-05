// Show value inside the debug console
function Alert() {
  this.mode = LiteGraph.ON_EVENT;
  this.addProperty("msg", "");
  this.addInput("", LiteGraph.EVENT);
  var that = this;
  this.widget = this.addWidget("text", "Text", "", "msg");
  this.widgets_up = true;
  this.size = [200, 30];
}

Alert.title = "Alert";
Alert.desc = "Show an alert window";
Alert.color = "#510";

Alert.prototype.onConfigure = function (o) {
  this.widget.value = o.properties.msg;
};

Alert.prototype.onAction = function (action, param) {
  var msg = this.properties.msg;
  setTimeout(function () {
    alert(msg);
  }, 10);
};