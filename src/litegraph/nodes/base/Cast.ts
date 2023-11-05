
//in case one type does ntt match other type but you want to connect them anyway

function Cast() {
  this.addInput("in", 0);
  this.addOutput("out", 0);
  this.size = [40, 30];
}

Cast.title = "Cast";
Cast.desc = "Allows to connect different types";

Cast.prototype.onExecute = function () {
  this.setOutputData(0, this.getInputData(0));
};