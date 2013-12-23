"use strict";

var vm = require('vm');
var Array = require('node-array');
var Mongo = require('mongodb');
var uuid = require('node-uuid');
var _compile = require('./compile');
var Schema = require('./schema');
var DBHouse = require('../../../index');
var Type = require('../../type');

var _schema = new Schema;

var MongoDB = module.exports = function() {
	var self = this;

	self.options = null;
	self.server = {};
	self.db = {};
}

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

MongoDB.prototype.establish = function(dbName, tableName, model, callback) {
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
		self.db[dbName] = new Mongo.Db(dbName, self.server[dbName], { safe: true });
		self.db[dbName].open(function(err, db) {
			if (err)
				throw err;

			_execute(db);
		});

		return;
	}

	_execute(self.db[dbName]);
};

MongoDB.prototype.query = function(dbName, tableName, model, conditions, options, callback) {
	var selectedColumns = options.selectedColumns;

	delete options['selectedColumns'];

	this.establish(dbName, tableName, model, function(db, collection) {
		var execution = _compile.compile(model, conditions);

		collection.find(execution, selectedColumns, options, function(err, data) {
			if (err) {
				if (callback) {
					callback(err, []);
				}
				return;
			}

			data.toArray(function(err, documents) {
				var result = [];

				if (model) {
					if (documents) {

						// Unpack results from MongoDB object
						for (var index in documents) {
							var x = result[index] = _compile.decompile(model, documents[index]);
						}
					}
				} else {
					result = documents;
				}

				if (callback) {
					callback(err, result);
				}
			});
		});
	});
};

MongoDB.prototype.delete = function(dbName, tableName, model, conditions, callback) {
	this.establish(dbName, tableName, model, function(db, collection) {
		var execution = _compile.compile(model, conditions);

		collection.remove(execution, function(err, data) {
			if (callback)
				callback(null, data);
		});
	});
};

MongoDB.prototype.insert = function(dbName, tableName, model, data, options, callback) {
	var record = {};

	// Auto-generate UUID
	if (model) {
		if (model.getInfo('_id').type == 'UUID') { 
			if (!data._id) {
				data._id = new Buffer(uuid.unparse(new Buffer(uuid.v1({}, [])))).toString('base64');
			}
		}
	}

	// packge original object to specific format that mongodb supports
	var record = _compile.compile(model, data, { default_value: true });

	this.establish(dbName, tableName, model, function(db, collection) {
		collection.insert(record, function(err, data) {
			if (err) {
				callback(err);
				return;
			}

			if (callback) {
				callback(null, _compile.decompile(model, data[0]));
			}
		});
	});
};

MongoDB.prototype.update = function(dbName, tableName, model, data, conditions, options, callback) {
	var record = {};

	// packge original object to specific format that mongodb supports
	var record = _compile.compile(model, data);

	this.establish(dbName, tableName, model, function(db, collection) {
		var execution = _compile.compile(model, conditions);
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
			collection.findAndModify(execution, [], updateOP, { safe: true, new: options.return_new_data || false, upsert: options.upserts || false }, function(err, data) {
				if (callback) {
					if (data) {
						callback(err, _compile.decompile(model, data));
					} else {
						callback(err);
					}
				}
			});
		} else {
			collection.update(execution, updateOP, { safe: true, multi: multi, upsert: options.upserts || false }, function(err) {
				if (callback)
					callback(err);
			});
		}
	});
};

MongoDB.prototype.replace = function(dbName, tableName, model, data, conditions, options, callback) {
	var record = {};

	// packge original object to specific format that mongodb supports
	var record = _schema.compile(model, data);

	this.establish(dbName, tableName, model, function(db, collection) {
		var execution = _compile.compile(model, conditions);
		var multi = (options.limit == 1) ? false : true;

		collection.update(execution, record, { safe: true, multi: multi }, function(err) {
			if (callback)
				callback(err);
		});
	});
};

MongoDB.prototype.drop = function(dbName, tableName, model, callback) {
	this.establish(dbName, tableName, model, function(db, collection) {
		collection.drop();

		if (callback)
			callback();
	});
};

MongoDB.prototype.count = function(dbName, tableName, model, conditions, options, callback) {

	this.establish(dbName, tableName, model, function(db, collection) {
		var execution = _compile.compile(model, conditions);

		collection.count(execution, options, function(err, total) {
			if (err) {
				if (callback) {
					callback(err, []);
				}
				return;
			}

			if (callback) {
				callback(err, total);
			}
		});
	});
};

MongoDB.prototype.createIndex = function(dbName, tableName, model, index, callback) {

	function _ensureIndex(collection, index, complete) {
		var _index = {};

		for (var fieldName in index.fields) {
			_index[index.fields[fieldName]] = 1;
		}

		collection.ensureIndex(_index, function() {
			complete();
		});
	}

	function _ensureIndexes(collection, indexes, complete) {

		indexes.forEachAsync(function(dbIndex, index, arr, next) {
			_ensureIndex(collection, dbIndex, function() {
				next();
			});
			
			return true;
		}, function() {
			complete();
		});
	}

	if (!index && model) {

		this.establish(dbName, tableName, model, function(db, collection) {

			_ensureIndexes(collection, model.index.indexes, function() {

				if (callback)
					callback();
			});
		});

		if (callback)
			callback();

		return;
	}

	this.establish(dbName, tableName, model, function(db, collection) {
		_ensureIndex(collection, index, function() {
			if (callback)
				callback();
		});
	});
};
