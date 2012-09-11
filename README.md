DBHouse
---
DBHouse is a generic database API framework, it makes developer to be able to access any kinds of database via generic API. API was designed like SQL Syntax and easy-use.

\* Currently, DBHouse only supports MongoDB.

Installation
-
Using NPM to install DBHouse module directly:

    npm install dbhouse

Examples
-

Querying MongoDB with specific condition:

    var DBHouse = require('dbhouse');
    
    /* Create connection with MongoDB */
    var dbHouse = new DBHouse;
    dbHouse.connect('mongodb', { host: 'localhost', port: 27017 }, function() {
    
        /* Create a database operator */
        var db = new DBHouse.Database(dbHouse);
        db.open('mydb')
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


DBHouse attempts to implement Object/Relation Mapping(ORM), you can define own database scheme with DBHouse APIs:

    var DBHouse = require('dbhouse');
    
    /* Create connection with database server */
    var dbHouse = new DBHouse;
    
    /* Define schema */
    var Contact = new DBHouse.Schema({
        _id: { type: 'UUID' },
        name: { type: 'String' },
        email: { type: 'String' },
        tel: { type: 'String' },
        created: { type: 'Date' }
    });
    
    dbHouse.connect('mongodb', { host: 'localhost', port: 27017 }, function() {
    
        /* Create a database operator */
        var db = new DBHouse.Database(dbHouse);
        
        db.open('mydb')
            .collection('contact')
            .model(Contact)
            .insert({
                name: 'Fred Chien',
                email: 'fred@mandice.com',
                tel: '0926123456',
                created: new Date().getTime()
            }, function(err, data) {
                if (err)
                    throw err;
    
                console.log(data);
            });
    });

\* DBHouse will generate UUID automatically for "_id" field if you set field type to "UUID".

Example of Creating Database Indexes
-
    var DBHouse = require('dbhouse');
    
    /* Define schema */
    var Contact = new DBHouse.Schema({
            _id: { type: 'UUID' },
            name: { type: 'String' },
            email: { type: 'String' },
            tel: { type: 'String' },
            created: { type: 'Date' }
    });
    
    /* Create Indexes */
    var index = new DBHouse.Index([
            { fields: [ 'created' ] },
            { fields: [ 'name', 'created' ] }
    ]);
    
    /* Create connection with database server */
    var dbHouse = new DBHouse;
    
    dbHouse.connect('mongodb', { host: 'localhost', port: 27017 }, function() {
    
            /* Create a database operator */
            var db = new DBHouse.Database(dbHouse);
    
            /* Create Index */
            db.open('mydb')
                    .collection('contact')
                    .model(Contact, index)
                    .createIndex();
    });

License
-
Licensed under the MIT License.

Authors
-
Copyright&copy; 2012 Fred Chien <<fred@mandice.com>>