import { BuiltInSlotType } from "@gausszhou/litegraph-core/src/types";

 //Show value inside the debug console
export default function EventCounter() {
  this.addInput("inc", BuiltInSlotType.ACTION);
  this.addInput("dec", BuiltInSlotType.ACTION);
  this.addInput("reset", BuiltInSlotType.ACTION);
  this.addOutput("change", BuiltInSlotType.EVENT);
  this.addOutput("num", "number");
  this.addProperty("doCountExecution", false, "boolean", {name: "Count Executions"});
  this.addWidget("toggle","Count Exec.",this.properties.doCountExecution,"doCountExecution");
  this.num = 0;
}

EventCounter.title = "Counter";
EventCounter.desc = "Counts events";

EventCounter.prototype.getTitle = function() {
  if (this.flags.collapsed) {
      return String(this.num);
  }
  return this.title;
};

EventCounter.prototype.onAction = function(action, param, options) {
  var v = this.num;
  if (action == "inc") {
      this.num += 1;
  } else if (action == "dec") {
      this.num -= 1;
  } else if (action == "reset") {
      this.num = 0;
  }
  if (this.num != v) {
      this.trigger("change", this.num);
  }
};

EventCounter.prototype.onDrawBackground = function(ctx) {
  if (this.flags.collapsed) {
      return;
  }
  ctx.fillStyle = "#AAA";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.fillText(this.num, this.size[0] * 0.5, this.size[1] * 0.5);
};

EventCounter.prototype.onExecute = function() {
  if(this.properties.doCountExecution){
      this.num += 1;
  }
  this.setOutputData(1, this.num);
};

