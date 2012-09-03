var DBHouse = require('../index');

/* Create connection with database server */
var dbHouse = new DBHouse;
dbHouse.connect('mongodb', { host: 'localhost', port: 27017 }, function() {

	/* Create a database operator */
	var db = new DBHouse.Database(dbHouse);
	db.open('dbhouse')
		.collection('users')
		.select({
			email: 0
		})
		.where({
			'$or': [ { name: 'Fred Chien'}, { name: 'Stacy Li' } ]
		})
		.limit(1)
		.query(function(err, data) {
			if (err)
				throw err;

			console.log(data);
		});
});
