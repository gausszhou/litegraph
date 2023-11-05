function GenericCompare() {
  this.addInput("A", 0);
  this.addInput("B", 0);
  this.addOutput("true", "boolean");
  this.addOutput("false", "boolean");
  this.addProperty("A", 1);
  this.addProperty("B", 1);
  this.addProperty("OP", "==", "enum", { values: GenericCompare.values });
  this.addWidget("combo", "Op.", this.properties.OP, { property: "OP", values: GenericCompare.values });

  this.size = [80, 60];
}

GenericCompare.values = ["==", "!="]; //[">", "<", "==", "!=", "<=", ">=", "||", "&&" ];

GenericCompare["@OP"] = {
  type: "enum",
  title: "operation",
  values: GenericCompare.values
};

GenericCompare.title = "Compare *";
GenericCompare.desc = "evaluates condition between A and B";

GenericCompare.prototype.getTitle = function () {
  return "*A " + this.properties.OP + " *B";
};

GenericCompare.prototype.onExecute = function () {
  var A = this.getInputData(0);
  if (A === undefined) {
    A = this.properties.A;
  } else {
    this.properties.A = A;
  }

  var B = this.getInputData(1);
  if (B === undefined) {
    B = this.properties.B;
  } else {
    this.properties.B = B;
  }

  var result = false;
  if (typeof A == typeof B) {
    switch (this.properties.OP) {
      case "==":
      case "!=":
        // traverse both objects.. consider that this is not a true deep check! consider underscore or other library for thath :: _isEqual()
        result = true;
        switch (typeof A) {
          case "object":
            var aProps = Object.getOwnPropertyNames(A);
            var bProps = Object.getOwnPropertyNames(B);
            if (aProps.length != bProps.length) {
              result = false;
              break;
            }
            for (var i = 0; i < aProps.length; i++) {
              var propName = aProps[i];
              if (A[propName] !== B[propName]) {
                result = false;
                break;
              }
            }
            break;
          default:
            result = A == B;
        }
        if (this.properties.OP == "!=") result = !result;
        break;
      /*case ">":
              result = A > B;
              break;
          case "<":
              result = A < B;
              break;
          case "<=":
              result = A <= B;
              break;
          case ">=":
              result = A >= B;
              break;
          case "||":
              result = A || B;
              break;
          case "&&":
              result = A && B;
              break;*/
    }
  }
  this.setOutputData(0, result);
  this.setOutputData(1, !result);
};
