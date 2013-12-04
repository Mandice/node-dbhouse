var DBHouse = require('../index');

/* Create connection with database server */
var dbHouse = new DBHouse;

/* Define schema */
var Address = new DBHouse.Schema({
	company: { type: 'String' },
	home: { type: 'String' },
	updated_time: { type: 'Date' }
});

var Contact = new DBHouse.Schema({
	_id: { type: 'UUID' },
	name: { type: 'String' },
	email: { type: 'String' },
	tel: { type: 'String' },
	created: { type: 'Date', default: Date.now },
	address: { type: 'Schema', schema: Address }
});

dbHouse.connect('mongodb', { host: 'localhost', port: 27017 }, function() {

	/* Create a database operator */
	var db = new DBHouse.Database(dbHouse);
	db.open('dbhouse')
		.collection('contact')
		.model(Contact)
		.query(function(err, data) {
			if (err)
				throw err;

			console.log(data);
		});
});
