const install = LiteGraph => {
  //Show value inside the debug console
  function TestWidgetsNode() {
    this.addOutput("", "number");
    this.properties = {};
    this.slider = this.addWidget("slider", "Slider", 0.5, function (v) {}, { min: 0, max: 1 });
    this.number = this.addWidget("number", "Number", 0.5, function (v) {}, { min: 0, max: 100 });
    this.combo = this.addWidget("combo", "Combo", "red", function (v) {}, { values: ["red", "green", "blue"] });
    this.text = this.addWidget("text", "Text", "edit me", function (v) {}, {});
    this.text2 = this.addWidget("text", "Text", "multiline", function (v) {}, { multiline: true });
    this.toggle = this.addWidget("toggle", "Toggle", true, function (v) {}, { on: "enabled", off: "disabled" });
    this.button = this.addWidget("button", "Button", null, function (v) {}, {});
    this.toggle2 = this.addWidget("toggle", "Disabled", true, function (v) {}, { on: "enabled", off: "disabled" });
    this.toggle2.disabled = true;
    this.serialize_widgets = true;
    this.size = this.computeSize();
  }

  TestWidgetsNode.title = "Widgets";

  //Show value inside the debug console
  function TestSpecialNode() {
    this.addInput("", "number");
    this.addOutput("", "number");
    this.properties = {};
    this.size = this.computeSize();
    this.visible = false;
    this.enabled = false;
  }

  TestSpecialNode.title = "Custom Shapes";
  TestSpecialNode.title_mode = LiteGraph.TRANSPARENT_TITLE;
  TestSpecialNode.slot_start_y = 20;

  TestSpecialNode.prototype.onDrawBackground = function (ctx) {
    if (this.flags.collapsed) return;

    ctx.fillStyle = "#555";
    ctx.fillRect(0, 0, this.size[0], 20);

    if (this.enabled) {
      ctx.fillStyle = "#AFB";
      ctx.beginPath();
      ctx.moveTo(this.size[0] - 20, 0);
      ctx.lineTo(this.size[0] - 25, 20);
      ctx.lineTo(this.size[0], 20);
      ctx.lineTo(this.size[0], 0);
      ctx.fill();
    }

    if (this.visible) {
      ctx.fillStyle = "#ABF";
      ctx.beginPath();
      ctx.moveTo(this.size[0] - 40, 0);
      ctx.lineTo(this.size[0] - 45, 20);
      ctx.lineTo(this.size[0] - 25, 20);
      ctx.lineTo(this.size[0] - 20, 0);
      ctx.fill();
    }

    ctx.strokeStyle = "#333";
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.lineTo(this.size[0] + 1, 20);
    ctx.moveTo(this.size[0] - 20, 0);
    ctx.lineTo(this.size[0] - 25, 20);
    ctx.moveTo(this.size[0] - 40, 0);
    ctx.lineTo(this.size[0] - 45, 20);
    ctx.stroke();

    if (this.mouseOver) {
      ctx.fillStyle = "#AAA";
      ctx.fillText("Example of helper", 0, this.size[1] + 14);
    }
  };

  TestSpecialNode.prototype.onMouseDown = function (e, pos) {
    if (pos[1] > 20) return;

    if (pos[0] > this.size[0] - 20) this.enabled = !this.enabled;
    else if (pos[0] > this.size[0] - 40) this.visible = !this.visible;
  };

  TestSpecialNode.prototype.onBounding = function (rect) {
    if (!this.flags.collapsed && this.mouseOver) rect[3] = this.size[1] + 20;
  };

  //Show value inside the debug console
  function TestSlotsNode() {
    this.addInput("C", "number");
    this.addOutput("A", "number");
    this.addOutput("B", "number");
    this.horizontal = true;
    this.size = [100, 40];
  }

  TestSlotsNode.title = "Flat Slots";

  //Show value inside the debug console
  function TestPropertyEditorsNode() {
    this.properties = {
      name: "foo",
      age: 10,
      alive: true,
      children: ["John", "Emily", "Charles"],
      skills: {
        speed: 10,
        dexterity: 100
      }
    };

    var that = this;
    this.addWidget("button", "Log", null, function () {
      console.log(that.properties);
    });
  }

  TestPropertyEditorsNode.title = "Properties";

  // register
  LiteGraph.registerNodeType("features/widgets", TestWidgetsNode);
  LiteGraph.registerNodeType("features/shape", TestSpecialNode);
  LiteGraph.registerNodeType("features/slots", TestSlotsNode);
  LiteGraph.registerNodeType("features/properties_editor", TestPropertyEditorsNode);
};

export default { install };
