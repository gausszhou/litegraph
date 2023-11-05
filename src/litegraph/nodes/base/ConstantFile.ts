function ConstantFile() {
  this.addInput("url", "string");
  this.addOutput("file", "string");
  this.addProperty("url", "");
  this.addProperty("type", "text");
  this.widget = this.addWidget("text", "url", "", "url");
  this._data = null;
}

ConstantFile.title = "Const File";
ConstantFile.desc = "Fetches a file from an url";
ConstantFile["@type"] = { type: "enum", values: ["text", "arraybuffer", "blob", "json"] };

ConstantFile.prototype.onPropertyChanged = function (name, value) {
  if (name == "url") {
    if (value == null || value == "") this._data = null;
    else {
      this.fetchFile(value);
    }
  }
};

ConstantFile.prototype.onExecute = function () {
  var url = this.getInputData(0) || this.properties.url;
  if (url && (url != this._url || this._type != this.properties.type)) this.fetchFile(url);
  this.setOutputData(0, this._data);
};

ConstantFile.prototype.setValue =  function(v: string | number) {
  this.setProperty("value", v);
};

ConstantFile.prototype.fetchFile = function (url) {
  var that = this;
  if (!url || url.constructor !== String) {
    that._data = null;
    that.boxcolor = null;
    return;
  }

  this._url = url;
  this._type = this.properties.type;
  if (url.substr(0, 4) == "http" && LiteGraph.proxy) {
    url = LiteGraph.proxy + url.substr(url.indexOf(":") + 3);
  }
  fetch(url)
    .then(function (response) {
      if (!response.ok) throw new Error("File not found");

      if (that.properties.type == "arraybuffer") return response.arrayBuffer();
      else if (that.properties.type == "text") return response.text();
      else if (that.properties.type == "json") return response.json();
      else if (that.properties.type == "blob") return response.blob();
    })
    .then(function (data) {
      that._data = data;
      that.boxcolor = "#AEA";
    })
    .catch(function (error) {
      that._data = null;
      that.boxcolor = "red";
      console.error("error fetching file:", url);
    });
};

ConstantFile.prototype.onDropFile = function (file) {
  var that = this;
  this._url = file.name;
  this._type = this.properties.type;
  this.properties.url = file.name;
  var reader = new FileReader();
  reader.onload = function (e) {
    that.boxcolor = "#AEA";
    var v = e.target.result;
    if (that.properties.type == "json") v = JSON.parse(v);
    that._data = v;
  };
  if (that.properties.type == "arraybuffer") reader.readAsArrayBuffer(file);
  else if (that.properties.type == "text" || that.properties.type == "json") reader.readAsText(file);
  else if (that.properties.type == "blob") return reader.readAsBinaryString(file);
};