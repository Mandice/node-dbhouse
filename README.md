DBHouse
---
DBHouse is a generic database API framework, it makes developer to be able to access any kinds of database via generic API. API was designed like SQL Syntax and easy-use.

\* Currently, DBHouse only supports MongoDB.

Installation
-
Using NPM to install DBHouse module directly:

    npm install dbhouse

Quick Examples
-

DBHouse is really easy to use, some topic you might be interested, see below:

* [Query](#quick_example_query)
* [Object/Relation Mapping(ORM)](#quick_example_orm)
* [Creating Database Indexes](#quick_example_create_database_indexes)

***

<a name="quick_example_query" />
### Query

The example to show how to query MongoDB with specific condition.

__Example__
```js
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
```

***

<a name="quick_example_orm" />
### Object/Relation Mapping(ORM)

DBHouse attempts to implement Object/Relation Mapping(ORM), you can define own database scheme with DBHouse APIs.

__Example__
```js
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
```
\* DBHouse will generate UUID automatically for "_id" field if you set field type to "UUID".

***

<a name="quick_example_create_database_indexes" />
### Creating Database Indexes

With ORM mechanism of DBHouse, it can just use `DBHouse.Index` to create indexes for specific fields in database.

__Example__
```js
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
```

License
-
Licensed under the MIT License.

Authors
-
Copyright&copy; 2012 Fred Chien <<fred@mandice.com>>
