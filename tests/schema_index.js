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
	created: { type: 'Date' },
	address: { type: 'Schema', schema: Address }
});

/* Create Indexes */
var index = new DBHouse.Index([
	{ fields: [ 'created' ] },
	{ fields: [ 'name', 'created' ] }
]);

dbHouse.connect('mongodb', { host: 'localhost', port: 27017 }, function() {

	/* Create a database operator */
	var db = new DBHouse.Database(dbHouse);

	/* Create Index */
	db.open('dbhouse')
		.collection('contact')
		.model(Contact, index)
		.createIndex();

	/* Query */
	db.open('dbhouse')
		.collection('contact')
		.model(Contact)
		.query(function(err, data) {
			if (err)
				throw err;

			console.log(data);
		});

});
