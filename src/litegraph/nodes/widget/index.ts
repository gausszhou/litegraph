const install = LiteGraph => {

  LiteGraph.registerNodeType("widget/button", WidgetButton);
  LiteGraph.registerNodeType("widget/toggle", WidgetToggle);

  LiteGraph.registerNodeType("widget/number", WidgetNumber);
  LiteGraph.registerNodeType("widget/combo", WidgetCombo);
  LiteGraph.registerNodeType("widget/knob", WidgetKnob);

  LiteGraph.registerNodeType("widget/internal_slider", WidgetSliderGUI);
  LiteGraph.registerNodeType("widget/hslider", WidgetHSlider);
  LiteGraph.registerNodeType("widget/progress", WidgetProgress);
  LiteGraph.registerNodeType("widget/text", WidgetText);
  LiteGraph.registerNodeType("widget/panel", WidgetPanel);
};

export default { install };
