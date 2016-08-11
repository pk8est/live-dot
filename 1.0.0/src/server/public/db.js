var fs = require('fs');
var path = require('path');
var util = require('../utils/util');
var dbPath = path.join(util.getHomePath(),  'Databases');
util.mkdirsSync(dbPath);

var options = {
    autoload: true,
    autosave: true, 
    autosaveInterval: 1000,
    autoloadCallback : loadHandler,
};

//var loki = require('lokijs', options);
var loki = require('lokijs');

db = new loki(path.join(dbPath, 'data.db'));
db.loadHandler = loadHandler;

function loadHandler(table) {
    var coll = db.getCollection(table);
    if (coll === null) {
        coll = db.addCollection(table);
    }
    return coll;
}

module.exports = db;