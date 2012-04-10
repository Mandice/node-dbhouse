var DBHouse = require('../index');

/* Create connection with database server */
var dbHouse = new DBHouse;
dbHouse.connect('mongodb');

/* Create a database operator */
var db = new DBHouse.Database(dbHouse);
db.open('dbhouse')
	.collection('users')
	.where({
		name: 'Fred Chien'
	})
	.delete();
