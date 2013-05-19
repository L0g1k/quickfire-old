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
    function readdir(path, callback) {
<<<<<<< HEAD
        if(isLegacySystemPath(path)) {
=======
        if(path.indexOf('\.') == 0) {
>>>>>>> 21baad040b148449444cf7dcdfe36cf5e200c2bf
            ChromeFileSystem.send("fs", "readdir", path, callback);
        }  else fileSystem.root.getDirectory(path, { create: false}, function(directory){
            directory.createReader().readEntries(function(entries){
                var returnArray = [];
                for(var i=0; i<entries.length; i++) {
                    returnArray.push(entries[i].name);
                }
                debugger;
                callback(undefined, returnArray);
            });
        }, function(error){
<<<<<<< HEAD
                callback(error)
=======

>>>>>>> 21baad040b148449444cf7dcdfe36cf5e200c2bf
        });
       // return ChromeFileSystem.send("fs", "readdir", path, callback);
    }

    function stat(path, callback) {
<<<<<<< HEAD
        if(isLegacySystemPath(path)) {
=======
        if(path.indexOf('\.') == 0 || path.indexOf('/Users/') == 0) {
>>>>>>> 21baad040b148449444cf7dcdfe36cf5e200c2bf
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
        }  else locateFileInDirectory(path, fileSystem.root, function(file) {
            var err = file!=null ? brackets.fs.NO_ERROR : brackets.fs.ERR_NOT_FOUND;
            if(callback) {
                callback(err, {
                    isFile: function() { return !StringUtils.endsWith(path, '\.')},
<<<<<<< HEAD
                    isDirectory: function() { return StringUtils.endsWith(path, '\.')},
                    mtime: file.lastModifiedDate
=======
                    isDirectory: function() { return StringUtils.endsWith(path, '\.')}
>>>>>>> 21baad040b148449444cf7dcdfe36cf5e200c2bf
                })
            }
        });

        /*
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
        });*/

    }

<<<<<<< HEAD
    function isLegacySystemPath(path) {
        return path.indexOf('\.') == 0 || path.indexOf('/Users/') == 0;
    }

=======
>>>>>>> 21baad040b148449444cf7dcdfe36cf5e200c2bf
    function locateFile (uri, callback) {
        console.log("Trying to locate file " + uri);
        return locateFileInDirectory(uri, root, callback);
    }

     function locateFileInDirectory (name, directory, callback) {
        var found = false
        if(StringUtils.endsWith(name, '/')) {
            callback(directory.fullPath == name ? directory : directory.getDirectory(name));
        } else directory.createReader().readEntries(function (entries) {
            for(var i = 0; i < entries.length; i++) {
                var entry = entries[i];
                if (typeof entry !== 'undefined') {
                    console.log("Found entry " + entry.name);
                    if (entry.isFile) {
                        if (entry.fullPath == name) {
                            found = true;
                            entry.file(callback);
                        }
                    } else {
                        locateFileInDirectory(name, directory, callback);
                    }
                }
            }
            // Hacky way to determine if the file wasn't found.
            setTimeout(function() { if(!found) callback(null)}, 500);
        });

    }

    function readFile(path, encoding, callback) {
<<<<<<< HEAD
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
=======
        return ChromeFileSystem.send("fs", "readFile", path, encoding, callback);
>>>>>>> 21baad040b148449444cf7dcdfe36cf5e200c2bf
    }

    function writeFile(path, data, encoding, callback) {
        fileSystem.root.getFile(path, { create: true}, function(fileEntry){
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
