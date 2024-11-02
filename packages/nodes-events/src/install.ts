import DelayEvent from "./DelayEvent";
import EventBranch from "./EventBranch";
import FilterEvent from "./FilterEvent";
import FrameDelayEvent from "./FrameDelayEvent";
import LogEvent from "./LogEvent";
import Sequence from "./Sequence";
import TriggerEvent from "./TriggerEvent";
import WrapAsEvent from "./WrapAsEvent";

export const install = (LiteGraph: any) => {
  LiteGraph.registerNodeType({
    class: DelayEvent,
    title: "Delay",
    desc: "Delays one event",
    type: "events/delay",
  });

  LiteGraph.registerNodeType({
    class: EventBranch,
    title: "Branch",
    desc: "If condition is true, outputs triggers true, otherwise false",
    type: "events/branch",
  });
  LiteGraph.registerNodeType({
    class: FilterEvent,
    title: "Filter Event",
    desc: "Blocks events that do not match the filter",
    type: "events/filter",
  });
  LiteGraph.registerNodeType({
    class: FrameDelayEvent,
    title: "Frame Delay",
    desc: "Delays one event by frame count",
    type: "events/frame_delay",
  });

  LiteGraph.registerNodeType({
    class: LogEvent,
    title: "Log Event",
    desc: "Log event in console",
    type: "events/log",
  });

  LiteGraph.registerNodeType({
    class: Sequence,
    title: "Sequence",
    desc: "Triggers a sequence of events when an event arrives",
    type: "events/sequence",
  });

  LiteGraph.registerNodeType({
    class: TriggerEvent,
    title: "Trigger Event",
    desc: "Triggers event if input evaluates to true",
    type: "events/trigger",
  });

  LiteGraph.registerNodeType({
    class: WrapAsEvent,
    title: "Wrap As Event",
    desc: "Triggers an event setting its parameter to the input value",
    type: "events/wrap_as_event",
  });
};
