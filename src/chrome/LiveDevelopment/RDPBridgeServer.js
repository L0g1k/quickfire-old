define(function RDPBridgeServer(require, exports, module) {

    var wss;
    var pages = {};
    var portsUsed = 9001;

    function init() {
        initWebsocketServer();
        initWebserver();
    }

    // use this so we can communicate with the quickfire devtools chrome extension
    function initWebsocketServer() {
        var port = 8999;
        wss = new WebSocketServer(port, "127.0.0.1");
        wss.onMessage = handleChromeExtensionMessage.bind(this);
        console.log("RDP Bridge Server listening for connections on port " + port);
    }

    // emulate chrome remote debug manager - port comes from Inspector.js getDebuggableWindows
    function initWebserver() {
       var requestListener = function (req, res) {
            console.log("Request: ", req);
        }
        var server = window.createServer(requestListener);
        server.listen(9222);
    }

    function handleChromeExtensionMessage(message) {
        console.log("Handling Chrome extension message ", message);
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
