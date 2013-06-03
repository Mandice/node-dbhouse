var DBHouse = require('../../index');
var _compile = require('../../lib/drivers/mongodb/compile');
var uuid = require('node-uuid');
var util = require('util');

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
			addr: { type: 'String' },
			updated: { type: 'Date' }
		})
	},
	grade: {
		type: 'Dict',
		subtype: 'Integer'
	},
	friends: {
		type: 'Dict',
		subtype: 'Schema',
		schema: new DBHouse.Schema({
			age: { type: 'Integer' },
			birth: { type: 'Date' }
		})
	},
	permission:{
		type: 'Array',
		subtype: 'Schema',
		schema: new DBHouse.Schema({
			user_id: { type: 'UUID' },
			admin: { type: 'Boolean' },
			read: { type: 'Boolean' },
			write: { type: 'Boolean' }
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
			{ name: 'Home', addr: 'Taiwan', updated: new Date().getTime() },
			{ name: 'Company', addr: 'China', updated: new Date().getTime() }
		],
		grade: {
			Chinese: 30,
			Math: 50,
			English: 40
		},
		friends: {
			Wesley: {
				age: 26,
				birth: new Date().getTime()
			},
			Louis: {
				age: 25,
				birth: new Date().getTime()
			},
			Rence: {
				age: 27,
				birth: new Date().getTime()
			}
		},
		permission: [{
			user_id: 'ZWRlZTAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAw',
			admin: true,
			read: true,
			write: true
		}]
	});

	console.log(util.inspect(result, false, null));
//} catch(err) {
//	console.log(err);
//}

console.log('--');

console.log('Decompile Object');
try {
	var source = _compile.decompile(Model, result);

	console.log(util.inspect(source, false, null));
} catch(err) {
	console.log(err);
}

console.log('--');
