var DBHouse = require('../index');

/* Create connection with database server */
var dbHouse = new DBHouse;
dbHouse.connect('mongodb', { host: 'localhost', port: 27017 }, function() {

	/* Create a database operator */
	var db = new DBHouse.Database(dbHouse);

	db.open('dbhouse')
		.collection('users')
		.insert({
			name: 'Fred Chien',
			email: 'fred@mandice.com',
			address: [
				{ type: 'Home', addr: 'Taiwan' },
				{ type: 'Company', addr: 'Taipei' }
			]
		}, function(err, data) {
			if (err)
				throw err;

			console.log(data);
		});

});
