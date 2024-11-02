

export  default  function WidgetPanel() {
  this.size = [200, 100];
  this.properties = {
    borderColor: "#ffffff",
    bgcolorTop: "#f0f0f0",
    bgcolorBottom: "#e0e0e0",
    shadowSize: 2,
    borderRadius: 3
  };
}

WidgetPanel.title = "Panel";
WidgetPanel.desc = "Non interactive panel";
WidgetPanel.widgets = [{ name: "update", text: "Update", type: "button" }];

WidgetPanel.prototype.createGradient = function (ctx) {
  if (this.properties["bgcolorTop"] == "" || this.properties["bgcolorBottom"] == "") {
    this.lineargradient = 0;
    return;
  }

  this.lineargradient = ctx.createLinearGradient(0, 0, 0, this.size[1]);
  this.lineargradient.addColorStop(0, this.properties["bgcolorTop"]);
  this.lineargradient.addColorStop(1, this.properties["bgcolorBottom"]);
};

WidgetPanel.prototype.onDrawForeground = function (ctx) {
  if (this.flags.collapsed) {
    return;
  }

  if (this.lineargradient == null) {
    this.createGradient(ctx);
  }

  if (!this.lineargradient) {
    return;
  }

  ctx.lineWidth = 1;
  ctx.strokeStyle = this.properties["borderColor"];
  //ctx.fillStyle = "#ebebeb";
  ctx.fillStyle = this.lineargradient;

  if (this.properties["shadowSize"]) {
    ctx.shadowColor = "#000";
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = this.properties["shadowSize"];
  } else {
    ctx.shadowColor = "transparent";
  }

  ctx.roundRect(0, 0, this.size[0] - 1, this.size[1] - 1, this.properties["shadowSize"]);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.stroke();
};


