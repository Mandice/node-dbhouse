var MongoDB = require('mongodb');

module.exports = function() {
	var self = this;
	this.server = null;

	this.connect = function(driver, options) {

		switch(driver) {
		case 'mongodb':
			self.server = new MongoDB.Server('localhost', 27017, { auto_reconnect: true, poolSize: 10 });
			break;

		default:
			break;
		}
	};
};

module.exports.Database = require('./lib/database');

