var DBHouse = require('../../index');
var _compile = require('../../lib/drivers/mongodb/compile');
var uuid = require('node-uuid');

/* Define schema */
var Contact = new DBHouse.Schema({
	_id: { type: 'UUID' },
	name: { type: 'String' },
	email: { type: 'String' },
	tel: { type: 'String' },
	age: { type: 'Integer' },
	created: { type: 'Date' },
	list: {
		type: 'Array',
		subtype: 'Schema',
		schema: new DBHouse.Schema({
			name: 'String',
			created: 'Date'
		})
	}
});

var Model = new DBHouse.Model(Contact);
Model.init();

console.log('Using $or operator with incoerect type value');
try {
	var result = _compile.compile(Model, {
		'$or': 123
	});

	console.log(result);
} catch(err) {
	console.log(err);
}

console.log('--');

console.log('Using $or operator with string and integer type fields');
var result = _compile.compile(Model, {
	'$or': [
		{ name: 'Fred', age: 26 },
		{ name: 'Stacy' }
	]
});

console.log(result);
console.log('--');

console.log('Using $or operator with date type fields');
var result = _compile.compile(Model, {
	'$or': [
		{ created: new Date().getTime() }
	]
});

console.log(result);
console.log(result.$or[0].created);
console.log('--');

console.log('Using $or operator with UUID type fields');
var id = uuid.v1({}, []);
console.log(id);
var result = _compile.compile(Model, {
	'$or': [
		{ '_id': id }
	]
});

console.log(result);
console.log('--');

console.log('Using $in operator with incorrect type value');
try {
	var result = _compile.compile(Model, {
		age: {
			'$in': 112233
		}
	});
	console.log(result);
} catch(err) {
	console.log(err);
}
console.log('--');

console.log('Using $in operator');
var result = _compile.compile(Model, {
	age: {
		'$in': [ 3, 5, 6 ]
	},
	created: {
		'$in': [
			new Date().getTime()
		]
	}
});

console.log(result);
console.log(result.created.$in[0]);
console.log('--');
