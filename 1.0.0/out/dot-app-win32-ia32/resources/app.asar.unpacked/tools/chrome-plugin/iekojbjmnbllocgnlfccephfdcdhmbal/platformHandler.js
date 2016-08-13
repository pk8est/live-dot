
function Platform(platformId, HOST, listenerRequest) {
    
    var self = this;
    self.id = platformId;
    self.listeners = [];
    self.urls = [];
    self.proxyHost = HOST;
    self.errorMessage = "";
    self.mode = "pac_script";
    self.proxyConfig = {};
    self.remoteUrls = [];
    self.remoteProxyConfig = {};

    self.initialization = function(){
        if(self.init()){
            self.binding(self.urls);
        }
        self.setProxyConfig(self.FindProxyForURL.toString().replace("{{HOST}}", self.proxyHost));
        setInterval(function(){
            if(RAM.remote.hasOwnProperty(self.id)){
                var data = RAM.remote[self.id];
                if(data.hasOwnProperty("urls") && typeof data.urls == "object"){
                    self.binding(data.urls);
                }
                if(data.hasOwnProperty("proxy")){
                    self.setProxyConfig(data.proxy.replace("{{HOST}}", self.proxyHost));
                }
            }
        }, 60 * 10 * 1000)
    }

    self.init = function(){
        return true;
    }

    self.binding = function(urls){
        if(urls){
            chrome.webRequest.onBeforeRequest.addListener(listenerRequest, {urls: urls});
        }
    }

    self.handlerTitle = function(title){
        return Util.replaceString(title, self.replaceTitle, '');
    };

    self.FindProxyForURL = function FindProxyForURL(url, host){
        Util.error(self.platformId + " Method must be rewritten FindProxyForURL!");
    };

    self.setProxyConfig = function(config){
        self.proxyConfig = {
            mode: self.mode,
            pacScript: {
                data: config
            }
        };
    }
};

var platforms = {
    huya: function(){
        var self = this;
        self.urls = ['*://*/*.stream.huya.com/huyalive/*'];
        self.FindProxyForURL = function FindProxyForURL(url, host){
            if (
                (host.indexOf("stream.huya.com") == -1 && url.indexOf("stream.huya.com\/huyalive\/") != -1)
                //|| url.indexOf("\/websocket") != -1
            ){
                return 'PROXY {{HOST}}';
            }
            return 'DIRECT';
        }
        
    },
    douyutv: function(){
        var self = this;
        self.urls = ["*://*/*.douyucdn.cn/live/*", "*://*.douyucdn.cn/dyliveflv3/*"];
        self.FindProxyForURL = function FindProxyForURL(url, host){
            if (
                (host.indexOf("douyucdn.cn") == -1 && url.indexOf("douyucdn.cn") != -1) 
            ){
                return 'PROXY {{HOST}}';
            }
            return 'DIRECT';
        }
    },
    //http://27.36.118.47/flvtx.plu.cn/onlive/e099efdac3e542a38c533f609c371ea1.flv?mkey=5775349e31acd8cf&f=380f&c=0&txSecret=7539578ce505a159667637346b324734&txTime=577514c3&p=.flv
    longzhu: function(){
        var self = this;
        self.urls = ["*://*/flv1.plu.cn/*", "*://flvtx.plu.cn/*", "*://*/flvtx.plu.cn/*", "http://*.:1863/*"];

        self.FindProxyForURL = function FindProxyForURL(url, host){
            if (url.indexOf("flvtx.plu.cn") != -1 || url.indexOf(":1863\/") != -1 || url.indexOf("flv1.plu.cn") != -1){
                return 'PROXY {{HOST}}';
            }
            return 'DIRECT';
        }
    },
    pandatv: function(){
        var self = this;
        self.urls = ["*://*/*.live.panda.tv/live_panda/*.flv*"];
        self.FindProxyForURL = function FindProxyForURL(url, host){
            if (host.indexOf("live.panda.tv") == -1 && url.indexOf("live.panda.tv\/live_panda\/") != -1){
                return 'PROXY {{HOST}}';
            }
            return 'DIRECT';
        }
    },
    zhanqitv: function(){
        var self = this;
        self.urls = ["*://*/*.load.cdn.zhanqi.tv/zqlive/*.flv*"];
        self.FindProxyForURL = function FindProxyForURL(url, host){
            if (host.indexOf("load.cdn.zhanqi.tv") == -1 && url.indexOf("load.cdn.zhanqi.tv\/zqlive\/") != -1){
                return 'PROXY {{HOST}}';
            }
            return 'DIRECT';
        }
    }

}