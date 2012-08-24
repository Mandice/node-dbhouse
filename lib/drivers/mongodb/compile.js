
var Schema = require('./schema');
var _schema = new Schema;

function compileElement(model, key, value) {
	var schema = model.getInfo(key);

	if (value instanceof Object) {

		if (schema.type == 'Schema') {
			var result = {};

			for (var subkey in value) {
				result[subkey] = compileElement(model, key + '.' + subkey, value[subkey]);
			}

			return result;
		} else if (schema.type == 'Array') {
			var result = [];

			if (schema.subtype == 'Schema') {
				console.log(model.getInfo(key + '[]'));

				// Getting objects
				for (var index in value) {
					var subobj = value[index];
					var subresult = {};

					for (var subkey in subobj) {
						subresult[subkey] = compileElement(model, key + '[].' + subkey, subobj[subkey]);
					}

					result.push(subresult);
				}
			} else {
				// Other type of fields
				for (var index in value) {
					result.push(compileElement(model, key, value[index]));
				}
			}

			return result;
		}

		var result = {};
		for (var cmd in value) {
			var obj = value[cmd];

			if (cmd == '$in' || cmd == '$nin' || cmd == '$all') {
				if (!(obj instanceof Array)) {
					throw Error('Syntax Error: \"' + cmd + '\" operator should be used with array type value');
				}

				var element = [];
				for (var index in obj) {
					element.push(_schema.package(schema, obj[index]));
				}

				result[cmd] = element;
			} else {
				result[cmd] = _schema.package(schema, obj);
			}
		}

		return result;
	}

	return _schema.package(schema, value);
}

function compile(model, conditions) {
	var result = {};

	for (var key in conditions) {
		var obj = conditions[key];

		if (key == '$or') {
			if (!(obj instanceof Array)) {
				throw Error('Syntax Error: \"$or\" operator should be used with array type value');
			}

			var element = []
			for (var index in obj) {
				element.push(compile(model, obj[index]));
			}

			result[key] = element;

		} else if (key == '$and') {
			if (!(obj instanceof Array)) {
				throw Error('Syntax Error: \"$and\" operator should be used with array type value');
			}

			var element = []
			for (var index in obj) {
				element.push(compile(model, obj[index]));
			}

			result[key] = element;
		} else {
			result[key] = compileElement(model, key, obj);
		}
	}

	return result;
}

function decompile(model, data) {

	function _decompile(_model, prefix, _data) {
		var result = {};
		var target = (prefix) ? prefix + '.' : '';

		for (var key in _data) {
			var obj = _data[key];
			var path = target + key;

			// Using schema to unpack object
			var schema = _model.getInfo(path);
			if (schema) {
				if (schema.type == 'Schema') {
					result[key] = _decompile(_model, target + key, obj);
				} else if (schema.type == 'Array') {
					var arr = result[key] = [];

					for (var index in obj) {
						arr.push(_schema.unpackage(schema, obj[index]));
					}
				} else {
					result[key] = _schema.unpackage(schema, obj);
				}
			} else if (obj instanceof Object) {
				result[key] = _decompile(_model, target + key, obj);
			}
		}

		return result;
	}

	return _decompile(model, '', data);
}

module.exports = {
	compile: compile,
	decompile: decompile
};
