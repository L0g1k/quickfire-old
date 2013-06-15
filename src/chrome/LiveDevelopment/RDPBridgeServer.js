/**
 * Here, we pretend to be the Chrome browser. Brackets connects to us, and we faithfully respond to it's RDP messages.
 *
 * This file is infact running in the packaged app, alongside Brackets.
 *
 * To communicate with the real page
 */

define(function RDPBridgeServer(require, exports, module) {

    var wss;
    var pages = {};
    var portsUsed = 9001;

    function init() {
        console.log("Initialising remote debug emulator");
        this.initWebsocketServer();
        this.initWebserver();
    }

    // use this so we can communicate with the quickfire devtools chrome extension
    this.initWebsocketServer = function() {
        var port = 8999;
        wss = new WebSocketServer(port, "127.0.0.1");
        wss.onMessage(handleChromeExtensionMessage.bind(this));
        console.log("RDP Bridge Server listening for connections on port " + port);
    }

    // emulate chrome remote debug manager - port comes from Inspector.js getDebuggableWindows
    this.initWebserver = function() {
       var requestListener = function (req, res) {
           console.log("Request: ", req);
           res.writeHead(200, {
               "Access-control-allow-origin": "*",
               "Content-Type": "application/json"
           });
           res.end(JSON.stringify([{
               description: "",
               faviconUrl: "",
               id: "C42D3306-7E65-787B-25E3-253873D74DFE",
               thumbnailUrl: "/thumb/C42D3306-7E65-787B-25E3-253873D74DFE",
               title: "GETTING STARTED WITH BRACKETS",
               type: "page",
               url: "chrome-extension://mmefihllomekhdklofjkpdphmcogimbp/src/LiveDevelopment/launch.html",
               "webSocketDebuggerUrl": "ws://localhost:8999"
           }]));
        }
        var server = window.httpChromify.createServer(requestListener);
        server.listen(9222);
    }

    function handleChromeExtensionMessage(_message) {

        console.log("Handling Chrome extension message ", _message);

        var message = JSON.parse(_message.substr(1, _message.length-1));
        var method = message.method, id = message.id, params = message.params;
        var methodCamelCased = this.methodCamelCased(method);
        var func = this['handle' + methodCamelCased];
        if(func)
            func.call(method.id, method.params);
        else {
            console.warn("Unknown message ", message);
        }
    }

    this.handleRuntimeEvaluate = function(id, params) {
        console.log("Evaluating", params);
    }

    this.handleCallFunctionOn = function(id, params) {
        console.log("Calling function on", params);
    }

    this.methodCamelCased = function(method) {
        var ret = "";
        if(method.indexOf(".") == -1) {
            return method;
        } else {
            var dot = false;
            for(var i=0; i<method.length; i++) {
                if(dot) {
                    ret += method.charAt(i).toUpperCase();
                    dot = false;
                } else {
                    var c = method.charAt(i);
                    if(c == ".") {
                        dot = true;
                    } else ret += method.charAt(i);
                }

            }


        }
        return ret;
    }

    function onPageOpened(tabId) {
       pages[tabId] = _createRDPBridgeServer();
       console.log("RDP Bridge Server: new client connected", tabId);
    }

    function onPageClosed(tabId) {
        delete pages[tabId];
        console.log("RDP Bridge Server: client disconnected", tabId);
    }

    function _createRDPBridgeServer() {
        var port = portsUsed;
        var server = new WebSocketServer(port, "127.0.0.1");
        portsUsed++;
        server.onMessage = handleBracketsRDPMessage.bind(this);
        return port;
    }

    function handleBracketsRDPMessage(message) {
        console.log("Handling Brackets RDP message ", message);
    }

    exports.init = init;
});
