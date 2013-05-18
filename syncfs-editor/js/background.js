chrome.app.runtime.onLaunched.addListener(function (arg) {
  chrome.app.window.create(
    '/syncfs-editor/main.html',
    { bounds: { width:780, height:490}, type:"shell" });
});
