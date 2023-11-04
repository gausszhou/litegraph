import LGraphNode from "../../core/LGraphNode";

/**
 * 时序，从序列中选择一个值输出
 * @example sequence: A,B,C index: 1 => out: B
 */
class Sequence extends LGraphNode {
  static title = "Sequence";
  static desc = "select one element from a sequence from a string";
  current_sequence: string = "";
  index: number;
  values: string[]
  constructor() {
    super();
    this.properties = {
      sequence: "A,B,C"
    };
    this.addInput("index", "number");
    this.addInput("seq","*");
    this.addOutput("out","*");
    this.index = 0;
    this.values = this.properties.sequence.split(",");
  }
  
  onPropertyChanged (name: string, value: string) {
    if (name == "sequence") {
      this.values = value.split(",");
    }
  };

  onExecute () {
    const seq = this.getInputData(1);
    if (seq && seq !== this.current_sequence) {
      this.current_sequence = seq;
      this.values = seq.split(",");
    }
    let index = this.getInputData(0);
    if (typeof index !== 'number') {
      index = 0;
    }
    this.index = index = Math.round(index) % this.values.length;
    this.setOutputData(0, this.values[index]);
  };
}

export default Sequence;
