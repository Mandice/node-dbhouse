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
	created: { type: 'Date' }
});

var Model = new DBHouse.Model(Contact);
Model.init();

console.log('Compile Object');
try {
	var result = _compile.compile(Model, {
		_id: 'NRnSsO6YEeGR-rWcknSojw',
		name: 'Fred',
		email: 'fred@mandice.com',
		tel: '092x333555',
		age: 26,
		created: new Date().getTime()
	});

	console.log(result);
} catch(err) {
	console.log(err);
}

console.log('--');

console.log('Decompile Object');
try {
	var source = _compile.decompile(Model, result);

	console.log(source);
} catch(err) {
	console.log(err);
}

console.log('--');
