var db = require('../public/db');
var table = "settings";


function Setting(options){
    options = typeof options == "object" ? options : {};
    var self = {
        key: options.key || "",
        value:  options.value || "",
    };
    return self;
}

module.exports.create = function(options, callback){
    db.loadDatabase({}, function(){
        var live = db.loadHandler(table);
        var item = new Setting(options);
        live.insert(item);
        db.save();
        if(callback) callback(item);
    })
}

module.exports.get = function(key, callback){
    db.loadDatabase({}, function(){
        var live = db.loadHandler(table);
        var item = live.findOne({key: key});
        callback(item ? item.value : "");
    })
}

module.exports.set = function(key, value, callback){
    db.loadDatabase({}, function(){
        var live = db.loadHandler(table);
        var item = live.findOne({key: key});
        if(item){
            item.value = value;
            live.update(item);
        }else{
            module.exports.create({key: key, value: value});
        }
        db.save();
    })
}


module.exports.update = function(item){
    db.loadDatabase({}, function(){
        var live = db.loadHandler(table);
        live.update(item);
        db.save();
    });
}

module.exports.Setting = Setting;
