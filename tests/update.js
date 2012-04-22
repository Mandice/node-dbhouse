var DBHouse = require('../index');

/* Create connection with database server */
var dbHouse = new DBHouse;
dbHouse.connect('mongodb', { host: 'localhost', port: 27017 }, function() {

	/* Create a database operator */
	var db = new DBHouse.Database(dbHouse);
	db.open('dbhouse')
		.collection('users')
		.where({
			name: 'Fred Chien'
		})
		.update({ tel: '0926333572' }, function(err) {
			if (err)
				throw err;
		});
});
