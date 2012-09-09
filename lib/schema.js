
var Schema = module.exports = function(schema, indexes) {
	this.schema = schema;
};

Schema.prototype.createIndex = function(index) {

	this.indexes.push(index);
};
