function launchEditor() {
    chrome.app.runtime.onLaunched.addListener(function (arg) {
        chrome.app.window.create(
            'src/main.html',
            { bounds: { width:780, height:490}, type:"shell" });
    });
}

function startWebServer(port) {
    setTimeout(function () {
        chrome.syncFileSystem.requestFileSystem(function (fs) {
            if(chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message)
            } else {
                new WebServerSimple("127.0.0.1", port || 8080, fs);
                loadDemos(fs);
            }
        });
    }, 500);
}

function loadDemos(fs) {
    var alwaysDemo = false;
    if(alwaysDemo) {
        require(["src/chrome/demos/DemoLoader"], function(DemoLoader){
            console.log(DemoLoader);
            DemoLoader.loadDemos(fs);
        });
    }
    chrome.runtime.onInstalled.addListener(function(details){
        console.log(details);
        if(details.reason = "install") {
            require(["src/chrome/demos/DemoLoader"], function(DemoLoader){
                console.log(DemoLoader);
                DemoLoader.loadDemos(fs);
            });
        }
    });
}

setTimeout(function () {

    try {
        launchEditor();

        startWebServer(8080);
    } catch (e) {
        console.error("Fatal: can't start web server", e.stack);
    }

}, 5000);
