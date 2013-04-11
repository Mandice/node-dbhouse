
var Model = module.exports = function(schema, index) {
	this.schema = schema || null;
	this.index = index || [];
	this.paths = {};
};

Model.prototype.init = function() {
	var self = this;

	self.configure('', self.schema);
};

Model.prototype.configure = function(prefix, schema) {
	var self = this;

	for (var key in schema.schema) {
		var obj = schema.schema[key];
		var new_prefix = (prefix) ? prefix + '.' + key : key;

		self.paths[new_prefix] = obj;
		if (obj.type == 'Schema') {
			self.configure(new_prefix, obj.schema);

		} else if (obj.type == 'Array') {
			if (obj.subtype == 'Schema') {
				self.configure(new_prefix, obj.schema);
				self.configure(new_prefix + '.$', obj.schema);
			}

		} else if (obj.type == 'Dict') {
			if (obj.subtype == 'Schema') {
				self.configure(new_prefix + '{}', obj.schema);
			}
		}
	}
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
