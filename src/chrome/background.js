chrome.app.runtime.onLaunched.addListener(function (arg) {
    chrome.app.window.create(
        'src/main.html',
        { bounds: { width:780, height:490}, type:"shell" });
});

var syncFS = new syncFS();
syncFS.init();
var requestListener = function (req, res) {
    console.log("Request: ", req);
    syncFS.locateFile(req.url, function(fileEntry){
        if(fileEntry != null) {
            res.writeHead(200);
            fileEntry.file(function(file){
                var reader = new FileReader();
                reader.readAsText(file, "utf-8");
                reader.onload = function(ev) {
                    res.end(ev.target.result);
                };
            });
        } else {
            res.writeHead(404);
            res.end();
        }
    });
}

var server = httpChromify.createServer(requestListener);
server.listen(8080);
console.log("Main webserver started on port 8080");