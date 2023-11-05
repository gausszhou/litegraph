// Watch a value in the editor
function Watch() {
  this.size = [60, 30];
  this.addInput("value", 0, { label: "" });
  this.value = 0;
}

Watch.title = "Watch";
Watch.desc = "Show value of input";
Watch.toString = function (o) {
  if (o == null) {
    return "null";
  } else if (o.constructor === Number) {
    return o.toFixed(3);
  } else if (o.constructor === Array) {
    var str = "[";
    for (var i = 0; i < o.length; ++i) {
      str += Watch.toString(o[i]) + (i + 1 != o.length ? "," : "");
    }
    str += "]";
    return str;
  } else {
    return String(o);
  }
};

Watch.prototype.getTitle = function () {
  if (this.flags.collapsed) {
    return this.inputs[0].label;
  }
  return this.title;
};

Watch.prototype.onExecute = function () {
  if (this.inputs[0]) {
    this.value = this.getInputData(0);
  }
};



// show the current value
Watch.prototype.onDrawBackground = function (ctx) {
  this.inputs[0].label = Watch.toString(this.value);
};