

  //Show value inside the debug console
  function WidgetSliderGUI() {
    this.addOutput("", "number");
    this.properties = {
      value: 0.5,
      min: 0,
      max: 1,
      text: "V"
    };
    var that = this;
    this.size = [140, 40];
    this.slider = this.addWidget(
      "slider",
      "V",
      this.properties.value,
      function (v) {
        that.properties.value = v;
      },
      this.properties
    );
    this.widgets_up = true;
  }

  WidgetSliderGUI.title = "Inner Slider";

  WidgetSliderGUI.prototype.onPropertyChanged = function (name, value) {
    if (name == "value") {
      this.slider.value = value;
    }
  };

  WidgetSliderGUI.prototype.onExecute = function () {
    this.setOutputData(0, this.properties.value);
  };


