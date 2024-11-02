import WidgetButton from "./WidgetButton";
import WidgetCombo from "./WidgetCombo";
import WidgetHSlider from "./WidgetHSlider";
import WidgetKnob from "./WidgetKnob";
import WidgetNumber from "./WidgetNumber";
import WidgetPanel from "./WidgetPanel";
import WidgetProgress from "./WidgetProgress";
import WidgetSliderGUI from "./WidgetSliderGUI";
import WidgetText from "./WidgetText";
import WidgetToggle from "./WidgetToggle";

export const install = (LiteGraph: any) => {
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
