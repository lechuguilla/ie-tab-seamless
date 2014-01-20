var RealUrlIs = "/?real_url_is:__";
var strFilePrefix = "file:///";

function gotoIeCore_OnlyForPage() {
    document.open();
    document.write(getIeHtml(document.location.href));
    document.getElementById('IECore').requestTarget = {
       gotFocus: function() {
          return true;
       },
       addIeTab: function(url) {
          port.postMessage({cmd:"openietab",url:url});
          //var newWindow = window.open(url);
          //newWindow.document.open();
          //newWindow.document.write(htmlBody);
          //newWindow.document.close();
          return true;
       },
       loadIeTab: function() {
          return true;
       },
       beforeNavigate : function(url) {
          //window.location.href = url;
          return true;
       },
       changeUrl: function(url) {
          if (url.length < 5 || url.substr(0,4) != "http") {
              if (!isTheSameUrl(location.href,url)) {
                  location.href = url;
              }
              console.info("href:"+location.href+","+url);
              return false;
          }
          if (!history.pushState) {
              return false;
          }

          var onlyShowUrl = RealUrlIs + url;
          var jsPrefix = "javascript:";
          if (url.toLowerCase() == window.location.href.toLowerCase()
                || window.location.href.substr(window.location.href.length - onlyShowUrl.length).toLowerCase() == onlyShowUrl.toLowerCase()
                || url.length >= jsPrefix.length && url.substr(0, jsPrefix.length).toLowerCase() == jsPrefix.toLowerCase()) {
             return true;
          }

          try {
              var newUrlDomain = getDomain(url);
              if (window.location.host.toLowerCase() == newUrlDomain.toLowerCase()) {
                 history.pushState({realUrl:url}, null, url);
              } else {
                 history.pushState({realUrl:url}, null, onlyShowUrl);
              }
          } catch (e) { }
          return true;
       }
    };
    document.close();

    window.onpopstate = function(e) {
        var ieCore = document.getElementById('IECore');
        if (ieCore.url && ieCore.url != window.location.href) {
            var newUrl = e.state?e.state.realUrl:window.location.href;
            ieCore.navigate(newUrl);
        }
    };
}
function isTheSameUrl(url1, url2) {
              console.info("same:"+formatUrlToIeUrl(url1)+","+formatUrlToIeUrl(url2));
    return formatUrlToIeUrl(url1).toLowerCase() == formatUrlToIeUrl(url2).toLowerCase();
}
function formatUrlToIeUrl(chromeUrl) {
    var outUrl = chromeUrl;
    if (startWith(chromeUrl, strFilePrefix)) outUrl = chromeUrl.substr(strFilePrefix.length).replace(/[/]/g,"\\");
    if (outUrl.charAt(outUrl.length-1) == "\\") return outUrl.substr(0, outUrl.length-1);
    return outUrl;
}
function startWith(str, strPrefix) {
    if (str.length < strPrefix.length) return false;
    return str.substr(0, strPrefix.length) == strPrefix;
}
function getRealUrl(url) {
   var prefixIndex = url.indexOf(RealUrlIs);
   if (prefixIndex < 0) return null;
   return url.substr(prefixIndex + RealUrlIs.length);
}

function getDomain(url) {
    var cIndex = url.indexOf('://');
    if (cIndex < 0) return null;
    var endIndex = url.indexOf('/',cIndex+3);
    if (endIndex < 0) return url.substr(cIndex+1);
    return url.substring(cIndex+3, endIndex);
}

function getIeHtml(url) {
    return '<html><body style="padding:0px;margin:0px;"><embed id="IECore" style="width:100%;height:100%;" url="'+url+'" type="application/x-zhucai-iecore"></embed></body></html>';
}
