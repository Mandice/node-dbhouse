
var Model = module.exports = function(schema, index) {
	this.schema = schema || null;
	this.index = index || [];
	this.paths = {};
	this.collectionPaths = {};
	this.defPaths = {
		fields: {},
		collections: {}
	};
};

Model.prototype.init = function() {
	var self = this;

	self.configure('', self.schema);
};

Model.prototype.configure = function(prefix, schema) {
	var self = this;

	function _configure(prefix, schema, parentType) {

		var internal = true;
		if (parentType != 'Array' && parentType != 'Dict') {
			internal = false;
		}

		var sign = null;
		if (parentType == 'Array') {
			sign = '.$';
		}

		for (var key in schema.schema) {
			var obj = schema.schema[key];
			var new_prefix = (prefix) ? prefix + '.' + key : key;

			self.paths[new_prefix] = obj;

			// This element is in Array
			if (sign)
				self.paths[new_prefix + sign] = obj;

			if (obj.type == 'Schema') {
				_configure(new_prefix, obj.schema, obj.type);

			} else if (obj.type == 'Array') {
				if (obj.subtype == 'Schema') {
					self.collectionPaths[new_prefix] = Object.keys(obj.schema.schema);
//					self.collectionPaths[new_prefix] = obj;
					_configure(new_prefix, obj.schema, obj.type);
//					_configure(new_prefix + '.$', obj.schema, obj.type);
				}

			} else if (obj.type == 'Dict') {
				if (obj.subtype == 'Schema') {
					self.collectionPaths[new_prefix] = Object.keys(obj.schema.schema);
//					self.collectionPaths[new_prefix] = obj;
					_configure(new_prefix + '{}', obj.schema, obj.type);
				}
			} else if (obj.default) {

				// Store path which has default value
				if (internal)
					self.defPaths.collections[new_prefix] = obj;
				else
					self.defPaths.fields[new_prefix] = obj;
			}
		}
	}

	_configure(prefix, schema, 'Schema');
};

Model.prototype.getInfo = function(path) {
	var self = this;

	if (self.paths.hasOwnProperty(path))
		return self.paths[path];

	function analyzePath() {
		var schema = null;
		var pathSymbol = null;

		var keys = Object.keys(self.paths);
		for (var index in keys) {
			pathSymbol = keys[index];
			if (path.search(pathSymbol) == 0) {
				schema = self.paths[pathSymbol];
				break;
			}
		}

		if (!schema)
			throw new Error('Undefined field \"' + path + '\"');

		// Traverse sub-schema
		if (schema.type == 'Dict') {
			if (schema.subtype == 'Schema') {
				var pathParts = path.substr(pathSymbol.length + 1).split('.');

				pathSymbol += '{}.' + pathParts.slice(1).join('.');

				// Continue to process sub-structure
				schema = self.getInfo(pathSymbol);
			}
		}

		return schema;
	}

	return analyzePath();
};
