var isInjected;
var port;
if (!isInjected) {
    isInjected = true;
    var realUrl = getRealUrl(window.location.href);
    if (realUrl) {
        window.location.replace(realUrl);
    } else {
        port = chrome.extension.connect()
        port.onMessage.addListener(function(msg) {
            if (msg.isIeCore) {
                gotoIeCore_OnlyForPage();
            }
        });
    }
}
