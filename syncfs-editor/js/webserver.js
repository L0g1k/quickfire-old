new WebServer().startServer(80);

function WebServer() {

        var fs = new syncFS();

        function locateFile(uri) {
           return fs.locateFile(uri);
        }

        var startServer = function (port) {

            var socket = chrome.socket;
            var socketInfo;
            var filesMap = {};

            fs.init();

            var writeErrorResponse = function (socketId, errorCode, keepAlive) {
                var file = { size : 0 };
                console.info("writeErrorResponse = = begin... ");
                console.info("writeErrorResponse = = file = " + file);
                var contentType = "text/plain"; //(file.type === "") ? "text/plain"  = file.type;
                var contentLength = file.size;
                var header = stringToUint8Array("HTTP/1.0 " + errorCode + " Not Found\nContent-length = " + file.size + "\nContent-type =" + contentType + ( keepAlive ? "\nConnection: keep-alive" : "") + "\n\n");
                console.info("writeErrorResponse = = Done setting header...");
                var outputBuffer = new ArrayBuffer(header.byteLength + file.size);
                var view = new Uint8Array(outputBuffer)
                view.set(header, 0);
                console.info("writeErrorResponse = = Done setting view...");
                socket.write(socketId, outputBuffer, function (writeInfo) {
                    console.log("WRITE (error)", writeInfo);
                    if (keepAlive) {
                        readFromSocket(socketId);
                    } else {
                        socket.disconnect(socketId);
                        socket.destroy(socketId);
                        socket.accept(socketInfo.socketId, onAccept);
                    }
                });
                console.info("writeErrorResponse = =filereader = = end onload...");

                console.info("writeErrorResponse = = end...");
            };

            var _init = function(){
                socket.create("tcp", {}, function(_socketInfo) {
                    socketInfo = _socketInfo;
                    socket.listen(socketInfo.socketId, "127.0.0.1", parseInt(port), 50, function(result) {
                        console.log("Web server started on port " + port);

                        socket.accept(socketInfo.socketId, onAccept);
                    });
                });
            }
            var write200Response = function (socketId, file, keepAlive) {
                var contentType = (typeof file.type === 'undefined' || file.type === "") ? "text/plain" : file.type;
                var contentLength = file.size;
                var header = stringToUint8Array("HTTP/1.0 200 OK\nContent-length = " + file.size + "\nContent-type =" + contentType + ( keepAlive ? "\nConnection: keep-alive" : "") + "\n\n");
                var outputBuffer = new ArrayBuffer(header.byteLength + file.size);
                var view = new Uint8Array(outputBuffer);
                view.set(header, 0);

                var fileReader = new FileReader();
                fileReader.onload = function (e) {
                    view.set(new Uint8Array(e.target.result), header.byteLength);
                    socket.write(socketId, outputBuffer, function (writeInfo) {
                        console.log("WRITE", writeInfo);
                        socket.disconnect(socketId);
                       // socket.accept(socketInfo.socketId, onAccept);
                        if (keepAlive) {
                            readFromSocket(socketId);
                        } else {
                            socket.disconnect(socketId);
                            socket.destroy(socketId);
                            socket.accept(socketInfo.socketId, onAccept);
                        }
                    });
                };

                fileReader.readAsArrayBuffer(file);
            };

            var onAccept = function (acceptInfo) {
                console.log("ACCEPT", acceptInfo)
                readFromSocket(acceptInfo.socketId);
            };

            var readFromSocket = function (socketId) {
                setTimeout(function () {
                    _readFromSocket(socketId);
                }, 500);
            }

            var _readFromSocket = function (socketId) {
                //  Read in the data
                socket.read(socketId, function (readInfo) {
                    console.log("READ", readInfo);
                    // Parse the request.
                    var data = arrayBufferToString(readInfo.data);
                    if (data.indexOf("GET ") == 0) {
                        var keepAlive = false;
                        if (data.indexOf("Connection: keep-alive") != -1) {
                            keepAlive = true;
                        }

                        // we can only deal with GET requests
                        var uriEnd = data.indexOf(" ", 4);
                        if (uriEnd < 0) { /* throw a wobbler */
                            return;
                        }
                        var uri = data.substring(4, uriEnd);
                        // strip qyery string
                        var q = uri.indexOf("?");
                        if (q != -1) {
                            uri = uri.substring(0, q);
                        }
                        fs.locateFile(uri, function(file){
                            if (!!file == false) {
                                console.warn("File does not exist..." + uri);
                                writeErrorResponse(socketId, 404, false);
                            } else {
                                console.info("GET 200 " + uri);
                                write200Response(socketId, file, false);
                            }
                        });
                    }
                    else {
                        socket.disconnect(socketId);
                        socket.destroy(socketId);
                        _init();
                    }
                });
            };

            _init();
        }


         function stringToUint8Array (string) {
            var buffer = new ArrayBuffer(string.length);
            var view = new Uint8Array(buffer);
            for (var i = 0; i < string.length; i++) {
                view[i] = string.charCodeAt(i);
            }
            return view;
        }

         function arrayBufferToString (buffer) {
            var str = '';
            var uArrayVal = new Uint8Array(buffer);
            for (var s = 0; s < uArrayVal.length; s++) {
                str += String.fromCharCode(uArrayVal[s]);
            }
            return str;
        }
        return {
            startServer: startServer,
            locateFile: locateFile
        }
}
