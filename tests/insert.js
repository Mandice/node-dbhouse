var DBHouse = require('../index');

/* Create connection with database server */
var dbHouse = new DBHouse;
dbHouse.connect('mongodb', { host: 'localhost', port: 27017 }, function() {

	/* Create a database operator */
	var db = new DBHouse.Database(dbHouse);

	/* If set, DBHouse will generate UUID to be _id, not use the default _id(eg, MongoDB's ObjectID) */
	db.idType = DBHouse.Database.IDType.UUID;
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

});
