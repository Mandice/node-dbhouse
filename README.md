DBHouse
---
DBHouse is a generic database API framework, it makes developer to be able to access any kinds of database via generic API. API was designed like SQL Syntax and easy-use.

\* Currently, DBHouse only supports MongoDB with official driver ([node-mongodb-native](https://github.com/mongodb/node-mongodb-native)).

Installation
-
Using NPM to install DBHouse module directly:

    npm install dbhouse

Quick Examples
-

DBHouse is really easy to use, some topic you might be interested, see below:

* [Queries](#quick_example_queries)
* [Object/Relation Mapping(ORM)](#quick_example_orm)
* [Creating Database Indexes](#quick_example_create_database_indexes)

***

<a name="quick_example_query" />
### Queries

Peform a simple query and return only one record.

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

Documentation
-

### APIs

__Database Operator__
* [open](#api_open)
* [collection](#api_collection)
* [table](#api_table)
* [select](#api_select)
* [where](#api_where)

***

<a name="api_open" />
### [Database Operator].open(db_name)

Sets specific database as the default (current) database.

Note that DBHouse always attempts to keep connection alive for more queries next time, it means that open() doesn't re-create a new connection every time if connection is still alive.

***

<a name="api_collection" />
### [Database Operator].collection(collection_name)

Sets specific collection(table) as current collection(table).

***

<a name="api_table" />
### [Database Operator].table(table_name)

Same function with collection(), it is just another name for developer who is familar with SQL.

***

<a name="api_select" />
### [Database Operator].select(fields)

Select the content of columns(fields) from a database.

__Arguments__
* fields - Object of fields to include or exclude (not both), {‘a’:1}

***

<a name="api_where" />
### [Database Operator].where(condition)

Select the condition for filtering records.

__Example__

Find records with specific field:
```js
var DBHouse = require('dbhouse');

// Create connection with MongoDB
var dbHouse = new DBHouse;
dbHouse.connect('mongodb', { host: 'localhost', port: 27017 }, function() {

    // Create a database operator
    var db = new DBHouse.Database(dbHouse);
    db.open('mydb')
        .collection('users')
        .where({
            name: 'Fred Chien'
        })
        .query(function(err, data) {
            if (err)
                throw err;

            console.log(data);
        });
});
```

***

License
-
Licensed under the MIT License.

Authors
-
Copyright&copy; 2012 Fred Chien <<fred@mandice.com>>
