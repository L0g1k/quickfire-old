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
        wss.onMessage(handleChromeExtensionMessage.bind(this));
        console.log("RDP Bridge Server listening for connections on port " + port);
    }

    // emulate chrome remote debug manager - port comes from Inspector.js getDebuggableWindows
    function initWebserver() {
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
