var DBHouse = require('../index');

/* Create connection with database server */
var dbHouse = new DBHouse;
dbHouse.connect();

/* Create a database operator */
var db = new DBHouse.Database(dbHouse);
db.open('dbhouse')
	.collection('users')
	.insert({
		name: 'Fred Chien',
		email: 'fred@mandice.com'
	}, function(err, data) {
		if (err)
			throw err;

		console.log(data);
	});
