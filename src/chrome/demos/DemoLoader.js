/*global $, chrome, brackets, define */


define(function (require, exports, module) {
    var log = function(err) { console.error(err)};
    var StringUtils = require("src/utils/StringUtils");
    // No directory listing capability in these APIs.. so here is a static listing. Needs to be manually updated
    // if the demo content changes!

    // NB: The files all have to be manually white listed in the manifest.json file

    var folders = {
        'Getting Started': [
            { name: '/', files: ['index.html', 'main.css'] },
            { name: 'screenshots', files: ['quick-edit.png'] }
        ]
    };

    var root = "src/chrome/demos/content/";

    function loadDemos(fs) {
        for (var folder in folders) {
            if (folders.hasOwnProperty(folder)) {
                // eg folder is 'Getting Started'
                fs.root.getDirectory(folder, {create:true},function(rootDemoDirectoryEntry){
                    loadFolder(rootDemoDirectoryEntry, folder);
                }, log);
            }
        }


    }

    function loadFolder(rootDemoDirectoryEntry, folder) {
        var rootPath = root + folder + '/';
        var subfolders = folders[folder];
        // eg root path is "src/chrome/demos/content/Getting Started", sub folders are ['/', 'screenshots']
        for (var i=0; i<subfolders.length; i++) {

            (function(i) {
                setTimeout(function () {
                    var subfolder = subfolders[i];
                    var folderPath = rootPath + subfolder.name;

                    if (subfolder.name == '/') {
                        populateFolder(subfolder.files, rootPath, rootDemoDirectoryEntry);
                    } else {
                        console.log("Creating " + subfolder.name);
                        rootDemoDirectoryEntry.getDirectory(subfolder.name, { create: true}, function (entry) {
                            populateFolder(subfolder.files, folderPath, entry);
                        }, log);
                    }

                }, 500);
            })(i);




        }
    }
    // Take file names, then create file API files, then write to
    // them by getting the actual content via http calls
    function populateFolder(files, folderPath, directoryEntry, finished) {
        if(files.length) {
            loadFile(files.pop(), folderPath, directoryEntry, function(){
                populateFolder(files, folderPath, directoryEntry);
            })
        }
    }
    function loadFile(file, folderPath, directoryEntry, callback) {
        console.log("Trying to create " + file, directoryEntry);
        directoryEntry.getFile(file, { create: true }, function (fileEntry) {


            var req = new XMLHttpRequest();
            if(StringUtils.endsWith(folderPath, '/') == false) {
                folderPath += '/';
            }
            var httpPath = folderPath + file;
            console.log("Making web request to " + httpPath);
            if(isBinary(file)) {
                req.responseType = 'arraybuffer';
            }
            req.open('GET', chrome.runtime.getURL(httpPath));

            req.onload = function() {
                var xhr = this;
                fileEntry.createWriter(function (writer) {

                    writer.onerror = function(err) {
                        callback(err.code)
                    };
                    writer.onwriteend = function() {
                        callback(0);
                    };

                    var blob = new Blob([xhr.response]);

                    writer.write(blob);

                });
            }
            req.onerror = log;
            req.send();

        }, log);
    }
    function isBinary(fileName) {
        var binary = ["png", "jpg", "jpeg", "zip", "otf", "ttf", "gif"];
        for(var i=0; i<binary.length; i++) {
            var entry = binary[i];
            if(StringUtils.endsWith(fileName, "." + entry)) {
                return true;
            }

        }
        return false;

    }

    exports.loadDemos = loadDemos;
});