import { BuiltInSlotType } from "@gausszhou/litegraph-core";

export default function WidgetCombo(this: any) {
  this.addOutput("", "string");
  this.addOutput("change", BuiltInSlotType.EVENT);
  this.size = [80, 60];
  this.properties = { value: "A", values: "A;B;C" };
  this.old_y = -1;
  this.mouse_captured = false;
  this._values = this.properties.values.split(";");
  var that = this;
  this.widgets_up = true;
  this.widget = this.addWidget(
    "combo",
    "",
    this.properties.value,
    function (v: any) {
      that.properties.value = v;
      that.triggerSlot(1, v);
    },
    { property: "value", values: this._values }
  );
}

WidgetCombo.title = "Combo";
WidgetCombo.desc = "Widget to select from a list";

WidgetCombo.prototype.onExecute = function (this: any) {
  this.setOutputData(0, this.properties.value);
};

WidgetCombo.prototype.onPropertyChanged = function (this: any, name: string, value: any) {
  if (name == "values") {
    this._values = value.split(";");
    this.widget.options.values = this._values;
  } else if (name == "value") {
    this.widget.value = value;
  }
};
