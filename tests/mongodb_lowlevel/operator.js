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
			_id: { type: 'UUID' },
			name: { type: 'String' },
			created: { type: 'Date' },
			counter: { type: 'Integer' }
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
var id = new Buffer(uuid.v1({})).toString('base64');
console.log(id);
var result = _compile.compile(Model, {
	'$or': [
		{ '_id': id }
	]
});

console.log(result);
console.log('--');

console.log('Using $pushAll operator with UUID type fields');
var id = new Buffer(uuid.v1({})).toString('base64');
console.log(id);
var result = _compile.compile(Model, {
	'$pushAll': {
		'_id': [ id ]
	}
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

console.log('Using $ operator');
var result = _compile.compile(Model, {
	'list.$._id': 'NRnSsO6YEeGR+rWcknSojw==',
	'list.$.name': 'Test Man',
	'list.$.created': new Date().getTime()
});

console.log(result);
console.log('--');

console.log('Using $ operator with $set command');
var result = _compile.compile(Model, {
	$set: {
		'list.$._id': 'NRnSsO6YEeGR+rWcknSojw==',
		'list.$.name': 'Test Man',
		'list.$.created': new Date().getTime()
	}
});

console.log(result);
console.log('--');

console.log('query list without $ operator');
var result = _compile.compile(Model, {
	'list._id': 'NRnSsO6YEeGR+rWcknSojw==',
	'list.name': 'Test Man',
	'list.created': new Date().getTime()
});

console.log(result);
console.log('--');

console.log('query list with $slice operator');
var result = _compile.compile(Model, {
	'list': { $slice: 10 },
});

console.log(result);
console.log('--');

console.log('query list with $slice operator and parameter');
var result = _compile.compile(Model, {
	'list': { $slice: [ 10, 20 ] },
});

console.log(result);
console.log('--');

console.log('query list with $slice operator and parameter');
var result = _compile.compile(Model, {
	'list': { $slice: [ 10, 20 ] },
});

console.log(result);
console.log('--');

console.log('query list with complex operator and wrong data type');
var result = _compile.compile(Model, {
	$pull: {
		list: {
			counter: { $in: [ '222', '333' ] }
		}
	}
});

console.log(result);
console.log(result.$pull.list.counter.$in);
console.log('--');

console.log('query list with $pushAll');
var result = _compile.compile(Model, {
	$pushAll: {
		list: [
			{
				name: 'Fred',
				created: new Date().getTime(),
				counter: 10
			}
		]
	}
});

console.log(result);
console.log(result.$pushAll.list);
console.log('--');

console.log('mixing $and and $not');
var result = _compile.compile(Model, {
	$and: [
		{
			name: {
				$not: 'Fred'
			}
		}
	]
});

console.log(result);
console.log(result.$and);

console.log('--');
