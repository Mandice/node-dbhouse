var Mongo = require('mongodb');
var _compile = require('./compile');
var _generator = require('./generator');
var DBHouse = require('../../../index');

function MongoDB() {
	this.server = null;
}
module.exports = MongoDB;

MongoDB.prototype.connect = function(options, callback) {
	if (!options.host)
		throw Error('Require host');

	if (!options.port)
		throw Error('Require port');

	this.server = new Mongo.Server(options.host, options.port, { auto_reconnect: true, poolSize: 10 });

	if (callback)
		callback();
};

MongoDB.prototype.establish = function(dbName, tableName, callback) {
	var self = this;

	if (self.server === null)
		throw Error('No available connection');

	/* Select database */
	var db = Mongo.Db(dbName, self.server);
	db.open(function(err, db) {
		if (err)
			throw err;

		db.collection(tableName, function(err, collection) {
			if (err)
				throw err;

			callback.apply(self, [ db, collection ]);
		});
	});
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
	if (options.idType == DBHouse.Database.IDType.UUID) {
		data._id = _generator.UUID();
	}

	this.establish(dbName, tableName, function(db, collection) {
		collection.insert(data, function(err, data) {
			if (callback)
				callback(null, data);
		});
	});
};

MongoDB.prototype.update = function(dbName, tableName, data, conditions, options, callback) {
	this.establish(dbName, tableName, function(db, collection) {
		var execution = _compile(conditions);
		var multi = (options.limit == 1) ? false : true;

		collection.update(execution, { $set: data }, { safe: true, multi: multi }, function(err) {
			if (callback)
				callback(err);
		});
	});
};

MongoDB.prototype.replace = function(dbName, tableName, data, conditions, options, callback) {
	this.establish(dbName, tableName, function(db, collection) {
		var execution = _compile(conditions);
		var multi = (options.limit == 1) ? false : true;

		collection.update(execution, data, { safe: true, multi: multi }, function(err) {
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
