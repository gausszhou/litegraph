function TableElement() {
  this.addInput("table", "table");
  this.addInput("row", "number");
  this.addInput("col", "number");
  this.addOutput("value", "");
  this.addProperty("row", 0);
  this.addProperty("column", 0);
}

TableElement.title = "Table[row][col]";
TableElement.desc = "Returns an element from a table";

TableElement.prototype.onExecute = function () {
  var table = this.getInputData(0);
  var row = this.getInputData(1);
  var col = this.getInputData(2);
  if (row == null) row = this.properties.row;
  if (col == null) col = this.properties.column;
  if (table == null || row == null || col == null) return;
  var row = table[Math.floor(Number(row))];
  if (row) this.setOutputData(0, row[Math.floor(Number(col))]);
  else this.setOutputData(0, null);
};