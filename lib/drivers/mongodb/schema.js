
var mongodb = require('mongodb');
//var compile = require('./compile');
var uuid = require('node-uuid');

var Schema = module.exports = function() {
};

Schema.prototype.translate = function(schema, value) {

	var type = schema.subtype || schema.type;

	switch(type) {
	case 'UUID':
		var uuid_text;

		// Encoded by Base64
		if (value.length == 48) {
			// Try to transate web-safe character to standard base 64
			var _value = value.replace(/-/g, '+').replace(/_/g, '\/').replace(/\*/g, '=');

			uuid_text = new Buffer(_value, 'base64').toString();
		} else if (value.length == 24) {
			// Try to transate web-safe character to standard base 64
			var _value = value.replace(/-/g, '+').replace(/_/g, '\/').replace(/\*/g, '=');

			uuid_text = new Buffer(_value, 'base64').toString('hex');
		} else if (value.length == 22) {
			// Try to transate web-safe character to standard base 64
			var _value = value.replace(/-/g, '+').replace(/_/g, '\/').replace(/\*/g, '=');

			uuid_text = new Buffer(_value + '==', 'base64').toString('hex');
		} else {
			uuid_text = value;
		}

		var source = uuid.parse(uuid_text);

		return new mongodb.Binary(new Buffer(source), mongodb.Binary.SUBTYPE_UUID);

	case 'Date':
		var i = value % 1000;

		return new mongodb.Timestamp(i, Math.floor(value * 0.001));

	case 'Integer':

		var isInteger_re = /^\s*(\+|-)?\d+\s*$/;

		// Convert to integer if value is not integer type
		if (String(value).search(isInteger_re) != -1)
			return parseInt(value);

		throw new Error('incorrect data type');

	default:
		return value;
	}
};

Schema.prototype.getData = function(schema, value) {

	var type = schema.subtype || schema.type;

	switch(type) {
	case 'UUID':
		var source = new Buffer(value.value(), 'binary');

		var uuid_text = new Buffer(uuid.unparse(source).replace(/-/g, ''), 'hex').toString('base64').replace(/=/g, '');

		// Translate to web-safe
		return uuid_text.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '*');

	case 'Date':
		var low = value.getLowBits();
		var lowStr = '';
		if (low < 100) {
			lowStr = '0' + low.toString();
		} else {
			lowStr = low.toString();
		}

		return parseInt(value.getHighBits().toString() + lowStr);

	default:
		return value;
	}
};

Schema.prototype.package = function(schema, value, opts) {
	var self = this;

	return this.translate(schema, value);
}

Schema.prototype.unpackage = function(schema, value, opts) {

	return this.getData(schema, value);
};

