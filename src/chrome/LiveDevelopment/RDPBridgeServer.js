/**
 * Here, we pretend to be the Chrome browser by starting a web socket server on the port which Chrome uses for RDP connections.
 *
 * (RDP = Remote Debug Protocol) - https://developers.google.com/chrome-developer-tools/docs/protocol/1.0/
 *
 * Brackets connects to us, and we faithfully respond to the RDP messages that it sends us. Actually, we are forwarding
 * the RDP mesage to a Chrome extension. That extension then carries out what is requested in the message.
 *
 * It's worth noting that this file is in fact running in the packaged app, alongside Brackets.
 *
 */

define(function RDPBridgeServer(require, exports, module) {

    var wss;
    var pages = {};
    var portsUsed = 9001;
    var self = this;
    this.chromeExtensionPort = null;

    this.extensionId = "ieebdnbmjjibnaakpmbpfhambidebejg";
    this.connected = false;

    function init() {
        console.log("Initialising remote debug emulator");
        this.initWebsocketServer();
        this.initWebserver();
        this.initChromeExtensionTransport();

    }

    this.initChromeExtensionTransport = function() {
        chrome.runtime.onConnectExternal.addListener(this.onExtensionConnect.bind(this));
        try {
            var port = chrome.runtime.connect(this.extensionId, { name: 'RDPBridgeServer'});
            if(port) {
                this._initPort(port);
            }
        } catch (e) {
            console.error("Couldn't open port to chrome extension", e.stack);
        }
    }

    this.onExtensionConnect = function(port) {
        var self = this;
        var ports = this.ports;
        //var tabId = port.sender.tab.id;
        var name = port.name || "";

        if(name == "Quickfire") {

            this._initPort(port);
        }
    }

    this._initPort= function(port) {
        console.log("\n\n===Chrome extension has connected.===\n\n", port);
        this.chromeExtensionPort = port;
        port.onDisconnect.addListener(function(port) {
            self.chromeExtensionPort = null;
            console.log("\n\n===Chrome extension has disconnected.\n\n===")
        });

        port.onMessage.addListener(this.onExtensionMessage);
    }

    // use this so we can communicate with the quickfire devtools chrome extension
    this.initWebsocketServer = function() {
        var self = this;
        var port = 8999;
        wss = new WebSocketServer(port, "127.0.0.1");
        //wss.onMessage(handleChromeExtensionMessage.bind(this));
        wss.onMessage(function(message) {
            // FIXME: This is just for testing. We ned a real way to determine the URL
            message = $.extend({
                url: "http://localhost:8080/Getting%20Started/index.html"
            }, JSON.parse(message.substr(1, message.length - 1)));
            console.log("Brackets RDP client sending message; will attempt to foward to chrome extension", message);
            self.sendMessageToChromeExtension(JSON.stringify(message), true);
        });
        console.log("RDP Bridge Server listening for connections on port " + port);
    }

    this.onExtensionMessage = function(message) {
        console.log("Forwarding message from chrome extension to brackets RDP client", message);
        wss.send(message);
    }

    this.sendMessageToChromeExtension = function(message, retry) {
        if(!this.chromeExtensionPort) {
            console.warn("Brackets tried to send an RDP message, but the " +
                "extension background page isn't reachable. The extension either" +
                " is not installed, or needs restarting");
        } else {
            this.chromeExtensionPort.postMessage(
                message);
        }
    }

    this.handleChromeExtensionResponse = function(response) {
        console.log("Response from chrome extension", response);
    }

    this.attemptConnection = function() {
        chrome.runtime.connect(this.extensionId, {
            name: 'RDPBridgeServer'
        });
        this.connected = true;
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
