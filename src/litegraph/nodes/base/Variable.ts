
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