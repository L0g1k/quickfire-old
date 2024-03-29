(function(){

    var require2=(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require2=="function"&&require2;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require2=="function"&&require2;for(var s=0;s<n.length;s++)i(n[s]);return i})({"net":[function(require2,module,exports){
        module.exports=require2('3tvzvh');
    },{}],"3tvzvh":[function(require2,module,exports){
        (function(){/*
         Copyright 2012 Google Inc

         Licensed under the Apache License, Version 2.0 (the "License");
         you may not use this file except in compliance with the License.
         You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

         Unless require2d by applicable law or agreed to in writing, software
         distributed under the License is distributed on an "AS IS" BASIS,
         WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
         See the License for the specific language governing permissions and
         limitations under the License.                  f
         */

            var net = module.exports;
            var events = require2('events');
            var util = require2('util');
            var Stream = require2('stream');
            var Buffer = require2('buffer').Buffer;
            if(window) window.Buffer = Buffer; // <-- hack for websocket-server.js to avoid recompiling
            var stringToArrayBuffer = function(str) {
                var buffer = new ArrayBuffer(str.length);
                var uint8Array = new Uint8Array(buffer);
                for(var i = 0; i < str.length; i++) {
                    uint8Array[i] = str.charCodeAt(i);
                }
                return buffer;
            };

            var bufferToArrayBuffer = function(buffer) {
                var ab = new ArrayBuffer(buffer.length);
                var view = new Uint8Array(ab);
                for (var i = 0; i < buffer.length; ++i) {
                    view[i] = buffer.readUInt8(i);
                }
                return ab;
            };

            var arrayBufferToBuffer = function(arrayBuffer) {
                var buffer = new Buffer(arrayBuffer.byteLength);
                var uint8Array = new Uint8Array(arrayBuffer);
                for(var i = 0; i < uint8Array.length; i++) {
                    buffer.writeUInt8(uint8Array[i], i);
                }
                return buffer;
            };

            net.createServer = function() {
                var options = {
                };
                var args = arguments;

                var cb = args[args.length -1];
                cb = (typeof cb === 'function') ? cb : function() {};

                if(typeof args[0] === 'object') {
                    options = args[0];
                }

                var server = new net.Server(options);
                server.on("connection", cb);
                return server;
            };

            net.connect = net.createConnection = function() {
                var options = {};
                var args = arguments;
                if(typeof args[0] === 'object') {
                    options.port = args[0].port;
                    options.host = args[0].host || "127.0.0.1";
                }
                else if(typeof args[0] === 'number') {
                    // there is a port
                    options.port = args[0];
                    if(typeof args[1] === 'string') {
                        options.host = args[1];
                    }
                }
                else if(typeof args[0] === 'string') {
                    return; // can't do this.
                }

                var cb = args[args.length -1];
                cb = (typeof cb === 'function') ? cb : function() {};

                var socket = new net.Socket(options, function() {
                    socket.connect(options, cb);
                });

                return socket;
            };

            function Server() {
                var _maxConnections = 0;
                this.__defineGetter__("maxConnections", function() { return _maxConnections; });

                var _connections = 0;
                this.__defineGetter__("connections", function() { return _connections; });

                events.EventEmitter.call(this);
                // if (!(this instanceof Server)) return new Server(arguments[0], arguments[1]);
                // events.EventEmitter.call(this);

                // var self = this;

                // var options;

                // if (typeof arguments[0] == 'function') {
                //   options = {};
                //   self.on('connection', arguments[0]);
                // } else {
                //   options = arguments[0] || {};

                //   if (typeof arguments[1] == 'function') {
                //     self.on('connection', arguments[1]);
                //   }
                // }

                // this._connections = 0;

                // // when server is using slaves .connections is not reliable
                // // so null will be return if thats the case
                // Object.defineProperty(this, 'connections', {
                //   get: function() {
                //     if (self._usingSlaves) {
                //       return null;
                //     }
                //     return self._connections;
                //   },
                //   set: function(val) {
                //     return (self._connections = val);
                //   },
                //   configurable: true, enumerable: true
                // });

                // this.allowHalfOpen = options.allowHalfOpen || false;

                // this._handle = null;
            }
            net.Server = Server;
            util.inherits(net.Server, events.EventEmitter);

            net.Server.prototype.listen = function() {
                var self = this;
                var options = {};
                var args = arguments;

                if (typeof args[0] === 'number') {
                    // assume port. and host.
                    options.port = args[0];
                    options.host = "127.0.0.1";
                    options.backlog = 511;
                    if(typeof args[1] === 'string') {
                        options.host = args[1];
                    }
                    else if(typeof args[1] === 'number') {
                        options.backlog = args[1];
                    }

                    if(typeof args[2] === 'number') {
                        options.backlog = args[2];
                    }
                }
                else {
                    // throw.
                }

                this._serverSocket = new net.Socket(options);

                var cb = args[args.length -1];
                cb = (typeof cb === 'function') ? cb : function() {};

                self.on('listening', cb);

                self._serverSocket.on("_created", function() {
                    // Socket created, now turn it into a server socket.
                    chrome.socket.listen(self._serverSocket._socketInfo.socketId, options.host, options.port, options.backlog, function() {
                        self.emit('listening');
                        chrome.socket.accept(self._serverSocket._socketInfo.socketId, self._accept.bind(self));
                    });
                });
            };

            net.Server.prototype._accept = function(acceptInfo) {
                // Create a new socket for the handle the response.
                var self = this;
                var socket = new net.Socket();

                socket._socketInfo = acceptInfo;
                self.emit("connection", socket);

                chrome.socket.accept(self._serverSocket._socketInfo.socketId, self._accept.bind(self));

                socket._read();
            };

            net.Server.prototype.close = function(callback) {
                self.on("close", callback || function() {});
                self._serverSocket.destroy();
                self.emit("close");
            };
            net.Server.prototype.address = function() {};

            net.Socket = function(options) {
                var createNew = false;
                var allowHalfOpen;
                if(options){
                    createNew = true;
                }
                var self = this;
                options = options || {};
                this._fd = options.fd;
                this._type = options.type || "tcp";
                //assert(this._type === "tcp6", "Only tcp4 is allowed");
                //assert(this._type === "unix", "Only tcp4 is allowed");
                this._type = allowHalfOpen = options.allowHalfOpen || false;
                this._socketInfo = 0;
                this._encoding;

                if(createNew){
                    chrome.socket.create("tcp", {}, function(createInfo) {
                        self._socketInfo = createInfo;
                        self.emit("_created"); // This event doesn't exist in the API, it is here because Chrome is async
                        // start trying to read
                        // self._read();
                    });
                }
            };

            util.inherits(net.Socket, Stream);

            /*
             Events:
             close
             connect
             data
             drain
             end
             error
             timeout
             */

            /*
             Methods
             */

            net.Socket.prototype.connect = function() {
                var self = this;
                var options = {};
                var args = arguments;

                if(typeof args[0] === 'object') {
                    // we have an options object.
                    options.port = args[0].port;
                    options.host = args[0].host || "127.0.0.1";
                }
                else if (typeof args[0] === 'string') {
                    // throw an error, we can't do named pipes.
                }
                else if (typeof args[0] === 'number') {
                    // assume port. and host.
                    options.port = args[0];
                    options.host = "127.0.0.1";
                    if(typeof args[1] === 'string') {
                        options.host = args[1];
                    }
                }

                var cb = args[args.length -1];
                cb = (typeof cb === 'function') ? cb : function() {};
                self.on('connect', cb);

                chrome.socket.connect(self._socketInfo.socketId, options.host, options.port, function(result) {
                    if(result == 0) {
                        self.emit('connect');
                    }
                    else {
                        self.emit('error', new Error("Unable to connect"));
                    }
                });
            };

            net.Socket.prototype.destroy = function() {
                chrome.socket.disconnect(this._socketInfo.socketId);
                chrome.socket.destroy(this._socketInfo.socketId);
                clearTimeout(this._readTimer);
            };
            net.Socket.prototype.destroySoon = function() {
                // Blaine's solution to this stub - probably not correct impl
                chrome.socket.disconnect(this._socketInfo.socketId);
                clearTimeout(this._readTimer);
            };

            net.Socket.prototype.setEncoding = function(encoding) {
                this._encoding = encoding;
            };

            net.Socket.prototype.setNoDelay = function(noDelay) {
                noDelay = (noDelay === undefined) ? true : noDelay;
                chrome.socket.setNoDely(self._socketInfo.socketId, noDelay, function() {});
            };

            net.Socket.prototype.setKeepAlive = function(enable, delay) {
                enable = (enable === 'undefined') ? false : enable;
                delay = (delay === 'undefined') ? 0 : delay;
                chrome.socket.setKeepAlive(self._socketInfo.socketId, enable, initialDelay, function() {});
            };

            net.Socket.prototype._read = function() {
                var self = this;
                if(typeof self._socketInfo.socketId === 'undefined') {
                    throw "Socket isn't working";
                }
                chrome.socket.read(self._socketInfo.socketId, function(readInfo) {
                    if(readInfo.resultCode < 0) return;
                    // ArrayBuffer to Buffer if no encoding.
                    //console.log(Array.prototype.slice.call(new Uint8Array(readInfo.data)).join(","));
                    var buffer = arrayBufferToBuffer(readInfo.data);
                    self.emit('data', buffer);
                    if (self.ondata) self.ondata(buffer.parent, buffer.offset, buffer.offset + buffer.length);
                });

                // enque another read soon. TODO: Is there are better way to controll speed.
                self._readTimer = setTimeout(self._read.bind(self), 100);
            };

            net.Socket.prototype.write = function(data, encoding, callback) {
                var buffer;
                var self = this;

                encoding = encoding || "UTF8";
                callback = callback || function() {};

                if(typeof data === 'string') {
                    buffer = stringToArrayBuffer(data);
                }
                else if(data instanceof Buffer) {
                    buffer = bufferToArrayBuffer(data);
                }
                else {
                    // throw an error because we can't do anything.
                }

                self._resetTimeout();

                chrome.socket.write(self._socketInfo.socketId, buffer, function(writeInfo) {
                    callback();
                });

                return true;
            };

            net.Socket.prototype._resetTimeout = function() {
                var self = this;
                if(!!self._timeout == false) clearTimeout(self._timeout);
                if(!!self._timeoutValue) self._timeout = setTimeout(function() { self.emit('timeout') }, self._timeoutValue);
            };

            net.Socket.prototype.setTimeout = function(timeout, callback) {
                this._timeoutValue = timeout;
                this._resetTimeout();
            };

            net.Socket.prototype.ref = function() {};
            net.Socket.prototype.unref = function() {};
            net.Socket.prototype.pause = function() {};
            net.Socket.prototype.resume = function() {};
            net.Socket.prototype.end = function() {

            };


            Object.defineProperty(net.Socket.prototype, 'readyState', {
                get: function() {}
            });

            Object.defineProperty(net.Socket.prototype, 'bufferSize', {
                get: function() {}
            });

        })()
    },{"events":1,"util":2,"stream":3,"buffer":4}],2:[function(require2,module,exports){
        var events = require2('events');

        exports.isArray = isArray;
        exports.isDate = function(obj){return Object.prototype.toString.call(obj) === '[object Date]'};
        exports.isRegExp = function(obj){return Object.prototype.toString.call(obj) === '[object RegExp]'};


        exports.print = function () {};
        exports.puts = function () {};
        exports.debug = function() {};

        exports.inspect = function(obj, showHidden, depth, colors) {
            var seen = [];

            var stylize = function(str, styleType) {
                // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
                var styles =
                { 'bold' : [1, 22],
                    'italic' : [3, 23],
                    'underline' : [4, 24],
                    'inverse' : [7, 27],
                    'white' : [37, 39],
                    'grey' : [90, 39],
                    'black' : [30, 39],
                    'blue' : [34, 39],
                    'cyan' : [36, 39],
                    'green' : [32, 39],
                    'magenta' : [35, 39],
                    'red' : [31, 39],
                    'yellow' : [33, 39] };

                var style =
                    { 'special': 'cyan',
                        'number': 'blue',
                        'boolean': 'yellow',
                        'undefined': 'grey',
                        'null': 'bold',
                        'string': 'green',
                        'date': 'magenta',
                        // "name": intentionally not styling
                        'regexp': 'red' }[styleType];

                if (style) {
                    return '\033[' + styles[style][0] + 'm' + str +
                        '\033[' + styles[style][1] + 'm';
                } else {
                    return str;
                }
            };
            if (! colors) {
                stylize = function(str, styleType) { return str; };
            }

            function format(value, recurseTimes) {
                // Provide a hook for user-specified inspect functions.
                // Check that value is an object with an inspect function on it
                if (value && typeof value.inspect === 'function' &&
                    // Filter out the util module, it's inspect function is special
                    value !== exports &&
                    // Also filter out any prototype objects using the circular check.
                    !(value.constructor && value.constructor.prototype === value)) {
                    return value.inspect(recurseTimes);
                }

                // Primitive types cannot have properties
                switch (typeof value) {
                    case 'undefined':
                        return stylize('undefined', 'undefined');

                    case 'string':
                        var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                            .replace(/'/g, "\\'")
                            .replace(/\\"/g, '"') + '\'';
                        return stylize(simple, 'string');

                    case 'number':
                        return stylize('' + value, 'number');

                    case 'boolean':
                        return stylize('' + value, 'boolean');
                }
                // For some reason typeof null is "object", so special case here.
                if (value === null) {
                    return stylize('null', 'null');
                }

                // Look up the keys of the object.
                var visible_keys = Object_keys(value);
                var keys = showHidden ? Object_getOwnPropertyNames(value) : visible_keys;

                // Functions without properties can be shortcutted.
                if (typeof value === 'function' && keys.length === 0) {
                    if (isRegExp(value)) {
                        return stylize('' + value, 'regexp');
                    } else {
                        var name = value.name ? ': ' + value.name : '';
                        return stylize('[Function' + name + ']', 'special');
                    }
                }

                // Dates without properties can be shortcutted
                if (isDate(value) && keys.length === 0) {
                    return stylize(value.toUTCString(), 'date');
                }

                var base, type, braces;
                // Determine the object type
                if (isArray(value)) {
                    type = 'Array';
                    braces = ['[', ']'];
                } else {
                    type = 'Object';
                    braces = ['{', '}'];
                }

                // Make functions say that they are functions
                if (typeof value === 'function') {
                    var n = value.name ? ': ' + value.name : '';
                    base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
                } else {
                    base = '';
                }

                // Make dates with properties first say the date
                if (isDate(value)) {
                    base = ' ' + value.toUTCString();
                }

                if (keys.length === 0) {
                    return braces[0] + base + braces[1];
                }

                if (recurseTimes < 0) {
                    if (isRegExp(value)) {
                        return stylize('' + value, 'regexp');
                    } else {
                        return stylize('[Object]', 'special');
                    }
                }

                seen.push(value);

                var output = keys.map(function(key) {
                    var name, str;
                    if (value.__lookupGetter__) {
                        if (value.__lookupGetter__(key)) {
                            if (value.__lookupSetter__(key)) {
                                str = stylize('[Getter/Setter]', 'special');
                            } else {
                                str = stylize('[Getter]', 'special');
                            }
                        } else {
                            if (value.__lookupSetter__(key)) {
                                str = stylize('[Setter]', 'special');
                            }
                        }
                    }
                    if (visible_keys.indexOf(key) < 0) {
                        name = '[' + key + ']';
                    }
                    if (!str) {
                        if (seen.indexOf(value[key]) < 0) {
                            if (recurseTimes === null) {
                                str = format(value[key]);
                            } else {
                                str = format(value[key], recurseTimes - 1);
                            }
                            if (str.indexOf('\n') > -1) {
                                if (isArray(value)) {
                                    str = str.split('\n').map(function(line) {
                                        return '  ' + line;
                                    }).join('\n').substr(2);
                                } else {
                                    str = '\n' + str.split('\n').map(function(line) {
                                        return '   ' + line;
                                    }).join('\n');
                                }
                            }
                        } else {
                            str = stylize('[Circular]', 'special');
                        }
                    }
                    if (typeof name === 'undefined') {
                        if (type === 'Array' && key.match(/^\d+$/)) {
                            return str;
                        }
                        name = JSON.stringify('' + key);
                        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
                            name = name.substr(1, name.length - 2);
                            name = stylize(name, 'name');
                        } else {
                            name = name.replace(/'/g, "\\'")
                                .replace(/\\"/g, '"')
                                .replace(/(^"|"$)/g, "'");
                            name = stylize(name, 'string');
                        }
                    }

                    return name + ': ' + str;
                });

                seen.pop();

                var numLinesEst = 0;
                var length = output.reduce(function(prev, cur) {
                    numLinesEst++;
                    if (cur.indexOf('\n') >= 0) numLinesEst++;
                    return prev + cur.length + 1;
                }, 0);

                if (length > 50) {
                    output = braces[0] +
                        (base === '' ? '' : base + '\n ') +
                        ' ' +
                        output.join(',\n  ') +
                        ' ' +
                        braces[1];

                } else {
                    output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
                }

                return output;
            }
            return format(obj, (typeof depth === 'undefined' ? 2 : depth));
        };


        function isArray(ar) {
            return ar instanceof Array ||
                Array.isArray(ar) ||
                (ar && ar !== Object.prototype && isArray(ar.__proto__));
        }


        function isRegExp(re) {
            return re instanceof RegExp ||
                (typeof re === 'object' && Object.prototype.toString.call(re) === '[object RegExp]');
        }


        function isDate(d) {
            if (d instanceof Date) return true;
            if (typeof d !== 'object') return false;
            var properties = Date.prototype && Object_getOwnPropertyNames(Date.prototype);
            var proto = d.__proto__ && Object_getOwnPropertyNames(d.__proto__);
            return JSON.stringify(proto) === JSON.stringify(properties);
        }

        function pad(n) {
            return n < 10 ? '0' + n.toString(10) : n.toString(10);
        }

        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
            'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
        function timestamp() {
            var d = new Date();
            var time = [pad(d.getHours()),
                pad(d.getMinutes()),
                pad(d.getSeconds())].join(':');
            return [d.getDate(), months[d.getMonth()], time].join(' ');
        }

        exports.log = function (msg) {};

        exports.pump = null;

        var Object_keys = Object.keys || function (obj) {
            var res = [];
            for (var key in obj) res.push(key);
            return res;
        };

        var Object_getOwnPropertyNames = Object.getOwnPropertyNames || function (obj) {
            var res = [];
            for (var key in obj) {
                if (Object.hasOwnProperty.call(obj, key)) res.push(key);
            }
            return res;
        };

        var Object_create = Object.create || function (prototype, properties) {
            // from es5-shim
            var object;
            if (prototype === null) {
                object = { '__proto__' : null };
            }
            else {
                if (typeof prototype !== 'object') {
                    throw new TypeError(
                        'typeof prototype[' + (typeof prototype) + '] != \'object\''
                    );
                }
                var Type = function () {};
                Type.prototype = prototype;
                object = new Type();
                object.__proto__ = prototype;
            }
            if (typeof properties !== 'undefined' && Object.defineProperties) {
                Object.defineProperties(object, properties);
            }
            return object;
        };

        exports.inherits = function(ctor, superCtor) {
            ctor.super_ = superCtor;
            ctor.prototype = Object_create(superCtor.prototype, {
                constructor: {
                    value: ctor,
                    enumerable: false,
                    writable: true,
                    configurable: true
                }
            });
        };

        var formatRegExp = /%[sdj%]/g;
        exports.format = function(f) {
            if (typeof f !== 'string') {
                var objects = [];
                for (var i = 0; i < arguments.length; i++) {
                    objects.push(exports.inspect(arguments[i]));
                }
                return objects.join(' ');
            }

            var i = 1;
            var args = arguments;
            var len = args.length;
            var str = String(f).replace(formatRegExp, function(x) {
                if (x === '%%') return '%';
                if (i >= len) return x;
                switch (x) {
                    case '%s': return String(args[i++]);
                    case '%d': return Number(args[i++]);
                    case '%j': return JSON.stringify(args[i++]);
                    default:
                        return x;
                }
            });
            for(var x = args[i]; i < len; x = args[++i]){
                if (x === null || typeof x !== 'object') {
                    str += ' ' + x;
                } else {
                    str += ' ' + exports.inspect(x);
                }
            }
            return str;
        };

    },{"events":1}],"crypto":[function(require2,module,exports){
        module.exports=require2('gCyZyB');
    },{}],"gCyZyB":[function(require2,module,exports){
        var sha = require2('./sha')
        var rng = require2('./rng')
        var md5 = require2('./md5')

        var algorithms = {
            sha1: {
                hex: sha.hex_sha1,
                binary: sha.b64_sha1,
                ascii: sha.str_sha1
            },
            md5: {
                hex: md5.hex_md5,
                binary: md5.b64_md5,
                ascii: md5.any_md5
            }
        }

        function error () {
            var m = [].slice.call(arguments).join(' ')
            throw new Error([
                m,
                'we accept pull requests',
                'http://github.com/dominictarr/crypto-browserify'
            ].join('\n'))
        }

        exports.createHash = function (alg) {
            alg = alg || 'sha1'
            if(!algorithms[alg])
                error('algorithm:', alg, 'is not yet supported')
            var s = ''
            var _alg = algorithms[alg]
            return {
                update: function (data) {
                    s += data
                    return this
                },
                digest: function (enc) {
                    enc = enc || 'binary'
                    var fn
                    if(!(fn = _alg[enc]))
                        error('encoding:', enc , 'is not yet supported for algorithm', alg)
                    var r = fn(s)
                    s = null //not meant to use the hash after you've called digest.
                    return r
                }
            }
        }

        exports.randomBytes = function(size, callback) {
            if (callback && callback.call) {
                try {
                    callback.call(this, undefined, rng(size));
                } catch (err) { callback(err); }
            } else {
                return rng(size);
            }
        }

// the least I can do is make error messages for the rest of the node.js/crypto api.
        ;['createCredentials'
            , 'createHmac'
            , 'createCypher'
            , 'createCypheriv'
            , 'createDecipher'
            , 'createDecipheriv'
            , 'createSign'
            , 'createVerify'
            , 'createDeffieHellman'
            , 'pbkdf2'].forEach(function (name) {
                exports[name] = function () {
                    error('sorry,', name, 'is not implemented yet')
                }
            })

    },{"./rng":5,"./md5":6,"./sha":7}],8:[function(require2,module,exports){
// shim for using process in browser

        var process = module.exports = {};

        process.nextTick = (function () {
            var canSetImmediate = typeof window !== 'undefined'
                && window.setImmediate;
            var canPost = typeof window !== 'undefined'
                    && window.postMessage && window.addEventListener
                ;

            if (canSetImmediate) {
                return function (f) { return window.setImmediate(f) };
            }

            if (canPost) {
                var queue = [];
                window.addEventListener('message', function (ev) {
                    if (ev.source === window && ev.data === 'process-tick') {
                        ev.stopPropagation();
                        if (queue.length > 0) {
                            var fn = queue.shift();
                            fn();
                        }
                    }
                }, true);

                return function nextTick(fn) {
                    queue.push(fn);
                    window.postMessage('process-tick', '*');
                };
            }

            return function nextTick(fn) {
                setTimeout(fn, 0);
            };
        })();

        process.title = 'browser';
        process.browser = true;
        process.env = {};
        process.argv = [];

        process.binding = function (name) {
            throw new Error('process.binding is not supported');
        }

// TODO(shtylman)
        process.cwd = function () { return '/' };
        process.chdir = function (dir) {
            throw new Error('process.chdir is not supported');
        };

    },{}],1:[function(require2,module,exports){
        (function(process){if (!process.EventEmitter) process.EventEmitter = function () {};

            var EventEmitter = exports.EventEmitter = process.EventEmitter;
            var isArray = typeof Array.isArray === 'function'
                    ? Array.isArray
                    : function (xs) {
                    return Object.prototype.toString.call(xs) === '[object Array]'
                }
                ;
            function indexOf (xs, x) {
                if (xs.indexOf) return xs.indexOf(x);
                for (var i = 0; i < xs.length; i++) {
                    if (x === xs[i]) return i;
                }
                return -1;
            }

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
            var defaultMaxListeners = 10;
            EventEmitter.prototype.setMaxListeners = function(n) {
                if (!this._events) this._events = {};
                this._events.maxListeners = n;
            };


            EventEmitter.prototype.emit = function(type) {
                // If there is no 'error' event listener then throw.
                if (type === 'error') {
                    if (!this._events || !this._events.error ||
                        (isArray(this._events.error) && !this._events.error.length))
                    {
                        if (arguments[1] instanceof Error) {
                            throw arguments[1]; // Unhandled 'error' event
                        } else {
                            throw new Error("Uncaught, unspecified 'error' event.");
                        }
                        return false;
                    }
                }

                if (!this._events) return false;
                var handler = this._events[type];
                if (!handler) return false;

                if (typeof handler == 'function') {
                    switch (arguments.length) {
                        // fast cases
                        case 1:
                            handler.call(this);
                            break;
                        case 2:
                            handler.call(this, arguments[1]);
                            break;
                        case 3:
                            handler.call(this, arguments[1], arguments[2]);
                            break;
                        // slower
                        default:
                            var args = Array.prototype.slice.call(arguments, 1);
                            handler.apply(this, args);
                    }
                    return true;

                } else if (isArray(handler)) {
                    var args = Array.prototype.slice.call(arguments, 1);

                    var listeners = handler.slice();
                    for (var i = 0, l = listeners.length; i < l; i++) {
                        listeners[i].apply(this, args);
                    }
                    return true;

                } else {
                    return false;
                }
            };

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
            EventEmitter.prototype.addListener = function(type, listener) {
                if ('function' !== typeof listener) {
                    throw new Error('addListener only takes instances of Function');
                }

                if (!this._events) this._events = {};

                // To avoid recursion in the case that type == "newListeners"! Before
                // adding it to the listeners, first emit "newListeners".
                this.emit('newListener', type, listener);

                if (!this._events[type]) {
                    // Optimize the case of one listener. Don't need the extra array object.
                    this._events[type] = listener;
                } else if (isArray(this._events[type])) {

                    // Check for listener leak
                    if (!this._events[type].warned) {
                        var m;
                        if (this._events.maxListeners !== undefined) {
                            m = this._events.maxListeners;
                        } else {
                            m = defaultMaxListeners;
                        }

                        if (m && m > 0 && this._events[type].length > m) {
                            this._events[type].warned = true;
                            console.error('(node) warning: possible EventEmitter memory ' +
                                'leak detected. %d listeners added. ' +
                                'Use emitter.setMaxListeners() to increase limit.',
                                this._events[type].length);
                            console.trace();
                        }
                    }

                    // If we've already got an array, just append.
                    this._events[type].push(listener);
                } else {
                    // Adding the second element, need to change to array.
                    this._events[type] = [this._events[type], listener];
                }

                return this;
            };

            EventEmitter.prototype.on = EventEmitter.prototype.addListener;

            EventEmitter.prototype.once = function(type, listener) {
                var self = this;
                self.on(type, function g() {
                    self.removeListener(type, g);
                    listener.apply(this, arguments);
                });

                return this;
            };

            EventEmitter.prototype.removeListener = function(type, listener) {
                if ('function' !== typeof listener) {
                    throw new Error('removeListener only takes instances of Function');
                }

                // does not use listeners(), so no side effect of creating _events[type]
                if (!this._events || !this._events[type]) return this;

                var list = this._events[type];

                if (isArray(list)) {
                    var i = indexOf(list, listener);
                    if (i < 0) return this;
                    list.splice(i, 1);
                    if (list.length == 0)
                        delete this._events[type];
                } else if (this._events[type] === listener) {
                    delete this._events[type];
                }

                return this;
            };

            EventEmitter.prototype.removeAllListeners = function(type) {
                if (arguments.length === 0) {
                    this._events = {};
                    return this;
                }

                // does not use listeners(), so no side effect of creating _events[type]
                if (type && this._events && this._events[type]) this._events[type] = null;
                return this;
            };

            EventEmitter.prototype.listeners = function(type) {
                if (!this._events) this._events = {};
                if (!this._events[type]) this._events[type] = [];
                if (!isArray(this._events[type])) {
                    this._events[type] = [this._events[type]];
                }
                return this._events[type];
            };

        })(require2("__browserify_process"))
    },{"__browserify_process":8}],3:[function(require2,module,exports){
        var events = require2('events');
        var util = require2('util');

        function Stream() {
            events.EventEmitter.call(this);
        }
        util.inherits(Stream, events.EventEmitter);
        module.exports = Stream;
// Backwards-compat with node 0.4.x
        Stream.Stream = Stream;

        Stream.prototype.pipe = function(dest, options) {
            var source = this;

            function ondata(chunk) {
                if (dest.writable) {
                    if (false === dest.write(chunk) && source.pause) {
                        source.pause();
                    }
                }
            }

            source.on('data', ondata);

            function ondrain() {
                if (source.readable && source.resume) {
                    source.resume();
                }
            }

            dest.on('drain', ondrain);

            // If the 'end' option is not supplied, dest.end() will be called when
            // source gets the 'end' or 'close' events.  Only dest.end() once, and
            // only when all sources have ended.
            if (!dest._isStdio && (!options || options.end !== false)) {
                dest._pipeCount = dest._pipeCount || 0;
                dest._pipeCount++;

                source.on('end', onend);
                source.on('close', onclose);
            }

            var didOnEnd = false;
            function onend() {
                if (didOnEnd) return;
                didOnEnd = true;

                dest._pipeCount--;

                // remove the listeners
                cleanup();

                if (dest._pipeCount > 0) {
                    // waiting for other incoming streams to end.
                    return;
                }

                dest.end();
            }


            function onclose() {
                if (didOnEnd) return;
                didOnEnd = true;

                dest._pipeCount--;

                // remove the listeners
                cleanup();

                if (dest._pipeCount > 0) {
                    // waiting for other incoming streams to end.
                    return;
                }

                dest.destroy();
            }

            // don't leave dangling pipes when there are errors.
            function onerror(er) {
                cleanup();
                if (this.listeners('error').length === 0) {
                    throw er; // Unhandled stream error in pipe.
                }
            }

            source.on('error', onerror);
            dest.on('error', onerror);

            // remove all the event listeners that were added.
            function cleanup() {
                source.removeListener('data', ondata);
                dest.removeListener('drain', ondrain);

                source.removeListener('end', onend);
                source.removeListener('close', onclose);

                source.removeListener('error', onerror);
                dest.removeListener('error', onerror);

                source.removeListener('end', cleanup);
                source.removeListener('close', cleanup);

                dest.removeListener('end', cleanup);
                dest.removeListener('close', cleanup);
            }

            source.on('end', cleanup);
            source.on('close', cleanup);

            dest.on('end', cleanup);
            dest.on('close', cleanup);

            dest.emit('pipe', source);

            // Allow for unix-like usage: A.pipe(B).pipe(C)
            return dest;
        };

    },{"events":1,"util":2}],9:[function(require2,module,exports){
        (function(){// UTILITY
            var util = require2('util');
            var Buffer = require2("buffer").Buffer;
            var pSlice = Array.prototype.slice;

            function objectKeys(object) {
                if (Object.keys) return Object.keys(object);
                var result = [];
                for (var name in object) {
                    if (Object.prototype.hasOwnProperty.call(object, name)) {
                        result.push(name);
                    }
                }
                return result;
            }

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

            var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

            assert.AssertionError = function AssertionError(options) {
                this.name = 'AssertionError';
                this.message = options.message;
                this.actual = options.actual;
                this.expected = options.expected;
                this.operator = options.operator;
                var stackStartFunction = options.stackStartFunction || fail;

                if (Error.captureStackTrace) {
                    Error.captureStackTrace(this, stackStartFunction);
                }
            };
            util.inherits(assert.AssertionError, Error);

            function replacer(key, value) {
                if (value === undefined) {
                    return '' + value;
                }
                if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
                    return value.toString();
                }
                if (typeof value === 'function' || value instanceof RegExp) {
                    return value.toString();
                }
                return value;
            }

            function truncate(s, n) {
                if (typeof s == 'string') {
                    return s.length < n ? s : s.slice(0, n);
                } else {
                    return s;
                }
            }

            assert.AssertionError.prototype.toString = function() {
                if (this.message) {
                    return [this.name + ':', this.message].join(' ');
                } else {
                    return [
                        this.name + ':',
                        truncate(JSON.stringify(this.actual, replacer), 128),
                        this.operator,
                        truncate(JSON.stringify(this.expected, replacer), 128)
                    ].join(' ');
                }
            };

// assert.AssertionError instanceof Error

            assert.AssertionError.__proto__ = Error.prototype;

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

            function fail(actual, expected, message, operator, stackStartFunction) {
                throw new assert.AssertionError({
                    message: message,
                    actual: actual,
                    expected: expected,
                    operator: operator,
                    stackStartFunction: stackStartFunction
                });
            }

// EXTENSION! allows for well behaved errors defined elsewhere.
            assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

            function ok(value, message) {
                if (!!!value) fail(value, true, message, '==', assert.ok);
            }
            assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

            assert.equal = function equal(actual, expected, message) {
                if (actual != expected) fail(actual, expected, message, '==', assert.equal);
            };

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

            assert.notEqual = function notEqual(actual, expected, message) {
                if (actual == expected) {
                    fail(actual, expected, message, '!=', assert.notEqual);
                }
            };

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

            assert.deepEqual = function deepEqual(actual, expected, message) {
                if (!_deepEqual(actual, expected)) {
                    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
                }
            };

            function _deepEqual(actual, expected) {
                // 7.1. All identical values are equivalent, as determined by ===.
                if (actual === expected) {
                    return true;

                } else if (Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
                    if (actual.length != expected.length) return false;

                    for (var i = 0; i < actual.length; i++) {
                        if (actual[i] !== expected[i]) return false;
                    }

                    return true;

                    // 7.2. If the expected value is a Date object, the actual value is
                    // equivalent if it is also a Date object that refers to the same time.
                } else if (actual instanceof Date && expected instanceof Date) {
                    return actual.getTime() === expected.getTime();

                    // 7.3. Other pairs that do not both pass typeof value == 'object',
                    // equivalence is determined by ==.
                } else if (typeof actual != 'object' && typeof expected != 'object') {
                    return actual == expected;

                    // 7.4. For all other Object pairs, including Array objects, equivalence is
                    // determined by having the same number of owned properties (as verified
                    // with Object.prototype.hasOwnProperty.call), the same set of keys
                    // (although not necessarily the same order), equivalent values for every
                    // corresponding key, and an identical 'prototype' property. Note: this
                    // accounts for both named and indexed properties on Arrays.
                } else {
                    return objEquiv(actual, expected);
                }
            }

            function isUndefinedOrNull(value) {
                return value === null || value === undefined;
            }

            function isArguments(object) {
                return Object.prototype.toString.call(object) == '[object Arguments]';
            }

            function objEquiv(a, b) {
                if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
                    return false;
                // an identical 'prototype' property.
                if (a.prototype !== b.prototype) return false;
                //~~~I've managed to break Object.keys through screwy arguments passing.
                //   Converting to array solves the problem.
                if (isArguments(a)) {
                    if (!isArguments(b)) {
                        return false;
                    }
                    a = pSlice.call(a);
                    b = pSlice.call(b);
                    return _deepEqual(a, b);
                }
                try {
                    var ka = objectKeys(a),
                        kb = objectKeys(b),
                        key, i;
                } catch (e) {//happens when one is a string literal and the other isn't
                    return false;
                }
                // having the same number of owned properties (keys incorporates
                // hasOwnProperty)
                if (ka.length != kb.length)
                    return false;
                //the same set of keys (although not necessarily the same order),
                ka.sort();
                kb.sort();
                //~~~cheap key test
                for (i = ka.length - 1; i >= 0; i--) {
                    if (ka[i] != kb[i])
                        return false;
                }
                //equivalent values for every corresponding key, and
                //~~~possibly expensive deep test
                for (i = ka.length - 1; i >= 0; i--) {
                    key = ka[i];
                    if (!_deepEqual(a[key], b[key])) return false;
                }
                return true;
            }

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

            assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
                if (_deepEqual(actual, expected)) {
                    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
                }
            };

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

            assert.strictEqual = function strictEqual(actual, expected, message) {
                if (actual !== expected) {
                    fail(actual, expected, message, '===', assert.strictEqual);
                }
            };

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

            assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
                if (actual === expected) {
                    fail(actual, expected, message, '!==', assert.notStrictEqual);
                }
            };

            function expectedException(actual, expected) {
                if (!actual || !expected) {
                    return false;
                }

                if (expected instanceof RegExp) {
                    return expected.test(actual);
                } else if (actual instanceof expected) {
                    return true;
                } else if (expected.call({}, actual) === true) {
                    return true;
                }

                return false;
            }

            function _throws(shouldThrow, block, expected, message) {
                var actual;

                if (typeof expected === 'string') {
                    message = expected;
                    expected = null;
                }

                try {
                    block();
                } catch (e) {
                    actual = e;
                }

                message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
                    (message ? ' ' + message : '.');

                if (shouldThrow && !actual) {
                    fail('Missing expected exception' + message);
                }

                if (!shouldThrow && expectedException(actual, expected)) {
                    fail('Got unwanted exception' + message);
                }

                if ((shouldThrow && actual && expected &&
                    !expectedException(actual, expected)) || (!shouldThrow && actual)) {
                    throw actual;
                }
            }

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

            assert.throws = function(block, /*optional*/error, /*optional*/message) {
                _throws.apply(this, [true].concat(pSlice.call(arguments)));
            };

// EXTENSION! This is annoying to write outside this module.
            assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
                _throws.apply(this, [false].concat(pSlice.call(arguments)));
            };

            assert.ifError = function(err) { if (err) {throw err;}};

        })()
    },{"util":2,"buffer":4}],5:[function(require2,module,exports){
// Original code adapted from Robert Kieffer.
// details at https://github.com/broofa/node-uuid
        (function() {
            var _global = this;

            var mathRNG, whatwgRNG;

            // NOTE: Math.random() does not guarantee "cryptographic quality"
            mathRNG = function(size) {
                var bytes = new Array(size);
                var r;

                for (var i = 0, r; i < size; i++) {
                    if ((i & 0x03) == 0) r = Math.random() * 0x100000000;
                    bytes[i] = r >>> ((i & 0x03) << 3) & 0xff;
                }

                return bytes;
            }

            // currently only available in webkit-based browsers.
            if (_global.crypto && crypto.getRandomValues) {
                var _rnds = new Uint32Array(4);
                whatwgRNG = function(size) {
                    var bytes = new Array(size);
                    crypto.getRandomValues(_rnds);

                    for (var c = 0 ; c < size; c++) {
                        bytes[c] = _rnds[c >> 2] >>> ((c & 0x03) * 8) & 0xff;
                    }
                    return bytes;
                }
            }

            module.exports = whatwgRNG || mathRNG;

        }())
    },{}],6:[function(require2,module,exports){
        /*
         * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
         * Digest Algorithm, as defined in RFC 1321.
         * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
         * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
         * Distributed under the BSD License
         * See http://pajhome.org.uk/crypt/md5 for more info.
         */

        /*
         * Configurable variables. You may need to tweak these to be compatible with
         * the server-side, but the defaults work in most cases.
         */
        var hexcase = 0;   /* hex output format. 0 - lowercase; 1 - uppercase        */
        var b64pad  = "";  /* base-64 pad character. "=" for strict RFC compliance   */

        /*
         * These are the functions you'll usually want to call
         * They take string arguments and return either hex or base-64 encoded strings
         */
        function hex_md5(s)    { return rstr2hex(rstr_md5(str2rstr_utf8(s))); }
        function b64_md5(s)    { return rstr2b64(rstr_md5(str2rstr_utf8(s))); }
        function any_md5(s, e) { return rstr2any(rstr_md5(str2rstr_utf8(s)), e); }
        function hex_hmac_md5(k, d)
        { return rstr2hex(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
        function b64_hmac_md5(k, d)
        { return rstr2b64(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
        function any_hmac_md5(k, d, e)
        { return rstr2any(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)), e); }

        /*
         * Perform a simple self-test to see if the VM is working
         */
        function md5_vm_test()
        {
            return hex_md5("abc").toLowerCase() == "900150983cd24fb0d6963f7d28e17f72";
        }

        /*
         * Calculate the MD5 of a raw string
         */
        function rstr_md5(s)
        {
            return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
        }

        /*
         * Calculate the HMAC-MD5, of a key and some data (raw strings)
         */
        function rstr_hmac_md5(key, data)
        {
            var bkey = rstr2binl(key);
            if(bkey.length > 16) bkey = binl_md5(bkey, key.length * 8);

            var ipad = Array(16), opad = Array(16);
            for(var i = 0; i < 16; i++)
            {
                ipad[i] = bkey[i] ^ 0x36363636;
                opad[i] = bkey[i] ^ 0x5C5C5C5C;
            }

            var hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
            return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
        }

        /*
         * Convert a raw string to a hex string
         */
        function rstr2hex(input)
        {
            try { hexcase } catch(e) { hexcase=0; }
            var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
            var output = "";
            var x;
            for(var i = 0; i < input.length; i++)
            {
                x = input.charCodeAt(i);
                output += hex_tab.charAt((x >>> 4) & 0x0F)
                    +  hex_tab.charAt( x        & 0x0F);
            }
            return output;
        }

        /*
         * Convert a raw string to a base-64 string
         */
        function rstr2b64(input)
        {
            try { b64pad } catch(e) { b64pad=''; }
            var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            var output = "";
            var len = input.length;
            for(var i = 0; i < len; i += 3)
            {
                var triplet = (input.charCodeAt(i) << 16)
                    | (i + 1 < len ? input.charCodeAt(i+1) << 8 : 0)
                    | (i + 2 < len ? input.charCodeAt(i+2)      : 0);
                for(var j = 0; j < 4; j++)
                {
                    if(i * 8 + j * 6 > input.length * 8) output += b64pad;
                    else output += tab.charAt((triplet >>> 6*(3-j)) & 0x3F);
                }
            }
            return output;
        }

        /*
         * Convert a raw string to an arbitrary string encoding
         */
        function rstr2any(input, encoding)
        {
            var divisor = encoding.length;
            var i, j, q, x, quotient;

            /* Convert to an array of 16-bit big-endian values, forming the dividend */
            var dividend = Array(Math.ceil(input.length / 2));
            for(i = 0; i < dividend.length; i++)
            {
                dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
            }

            /*
             * Repeatedly perform a long division. The binary array forms the dividend,
             * the length of the encoding is the divisor. Once computed, the quotient
             * forms the dividend for the next step. All remainders are stored for later
             * use.
             */
            var full_length = Math.ceil(input.length * 8 /
                (Math.log(encoding.length) / Math.log(2)));
            var remainders = Array(full_length);
            for(j = 0; j < full_length; j++)
            {
                quotient = Array();
                x = 0;
                for(i = 0; i < dividend.length; i++)
                {
                    x = (x << 16) + dividend[i];
                    q = Math.floor(x / divisor);
                    x -= q * divisor;
                    if(quotient.length > 0 || q > 0)
                        quotient[quotient.length] = q;
                }
                remainders[j] = x;
                dividend = quotient;
            }

            /* Convert the remainders to the output string */
            var output = "";
            for(i = remainders.length - 1; i >= 0; i--)
                output += encoding.charAt(remainders[i]);

            return output;
        }

        /*
         * Encode a string as utf-8.
         * For efficiency, this assumes the input is valid utf-16.
         */
        function str2rstr_utf8(input)
        {
            var output = "";
            var i = -1;
            var x, y;

            while(++i < input.length)
            {
                /* Decode utf-16 surrogate pairs */
                x = input.charCodeAt(i);
                y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
                if(0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF)
                {
                    x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
                    i++;
                }

                /* Encode output as utf-8 */
                if(x <= 0x7F)
                    output += String.fromCharCode(x);
                else if(x <= 0x7FF)
                    output += String.fromCharCode(0xC0 | ((x >>> 6 ) & 0x1F),
                        0x80 | ( x         & 0x3F));
                else if(x <= 0xFFFF)
                    output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                        0x80 | ((x >>> 6 ) & 0x3F),
                        0x80 | ( x         & 0x3F));
                else if(x <= 0x1FFFFF)
                    output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                        0x80 | ((x >>> 12) & 0x3F),
                        0x80 | ((x >>> 6 ) & 0x3F),
                        0x80 | ( x         & 0x3F));
            }
            return output;
        }

        /*
         * Encode a string as utf-16
         */
        function str2rstr_utf16le(input)
        {
            var output = "";
            for(var i = 0; i < input.length; i++)
                output += String.fromCharCode( input.charCodeAt(i)        & 0xFF,
                    (input.charCodeAt(i) >>> 8) & 0xFF);
            return output;
        }

        function str2rstr_utf16be(input)
        {
            var output = "";
            for(var i = 0; i < input.length; i++)
                output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF,
                    input.charCodeAt(i)        & 0xFF);
            return output;
        }

        /*
         * Convert a raw string to an array of little-endian words
         * Characters >255 have their high-byte silently ignored.
         */
        function rstr2binl(input)
        {
            var output = Array(input.length >> 2);
            for(var i = 0; i < output.length; i++)
                output[i] = 0;
            for(var i = 0; i < input.length * 8; i += 8)
                output[i>>5] |= (input.charCodeAt(i / 8) & 0xFF) << (i%32);
            return output;
        }

        /*
         * Convert an array of little-endian words to a string
         */
        function binl2rstr(input)
        {
            var output = "";
            for(var i = 0; i < input.length * 32; i += 8)
                output += String.fromCharCode((input[i>>5] >>> (i % 32)) & 0xFF);
            return output;
        }

        /*
         * Calculate the MD5 of an array of little-endian words, and a bit length.
         */
        function binl_md5(x, len)
        {
            /* append padding */
            x[len >> 5] |= 0x80 << ((len) % 32);
            x[(((len + 64) >>> 9) << 4) + 14] = len;

            var a =  1732584193;
            var b = -271733879;
            var c = -1732584194;
            var d =  271733878;

            for(var i = 0; i < x.length; i += 16)
            {
                var olda = a;
                var oldb = b;
                var oldc = c;
                var oldd = d;

                a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
                d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
                c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
                b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
                a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
                d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
                c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
                b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
                a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
                d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
                c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
                b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
                a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
                d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
                c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
                b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

                a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
                d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
                c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
                b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
                a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
                d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
                c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
                b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
                a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
                d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
                c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
                b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
                a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
                d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
                c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
                b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

                a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
                d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
                c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
                b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
                a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
                d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
                c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
                b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
                a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
                d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
                c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
                b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
                a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
                d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
                c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
                b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

                a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
                d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
                c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
                b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
                a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
                d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
                c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
                b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
                a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
                d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
                c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
                b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
                a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
                d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
                c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
                b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

                a = safe_add(a, olda);
                b = safe_add(b, oldb);
                c = safe_add(c, oldc);
                d = safe_add(d, oldd);
            }
            return Array(a, b, c, d);
        }

        /*
         * These functions implement the four basic operations the algorithm uses.
         */
        function md5_cmn(q, a, b, x, s, t)
        {
            return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
        }
        function md5_ff(a, b, c, d, x, s, t)
        {
            return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
        }
        function md5_gg(a, b, c, d, x, s, t)
        {
            return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
        }
        function md5_hh(a, b, c, d, x, s, t)
        {
            return md5_cmn(b ^ c ^ d, a, b, x, s, t);
        }
        function md5_ii(a, b, c, d, x, s, t)
        {
            return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
        }

        /*
         * Add integers, wrapping at 2^32. This uses 16-bit operations internally
         * to work around bugs in some JS interpreters.
         */
        function safe_add(x, y)
        {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF);
            var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        }

        /*
         * Bitwise rotate a 32-bit number to the left.
         */
        function bit_rol(num, cnt)
        {
            return (num << cnt) | (num >>> (32 - cnt));
        }


        exports.hex_md5 = hex_md5;
        exports.b64_md5 = b64_md5;
        exports.any_md5 = any_md5;

    },{}],7:[function(require2,module,exports){
        /*
         * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
         * in FIPS PUB 180-1
         * Version 2.1a Copyright Paul Johnston 2000 - 2002.
         * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
         * Distributed under the BSD License
         * See http://pajhome.org.uk/crypt/md5 for details.
         */

        exports.hex_sha1 = hex_sha1;
        exports.b64_sha1 = b64_sha1;
        exports.str_sha1 = str_sha1;
        exports.hex_hmac_sha1 = hex_hmac_sha1;
        exports.b64_hmac_sha1 = b64_hmac_sha1;
        exports.str_hmac_sha1 = str_hmac_sha1;

        /*
         * Configurable variables. You may need to tweak these to be compatible with
         * the server-side, but the defaults work in most cases.
         */
        var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
        var b64pad  = ""; /* base-64 pad character. "=" for strict RFC compliance   */
        var chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */

        /*
         * These are the functions you'll usually want to call
         * They take string arguments and return either hex or base-64 encoded strings
         */
        function hex_sha1(s){return binb2hex(core_sha1(str2binb(s),s.length * chrsz));}
        function b64_sha1(s){return binb2b64(core_sha1(str2binb(s),s.length * chrsz));}
        function str_sha1(s){return binb2str(core_sha1(str2binb(s),s.length * chrsz));}
        function hex_hmac_sha1(key, data){ return binb2hex(core_hmac_sha1(key, data));}
        function b64_hmac_sha1(key, data){ return binb2b64(core_hmac_sha1(key, data));}
        function str_hmac_sha1(key, data){ return binb2str(core_hmac_sha1(key, data));}

        /*
         * Perform a simple self-test to see if the VM is working
         */
        function sha1_vm_test()
        {
            return hex_sha1("abc") == "a9993e364706816aba3e25717850c26c9cd0d89d";
        }

        /*
         * Calculate the SHA-1 of an array of big-endian words, and a bit length
         */
        function core_sha1(x, len)
        {
            /* append padding */
            x[len >> 5] |= 0x80 << (24 - len % 32);
            x[((len + 64 >> 9) << 4) + 15] = len;

            var w = Array(80);
            var a =  1732584193;
            var b = -271733879;
            var c = -1732584194;
            var d =  271733878;
            var e = -1009589776;

            for(var i = 0; i < x.length; i += 16)
            {
                var olda = a;
                var oldb = b;
                var oldc = c;
                var oldd = d;
                var olde = e;

                for(var j = 0; j < 80; j++)
                {
                    if(j < 16) w[j] = x[i + j];
                    else w[j] = rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
                    var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
                        safe_add(safe_add(e, w[j]), sha1_kt(j)));
                    e = d;
                    d = c;
                    c = rol(b, 30);
                    b = a;
                    a = t;
                }

                a = safe_add(a, olda);
                b = safe_add(b, oldb);
                c = safe_add(c, oldc);
                d = safe_add(d, oldd);
                e = safe_add(e, olde);
            }
            return Array(a, b, c, d, e);

        }

        /*
         * Perform the appropriate triplet combination function for the current
         * iteration
         */
        function sha1_ft(t, b, c, d)
        {
            if(t < 20) return (b & c) | ((~b) & d);
            if(t < 40) return b ^ c ^ d;
            if(t < 60) return (b & c) | (b & d) | (c & d);
            return b ^ c ^ d;
        }

        /*
         * Determine the appropriate additive constant for the current iteration
         */
        function sha1_kt(t)
        {
            return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
                (t < 60) ? -1894007588 : -899497514;
        }

        /*
         * Calculate the HMAC-SHA1 of a key and some data
         */
        function core_hmac_sha1(key, data)
        {
            var bkey = str2binb(key);
            if(bkey.length > 16) bkey = core_sha1(bkey, key.length * chrsz);

            var ipad = Array(16), opad = Array(16);
            for(var i = 0; i < 16; i++)
            {
                ipad[i] = bkey[i] ^ 0x36363636;
                opad[i] = bkey[i] ^ 0x5C5C5C5C;
            }

            var hash = core_sha1(ipad.concat(str2binb(data)), 512 + data.length * chrsz);
            return core_sha1(opad.concat(hash), 512 + 160);
        }

        /*
         * Add integers, wrapping at 2^32. This uses 16-bit operations internally
         * to work around bugs in some JS interpreters.
         */
        function safe_add(x, y)
        {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF);
            var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        }

        /*
         * Bitwise rotate a 32-bit number to the left.
         */
        function rol(num, cnt)
        {
            return (num << cnt) | (num >>> (32 - cnt));
        }

        /*
         * Convert an 8-bit or 16-bit string to an array of big-endian words
         * In 8-bit function, characters >255 have their hi-byte silently ignored.
         */
        function str2binb(str)
        {
            var bin = Array();
            var mask = (1 << chrsz) - 1;
            for(var i = 0; i < str.length * chrsz; i += chrsz)
                bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (32 - chrsz - i%32);
            return bin;
        }

        /*
         * Convert an array of big-endian words to a string
         */
        function binb2str(bin)
        {
            var str = "";
            var mask = (1 << chrsz) - 1;
            for(var i = 0; i < bin.length * 32; i += chrsz)
                str += String.fromCharCode((bin[i>>5] >>> (32 - chrsz - i%32)) & mask);
            return str;
        }

        /*
         * Convert an array of big-endian words to a hex string.
         */
        function binb2hex(binarray)
        {
            var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
            var str = "";
            for(var i = 0; i < binarray.length * 4; i++)
            {
                str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
                    hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
            }
            return str;
        }

        /*
         * Convert an array of big-endian words to a base-64 string
         */
        function binb2b64(binarray)
        {
            var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            var str = "";
            for(var i = 0; i < binarray.length * 4; i += 3)
            {
                var triplet = (((binarray[i   >> 2] >> 8 * (3 -  i   %4)) & 0xFF) << 16)
                    | (((binarray[i+1 >> 2] >> 8 * (3 - (i+1)%4)) & 0xFF) << 8 )
                    |  ((binarray[i+2 >> 2] >> 8 * (3 - (i+2)%4)) & 0xFF);
                for(var j = 0; j < 4; j++)
                {
                    if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
                    else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
                }
            }
            return str;
        }


    },{}],10:[function(require2,module,exports){
        exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes) {
            var e, m,
                eLen = nBytes * 8 - mLen - 1,
                eMax = (1 << eLen) - 1,
                eBias = eMax >> 1,
                nBits = -7,
                i = isBE ? 0 : (nBytes - 1),
                d = isBE ? 1 : -1,
                s = buffer[offset + i];

            i += d;

            e = s & ((1 << (-nBits)) - 1);
            s >>= (-nBits);
            nBits += eLen;
            for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

            m = e & ((1 << (-nBits)) - 1);
            e >>= (-nBits);
            nBits += mLen;
            for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

            if (e === 0) {
                e = 1 - eBias;
            } else if (e === eMax) {
                return m ? NaN : ((s ? -1 : 1) * Infinity);
            } else {
                m = m + Math.pow(2, mLen);
                e = e - eBias;
            }
            return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
        };

        exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes) {
            var e, m, c,
                eLen = nBytes * 8 - mLen - 1,
                eMax = (1 << eLen) - 1,
                eBias = eMax >> 1,
                rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
                i = isBE ? (nBytes - 1) : 0,
                d = isBE ? -1 : 1,
                s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

            value = Math.abs(value);

            if (isNaN(value) || value === Infinity) {
                m = isNaN(value) ? 1 : 0;
                e = eMax;
            } else {
                e = Math.floor(Math.log(value) / Math.LN2);
                if (value * (c = Math.pow(2, -e)) < 1) {
                    e--;
                    c *= 2;
                }
                if (e + eBias >= 1) {
                    value += rt / c;
                } else {
                    value += rt * Math.pow(2, 1 - eBias);
                }
                if (value * c >= 2) {
                    e++;
                    c /= 2;
                }

                if (e + eBias >= eMax) {
                    m = 0;
                    e = eMax;
                } else if (e + eBias >= 1) {
                    m = (value * c - 1) * Math.pow(2, mLen);
                    e = e + eBias;
                } else {
                    m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
                    e = 0;
                }
            }

            for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

            e = (e << mLen) | m;
            eLen += mLen;
            for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

            buffer[offset + i - d] |= s * 128;
        };

    },{}],4:[function(require2,module,exports){
        (function(){function SlowBuffer (size) {
            this.length = size;
        };

            var assert = require2('assert');

            exports.INSPECT_MAX_BYTES = 50;


            function toHex(n) {
                if (n < 16) return '0' + n.toString(16);
                return n.toString(16);
            }

            function utf8ToBytes(str) {
                var byteArray = [];
                for (var i = 0; i < str.length; i++)
                    if (str.charCodeAt(i) <= 0x7F)
                        byteArray.push(str.charCodeAt(i));
                    else {
                        var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
                        for (var j = 0; j < h.length; j++)
                            byteArray.push(parseInt(h[j], 16));
                    }

                return byteArray;
            }

            function asciiToBytes(str) {
                var byteArray = []
                for (var i = 0; i < str.length; i++ )
                    // Node's code seems to be doing this and not & 0x7F..
                    byteArray.push( str.charCodeAt(i) & 0xFF );

                return byteArray;
            }

            function base64ToBytes(str) {
                return require2("base64-js").toByteArray(str);
            }

            SlowBuffer.byteLength = function (str, encoding) {
                switch (encoding || "utf8") {
                    case 'hex':
                        return str.length / 2;

                    case 'utf8':
                    case 'utf-8':
                        return utf8ToBytes(str).length;

                    case 'ascii':
                    case 'binary':
                        return str.length;

                    case 'base64':
                        return base64ToBytes(str).length;

                    default:
                        throw new Error('Unknown encoding');
                }
            };

            function blitBuffer(src, dst, offset, length) {
                var pos, i = 0;
                while (i < length) {
                    if ((i+offset >= dst.length) || (i >= src.length))
                        break;

                    dst[i + offset] = src[i];
                    i++;
                }
                return i;
            }

            SlowBuffer.prototype.utf8Write = function (string, offset, length) {
                var bytes, pos;
                return SlowBuffer._charsWritten =  blitBuffer(utf8ToBytes(string), this, offset, length);
            };

            SlowBuffer.prototype.asciiWrite = function (string, offset, length) {
                var bytes, pos;
                return SlowBuffer._charsWritten =  blitBuffer(asciiToBytes(string), this, offset, length);
            };

            SlowBuffer.prototype.binaryWrite = SlowBuffer.prototype.asciiWrite;

            SlowBuffer.prototype.base64Write = function (string, offset, length) {
                var bytes, pos;
                return SlowBuffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);
            };

            SlowBuffer.prototype.base64Slice = function (start, end) {
                var bytes = Array.prototype.slice.apply(this, arguments)
                return require2("base64-js").fromByteArray(bytes);
            }

            function decodeUtf8Char(str) {
                try {
                    return decodeURIComponent(str);
                } catch (err) {
                    return String.fromCharCode(0xFFFD); // UTF 8 invalid char
                }
            }

            SlowBuffer.prototype.utf8Slice = function () {
                var bytes = Array.prototype.slice.apply(this, arguments);
                var res = "";
                var tmp = "";
                var i = 0;
                while (i < bytes.length) {
                    if (bytes[i] <= 0x7F) {
                        res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);
                        tmp = "";
                    } else
                        tmp += "%" + bytes[i].toString(16);

                    i++;
                }

                return res + decodeUtf8Char(tmp);
            }

            SlowBuffer.prototype.asciiSlice = function () {
                var bytes = Array.prototype.slice.apply(this, arguments);
                var ret = "";
                for (var i = 0; i < bytes.length; i++)
                    ret += String.fromCharCode(bytes[i]);
                return ret;
            }

            SlowBuffer.prototype.binarySlice = SlowBuffer.prototype.asciiSlice;

            SlowBuffer.prototype.inspect = function() {
                var out = [],
                    len = this.length;
                for (var i = 0; i < len; i++) {
                    out[i] = toHex(this[i]);
                    if (i == exports.INSPECT_MAX_BYTES) {
                        out[i + 1] = '...';
                        break;
                    }
                }
                return '<SlowBuffer ' + out.join(' ') + '>';
            };


            SlowBuffer.prototype.hexSlice = function(start, end) {
                var len = this.length;

                if (!start || start < 0) start = 0;
                if (!end || end < 0 || end > len) end = len;

                var out = '';
                for (var i = start; i < end; i++) {
                    out += toHex(this[i]);
                }
                return out;
            };


            SlowBuffer.prototype.toString = function(encoding, start, end) {
                encoding = String(encoding || 'utf8').toLowerCase();
                start = +start || 0;
                if (typeof end == 'undefined') end = this.length;

                // Fastpath empty strings
                if (+end == start) {
                    return '';
                }

                switch (encoding) {
                    case 'hex':
                        return this.hexSlice(start, end);

                    case 'utf8':
                    case 'utf-8':
                        return this.utf8Slice(start, end);

                    case 'ascii':
                        return this.asciiSlice(start, end);

                    case 'binary':
                        return this.binarySlice(start, end);

                    case 'base64':
                        return this.base64Slice(start, end);

                    case 'ucs2':
                    case 'ucs-2':
                        return this.ucs2Slice(start, end);

                    default:
                        throw new Error('Unknown encoding');
                }
            };


            SlowBuffer.prototype.hexWrite = function(string, offset, length) {
                offset = +offset || 0;
                var remaining = this.length - offset;
                if (!length) {
                    length = remaining;
                } else {
                    length = +length;
                    if (length > remaining) {
                        length = remaining;
                    }
                }

                // must be an even number of digits
                var strLen = string.length;
                if (strLen % 2) {
                    throw new Error('Invalid hex string');
                }
                if (length > strLen / 2) {
                    length = strLen / 2;
                }
                for (var i = 0; i < length; i++) {
                    var byte = parseInt(string.substr(i * 2, 2), 16);
                    if (isNaN(byte)) throw new Error('Invalid hex string');
                    this[offset + i] = byte;
                }
                SlowBuffer._charsWritten = i * 2;
                return i;
            };


            SlowBuffer.prototype.write = function(string, offset, length, encoding) {
                // Support both (string, offset, length, encoding)
                // and the legacy (string, encoding, offset, length)
                if (isFinite(offset)) {
                    if (!isFinite(length)) {
                        encoding = length;
                        length = undefined;
                    }
                } else {  // legacy
                    var swap = encoding;
                    encoding = offset;
                    offset = length;
                    length = swap;
                }

                offset = +offset || 0;
                var remaining = this.length - offset;
                if (!length) {
                    length = remaining;
                } else {
                    length = +length;
                    if (length > remaining) {
                        length = remaining;
                    }
                }
                encoding = String(encoding || 'utf8').toLowerCase();

                switch (encoding) {
                    case 'hex':
                        return this.hexWrite(string, offset, length);

                    case 'utf8':
                    case 'utf-8':
                        return this.utf8Write(string, offset, length);

                    case 'ascii':
                        return this.asciiWrite(string, offset, length);

                    case 'binary':
                        return this.binaryWrite(string, offset, length);

                    case 'base64':
                        return this.base64Write(string, offset, length);

                    case 'ucs2':
                    case 'ucs-2':
                        return this.ucs2Write(string, offset, length);

                    default:
                        throw new Error('Unknown encoding');
                }
            };


// slice(start, end)
            SlowBuffer.prototype.slice = function(start, end) {
                if (end === undefined) end = this.length;

                if (end > this.length) {
                    throw new Error('oob');
                }
                if (start > end) {
                    throw new Error('oob');
                }

                return new Buffer(this, end - start, +start);
            };

            SlowBuffer.prototype.copy = function(target, targetstart, sourcestart, sourceend) {
                var temp = [];
                for (var i=sourcestart; i<sourceend; i++) {
                    assert.ok(typeof this[i] !== 'undefined', "copying undefined buffer bytes!");
                    temp.push(this[i]);
                }

                for (var i=targetstart; i<targetstart+temp.length; i++) {
                    target[i] = temp[i-targetstart];
                }
            };

            SlowBuffer.prototype.fill = function(value, start, end) {
                if (end > this.length) {
                    throw new Error('oob');
                }
                if (start > end) {
                    throw new Error('oob');
                }

                for (var i = start; i < end; i++) {
                    this[i] = value;
                }
            }

            function coerce(length) {
                // Coerce length to a number (possibly NaN), round up
                // in case it's fractional (e.g. 123.456) then do a
                // double negate to coerce a NaN to 0. Easy, right?
                length = ~~Math.ceil(+length);
                return length < 0 ? 0 : length;
            }


// Buffer

            function Buffer(subject, encoding, offset) {
                if (!(this instanceof Buffer)) {
                    return new Buffer(subject, encoding, offset);
                }

                var type;

                // Are we slicing?
                if (typeof offset === 'number') {
                    this.length = coerce(encoding);
                    this.parent = subject;
                    this.offset = offset;
                } else {
                    // Find the length
                    switch (type = typeof subject) {
                        case 'number':
                            this.length = coerce(subject);
                            break;

                        case 'string':
                            this.length = Buffer.byteLength(subject, encoding);
                            break;

                        case 'object': // Assume object is an array
                            this.length = coerce(subject.length);
                            break;

                        default:
                            throw new Error('First argument needs to be a number, ' +
                                'array or string.');
                    }

                    if (this.length > Buffer.poolSize) {
                        // Big buffer, just alloc one.
                        this.parent = new SlowBuffer(this.length);
                        this.offset = 0;

                    } else {
                        // Small buffer.
                        if (!pool || pool.length - pool.used < this.length) allocPool();
                        this.parent = pool;
                        this.offset = pool.used;
                        pool.used += this.length;
                    }

                    // Treat array-ish objects as a byte array.
                    if (isArrayIsh(subject)) {
                        for (var i = 0; i < this.length; i++) {
                            if (subject instanceof Buffer) {
                                this.parent[i + this.offset] = subject.readUInt8(i);
                            }
                            else {
                                this.parent[i + this.offset] = subject[i];
                            }
                        }
                    } else if (type == 'string') {
                        // We are a string
                        this.length = this.write(subject, 0, encoding);
                    }
                }

            }

            function isArrayIsh(subject) {
                return Array.isArray(subject) || Buffer.isBuffer(subject) ||
                    subject && typeof subject === 'object' &&
                        typeof subject.length === 'number';
            }

            exports.SlowBuffer = SlowBuffer;
            exports.Buffer = Buffer;

            Buffer.poolSize = 8 * 1024;
            var pool;

            function allocPool() {
                pool = new SlowBuffer(Buffer.poolSize);
                pool.used = 0;
            }


// Static methods
            Buffer.isBuffer = function isBuffer(b) {
                return b instanceof Buffer || b instanceof SlowBuffer;
            };

            Buffer.concat = function (list, totalLength) {
                if (!Array.isArray(list)) {
                    throw new Error("Usage: Buffer.concat(list, [totalLength])\n \
      list should be an Array.");
                }

                if (list.length === 0) {
                    return new Buffer(0);
                } else if (list.length === 1) {
                    return list[0];
                }

                if (typeof totalLength !== 'number') {
                    totalLength = 0;
                    for (var i = 0; i < list.length; i++) {
                        var buf = list[i];
                        totalLength += buf.length;
                    }
                }

                var buffer = new Buffer(totalLength);
                var pos = 0;
                for (var i = 0; i < list.length; i++) {
                    var buf = list[i];
                    buf.copy(buffer, pos);
                    pos += buf.length;
                }
                return buffer;
            };

// Inspect
            Buffer.prototype.inspect = function inspect() {
                var out = [],
                    len = this.length;

                for (var i = 0; i < len; i++) {
                    out[i] = toHex(this.parent[i + this.offset]);
                    if (i == exports.INSPECT_MAX_BYTES) {
                        out[i + 1] = '...';
                        break;
                    }
                }

                return '<Buffer ' + out.join(' ') + '>';
            };


            Buffer.prototype.get = function get(i) {
                if (i < 0 || i >= this.length) throw new Error('oob');
                return this.parent[this.offset + i];
            };


            Buffer.prototype.set = function set(i, v) {
                if (i < 0 || i >= this.length) throw new Error('oob');
                return this.parent[this.offset + i] = v;
            };


// write(string, offset = 0, length = buffer.length-offset, encoding = 'utf8')
            Buffer.prototype.write = function(string, offset, length, encoding) {
                // Support both (string, offset, length, encoding)
                // and the legacy (string, encoding, offset, length)
                if (isFinite(offset)) {
                    if (!isFinite(length)) {
                        encoding = length;
                        length = undefined;
                    }
                } else {  // legacy
                    var swap = encoding;
                    encoding = offset;
                    offset = length;
                    length = swap;
                }

                offset = +offset || 0;
                var remaining = this.length - offset;
                if (!length) {
                    length = remaining;
                } else {
                    length = +length;
                    if (length > remaining) {
                        length = remaining;
                    }
                }
                encoding = String(encoding || 'utf8').toLowerCase();

                var ret;
                switch (encoding) {
                    case 'hex':
                        ret = this.parent.hexWrite(string, this.offset + offset, length);
                        break;

                    case 'utf8':
                    case 'utf-8':
                        ret = this.parent.utf8Write(string, this.offset + offset, length);
                        break;

                    case 'ascii':
                        ret = this.parent.asciiWrite(string, this.offset + offset, length);
                        break;

                    case 'binary':
                        ret = this.parent.binaryWrite(string, this.offset + offset, length);
                        break;

                    case 'base64':
                        // Warning: maxLength not taken into account in base64Write
                        ret = this.parent.base64Write(string, this.offset + offset, length);
                        break;

                    case 'ucs2':
                    case 'ucs-2':
                        ret = this.parent.ucs2Write(string, this.offset + offset, length);
                        break;

                    default:
                        throw new Error('Unknown encoding');
                }

                Buffer._charsWritten = SlowBuffer._charsWritten;

                return ret;
            };


// toString(encoding, start=0, end=buffer.length)
            Buffer.prototype.toString = function(encoding, start, end) {
                encoding = String(encoding || 'utf8').toLowerCase();

                if (typeof start == 'undefined' || start < 0) {
                    start = 0;
                } else if (start > this.length) {
                    start = this.length;
                }

                if (typeof end == 'undefined' || end > this.length) {
                    end = this.length;
                } else if (end < 0) {
                    end = 0;
                }

                start = start + this.offset;
                end = end + this.offset;

                switch (encoding) {
                    case 'hex':
                        return this.parent.hexSlice(start, end);

                    case 'utf8':
                    case 'utf-8':
                        return this.parent.utf8Slice(start, end);

                    case 'ascii':
                        return this.parent.asciiSlice(start, end);

                    case 'binary':
                        return this.parent.binarySlice(start, end);

                    case 'base64':
                        return this.parent.base64Slice(start, end);

                    case 'ucs2':
                    case 'ucs-2':
                        return this.parent.ucs2Slice(start, end);

                    default:
                        throw new Error('Unknown encoding');
                }
            };


// byteLength
            Buffer.byteLength = SlowBuffer.byteLength;


// fill(value, start=0, end=buffer.length)
            Buffer.prototype.fill = function fill(value, start, end) {
                value || (value = 0);
                start || (start = 0);
                end || (end = this.length);

                if (typeof value === 'string') {
                    value = value.charCodeAt(0);
                }
                if (!(typeof value === 'number') || isNaN(value)) {
                    throw new Error('value is not a number');
                }

                if (end < start) throw new Error('end < start');

                // Fill 0 bytes; we're done
                if (end === start) return 0;
                if (this.length == 0) return 0;

                if (start < 0 || start >= this.length) {
                    throw new Error('start out of bounds');
                }

                if (end < 0 || end > this.length) {
                    throw new Error('end out of bounds');
                }

                return this.parent.fill(value,
                    start + this.offset,
                    end + this.offset);
            };


// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
            Buffer.prototype.copy = function(target, target_start, start, end) {
                var source = this;
                start || (start = 0);
                end || (end = this.length);
                target_start || (target_start = 0);

                if (end < start) throw new Error('sourceEnd < sourceStart');

                // Copy 0 bytes; we're done
                if (end === start) return 0;
                if (target.length == 0 || source.length == 0) return 0;

                if (target_start < 0 || target_start >= target.length) {
                    throw new Error('targetStart out of bounds');
                }

                if (start < 0 || start >= source.length) {
                    throw new Error('sourceStart out of bounds');
                }

                if (end < 0 || end > source.length) {
                    throw new Error('sourceEnd out of bounds');
                }

                // Are we oob?
                if (end > this.length) {
                    end = this.length;
                }

                if (target.length - target_start < end - start) {
                    end = target.length - target_start + start;
                }

                return this.parent.copy(target.parent,
                    target_start + target.offset,
                    start + this.offset,
                    end + this.offset);
            };


// slice(start, end)
            Buffer.prototype.slice = function(start, end) {
                if (end === undefined) end = this.length;
                if (end > this.length) throw new Error('oob');
                if (start > end) throw new Error('oob');

                return new Buffer(this.parent, end - start, +start + this.offset);
            };


// Legacy methods for backwards compatibility.

            Buffer.prototype.utf8Slice = function(start, end) {
                return this.toString('utf8', start, end);
            };

            Buffer.prototype.binarySlice = function(start, end) {
                return this.toString('binary', start, end);
            };

            Buffer.prototype.asciiSlice = function(start, end) {
                return this.toString('ascii', start, end);
            };

            Buffer.prototype.utf8Write = function(string, offset) {
                return this.write(string, offset, 'utf8');
            };

            Buffer.prototype.binaryWrite = function(string, offset) {
                return this.write(string, offset, 'binary');
            };

            Buffer.prototype.asciiWrite = function(string, offset) {
                return this.write(string, offset, 'ascii');
            };

            Buffer.prototype.readUInt8 = function(offset, noAssert) {
                var buffer = this;

                if (!noAssert) {
                    assert.ok(offset !== undefined && offset !== null,
                        'missing offset');

                    assert.ok(offset < buffer.length,
                        'Trying to read beyond buffer length');
                }

                if (offset >= buffer.length) return;

                return buffer.parent[buffer.offset + offset];
            };

            function readUInt16(buffer, offset, isBigEndian, noAssert) {
                var val = 0;


                if (!noAssert) {
                    assert.ok(typeof (isBigEndian) === 'boolean',
                        'missing or invalid endian');

                    assert.ok(offset !== undefined && offset !== null,
                        'missing offset');

                    assert.ok(offset + 1 < buffer.length,
                        'Trying to read beyond buffer length');
                }

                if (offset >= buffer.length) return 0;

                if (isBigEndian) {
                    val = buffer.parent[buffer.offset + offset] << 8;
                    if (offset + 1 < buffer.length) {
                        val |= buffer.parent[buffer.offset + offset + 1];
                    }
                } else {
                    val = buffer.parent[buffer.offset + offset];
                    if (offset + 1 < buffer.length) {
                        val |= buffer.parent[buffer.offset + offset + 1] << 8;
                    }
                }

                return val;
            }

            Buffer.prototype.readUInt16LE = function(offset, noAssert) {
                return readUInt16(this, offset, false, noAssert);
            };

            Buffer.prototype.readUInt16BE = function(offset, noAssert) {
                return readUInt16(this, offset, true, noAssert);
            };

            function readUInt32(buffer, offset, isBigEndian, noAssert) {
                var val = 0;

                if (!noAssert) {
                    assert.ok(typeof (isBigEndian) === 'boolean',
                        'missing or invalid endian');

                    assert.ok(offset !== undefined && offset !== null,
                        'missing offset');

                    assert.ok(offset + 3 < buffer.length,
                        'Trying to read beyond buffer length');
                }

                if (offset >= buffer.length) return 0;

                if (isBigEndian) {
                    if (offset + 1 < buffer.length)
                        val = buffer.parent[buffer.offset + offset + 1] << 16;
                    if (offset + 2 < buffer.length)
                        val |= buffer.parent[buffer.offset + offset + 2] << 8;
                    if (offset + 3 < buffer.length)
                        val |= buffer.parent[buffer.offset + offset + 3];
                    val = val + (buffer.parent[buffer.offset + offset] << 24 >>> 0);
                } else {
                    if (offset + 2 < buffer.length)
                        val = buffer.parent[buffer.offset + offset + 2] << 16;
                    if (offset + 1 < buffer.length)
                        val |= buffer.parent[buffer.offset + offset + 1] << 8;
                    val |= buffer.parent[buffer.offset + offset];
                    if (offset + 3 < buffer.length)
                        val = val + (buffer.parent[buffer.offset + offset + 3] << 24 >>> 0);
                }

                return val;
            }

            Buffer.prototype.readUInt32LE = function(offset, noAssert) {
                return readUInt32(this, offset, false, noAssert);
            };

            Buffer.prototype.readUInt32BE = function(offset, noAssert) {
                return readUInt32(this, offset, true, noAssert);
            };


            /*
             * Signed integer types, yay team! A reminder on how two's complement actually
             * works. The first bit is the signed bit, i.e. tells us whether or not the
             * number should be positive or negative. If the two's complement value is
             * positive, then we're done, as it's equivalent to the unsigned representation.
             *
             * Now if the number is positive, you're pretty much done, you can just leverage
             * the unsigned translations and return those. Unfortunately, negative numbers
             * aren't quite that straightforward.
             *
             * At first glance, one might be inclined to use the traditional formula to
             * translate binary numbers between the positive and negative values in two's
             * complement. (Though it doesn't quite work for the most negative value)
             * Mainly:
             *  - invert all the bits
             *  - add one to the result
             *
             * Of course, this doesn't quite work in Javascript. Take for example the value
             * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of
             * course, Javascript will do the following:
             *
             * > ~0xff80
             * -65409
             *
             * Whoh there, Javascript, that's not quite right. But wait, according to
             * Javascript that's perfectly correct. When Javascript ends up seeing the
             * constant 0xff80, it has no notion that it is actually a signed number. It
             * assumes that we've input the unsigned value 0xff80. Thus, when it does the
             * binary negation, it casts it into a signed value, (positive 0xff80). Then
             * when you perform binary negation on that, it turns it into a negative number.
             *
             * Instead, we're going to have to use the following general formula, that works
             * in a rather Javascript friendly way. I'm glad we don't support this kind of
             * weird numbering scheme in the kernel.
             *
             * (BIT-MAX - (unsigned)val + 1) * -1
             *
             * The astute observer, may think that this doesn't make sense for 8-bit numbers
             * (really it isn't necessary for them). However, when you get 16-bit numbers,
             * you do. Let's go back to our prior example and see how this will look:
             *
             * (0xffff - 0xff80 + 1) * -1
             * (0x007f + 1) * -1
             * (0x0080) * -1
             */
            Buffer.prototype.readInt8 = function(offset, noAssert) {
                var buffer = this;
                var neg;

                if (!noAssert) {
                    assert.ok(offset !== undefined && offset !== null,
                        'missing offset');

                    assert.ok(offset < buffer.length,
                        'Trying to read beyond buffer length');
                }

                if (offset >= buffer.length) return;

                neg = buffer.parent[buffer.offset + offset] & 0x80;
                if (!neg) {
                    return (buffer.parent[buffer.offset + offset]);
                }

                return ((0xff - buffer.parent[buffer.offset + offset] + 1) * -1);
            };

            function readInt16(buffer, offset, isBigEndian, noAssert) {
                var neg, val;

                if (!noAssert) {
                    assert.ok(typeof (isBigEndian) === 'boolean',
                        'missing or invalid endian');

                    assert.ok(offset !== undefined && offset !== null,
                        'missing offset');

                    assert.ok(offset + 1 < buffer.length,
                        'Trying to read beyond buffer length');
                }

                val = readUInt16(buffer, offset, isBigEndian, noAssert);
                neg = val & 0x8000;
                if (!neg) {
                    return val;
                }

                return (0xffff - val + 1) * -1;
            }

            Buffer.prototype.readInt16LE = function(offset, noAssert) {
                return readInt16(this, offset, false, noAssert);
            };

            Buffer.prototype.readInt16BE = function(offset, noAssert) {
                return readInt16(this, offset, true, noAssert);
            };

            function readInt32(buffer, offset, isBigEndian, noAssert) {
                var neg, val;

                if (!noAssert) {
                    assert.ok(typeof (isBigEndian) === 'boolean',
                        'missing or invalid endian');

                    assert.ok(offset !== undefined && offset !== null,
                        'missing offset');

                    assert.ok(offset + 3 < buffer.length,
                        'Trying to read beyond buffer length');
                }

                val = readUInt32(buffer, offset, isBigEndian, noAssert);
                neg = val & 0x80000000;
                if (!neg) {
                    return (val);
                }

                return (0xffffffff - val + 1) * -1;
            }

            Buffer.prototype.readInt32LE = function(offset, noAssert) {
                return readInt32(this, offset, false, noAssert);
            };

            Buffer.prototype.readInt32BE = function(offset, noAssert) {
                return readInt32(this, offset, true, noAssert);
            };

            function readFloat(buffer, offset, isBigEndian, noAssert) {
                if (!noAssert) {
                    assert.ok(typeof (isBigEndian) === 'boolean',
                        'missing or invalid endian');

                    assert.ok(offset + 3 < buffer.length,
                        'Trying to read beyond buffer length');
                }

                return require2('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
                    23, 4);
            }

            Buffer.prototype.readFloatLE = function(offset, noAssert) {
                return readFloat(this, offset, false, noAssert);
            };

            Buffer.prototype.readFloatBE = function(offset, noAssert) {
                return readFloat(this, offset, true, noAssert);
            };

            function readDouble(buffer, offset, isBigEndian, noAssert) {
                if (!noAssert) {
                    assert.ok(typeof (isBigEndian) === 'boolean',
                        'missing or invalid endian');

                    assert.ok(offset + 7 < buffer.length,
                        'Trying to read beyond buffer length');
                }

                return require2('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
                    52, 8);
            }

            Buffer.prototype.readDoubleLE = function(offset, noAssert) {
                return readDouble(this, offset, false, noAssert);
            };

            Buffer.prototype.readDoubleBE = function(offset, noAssert) {
                return readDouble(this, offset, true, noAssert);
            };


            /*
             * We have to make sure that the value is a valid integer. This means that it is
             * non-negative. It has no fractional component and that it does not exceed the
             * maximum allowed value.
             *
             *      value           The number to check for validity
             *
             *      max             The maximum value
             */
            function verifuint(value, max) {
                assert.ok(typeof (value) == 'number',
                    'cannot write a non-number as a number');

                assert.ok(value >= 0,
                    'specified a negative value for writing an unsigned value');

                assert.ok(value <= max, 'value is larger than maximum value for type');

                assert.ok(Math.floor(value) === value, 'value has a fractional component');
            }

            Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
                var buffer = this;

                if (!noAssert) {
                    assert.ok(value !== undefined && value !== null,
                        'missing value');

                    assert.ok(offset !== undefined && offset !== null,
                        'missing offset');

                    assert.ok(offset < buffer.length,
                        'trying to write beyond buffer length');

                    verifuint(value, 0xff);
                }

                if (offset < buffer.length) {
                    buffer.parent[buffer.offset + offset] = value;
                }
            };

            function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {
                if (!noAssert) {
                    assert.ok(value !== undefined && value !== null,
                        'missing value');

                    assert.ok(typeof (isBigEndian) === 'boolean',
                        'missing or invalid endian');

                    assert.ok(offset !== undefined && offset !== null,
                        'missing offset');

                    assert.ok(offset + 1 < buffer.length,
                        'trying to write beyond buffer length');

                    verifuint(value, 0xffff);
                }

                for (var i = 0; i < Math.min(buffer.length - offset, 2); i++) {
                    buffer.parent[buffer.offset + offset + i] =
                        (value & (0xff << (8 * (isBigEndian ? 1 - i : i)))) >>>
                            (isBigEndian ? 1 - i : i) * 8;
                }

            }

            Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
                writeUInt16(this, value, offset, false, noAssert);
            };

            Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
                writeUInt16(this, value, offset, true, noAssert);
            };

            function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {
                if (!noAssert) {
                    assert.ok(value !== undefined && value !== null,
                        'missing value');

                    assert.ok(typeof (isBigEndian) === 'boolean',
                        'missing or invalid endian');

                    assert.ok(offset !== undefined && offset !== null,
                        'missing offset');

                    assert.ok(offset + 3 < buffer.length,
                        'trying to write beyond buffer length');

                    verifuint(value, 0xffffffff);
                }

                for (var i = 0; i < Math.min(buffer.length - offset, 4); i++) {
                    buffer.parent[buffer.offset + offset + i] =
                        (value >>> (isBigEndian ? 3 - i : i) * 8) & 0xff;
                }
            }

            Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
                writeUInt32(this, value, offset, false, noAssert);
            };

            Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
                writeUInt32(this, value, offset, true, noAssert);
            };


            /*
             * We now move onto our friends in the signed number category. Unlike unsigned
             * numbers, we're going to have to worry a bit more about how we put values into
             * arrays. Since we are only worrying about signed 32-bit values, we're in
             * slightly better shape. Unfortunately, we really can't do our favorite binary
             * & in this system. It really seems to do the wrong thing. For example:
             *
             * > -32 & 0xff
             * 224
             *
             * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of
             * this aren't treated as a signed number. Ultimately a bad thing.
             *
             * What we're going to want to do is basically create the unsigned equivalent of
             * our representation and pass that off to the wuint* functions. To do that
             * we're going to do the following:
             *
             *  - if the value is positive
             *      we can pass it directly off to the equivalent wuint
             *  - if the value is negative
             *      we do the following computation:
             *         mb + val + 1, where
             *         mb   is the maximum unsigned value in that byte size
             *         val  is the Javascript negative integer
             *
             *
             * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If
             * you do out the computations:
             *
             * 0xffff - 128 + 1
             * 0xffff - 127
             * 0xff80
             *
             * You can then encode this value as the signed version. This is really rather
             * hacky, but it should work and get the job done which is our goal here.
             */

            /*
             * A series of checks to make sure we actually have a signed 32-bit number
             */
            function verifsint(value, max, min) {
                assert.ok(typeof (value) == 'number',
                    'cannot write a non-number as a number');

                assert.ok(value <= max, 'value larger than maximum allowed value');

                assert.ok(value >= min, 'value smaller than minimum allowed value');

                assert.ok(Math.floor(value) === value, 'value has a fractional component');
            }

            function verifIEEE754(value, max, min) {
                assert.ok(typeof (value) == 'number',
                    'cannot write a non-number as a number');

                assert.ok(value <= max, 'value larger than maximum allowed value');

                assert.ok(value >= min, 'value smaller than minimum allowed value');
            }

            Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
                var buffer = this;

                if (!noAssert) {
                    assert.ok(value !== undefined && value !== null,
                        'missing value');

                    assert.ok(offset !== undefined && offset !== null,
                        'missing offset');

                    assert.ok(offset < buffer.length,
                        'Trying to write beyond buffer length');

                    verifsint(value, 0x7f, -0x80);
                }

                if (value >= 0) {
                    buffer.writeUInt8(value, offset, noAssert);
                } else {
                    buffer.writeUInt8(0xff + value + 1, offset, noAssert);
                }
            };

            function writeInt16(buffer, value, offset, isBigEndian, noAssert) {
                if (!noAssert) {
                    assert.ok(value !== undefined && value !== null,
                        'missing value');

                    assert.ok(typeof (isBigEndian) === 'boolean',
                        'missing or invalid endian');

                    assert.ok(offset !== undefined && offset !== null,
                        'missing offset');

                    assert.ok(offset + 1 < buffer.length,
                        'Trying to write beyond buffer length');

                    verifsint(value, 0x7fff, -0x8000);
                }

                if (value >= 0) {
                    writeUInt16(buffer, value, offset, isBigEndian, noAssert);
                } else {
                    writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);
                }
            }

            Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
                writeInt16(this, value, offset, false, noAssert);
            };

            Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
                writeInt16(this, value, offset, true, noAssert);
            };

            function writeInt32(buffer, value, offset, isBigEndian, noAssert) {
                if (!noAssert) {
                    assert.ok(value !== undefined && value !== null,
                        'missing value');

                    assert.ok(typeof (isBigEndian) === 'boolean',
                        'missing or invalid endian');

                    assert.ok(offset !== undefined && offset !== null,
                        'missing offset');

                    assert.ok(offset + 3 < buffer.length,
                        'Trying to write beyond buffer length');

                    verifsint(value, 0x7fffffff, -0x80000000);
                }

                if (value >= 0) {
                    writeUInt32(buffer, value, offset, isBigEndian, noAssert);
                } else {
                    writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);
                }
            }

            Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
                writeInt32(this, value, offset, false, noAssert);
            };

            Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
                writeInt32(this, value, offset, true, noAssert);
            };

            function writeFloat(buffer, value, offset, isBigEndian, noAssert) {
                if (!noAssert) {
                    assert.ok(value !== undefined && value !== null,
                        'missing value');

                    assert.ok(typeof (isBigEndian) === 'boolean',
                        'missing or invalid endian');

                    assert.ok(offset !== undefined && offset !== null,
                        'missing offset');

                    assert.ok(offset + 3 < buffer.length,
                        'Trying to write beyond buffer length');

                    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);
                }

                require2('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
                    23, 4);
            }

            Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
                writeFloat(this, value, offset, false, noAssert);
            };

            Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
                writeFloat(this, value, offset, true, noAssert);
            };

            function writeDouble(buffer, value, offset, isBigEndian, noAssert) {
                if (!noAssert) {
                    assert.ok(value !== undefined && value !== null,
                        'missing value');

                    assert.ok(typeof (isBigEndian) === 'boolean',
                        'missing or invalid endian');

                    assert.ok(offset !== undefined && offset !== null,
                        'missing offset');

                    assert.ok(offset + 7 < buffer.length,
                        'Trying to write beyond buffer length');

                    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);
                }

                require2('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
                    52, 8);
            }

            Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
                writeDouble(this, value, offset, false, noAssert);
            };

            Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
                writeDouble(this, value, offset, true, noAssert);
            };

            SlowBuffer.prototype.readUInt8 = Buffer.prototype.readUInt8;
            SlowBuffer.prototype.readUInt16LE = Buffer.prototype.readUInt16LE;
            SlowBuffer.prototype.readUInt16BE = Buffer.prototype.readUInt16BE;
            SlowBuffer.prototype.readUInt32LE = Buffer.prototype.readUInt32LE;
            SlowBuffer.prototype.readUInt32BE = Buffer.prototype.readUInt32BE;
            SlowBuffer.prototype.readInt8 = Buffer.prototype.readInt8;
            SlowBuffer.prototype.readInt16LE = Buffer.prototype.readInt16LE;
            SlowBuffer.prototype.readInt16BE = Buffer.prototype.readInt16BE;
            SlowBuffer.prototype.readInt32LE = Buffer.prototype.readInt32LE;
            SlowBuffer.prototype.readInt32BE = Buffer.prototype.readInt32BE;
            SlowBuffer.prototype.readFloatLE = Buffer.prototype.readFloatLE;
            SlowBuffer.prototype.readFloatBE = Buffer.prototype.readFloatBE;
            SlowBuffer.prototype.readDoubleLE = Buffer.prototype.readDoubleLE;
            SlowBuffer.prototype.readDoubleBE = Buffer.prototype.readDoubleBE;
            SlowBuffer.prototype.writeUInt8 = Buffer.prototype.writeUInt8;
            SlowBuffer.prototype.writeUInt16LE = Buffer.prototype.writeUInt16LE;
            SlowBuffer.prototype.writeUInt16BE = Buffer.prototype.writeUInt16BE;
            SlowBuffer.prototype.writeUInt32LE = Buffer.prototype.writeUInt32LE;
            SlowBuffer.prototype.writeUInt32BE = Buffer.prototype.writeUInt32BE;
            SlowBuffer.prototype.writeInt8 = Buffer.prototype.writeInt8;
            SlowBuffer.prototype.writeInt16LE = Buffer.prototype.writeInt16LE;
            SlowBuffer.prototype.writeInt16BE = Buffer.prototype.writeInt16BE;
            SlowBuffer.prototype.writeInt32LE = Buffer.prototype.writeInt32LE;
            SlowBuffer.prototype.writeInt32BE = Buffer.prototype.writeInt32BE;
            SlowBuffer.prototype.writeFloatLE = Buffer.prototype.writeFloatLE;
            SlowBuffer.prototype.writeFloatBE = Buffer.prototype.writeFloatBE;
            SlowBuffer.prototype.writeDoubleLE = Buffer.prototype.writeDoubleLE;
            SlowBuffer.prototype.writeDoubleBE = Buffer.prototype.writeDoubleBE;

        })()
    },{"assert":9,"./buffer_ieee754":10,"base64-js":11}],11:[function(require2,module,exports){
        (function (exports) {
            'use strict';

            var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

            function b64ToByteArray(b64) {
                var i, j, l, tmp, placeHolders, arr;

                if (b64.length % 4 > 0) {
                    throw 'Invalid string. Length must be a multiple of 4';
                }

                // the number of equal signs (place holders)
                // if there are two placeholders, than the two characters before it
                // represent one byte
                // if there is only one, then the three characters before it represent 2 bytes
                // this is just a cheap hack to not do indexOf twice
                placeHolders = b64.indexOf('=');
                placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

                // base64 is 4/3 + up to two characters of the original data
                arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

                // if there are placeholders, only get up to the last complete 4 chars
                l = placeHolders > 0 ? b64.length - 4 : b64.length;

                for (i = 0, j = 0; i < l; i += 4, j += 3) {
                    tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
                    arr.push((tmp & 0xFF0000) >> 16);
                    arr.push((tmp & 0xFF00) >> 8);
                    arr.push(tmp & 0xFF);
                }

                if (placeHolders === 2) {
                    tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
                    arr.push(tmp & 0xFF);
                } else if (placeHolders === 1) {
                    tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
                    arr.push((tmp >> 8) & 0xFF);
                    arr.push(tmp & 0xFF);
                }

                return arr;
            }

            function uint8ToBase64(uint8) {
                var i,
                    extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
                    output = "",
                    temp, length;

                function tripletToBase64 (num) {
                    return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
                };

                // go through the array every three bytes, we'll deal with trailing stuff later
                for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
                    temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
                    output += tripletToBase64(temp);
                }

                // pad the end with zeros, but make sure to not forget the extra bytes
                switch (extraBytes) {
                    case 1:
                        temp = uint8[uint8.length - 1];
                        output += lookup[temp >> 2];
                        output += lookup[(temp << 4) & 0x3F];
                        output += '==';
                        break;
                    case 2:
                        temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
                        output += lookup[temp >> 10];
                        output += lookup[(temp >> 4) & 0x3F];
                        output += lookup[(temp << 2) & 0x3F];
                        output += '=';
                        break;
                }

                return output;
            }

            module.exports.toByteArray = b64ToByteArray;
            module.exports.fromByteArray = uint8ToBase64;
        }());

    },{}]},{},[])
    ;
    /*
     * node-ws - pure Javascript WebSockets server
     * Copyright Bradley Wright <brad@intranation.com>
     */

// Use strict compilation rules - we're not animals
    'use strict';

    var net = require2('net'),
        crypto2 = require2('crypto');

    function HandshakeHYBI00(request) {
        // split up lines and parse
        var lines = request.split('\r\n'),
            headers = parseHeaders(lines);


        var protocol = headers['sec-websocket-protocol'];

        // calc key
        var key = headers['sec-websocket-key'];
        //var key = "x3JJHMbDL1EzLkh9GBhXDw=="; //test key
        var shasum = crypto2.createHash('sha1');
        shasum.update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11");
        key = btoa(shasum.digest('ascii'));

        var headers = [
            'HTTP/1.1 101 Switching Protocols'
            , 'Upgrade: websocket'
            , 'Connection: Upgrade'
            , 'Sec-WebSocket-Accept: ' + key
            , 'Access-Control-Allow-Origin: *'
            , ''
        ];


        if (typeof protocol != 'undefined') {
            headers.push('Sec-WebSocket-Protocol: ' + protocol);
        }

        return headers;

    }

    function parseHeaders(headers) {
        // splits a list of headers into key/value pairs
        var parsedHeaders = {};

        headers.forEach(function(header) {
            // might contain a colon, so limit split
            var toParse = header.split(':');
            if (toParse.length >= 2) {
                // it has to be Key: Value
                var key = toParse[0].toLowerCase(),
                // might be more than 1 colon
                    value = toParse.slice(1).join(':')
                        .replace(/^\s\s*/, '')
                        .replace(/\s\s*$/, '');
                parsedHeaders[key] = value;
            }
            else {
                // it might be a method request,
                // which we want to store and check
                if (header.indexOf('GET') === 0) {
                    parsedHeaders['X-Request-Method'] = 'GET';
                }
            }
        });

        return parsedHeaders;
    }

    function WebSocketServer(port, bindAddress) {
        this.port = port;
        this.bindAddress = bindAddress;
        var self = this;
        net.createServer(function (socket) {

            var wsConnected = false;
            self.socket = socket;

            socket.addListener('data', function (data) {

                if (wsConnected) {
                    if(data.length) {
                        var raw = decodeWebSocket(data);
                        var decoded = String.fromCharCode.apply(null, raw);
                        console.log(decoded);
                        if(self.callback)
                            self.callback(decoded);
                    }

                } else {

                    var response = HandshakeHYBI00(data.toString('binary'));
                    if (response) {
                        // handshake succeeded, open connection
                        var handshakeString = response.join('\r\n') + "\r\n";
                        socket.write(handshakeString, 'ascii', function(){
                            console.log('Completing handshake');
                        });

                        wsConnected = true;
                    }
                    else {
                        // close connection, handshake bad
                        socket.end();
                        console.error('Bad handshake');
                        return;
                    }

                }
            });

        }).listen(port, bindAddress);
    }

    WebSocketServer.prototype.send = function(message) {
        if(typeof message == 'object') {
            message = JSON.stringify(message);
        }
        if(typeof this.socket !== 'undefined') {
            var data = encodeWebSocket(message);
            this.socket.write(data);
        } else console.warn("There is nobody to send to");
    }

    WebSocketServer.prototype.onMessage = function(callback) {
        this.callback = callback;
    }

    function encodeWebSocket(bytesRaw){
        var bytesFormatted;
        var indexStartRawData;
        if (bytesRaw.length <= 125) {
            indexStartRawData = 2;
            bytesFormatted = new Buffer(bytesRaw.length + 2);
            bytesFormatted.writeUInt8(bytesRaw.length, 1);
        } else if (bytesRaw.length >= 126 && bytesRaw.length <= 65535) {
            indexStartRawData = 4;
            bytesFormatted = new Buffer(bytesRaw.length + 4);
            bytesFormatted.writeUInt8(126, 1);
            bytesFormatted.writeUInt8(( bytesRaw.length >> 8 ) & 255, 2);
            bytesFormatted.writeUInt8(( bytesRaw.length      ) & 255, 3);
        } else {
            indexStartRawData = 10;
            bytesFormatted = new Buffer(bytesRaw.length + 10);
            bytesFormatted.writeUInt8(127, 1);
            bytesFormatted.writeUInt8(( bytesRaw.length >> 56 ) & 255, 2);
            bytesFormatted.writeUInt8(( bytesRaw.length >> 48 ) & 255, 3);
            bytesFormatted.writeUInt8(( bytesRaw.length >> 40 ) & 255, 4);
            bytesFormatted.writeUInt8(( bytesRaw.length >> 32 ) & 255 ,5);
            bytesFormatted.writeUInt8(( bytesRaw.length >> 24 ) & 255, 6);
            bytesFormatted.writeUInt8(( bytesRaw.length >> 16 ) & 255, 7);
            bytesFormatted.writeUInt8(( bytesRaw.length >>  8 ) & 255, 8);
            bytesFormatted.writeUInt8(( bytesRaw.length       ) & 255, 9);
        }

        bytesFormatted.writeUInt8(129, 0);

        for (var i = 0; i < bytesRaw.length; i++){
            bytesFormatted.writeUInt8(bytesRaw.charCodeAt(i), indexStartRawData + i);
        }
        return bytesFormatted;
    }

    function decodeWebSocket (bytes){
        var datalength = bytes.readUInt8(1) & 127;
        var indexFirstMask = 2;
        if (datalength == 126) {
            indexFirstMask = 4;
        } else if (datalength == 127) {
            indexFirstMask = 10;
        }
        var masks = bytes.slice(indexFirstMask, indexFirstMask + 4);
        var indexFirstDataByte = indexFirstMask + 4;
        var j = 0;
        var i = indexFirstDataByte;
        var output = []
        while (i < bytes.length) {
            var dataByte = bytes.readUInt8(i++);
            var maskByte = masks.readUInt8(j++ % 4);
            output[j] = dataByte ^ maskByte;
        }
        return output;
    }

    function toArrayBuffer(buffer) {
        var ab = new ArrayBuffer(buffer.length);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buffer.length; ++i) {
            view[i] = buffer[i];
        }
        return ab;
    }

    function arrayBufferToString(buffer) {
        var str = '';
        var uArrayVal = new Uint8Array(buffer);
        for(var s = 0; s < uArrayVal.length; s++) {
            str += String.fromCharCode(uArrayVal[s]);
        }
        return str;
    };

//var wss = new WebSocketServer(9000, "127.0.0.1");
//wss.onMessage(function(message) {console.log("Server: message received: " + message)});
window.WebSocketServer = WebSocketServer;

})()