var MongoDB = require('mongodb');
var _compile = require('./compile');
var _generator = require('./generator');

module.exports = function(_dbhouse) {
	var self = this;
	this.idType = IDType.DEFAULT;
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
	this.order = function(columnName, sort) {
		if (column) {
			self.clause.order = {
				column: columnName,
				sort: 1
			};

			if (typeof(sort) !== 'undefined') {
				if (sort == 1)
					self.clause.order.sort = 1;
				else
					self.clause.order.sort = -1;
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

		self.dbHouse.driver.execute(self.dbName, self.tableName, function(db, collection) {
			callback.apply(self, [ db, collection ]);
		});
	};

	/*
	 * Query
	 */
	this.query = function(callback) {
		var options = {};
		
		if (self.clause.limit)
			options.limit = self.clause.limit;

		if (self.clause.skip)
			options.skip = self.clause.skip;

		if (self.clause.order)
			options.sort = [ self.clause.order.column, (self.clause.order.sort == 1) ? 'asc' : 'desc' ];

		self.dbHouse.driver.query(self.dbName, self.tableName, self.conditions, options, function(err, data) {
			callback.apply(self, [ err, data ]);
		});
	};

	/*
	 * Delete and remove records
	 */
	this.delete = function(callback) {
		self.dbHouse.driver.delete(self.dbName, self.tableName, self.conditions, function(err, data) {
			if (callback)
				callback.apply(self, [ err, data ]);
		});
	};

	/*
	 * Insert
	 */
	this.insert = function(data, callback) {
		if (!data)
			throw Error('No data needs to be inserted into database');

		self.dbHouse.driver.insert(self.dbName, self.tableName, data, { idType: self.idType }, function(err, data) {
			callback.apply(self, [ err, data ]);
		});
	};

	/*
	 * Update records
	 */
	this.update = function(data, callback) {
		var options = {};
		
		if (self.clause.limit)
			options.limit = self.clause.limit;

		self.dbHouse.driver.update(self.dbName, self.tableName, data, self.conditions, options, function(err, data) {
			callback.apply(self, [ err, data ]);
		});
	};

	/*
	 * Replace records (Only supported by MongoDB)
	 */
	this.replace = function(data, callback) {
		var options = {};
		
		if (self.clause.limit)
			options.limit = self.clause.limit;

		self.dbHouse.driver.replace(self.dbName, self.tableName, data, self.conditions, options, function(err, data) {
			callback.apply(self, [ err, data ]);
		});
	};

	/*
	 * Drop table or collection
	 */
	this.drop = function(callback) {
		self.dbHouse.driver.drop(self.dbName, self.tableName, function() {
			if (callback)
				callback();
		});
	};

};

var IDType = module.exports.IDType = {
	'DEFAULT': 0,
	'UUID': 1
};
