/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, chrome */

define(function (require, exports, module) {
    "use strict";

    var ChromeFileSystem = require("./ChromeFileSystem");
    var StringUtils = require("utils/StringUtils");
    var NO_ERROR = 0;
    var ERR_UNKNOWN = 1;
    var ERR_INVALID_PARAMS = 2;
    var ERR_NOT_FOUND = 3;
    var ERR_CANT_READ = 4;
    var ERR_UNSUPPORTED_ENCODING = 5;
    var ERR_CANT_WRITE = 6;
    var ERR_OUT_OF_SPACE = 7;
    var ERR_NOT_FILE = 8;
    var ERR_NOT_DIRECTORY = 9;
    var fileSystem = null;

    function init(callback) {
        chrome.syncFileSystem.requestFileSystem(function (fs){
            fileSystem = fs;
            callback();
        });
    }

    function locateFile (uri, callback) {

        console.log("Trying to locate file " + uri);

        if(StringUtils.endsWith(uri, '/')) {
            callback(fileSystem.root.fullPath == uri ? fileSystem.root : fileSystem.root.getDirectory(uri));
        } else fileSystem.root.getFile(uri, {create: false},
            function(file) {
                callback(file);
            },
            function(err) {
                callback(null);
                console.log(err)
            }
        );
    }

    function readdir(path, callback) {
        if(isLegacySystemPath(path)) {
            ChromeFileSystem.send("fs", "readdir", path, callback);
        }  else fileSystem.root.getDirectory(path, { create: false }, function(directory){
            directory.createReader().readEntries(function(entries){
                var returnArray = [];
                for(var i=0; i<entries.length; i++) {
                    returnArray.push(entries[i].name);
                }
                debugger;
                callback(undefined, returnArray);
            });
        }, function(error){
                callback(error)
        });
    }

    function stat(path, callback) {
        if(isLegacySystemPath(path)) {
            ChromeFileSystem.send("fs", "stat", path, function (err, statData) {
                if (statData && callback) {
                    statData.isFile = function () { return statData._isFile; };
                    statData.isDirectory = function () { return statData._isDirectory; };
                    statData.isBlockDevice = function () { return statData._isBlockDevice; };
                    statData.isCharacterDevice = function () { return statData._isCharacterDevice; };
                    statData.isFIFO = function () { return statData._isFIFO; };
                    statData.isSocket = function () { return statData._isSocket; };
                    statData.atime = new Date(statData.atime);
                    statData.mtime = new Date(statData.mtime);
                    statData.ctime = new Date(statData.ctime);
                }
                if (callback) {
                    callback(err, statData);
                }
            });
        }  else  {
            locateFile(path, function(fileEntry) {
                if(fileEntry == null) {
                    callback(brackets.fs.ERR_NOT_FOUND)
                } else {
                    if(fileEntry.isDirectory) {

                        callback(brackets.fs.NO_ERROR, {
                            isFile: function() { return false },
                            isDirectory: function() { return true },
                            mtime: new Date()
                        })
                    } else fileEntry.file(function(file){
                        callback(brackets.fs.NO_ERROR, {
                            isFile: function() { return true },
                            isDirectory: function() { return false },
                            mtime: file.lastModifiedDate
                        })
                    });

                }
            });
        }
    }

    function isLegacySystemPath(path) {
        return path.indexOf('\.') == 0 || path.indexOf('/Users/') == 0;
    }

    function readFile(path, encoding, callback) {
        if(isLegacySystemPath(path))
            ChromeFileSystem.send("fs", "readFile", path, encoding, callback);
        else {

            fileSystem.root.getFile(path, { create: false}, function(fileEntry){
                if(fileEntry == null) {
                      callback(brackets.fs.ERR_NOT_FOUND)
                } else {
                    fileEntry.file(function(file){
                        var reader = new FileReader();
                        reader.readAsText(file, "utf-8");
                        reader.onload = function(ev) {
                            callback(brackets.fs.NO_ERROR, ev.target.result);
                        };
                    })
                }

            }, function (error){
                callback(brackets.ERR_UNKNOWN);
            });
        }
    }

    function writeFile(path, data, encoding, callback) {

        this.filesystem.root.getFile(
            path, { create: false },
            function(entry) {
                entry.createWriter(function (writer) {
                    writer.truncate(0);
                    writer.onerror = error.bind(null, 'writer.truncate');
                    writer.onwriteend = function() {
                        var content = this.getContent();
                        var blob = new Blob([content]);
                        var size = content.length;
                        writer.write(blob);
                        writer.onerror = error;
                        writer.onwriteend = function(){
                            callback();
                        };
                    }.bind(this);
                }.bind(this));
            }.bind(this));

        fileSystem.root.getFile(path, { create: false }, function(fileEntry){
            callback(undefined, fileEntry);
        }, function (error){
            callback.err(error);
        });
        //return ChromeFileSystem.send("fs", "writeFile", path, data, encoding, callback);
    }

    function chmod(path, mode, callback) {
        return ChromeFileSystem.send("fs", "chmod", path, mode, callback);
    }

    function unlink(path, callback) {
        return ChromeFileSystem.send("fs", "unlink", path, callback);
    }

    function cwd(callback) {
        return ChromeFileSystem.send("fs", "cwd", callback);
    }

    function makedir (path, mode, callback) {
        return ChromeFileSystem.send("fs", "mkdir", path, mode, callback);
    }

    exports.NO_ERROR = NO_ERROR;
    exports.ERR_UNKNOWN = ERR_UNKNOWN;
    exports.ERR_INVALID_PARAMS = ERR_INVALID_PARAMS;
    exports.ERR_NOT_FOUND = ERR_NOT_FOUND;
    exports.ERR_CANT_READ = ERR_CANT_READ;
    exports.ERR_UNSUPPORTED_ENCODING = ERR_UNSUPPORTED_ENCODING;
    exports.ERR_CANT_WRITE = ERR_CANT_WRITE;
    exports.ERR_OUT_OF_SPACE = ERR_OUT_OF_SPACE;
    exports.ERR_NOT_FILE = ERR_NOT_FILE;
    exports.ERR_NOT_DIRECTORY = ERR_NOT_DIRECTORY;

    exports.readdir = readdir;
    exports.stat = stat;
    exports.readFile = readFile;
    exports.writeFile = writeFile;
    exports.chmod = chmod;
    exports.unlink = unlink;
    exports.cwd = cwd;
    exports.makedir = makedir;
    exports.init = init;
});
