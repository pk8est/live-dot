function createSocket(host){

    var socket = io.connect(host); 
    socket.on('connect', function(){ 
        console.log("connect ...");
    });

    socket.on("disconnect", function(){
        clearProxy();
        socket.disconnect();
    })

    socket.on("close-connect", function(tabId){
        clearProxy();
        socket.disconnect();
        chrome.tabs.reload(tabId);
    })

    socket.on("clear-proxy", function(){
        clearProxy();
    })

    socket.on("live-record-start", function(message){
        Util.notice("已经开始录制！");
        console.log("开始录制")
    })

    socket.on("live-record-end", function(message){
        Util.notice("已经结束录制！");
        console.log("结束录制")
    })

    socket.on("live-error", function(message){
        Util.notice(message);
        console.log(message)  
    })

    socket.on("live-success", function(message){
        Util.notice(message);
        console.log(message)  
    })

    return socket;

};
