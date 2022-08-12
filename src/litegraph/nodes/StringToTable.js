const install = LiteGraph => {
	function StringToTable() {
		this.addInput("", "string");
		this.addOutput("table", "table");
		this.addOutput("rows", "number");
		this.addProperty("value", "");
		this.addProperty("separator", ",");
		this._table = null;
	}

	StringToTable.title = "toTable";
	StringToTable.desc = "Splits a string to table";

	StringToTable.prototype.onExecute = function () {
		var input = this.getInputData(0);
		if (!input) return;
		var separator = this.properties.separator || ",";
		if (input != this._str || separator != this._last_separator) {
			this._last_separator = separator;
			this._str = input;
			this._table = input.split("\n").map(function (a) {
				return a.trim().split(separator);
			});
		}
		this.setOutputData(0, this._table);
		this.setOutputData(1, this._table ? this._table.length : 0);
	};

	LiteGraph.registerNodeType("string/toTable", StringToTable);
};
export default { install };
