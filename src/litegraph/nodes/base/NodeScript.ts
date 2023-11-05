// Execites simple code
function NodeScript() {
  this.size = [60, 30];
  this.addProperty("onExecute", "return A;");
  this.addInput("A", 0);
  this.addInput("B", 0);
  this.addOutput("out", 0);

  this._func = null;
  this.data = {};
}

NodeScript.prototype.onConfigure = function (o) {
  if (o.properties.onExecute && LiteGraph.allow_scripts) this.compileCode(o.properties.onExecute);
  else console.warn("Script not compiled, LiteGraph.allow_scripts is false");
};

NodeScript.title = "Script";
NodeScript.desc = "executes a code (max 100 characters)";

NodeScript.widgets_info = {
  onExecute: { type: "code" }
};

NodeScript.prototype.onPropertyChanged = function (name, value) {
  if (name == "onExecute" && LiteGraph.allow_scripts) this.compileCode(value);
  else console.warn("Script not compiled, LiteGraph.allow_scripts is false");
};

NodeScript.prototype.compileCode = function (code) {
  this._func = null;
  if (code.length > 256) {
    console.warn("Script too long, max 256 chars");
  } else {
    var code_low = code.toLowerCase();
    var forbidden_words = ["script", "body", "document", "eval", "nodescript", "function"]; //bad security solution
    for (var i = 0; i < forbidden_words.length; ++i) {
      if (code_low.indexOf(forbidden_words[i]) != -1) {
        console.warn("invalid script");
        return;
      }
    }
    try {
      this._func = new Function("A", "B", "C", "DATA", "node", code);
    } catch (err) {
      console.error("Error parsing script");
      console.error(err);
    }
  }
};

NodeScript.prototype.onExecute = function () {
  if (!this._func) {
    return;
  }

  try {
    var A = this.getInputData(0);
    var B = this.getInputData(1);
    var C = this.getInputData(2);
    this.setOutputData(0, this._func(A, B, C, this.data, this));
  } catch (err) {
    console.error("Error in script");
    console.error(err);
  }
};

NodeScript.prototype.onGetOutputs = function () {
  return [["C", ""]];
};