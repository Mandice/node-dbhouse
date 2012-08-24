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
	parents: {
		type: 'Schema',
		schema: new DBHouse.Schema({
			mother: { type: 'String' },
			father: { type: 'String' },
			brother: {
				type: 'Schema',
				schema: new DBHouse.Schema({
					name: { type: 'String' },
					age: { type: 'Integer' },
					birth: { type: 'Date' }
				})
			}
		})
	},
	logs: {
		type: 'Array',
		subtype: 'Date'
	},
	address: {
		type: 'Array',
		subtype: 'Schema',
		schema: new DBHouse.Schema({
			name: { type: 'String' },
			addr: { type: 'String' }
		})
	}
});

var Model = new DBHouse.Model(Contact);
Model.init();

console.log('Compile Object');
//try {
	var result = _compile.compile(Model, {
		name: 'Fred',
		email: 'fred@mandice.com',
		tel: '092x333555',
		age: 26,
		created: new Date().getTime(),
		parents: {
			mother: 'May',
			father: 'Charles',
			brother: {
				name: 'Frankie',
				age: 22,
				birth: new Date().getTime()
			}
		},
		logs: [
			new Date().getTime(),
			new Date().getTime() + 1000,
		],
		address: [
			{ name: 'Home', addr: 'Taiwan' },
			{ name: 'Company', addr: 'China' }
		]
	});

	console.log(result);
//} catch(err) {
//	console.log(err);
//}

console.log('--');

console.log('Decompile Object');
try {
	var source = _compile.decompile(Model, result);

	console.log(source);
} catch(err) {
	console.log(err);
}

console.log('--');
