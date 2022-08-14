const install = LiteGraph => {
  // Constant
  function Time() {
    this.addOutput("in ms", "number");
    this.addOutput("in sec", "number");
  }

  Time.title = "Time";
  Time.desc = "Time";

  Time.prototype.onExecute = function () {
    this.setOutputData(0, this.graph.globaltime * 1000);
    this.setOutputData(1, this.graph.globaltime);
  };

  //Constant
  function ConstantNumber() {
    this.addOutput("value", "number");
    this.addProperty("value", 1.0);
    this.widget = this.addWidget("number", "value", 1, "value");
    this.widgets_up = true;
    this.size = [180, 30];
  }

  ConstantNumber.title = "Const Number";
  ConstantNumber.desc = "Constant number";

  ConstantNumber.prototype.onExecute = function () {
    this.setOutputData(0, parseFloat(this.properties["value"]));
  };

  ConstantNumber.prototype.getTitle = function () {
    if (this.flags.collapsed) {
      return this.properties.value;
    }
    return this.title;
  };

  ConstantNumber.prototype.setValue = function (v) {
    this.setProperty("value", v);
  };

  ConstantNumber.prototype.onDrawBackground = function (ctx) {
    //show the current value
    this.outputs[0].label = this.properties["value"].toFixed(3);
  };

  function ConstantBoolean() {
    this.addOutput("bool", "boolean");
    this.addProperty("value", true);
    this.widget = this.addWidget("toggle", "value", true, "value");
    this.serialize_widgets = true;
    this.widgets_up = true;
    this.size = [140, 30];
  }

  ConstantBoolean.title = "Const Boolean";
  ConstantBoolean.desc = "Constant boolean";
  ConstantBoolean.prototype.getTitle = ConstantNumber.prototype.getTitle;

  ConstantBoolean.prototype.onExecute = function () {
    this.setOutputData(0, this.properties["value"]);
  };

  ConstantBoolean.prototype.setValue = ConstantNumber.prototype.setValue;

  ConstantBoolean.prototype.onGetInputs = function () {
    return [["toggle", LiteGraph.ACTION]];
  };

  ConstantBoolean.prototype.onAction = function (action) {
    this.setValue(!this.properties.value);
  };

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

  function ConstantObject() {
    this.addOutput("obj", "object");
    this.size = [120, 30];
    this._object = {};
  }

  ConstantObject.title = "Const Object";
  ConstantObject.desc = "Constant Object";

  ConstantObject.prototype.onExecute = function () {
    this.setOutputData(0, this._object);
  };

  function ConstantFile() {
    this.addInput("url", "string");
    this.addOutput("file", "string");
    this.addProperty("url", "");
    this.addProperty("type", "text");
    this.widget = this.addWidget("text", "url", "", "url");
    this._data = null;
  }

  ConstantFile.title = "Const File";
  ConstantFile.desc = "Fetches a file from an url";
  ConstantFile["@type"] = { type: "enum", values: ["text", "arraybuffer", "blob", "json"] };

  ConstantFile.prototype.onPropertyChanged = function (name, value) {
    if (name == "url") {
      if (value == null || value == "") this._data = null;
      else {
        this.fetchFile(value);
      }
    }
  };

  ConstantFile.prototype.onExecute = function () {
    var url = this.getInputData(0) || this.properties.url;
    if (url && (url != this._url || this._type != this.properties.type)) this.fetchFile(url);
    this.setOutputData(0, this._data);
  };

  ConstantFile.prototype.setValue = ConstantNumber.prototype.setValue;

  ConstantFile.prototype.fetchFile = function (url) {
    var that = this;
    if (!url || url.constructor !== String) {
      that._data = null;
      that.boxcolor = null;
      return;
    }

    this._url = url;
    this._type = this.properties.type;
    if (url.substr(0, 4) == "http" && LiteGraph.proxy) {
      url = LiteGraph.proxy + url.substr(url.indexOf(":") + 3);
    }
    fetch(url)
      .then(function (response) {
        if (!response.ok) throw new Error("File not found");

        if (that.properties.type == "arraybuffer") return response.arrayBuffer();
        else if (that.properties.type == "text") return response.text();
        else if (that.properties.type == "json") return response.json();
        else if (that.properties.type == "blob") return response.blob();
      })
      .then(function (data) {
        that._data = data;
        that.boxcolor = "#AEA";
      })
      .catch(function (error) {
        that._data = null;
        that.boxcolor = "red";
        console.error("error fetching file:", url);
      });
  };

  ConstantFile.prototype.onDropFile = function (file) {
    var that = this;
    this._url = file.name;
    this._type = this.properties.type;
    this.properties.url = file.name;
    var reader = new FileReader();
    reader.onload = function (e) {
      that.boxcolor = "#AEA";
      var v = e.target.result;
      if (that.properties.type == "json") v = JSON.parse(v);
      that._data = v;
    };
    if (that.properties.type == "arraybuffer") reader.readAsArrayBuffer(file);
    else if (that.properties.type == "text" || that.properties.type == "json") reader.readAsText(file);
    else if (that.properties.type == "blob") return reader.readAsBinaryString(file);
  };

  //to store json objects
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

  ConstantData.prototype.setValue = ConstantNumber.prototype.setValue;

  //to store json objects
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

  ConstantArray.prototype.setValue = ConstantNumber.prototype.setValue;

  function SetArray() {
    this.addInput("arr", "array");
    this.addInput("value", "");
    this.addOutput("arr", "array");
    this.properties = { index: 0 };
    this.widget = this.addWidget("number", "i", this.properties.index, "index", { precision: 0, step: 10, min: 0 });
  }

  SetArray.title = "Set Array";
  SetArray.desc = "Sets index of array";

  SetArray.prototype.onExecute = function () {
    var arr = this.getInputData(0);
    if (!arr) return;
    var v = this.getInputData(1);
    if (v === undefined) return;
    if (this.properties.index) arr[Math.floor(this.properties.index)] = v;
    this.setOutputData(0, arr);
  };

  function ArrayElement() {
    this.addInput("array", "array,table,string");
    this.addInput("index", "number");
    this.addOutput("value", "");
    this.addProperty("index", 0);
  }

  ArrayElement.title = "Array[i]";
  ArrayElement.desc = "Returns an element from an array";

  ArrayElement.prototype.onExecute = function () {
    var array = this.getInputData(0);
    var index = this.getInputData(1);
    if (index == null) index = this.properties.index;
    if (array == null || index == null) return;
    this.setOutputData(0, array[Math.floor(Number(index))]);
  };

  function TableElement() {
    this.addInput("table", "table");
    this.addInput("row", "number");
    this.addInput("col", "number");
    this.addOutput("value", "");
    this.addProperty("row", 0);
    this.addProperty("column", 0);
  }

  TableElement.title = "Table[row][col]";
  TableElement.desc = "Returns an element from a table";

  TableElement.prototype.onExecute = function () {
    var table = this.getInputData(0);
    var row = this.getInputData(1);
    var col = this.getInputData(2);
    if (row == null) row = this.properties.row;
    if (col == null) col = this.properties.column;
    if (table == null || row == null || col == null) return;
    var row = table[Math.floor(Number(row))];
    if (row) this.setOutputData(0, row[Math.floor(Number(col))]);
    else this.setOutputData(0, null);
  };

  function ObjectProperty() {
    this.addInput("obj", "object");
    this.addOutput("property", 0);
    this.addProperty("value", 0);
    this.widget = this.addWidget("text", "prop.", "", this.setValue.bind(this));
    this.widgets_up = true;
    this.size = [140, 30];
    this._value = null;
  }

  ObjectProperty.title = "Object property";
  ObjectProperty.desc = "Outputs the property of an object";

  ObjectProperty.prototype.setValue = function (v) {
    this.properties.value = v;
    this.widget.value = v;
  };

  ObjectProperty.prototype.getTitle = function () {
    if (this.flags.collapsed) {
      return "in." + this.properties.value;
    }
    return this.title;
  };

  ObjectProperty.prototype.onPropertyChanged = function (name, value) {
    this.widget.value = value;
  };

  ObjectProperty.prototype.onExecute = function () {
    var data = this.getInputData(0);
    if (data != null) {
      this.setOutputData(0, data[this.properties.value]);
    }
  };

  function ObjectKeys() {
    this.addInput("obj", "");
    this.addOutput("keys", "array");
    this.size = [140, 30];
  }

  ObjectKeys.title = "Object keys";
  ObjectKeys.desc = "Outputs an array with the keys of an object";

  ObjectKeys.prototype.onExecute = function () {
    var data = this.getInputData(0);
    if (data != null) {
      this.setOutputData(0, Object.keys(data));
    }
  };

  function SetObject() {
    this.addInput("obj", "");
    this.addInput("value", "");
    this.addOutput("obj", "");
    this.properties = { property: "" };
    this.name_widget = this.addWidget("text", "prop.", this.properties.property, "property");
  }

  SetObject.title = "Set Object";
  SetObject.desc = "Adds propertiesrty to object";

  SetObject.prototype.onExecute = function () {
    var obj = this.getInputData(0);
    if (!obj) return;
    var v = this.getInputData(1);
    if (v === undefined) return;
    if (this.properties.property) obj[this.properties.property] = v;
    this.setOutputData(0, obj);
  };

  function MergeObjects() {
    this.addInput("A", "object");
    this.addInput("B", "object");
    this.addOutput("out", "object");
    this._result = {};
    var that = this;
    this.addWidget("button", "clear", "", function () {
      that._result = {};
    });
    this.size = this.computeSize();
  }

  MergeObjects.title = "Merge Objects";
  MergeObjects.desc = "Creates an object copying properties from others";

  MergeObjects.prototype.onExecute = function () {
    var A = this.getInputData(0);
    var B = this.getInputData(1);
    var C = this._result;
    if (A) for (var i in A) C[i] = A[i];
    if (B) for (var i in B) C[i] = B[i];
    this.setOutputData(0, C);
  };

  //Store as variable
  function Variable() {
    this.size = [60, 30];
    this.addInput("in");
    this.addOutput("out");
    this.properties = { varname: "myname", container: Variable.LITEGRAPH };
    this.value = null;
  }

  Variable.title = "Variable";
  Variable.desc = "store/read variable value";

  Variable.LITEGRAPH = 0; //between all graphs
  Variable.GRAPH = 1; //only inside this graph
  Variable.GLOBALSCOPE = 2; //attached to Window

  Variable["@container"] = {
    type: "enum",
    values: { litegraph: Variable.LITEGRAPH, graph: Variable.GRAPH, global: Variable.GLOBALSCOPE }
  };

  Variable.prototype.onExecute = function () {
    var container = this.getContainer();

    if (this.isInputConnected(0)) {
      this.value = this.getInputData(0);
      container[this.properties.varname] = this.value;
      this.setOutputData(0, this.value);
      return;
    }

    this.setOutputData(0, container[this.properties.varname]);
  };

  Variable.prototype.getContainer = function () {
    switch (this.properties.container) {
      case Variable.GRAPH:
        if (this.graph) return this.graph.vars;
        return {};
        break;
      case Variable.GLOBALSCOPE:
        return global;
        break;
      case Variable.LITEGRAPH:
      default:
        return LiteGraph.Globals;
        break;
    }
  };

  Variable.prototype.getTitle = function () {
    return this.properties.varname;
  };

  function DownloadData() {
    this.size = [60, 30];
    this.addInput("data", 0);
    this.addInput("download", LiteGraph.ACTION);
    this.properties = { filename: "data.json" };
    this.value = null;
    var that = this;
    this.addWidget("button", "Download", "", function (v) {
      if (!that.value) return;
      that.downloadAsFile();
    });
  }

  DownloadData.title = "Download";
  DownloadData.desc = "Download some data";

  DownloadData.prototype.downloadAsFile = function () {
    if (this.value == null) return;

    var str = null;
    if (this.value.constructor === String) str = this.value;
    else str = JSON.stringify(this.value);

    var file = new Blob([str]);
    var url = URL.createObjectURL(file);
    var element = document.createElement("a");
    element.setAttribute("href", url);
    element.setAttribute("download", this.properties.filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000 * 60); //wait one minute to revoke url
  };

  DownloadData.prototype.onAction = function (action, param) {
    var that = this;
    setTimeout(function () {
      that.downloadAsFile();
    }, 100); //deferred to avoid blocking the renderer with the popup
  };

  DownloadData.prototype.onExecute = function () {
    if (this.inputs[0]) {
      this.value = this.getInputData(0);
    }
  };

  DownloadData.prototype.getTitle = function () {
    if (this.flags.collapsed) {
      return this.properties.filename;
    }
    return this.title;
  };

  //Watch a value in the editor
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

  //Show value inside the debug console
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

  //Execites simple code
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

  function length(v) {
    if (v && v.length != null) return Number(v.length);
    return 0;
  }

  function not(a) {
    return !a;
  }

  LiteGraph.registerNodeType("basic/time", Time);
  LiteGraph.registerNodeType("basic/const", ConstantNumber);
  LiteGraph.registerNodeType("basic/boolean", ConstantBoolean);
  LiteGraph.registerNodeType("basic/string", ConstantString);
  LiteGraph.registerNodeType("basic/object", ConstantObject);

  LiteGraph.registerNodeType("basic/file", ConstantFile);
  LiteGraph.registerNodeType("basic/data", ConstantData);
  LiteGraph.registerNodeType("basic/array", ConstantArray);
  LiteGraph.registerNodeType("basic/set_array", SetArray);
  LiteGraph.registerNodeType("basic/array[]", ArrayElement);
  LiteGraph.registerNodeType("basic/table[][]", TableElement);

  LiteGraph.registerNodeType("basic/object_property", ObjectProperty);
  LiteGraph.registerNodeType("basic/object_keys", ObjectKeys);
  LiteGraph.registerNodeType("basic/set_object", SetObject);
  LiteGraph.registerNodeType("basic/merge_objects", MergeObjects);

  LiteGraph.registerNodeType("basic/variable", Variable);
  LiteGraph.registerNodeType("basic/download", DownloadData);
  LiteGraph.registerNodeType("basic/watch", Watch);
  LiteGraph.registerNodeType("basic/cast", Cast);

  LiteGraph.registerNodeType("basic/console", Console);
  LiteGraph.registerNodeType("basic/alert", Alert);
  LiteGraph.registerNodeType("basic/script", NodeScript);
  LiteGraph.registerNodeType("basic/CompareValues", GenericCompare);

  LiteGraph.wrapFunctionAsNode("basic/length", length, [""], "number");
  LiteGraph.wrapFunctionAsNode("basic/not", not, [""], "boolean");
};

export default { install };
