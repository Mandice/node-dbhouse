var DBHouse = require('../../index');

/* Create connection with database server */
var dbHouse = new DBHouse;
dbHouse.connect('dbhouse');

/* Create a database operator */
var db = new DBHouse.Database(dbHouse);
db.open('dbhouse')
	.collection('users')
	.query(function(err, data) {
		if (err)
			throw err;

		console.log(data);
	});

