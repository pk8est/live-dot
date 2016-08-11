var router = {};
router.GET = {};
router.POST = {};

router.runAction = function(path, req, res){
    var method = req.method;
    res.jsonOutput = function(data){
        res.writeHead(200, {
            'Content-Type': 'application/json',
        });
        res.end(JSON.stringify(data));
    }
    if(typeof router[method][path] == "function"){
        router[method][path](req, res);
    }else{
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end();
    }
}

router.get = function(path, handler){
    this.GET[path] = handler;
} 
router.post = function(path, handler){
    this.POST[path] = handler;
} 

module.exports = router;