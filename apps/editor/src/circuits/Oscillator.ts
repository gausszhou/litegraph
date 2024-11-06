import { LGraphNode } from "@gausszhou/litegraph-core";

export default class Oscillator extends LGraphNode {
  static title = "Oscillator";
  static desc  = "Oscillator"
  static shape = 1;
  static title_color = "#012";
  static registerType = "circuit/oscillator";
  static filter = "is_filter";
  time: number;
  value: boolean;
  value_widget;

  constructor() {
    super();
    this.addOutput("level", "Boolean");
    this.value = true;
    this.time = Date.now();
    this.properties = {
      freq: 1, // 1Hz
    };
    this.value_widget = this.addWidget(
      "number",
      "Freq",
      this.properties.freq,
      "freq",
      { min: 1, max: 20, step: 1 }
    );
  }

  onExecute() {
    let now = Date.now();
    if (now - this.time > 1000 / this.properties.freq) {
      this.time = now;
      this.value = !this.value;
      this.setOutputData(0, this.value);
      this.setDirtyCanvas(true, true);
    }
  }
}

