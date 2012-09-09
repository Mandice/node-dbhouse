DBHouse
---
DBHouse is a generic database API framework, it makes developer to be able to access any kinds of database via generic API. API was designed like SQL Syntax and easy-use.

Installation
-
Using NPM to install DBHouse module directly:

    npm install dbhouse

Example
-

Querying MongoDB with specific condition:

    var DBHouse = require('dbhouse');
    
    /* Create connection with MongoDB */
    var dbHouse = new DBHouse;
    dbHouse.connect('mongodb', { host: 'localhost', port: 27017 }, function() {
    
      /* Create a database operator */
      var db = new DBHouse.Database(dbHouse);
      db.open('dbhouse')
        .collection('users')
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

License
-
Licensed under the MIT License.

Authors
-
Copyright&copy; 2012 Fred Chien <<fred@mandice.com>>