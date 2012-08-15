var Mongo = require('mongodb');
var _compile = require('./compile');
var _generator = require('./generator');
var DBHouse = require('../../../index');
var Type = require('../../type');

function MongoDB() {
	this.options = null;
	this.server = {};
	this.db = {};
}
module.exports = MongoDB;

MongoDB.prototype.connect = function(options, callback) {
	if (!options.host)
		throw Error('Require host');

	if (!options.port)
		throw Error('Require port');

	// Store options, we do not really connect to database server
	this.options = options;

	if (callback)
		callback(null);
};

MongoDB.prototype.establish = function(dbName, tableName, callback) {
	var self = this;

	function _execute(db) {

		/* Select database */
		db.collection(tableName, function(err, collection) {
			if (err)
				throw err;

			callback.apply(self, [ db, collection ]);
		});
	}

	if (self.options === null)
		throw Error('No available connection');

	// connect to server and open database
	if (!self.server.hasOwnProperty(dbName) || !self.db.hasOwnProperty(dbName)) {
		self.server[dbName] = new Mongo.Server(self.options.host, self.options.port, { auto_reconnect: true, poolSize: self.options.poolSize || 10 });
		self.db[dbName] = new Mongo.Db(dbName, self.server[dbName]);
		self.db[dbName].open(function(err, db) {
			if (err)
				throw err;

			_execute(db);
		});

		return;
	}

	_execute(self.db[dbName]);
};

MongoDB.prototype.query = function(dbName, tableName, conditions, options, callback) {
	this.establish(dbName, tableName, function(db, collection) {
		var execution = _compile(conditions);

		collection.find(execution, options, function(err, data) {
			if (callback)
				data.toArray(callback);
		});
	});
};

MongoDB.prototype.delete = function(dbName, tableName, conditions, callback) {
	this.establish(dbName, tableName, function(db, collection) {
		var execution = _compile(conditions);

		collection.remove(execution, function(err, data) {
			if (callback)
				callback(null, data);
		});
	});
};

MongoDB.prototype.insert = function(dbName, tableName, data, options, callback) {
	var record = {};

	if (options.idType == DBHouse.Database.IDType.UUID) {
		data._id = _generator.UUID();
	}

	/* Convert object to specific format */
	for (var key in data) {
		if (data[key].constructor === Type.Timestamp) {
			record[key] = _generator.Timestamp(data[key].timestamp);
			continue;
		}

		record[key] = data[key];
	}

	this.establish(dbName, tableName, function(db, collection) {
		collection.insert(record, function(err, data) {
			if (err) {
				callback(err);
				return;
			}

			if (callback) {
				callback(null, data[0]);
			}
		});
	});
};

MongoDB.prototype.update = function(dbName, tableName, data, conditions, options, callback) {
	var record = {};

	/* Convert object to specific format */
	for (var key in data) {
		if (data[key].constructor === Type.Timestamp) {
			record[key] = _generator.Timestamp(data[key].timestamp);
			continue;
		}

		record[key] = data[key];
	}

	this.establish(dbName, tableName, function(db, collection) {
		var execution = _compile(conditions);
		var multi = (options.limit == 1) ? false : true;
		var updateOP = {};
		var specialOP = false;

		for (var key in record) {
			// It's special operation
			if (key.charAt(0) == '$') {
				specialOP = true;
				break;
			}
		}

		if (specialOP) {
			updateOP = record;
		} else {
			updateOP = { $set: record };
		}

		if (options.return_data || options.return_new_data) {
			console.log(execution);
			console.log(record);
			collection.findAndModify(execution, [], record, { safe: true, new: options.return_new_data || false }, function(err, data) {
				if (callback)
					callback(err, data);
			});
		} else {
			collection.update(execution, record, { safe: true, multi: multi }, function(err) {
				if (callback)
					callback(err);
			});
		}
	});
};

MongoDB.prototype.replace = function(dbName, tableName, data, conditions, options, callback) {
	var record = {};

	/* Convert object to specific format */
	for (var key in data) {
		if (data[key].constructor === Type.Timestamp) {
			record[key] = _generator.Timestamp(data[key].timestamp);
			continue;
		}

		record[key] = data[key];
	}

	this.establish(dbName, tableName, function(db, collection) {
		var execution = _compile(conditions);
		var multi = (options.limit == 1) ? false : true;

		collection.update(execution, record, { safe: true, multi: multi }, function(err) {
			if (callback)
				callback(err);
		});
	});
};

MongoDB.prototype.drop = function(dbName, tableName, callback) {
	this.establish(dbName, tableName, function(db, collection) {
		collection.drop();
		callback();
	});
};
