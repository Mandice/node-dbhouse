var MongoDB = require('mongodb');
var _compile = require('./compile');

module.exports = function(_dbhouse) {
	var self = this;
	this.dbHouse = _dbhouse;
	this.dbName = null;
	this.tableName = null;
	this.selectedColumns = [];
	this.conditions = {};
	this.clause = {
		limit: null,
		skip: null,
		order: null
	};

	/*
	 * Open database
	 */
	this.open = function(dbname) {
		self.dbName = dbname;

		return self;
	};

	/*
	 * Get table (RDBMS style)
	 */
	this.table = function(tablename) {
		self.tableName = tablename;

		return self;
	};

	/*
	 * Get collection (MongoDB style)
	 */
	this.collection = function(tablename) {
		self.tableName = tablename;

		return self;
	};

	/*
	 * Select column
	 */
	this.select = function(cols) {
		self.selectedColumns = cols;

		return self;
	};
	
	/*
	 * Set conditions
	 */
	this.where = function(conditions) {
		self.conditions = conditions;

		return self;
	}

	/*
	 * Set limit of number of records
	 */
	this.limit = function(num) {
		if (num)
			self.clause.limit = num;
		else
			self.clause.limit = null;

		return self;
	};

	/*
	 * Set number of records for skip or offset
	 */
	this.skip = function(num) {
		if (num)
			self.clause.skip = num;
		else
			self.clause.skip = null;

		return self;
	};

	/*
	 * Set order clause
	 */
	this.order = function(columnName, sorts) {
		if (column) {
			self.clause.order = {
				column: columnName,
				sorts: 1
			};

			if (typeof(sorts) !== 'undefined') {
				self.clause.order.sorts = sorts;
			}
		} else {
			self.clause.order = null;
		}

		return self;
	};

	/*
	 * Execute
	 */
	this.execute = function(callback) {
		if (!self.dbHouse)
			throw Error('No DBHouse reference');

		if (!self.dbName)
			throw Error('No such database name');

		if (!self.tableName)
			throw Error('No such table or collection name');

		/* Select database */
		var db = MongoDB.Db(self.dbName, self.dbHouse.server);
		db.open(function(err, db) {
			if (err)
				throw err;

			db.collection(self.tableName, function(err, collection) {
				if (err)
					throw err;

				callback.apply(self, [ db, collection ]);
			});
		});
	};

	/*
	 * Query
	 */
	this.query = function(callback) {
		self.execute(function(database, collection) {
			var execution = _compile(self.conditions);

			if (self.clause.limit == 1)
				collection.findOne(execution, function(err, data) {
					if (callback)
						callback(err, data)
				});
			else
				collection.find(execution, function(err, data) {
					if (callback)
						data.toArray(callback);
				});
		});
	};

	/*
	 * Delete and remove records
	 */
	this.delete = function(callback) {
		self.execute(function(database, collection) {
			var execution = _compile(self.conditions);

			collection.remove(execution, function(err, data) {
				if (callback)
					callback(null);
			});
		});
	};

	/*
	 * Insert
	 */
	this.insert = function(data, callback) {
		self.execute(function(database, collection) {
			collection.insert(data, function(err, data) {
				if (callback)
					callback(null, data);
			});
		});
	};

	/*
	 * Drop table or collection
	 */
	this.drop = function() {
		self.execute(function(database, collection) {
			collection.drop();
		});
	};
};
