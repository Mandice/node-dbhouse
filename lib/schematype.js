
var SchemaType = module.exports = {
	String: function() {
		return {
			type: 'String'
		};
	},
	Number: function() {
		return {
			type: 'Number'
		};
	},
	Integer: function() {
		return {
			type: 'Integer'
		};
	},
	Boolean: function() {
		return {
			type: 'Boolean'
		};
	},
	Date: function() {
		return {
			type: 'Date'
		};
	},
	Array: function() {
		return {
			type: 'Array'
		};
	},
	Object: function(schema) {
		return {
			type: 'Object',
			model: schema
		};
	},
	UUID: function() {
		return {
			type: 'UUID'
		};
	},
};
