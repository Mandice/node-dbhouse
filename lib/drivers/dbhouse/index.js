var DBHouse = require('../../../index');

function DBHouseDriver() {
	this.server = null;
}
module.exports = DBHouseDriver;

DBHouseDriver.prototype.connect = function(options, callback) {
	this.server = 'dummy';

	if (callback)
		callback();
};

DBHouseDriver.prototype.query = function(dbName, tableName, conditions, options, callback) {
	var jsql = [{
		cmd: 'query',
		dbName: dbName,
		tableName: tableName,
		conditions: conditions,
		options: options
	}];
};

DBHouseDriver.prototype.delete = function(dbName, tableName, conditions, callback) {
	var jsql = [{
		cmd: 'delete',
		dbName: dbName,
		tableName: tableName,
		conditions: conditions
	}];
};

DBHouseDriver.prototype.insert = function(dbName, tableName, data, options, callback) {
};

DBHouseDriver.prototype.update = function(dbName, tableName, data, conditions, options, callback) {
};

DBHouseDriver.prototype.replace = function(dbName, tableName, data, conditions, options, callback) {
};

DBHouseDriver.prototype.drop = function(dbName, tableName, callback) {
};
