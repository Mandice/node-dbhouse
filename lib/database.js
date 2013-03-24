var Model = require('./model');

module.exports = function(_dbhouse) {
	var self = this;
	this.dbHouse = _dbhouse;
	this.dbName = null;
	this.dbmodel = null;
	this.tableName = null;
	this.selectedColumns = [];
	this.conditions = {};
	this.clause = {
		limit: null,
		skip: null,
		order: null
	};

	function _clearStatus() {
		self.dbName = null;
		self.dbmodel = null;
		self.tableName = null;
		self.selectedColumns = [];
		self.conditions = {};

		self.clause = {
			limit: null,
			skip: null,
			order: null
		};
	}

	/*
	 * Open database
	 */
	this.open = function(dbname) {
		self.dbName = dbname;

		return self;
	};

	/*
	 * Refer to model
	 */
	this.model = function(schema, index) {
		self.dbModel = new Model(schema, index || []);
		self.dbModel.init();

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
		if (columnName) {
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

		self.dbHouse.driver.execute(self.dbName, self.tableName, self.dbModel, function(db, collection) {
			_clearStatus();

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
			options.sort = [[ self.clause.order.column, self.clause.order.sort ]];

		options.selectedColumns = self.selectedColumns;

		self.dbHouse.driver.query(self.dbName, self.tableName, self.dbModel, self.conditions, options, function(err, data) {
			_clearStatus();

			callback.apply(self, [ err, data ]);
		});

		return self;
	};

	/*
	 * Delete and remove records
	 */
	this.delete = function(callback) {
		self.dbHouse.driver.delete(self.dbName, self.tableName, self.dbModel, self.conditions, function(err, data) {
			_clearStatus();

			if (callback)
				callback.apply(self, [ err, data ]);
		});

		return self;
	};

	/*
	 * Insert
	 */
	this.insert = function(data, callback) {
		if (!data)
			throw Error('No data needs to be inserted into database');

		self.dbHouse.driver.insert(self.dbName, self.tableName, self.dbModel, data, { idType: self.idType }, function(err, data) {
			_clearStatus();

			callback.apply(self, [ err, data ]);
		});

		return self;
	};

	/*
	 * Update records
	 */
	this.update = function() {
		var data = arguments[0];
		var opts = {};
		var callback = null;
		var options = {};
		
		if (self.clause.limit)
			options.limit = self.clause.limit;

		if (arguments.length == 2) {
			if (arguments[1] instanceof Function) {
				callback = arguments[1];
			} else {
				opts = arguments[1];
			}
		} else if (arguments.length == 3) {
			opts = arguments[1];
			callback = arguments[2];
		}

		if (opts.return_data) {
			// Return the original
			options.return_data = true;

		} else if (opts.return_new_data) {
			// Return the modified
			options.return_new_data = true;
		}

		if (opts.upsert) {
			options.upsert = true;
		}

		self.dbHouse.driver.update(self.dbName, self.tableName, self.dbModel, data, self.conditions, options, function(err, data) {
			_clearStatus();

			callback.apply(self, [ err, data ]);
		});

		return self;
	};

	/*
	 * Replace records (Only supported by MongoDB)
	 */
	this.replace = function(data, callback) {
		var options = {};
		
		if (self.clause.limit)
			options.limit = self.clause.limit;

		self.dbHouse.driver.replace(self.dbName, self.tableName, self.dbModel, data, self.conditions, options, function(err, data) {
			_clearStatus();

			callback.apply(self, [ err, data ]);
		});

		return self;
	};

	/*
	 * Drop table or collection
	 */
	this.drop = function(callback) {

		self.dbHouse.driver.drop(self.dbName, self.tableName, self.dbModel, function() {
			_clearStatus();

			if (callback)
				callback();
		});

		return self;
	};

	/*
	 * Create Index
	 */
	this.createIndex = function(index, callback) {
		if (!index && !self.dbModel) {
			callback(new Error('No index'));
			return;
		}

		self.dbHouse.driver.createIndex(self.dbName, self.tableName, self.dbModel, index, function() {
			_clearStatus();

			if (callback)
				callback(null);
		});

		return self;
	};
};
