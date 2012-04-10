var uuid = require('node-uuid');
var mongodb = require('mongodb');

module.exports.UUID = function() {
	return new mongodb.Binary(new Buffer(uuid.v1({}, [])), mongodb.Binary.SUBTYPE_UUID);
};

module.exports.Timestamp = function() {
	var ts = new Date().getTime();
	var i = ts % 1000;

	return new mongodb.Timestamp(i, Math.floor(ts * 0.001));
};
