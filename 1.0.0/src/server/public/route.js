var path = require("path");
var route = require("./router");
var util = require("../utils/util");
var Live = require('../models/live');
var Setting = require('../models/setting');
var handler = require("./handler");

route.get("/ping", function(req, res){
    res.jsonOutput({"status": 1});
});

route.post("/report", function(req, res){
    res.jsonOutput({"status": 1});
});

route.post("/fail", function(req, res){
    res.jsonOutput({"status": 1});
});

route.get("/list", function(req, res){
    Live.getList({}, 1, 20, function(list){
        res.jsonOutput({"status": 1, "list": list});
    })
});

route.get("/active-list", function(req, res){
    Live.getList({}, 1, 20, function(list){
        res.jsonOutput({"status": 1, "list": handler.getActiveList()});
    })
});

route.get("/getFileSavePath", function(req, res){
    Setting.get("file-save-path", function(value){
        var path = "";
        if(value) path = value;
        if(!path) path = path.join(util.getHomePath(), "Data");
        res.jsonOutput({"status": 1, "path": path});
    });
});

module.exports = route;

