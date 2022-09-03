import Circuit from "./Circuit";
function Oscillator() {
  this.addOutput("O", "Boolean");
  this.value = true;
  this.time = Date.now();
  this.properties = {
    freq: 20 // 1Hz
  };
  this.value_widget = this.addWidget(
    "number",
    "Freq",
    this.properties.freq,
    "freq",
    { min: 1, max: 20, step: 10 }
  );
}
// node.constructor.title_color
Oscillator.title = "晶振";
Oscillator.shape = 2;
Oscillator.title_color = "#012";
Oscillator.registerType = "circuit/oscillator";

// prototype
Oscillator.prototype = Object.create(Circuit.prototype);
Oscillator.prototype.constructor = Oscillator;
Oscillator.prototype.onExecute = function () {
  let now = Date.now();
  if (now - this.time > 1000 / this.properties.freq) {
    this.time = now;
    this.value = !this.value;
    this.setOutputData(0, this.value);
    this.setDirtyCanvas(true, true);
  }
};
export default Oscillator;
