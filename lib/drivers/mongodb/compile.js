"use strict";

var util = require('util');

// Schema translator
var Schema = require('./schema');
var schema = new Schema();

var Expression = {};
var Value = {};
var OperatorExpression = {};
var Field = {};

var expressionRules = {
	$or: { expression: [ Expression ] },
	$nor: { expression: [ Expression ] },
	$and: { expression: [ Expression ] },
	$addToSet: { expression: { Field: Value } },
	$pushAll: { expression: { Field: [ Value ] } },
	$pullAll: { expression: { Field: [ Value ] } },
	$set: { expression: { Field: Value } },
	$unset: { expression: { Field: Value } },
	$inc: { expression: { Field: Value } },
	$push: { expression: { Field: Value } },
	$pull: { expression: { Field: Value } }
};

var operatorExpressionRules = {
	$in: { expression: [ Value ] },
	$nin: { expression: [ Value ] },
	$all: { expression: [ Value ] },
	$not: { expression: OperatorExpression },
	$slice: { expression: [ Value ] },
	$regex: { expression: Value },
	$options: { expression: Value },
	$gt: { expression: Value },
	$gte: { expression: Value },
	$lt: { expression: Value },
	$lte: { expression: Value },
	$ne: { expression: Value },
	$mod: { expression: [ Value ] }
};

function rawValue(model, base, field, value, opts) {
	return value;
}

function packageValue(model, base, field, value, opts) {
	var result = null;
	var targetField = (field == null) ? [] : [ field ];

	function _packageValue(pathSets, value) {
		var result = null;

		if (value instanceof Array) {
			result = [];

			// Translate all items to specific type
			var fieldSchema = model.getInfo(pathSets.join('.'));
			if (fieldSchema == null)
				throw new Error('\"' + pathSets.join('.') + '\"' + ' field is undefined');

			for (var index in value) {
				var _rs = schema.package(fieldSchema, value[index], opts);
				if (_rs == null)
					throw new Error('\"' + pathSets.join('.') + '\"' + ' contains value of incorrect type.');

				result.push(_rs);
			}
		} else if (value instanceof Object) {
			// Here is different from unpackgeValue(), because we use getInfo() to parse path. There is 
			// no need to check type of each object.

			result = {};

			// It has sub-items.
			for (var key in value) {
				var pathSet = pathSets.concat([ key ]);

				result[key] = _packageValue(pathSet, value[key]);
			}

			// Trying to apply defaults
			if (opts.applyDefaults) {

				var fieldNames = model.collectionPaths[pathSets.join('.')] || null;
				if (fieldNames) {

					for (var index in fieldNames) {
						var key = fieldNames[index];

						if (!result[key]) {
							var pathSet = pathSets.concat([ key ]);
							var info = model.defPaths.collections[pathSet.join('.')];

							if (info.default instanceof Function)
								result[key] = _packageValue(pathSet, info.default());
							else
								result[key] = _packageValue(pathSet, info.default);
						}
					}
				}
			}

		} else {

			// Translate value to specific type
			var fieldSchema = model.getInfo(pathSets.join('.'));
			if (fieldSchema == null)
				throw new Error('\"' + pathSets.join('.') + '\"' + ' field is undefined');

			result = schema.package(fieldSchema, value, opts);
			if (result == null)
				throw new Error('\"' + pathSets.join('.') + '\"' + ' contains value of incorrect type.');

		}

		return result;
	}

	result = _packageValue(base.concat(targetField), value);

	return result;
}

function unpackageValue(model, base, field, value, opts) {
	var result = null;
	var targetField = (field == null) ? [] : [ field ];

	function _unpackageValue(pathSets, value) {
		var result = null;

		if (value instanceof Array) {
			result = [];

			// Translate all items to specific type
			var fieldSchema = model.getInfo(pathSets.join('.'));
			if (fieldSchema == null)
				throw new Error('\"' + pathSets.join('.') + '\"' + ' field is undefined');

			for (var index in value) {
				var _rs = schema.unpackage(fieldSchema, value[index], opts);
				if (_rs == null)
					throw new Error('\"' + pathSets.join('.') + '\"' + ' contains value of incorrect type.');

				result.push(_rs);
			}
		} else if (value instanceof Object) {

			// It might be defined in schema.
			var fieldSchema = model.getInfo(pathSets.join('.'));
			if (fieldSchema == null || fieldSchema.type == 'Schema' || fieldSchema.subtype == 'Schema') {
				result = {};

				// It has sub-items.
				for (var key in value) {
					var pathSet = pathSets.concat([ key ]);

					result[key] = _unpackageValue(pathSet, value[key]);
				}
			} else {
				result = schema.unpackage(fieldSchema, value, opts);
			}

		} else {

			// Translate value to specific type
			var fieldSchema = model.getInfo(pathSets.join('.'));
			if (fieldSchema == null)
				throw new Error('\"' + pathSets.join('.') + '\"' + ' field is undefined');

			result = schema.unpackage(fieldSchema, value, opts);
			if (result == null)
				throw new Error('\"' + pathSets.join('.') + '\"' + ' contains value of incorrect type.');

		}

		return result;
	}

	result = _unpackageValue(base.concat(targetField), value);

	return result;
}

function compileValueWithExp(model, exp, base, field, value, valueHandler, opts) {
	var result = null;

	if (exp == Expression) {
		result = compileExpression(model, expressionRules, base, value, valueHandler, opts);

	} else if (exp == OperatorExpression) {

		if (!(value instanceof Object)) {
			// It's a value rather than operator expression.
			result = compileValueWithExp(model, Value, base, field, value, valueHandler, opts);

		} else if (value instanceof Array) {
			// It's array with sub-structure
			result = compileExpression(model, operatorExpressionRules, base.concat([ field ]), value, valueHandler, opts);

		} else {
			// It could be a object-type value, so we try to parse it first.
			try {
				result = valueHandler(model, base, field, value, opts);
			} catch(err) {
				result = compileExpression(model, operatorExpressionRules, base.concat((field != null) ? [ field ] : []), value, valueHandler, opts);
			}
		}

	} else if (exp == Value) {

		// Translate value to specific type which is defined in schema.
		result = valueHandler(model, base, field, value, opts);

	} else if (exp instanceof Array) {
		if (!(value instanceof Array)) {
			throw new Error('Syntax error');
		}

		result = [];
		if (exp.length > 0) {
			value.forEach(function(subitem, index, arr) {
				result.push(compileValueWithExp(model, exp[0], base, field, subitem, valueHandler, opts));
			});
		}

	} else if (exp instanceof Object) {
		if (!(value instanceof Object)) {
			throw new Error('Syntax error');
		}

		result = {};
		var subexpkey = Object.keys(exp);
		if (subexpkey.length > 0) {
			if (subexpkey == 'Field') {

				for (var fieldName in value) {
					result[fieldName] = compileValueWithExp(model, exp[subexpkey], base, fieldName, value[fieldName], valueHandler, opts);
				};
			}
		}
	}

	return result;
};

function compileExpressionSingle(model, rules, base, key, value, valueHandler, opts) {
	var result = {};
	var rule;

	// Command
	if (key.indexOf('$') == 0) {
		rule = rules[key];
		if (rule == undefined)
			throw new Error('No such command ' + key);

		var exp = rule.expression;
		result[key] = compileValueWithExp(model, exp, base, null, value, valueHandler, opts);

		return result;
	}

	// Normal value
	result[key] = compileValueWithExp(model, OperatorExpression, base, key, value, valueHandler, opts);

	return result;
}

function compileExpression(model, rules, base, expression, valueHandler, opts) {
	var result = null;

	if (!(expression instanceof Object)) {
		return expression;
	}

	// non-root expression can be Array object.
	if (base.length > 0) {

		if (expression instanceof Array) {
			result = [];

			for (var index in expression) {
				result.push(compileValueWithExp(model, OperatorExpression, base, null, expression[index], valueHandler, opts));
			}

			return result;
		}
		
	}

	// Normal expression
	result = {};
	for (var key in expression) {

		// compileExpressionSingle() will return key and value both, we need value only.
		result[key] = compileExpressionSingle(model, rules, base, key, expression[key], valueHandler, opts)[key];
	}

	return result;
}

function compile(model, expression, opts) {

	if (model == null) {
		// No need to package value
		return compileExpression(model, expressionRules, [], expression, rawValue, opts || {})
	}

	if (opts) {

		if (opts.applyDefaults) {

			// Set value by default unless it was set already
			for (var pathName in model.defPaths.fields) {
				var info = model.defPaths.fields[pathName];

				// no such field was set
				if (typeof eval('expression.' + pathName) === 'undefined') {

					// Apply default
					if (info.default instanceof Function)
						applyDefault(expression, pathName, info.default());
					else
						applyDefault(expression, pathName, info.default);
				}
			}
			
		}
	}

	return compileExpression(model, expressionRules, [], expression, packageValue, opts || {});
}

function decompile(model, expression, opts) {

	if (model == null) {
		// No need to unpackage value
		return compileExpression(model, expressionRules, [], expression, rawValue, opts || {});
	}

	function _decompile(_schema, obj) {
		var value = null;

		if (_schema.type == 'Schema') {

			value = {};

			for (var key in _schema.schema.schema) {

				if (!obj[key])
					continue;

				value[key] = _decompile(_schema.schema.schema[key], obj[key]);
			}

		} else if (_schema.type == 'Array') {
			var value = [];

			if (!_schema.subtype) {

				for (var index in obj) {
					value.push(obj[index]);
				}
			}

			var subSchema = { type: _schema.subtype };
			if (subSchema.type == 'Schema')
				subSchema.schema = _schema.schema;

			for (var index in obj) {

				var _val = _decompile(subSchema, obj[index]);

				value.push(_val);
			}

		} else if (_schema.type == 'Dict') {
			value = {};

			if (!_schema.subtype) {

				for (var key in obj) {
					value[key] = obj[index];
				}
			}

			var subSchema = { type: _schema.subtype };
			if (subSchema.type == 'Schema')
				subSchema.schema = _schema.schema;

			for (var _key in obj) {

				value[_key] = _decompile(subSchema, obj[_key]);
			}


		} else {

			value = schema.unpackage(_schema, obj, opts || {});
		}

		return value;
	}

	var result = {};
	for (var key in model.schema.schema) {
		if (!expression[key])
			continue;

		result[key] = _decompile(model.schema.schema[key], expression[key]);
	}

	return result;
}

function applyDefault(obj, fullpath, value) {

	var paths = fullpath.split('.');
	var index = 0;
	var len = paths.length;

	function _traverse(_obj) {

		if (index >= len)
			return;

		var key = paths[index];

		// Set value
		if (index == len - 1) {
			_obj[key] = value;
			return;
		}

		index++;

		if (!_obj[key]) {
			_obj[key] = {};

			_traverse(_obj[key]);

			return;
		}

		_traverse(_obj[key]);
	}

	if (len >= 1) {
		_traverse(obj);
	}
}

module.exports = {
	compile: compile,
	decompile: decompile
};
