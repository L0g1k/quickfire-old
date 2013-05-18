/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, window, navigator */

define(function (require, exports, module) {
    "use strict";

    function quit() {
        // unsupported
    }

    function abortQuit() {
        // unsupported
    }

    function showDeveloperTools() {
        // nothing (Chrome does this automatically)
    }

    function getElapsedMilliseconds() {
        return new Date().getTime() - window._startupTime;
    }

    function openLiveBrowser(url, enableRemoteDebugging, callback) {
        if (callback) {
            callback();
        }
    }

    function closeLiveBrowser(callback) {
        if (callback) {
            callback();
        }
    }

    function openURLInDefaultBrowser(callback, url) {
        window.open("url", "_blank");
        if (callback) {
            callback();
        }
    }

    function showExtensionsFolder() {
        console.log("Not implemented in NativeProxy: app.showExtensionsFolder()", arguments);
    }

    function getApplicationSupportDirectory() {
        console.log("Not implemented in NativeProxy: app.getApplicationSupportDirectory()", arguments);
        return ".";
    }

    function addMenu() {
        console.log("Not implemented in NativeProxy: app.addMenu()", arguments);
    }

    function addMenuItem() {
        console.log("Not implemented in NativeProxy: app.addMenuItem()", arguments);
    }

    function getNodeState(callback) {
        console.log("Not implemented in NativeProxy: app.getNodeState()", arguments);
        callback(-2);
    }

    exports.language = navigator.language || window.localStorage.getItem("locale");

    exports.quit                            = quit;
    exports.abortQuit                       = abortQuit;
    exports.showDeveloperTools              = showDeveloperTools;
    exports.getElapsedMilliseconds          = getElapsedMilliseconds;
    exports.openLiveBrowser                 = openLiveBrowser;
    exports.closeLiveBrowser                = closeLiveBrowser;
    exports.openURLInDefaultBrowser         = openURLInDefaultBrowser;
    exports.showExtensionsFolder            = showExtensionsFolder;
    exports.getApplicationSupportDirectory  = getApplicationSupportDirectory;
    exports.addMenu                         = addMenu;
    exports.addMenuItem                     = addMenuItem;
    exports.getNodeState                    = getNodeState;
});
