var MongoDB = require('mongodb');

function DBHouse() {
	this.driver = null;
	this.server = null;
}
module.exports = DBHouse;

DBHouse.prototype.connect = function(driver, options, callback) {
		var Driver;

		switch(driver) {
		case 'mongodb':
			Driver = require('./lib/drivers/mongodb');
			this.driver = new Driver();
			this.driver.connect(options, function() {
				if (callback)
					callback();
			});
			break;

		case 'dbhouse':
			Driver = require('./lib/drivers/dbhouse');
			this.driver = new Driver();
			this.driver.connect(options, function() {
				if (callback)
					callback();
			});
			break;

		default:
			break;
		}
	};

module.exports.Database = require('./lib/database');
module.exports.Type = require('./lib/type');

