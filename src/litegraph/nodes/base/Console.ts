import LiteGraph from "../../core/LiteGraph";

//Show value inside the debug console
function Console() {
  this.mode = LiteGraph.ON_EVENT;
  this.size = [80, 30];
  this.addProperty("msg", "");
  this.addInput("log", LiteGraph.EVENT);
  this.addInput("msg", 0);
}

Console.title = "Console";
Console.desc = "Show value inside the console";

Console.prototype.onAction = function (action, param) {
  // param is the action
  var msg = this.getInputData(1); //getInputDataByName("msg");
  //if (msg == null || typeof msg == "undefined") return;
  if (!msg) msg = this.properties.msg;
  if (!msg) msg = "Event: " + param; // msg is undefined if the slot is lost?
  if (action == "log") {
    console.log(msg);
  } else if (action == "warn") {
    console.warn(msg);
  } else if (action == "error") {
    console.error(msg);
  }
};

Console.prototype.onExecute = function () {
  var msg = this.getInputData(1); //getInputDataByName("msg");
  if (!msg) msg = this.properties.msg;
  if (msg != null && typeof msg != "undefined") {
    this.properties.msg = msg;
    console.log(msg);
  }
};

Console.prototype.onGetInputs = function () {
  return [
    ["log", LiteGraph.ACTION],
    ["warn", LiteGraph.ACTION],
    ["error", LiteGraph.ACTION]
  ];
};