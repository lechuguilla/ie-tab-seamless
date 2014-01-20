var isWin = (navigator.platform == "Win32") || (navigator.platform == "Windows");
var tabsMode = new Object();
var injectCode = "var isInjected;if(typeof(gotoIeCore_OnlyForPage) == 'undefined'){false;} else {isInjected = true;gotoIeCore_OnlyForPage();true;}";
var settings = {autoUrls:window.localStorage.autoUrls, autoExceptUrls:window.localStorage.autoExceptUrls};

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-40906461-2']);
_gaq.push(['_trackPageview']);

function inject(tab) {
   chrome.tabs.executeScript(tab.id, {runAt:"document_start", 
        code:injectCode},
        function(result) {
            if (!result[0]) {
               chrome.tabs.executeScript(tab.id, {runAt:"document_start", file:"api.js"}, function() {
                   chrome.tabs.executeScript(tab.id, {runAt:"document_start", file:"content_script.js"}, function() {
                        chrome.tabs.executeScript(tab.id, {runAt:"document_start", code:injectCode});
                   });
               });
            }
        });
}
function setIeCore(tab, isIeCore) {
   if (isIeCore) _gaq.push(['_setCustomVar',1,'openUrl',tab.url,3]);

   updateIeCoreState(tab, isIeCore);
   if (isIeCore) {
       inject(tab);
   } else {
       chrome.tabs.update(tab.id, {url:tab.url});
   }
}
function updateIeCoreState(tab, isIeCore) {
   tabsMode[tab.id] = isIeCore;
   if (isIeCore) {
       chrome.browserAction.setIcon({path:'logo_color19.png',tabId:tab.id});
   } else {
       chrome.browserAction.setIcon({path:'logo_gray19.png',tabId:tab.id});
   }
}
function openInIE(url) {
    chrome.tabs.create({url:url},function(tab){
       setIeCore(tab, true);
    });
}
if (chrome.tabs.onReplaced) {
    chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId) {
        tabsMode[addedTabId] = tabsMode[removedTabId];
        tabsMode[removedTabId] = undefined;
        chrome.tabs.get(addedTabId, function(tab){
            if (checkOrAuto(tab)) {
                setIeCore(tab, true);
            }
        });
    });
}
chrome.extension.onConnect.addListener(function(port) {
   if (port.sender.tab.id <= 0) {
       return;
   }
   port.onMessage.addListener(function(msg) {
      if (msg.cmd == "openietab") {
          openInIE(msg.url);
      }
   });

   console.info("tabsMode[port.sender.tab.id]:"+tabsMode[port.sender.tab.id]);
   var msg = {isIeCore:checkOrAuto(port.sender.tab)};
   port.postMessage(msg);
   if (tabsMode[port.sender.tab.id]) updateIeCoreState(port.sender.tab, true);
});

function checkOrAuto(tab) {
   var url = tab.url;
   if (typeof tabsMode[tab.id] === 'undefined') {
       if (isAutoUrl(url)) {
           tabsMode[tab.id] = true;
       }
   }
   return tabsMode[tab.id];
}

function isAutoUrl(url) {
   if (!settings.enableAuto || !settings.autoUrls) return false;
   buildAutoRegularsIfNeed();
   var result = false;
   if (isAccordRules(settings.autoRegulars, url)) {
       result = true;
   } else if (url.charAt(url.length-1) == '/') {
       if (isAccordRules(settings.autoRegulars, url.substr(0, url.length - 1))) {
           result = true;
       }
   }
   if (result) {
       if (isAccordRules(settings.autoExceptRegulars, url)) {
           result = false;
       } else if (url.charAt(url.length-1) == '/') {
           if (isAccordRules(settings.autoExceptRegulars, url.substr(0, url.length - 1))) {
               result = false;
           }
       }
   }
   return result;
}

function isAccordRules(rules, url) {
   for (var i=0; i<rules.length; i++) {
      var reg = rules[i];
      if (reg.test(url)) {
          return true;
      }
   }
   return false;
}

function buildAutoRegularsIfNeed() {
   if (settings.autoRegulars) return;
   settings.autoRegulars = buildRegularsFromString(settings.autoUrls);
   settings.autoExceptRegulars = buildRegularsFromString(settings.autoExceptUrls);
}

function buildRegularsFromString(strRule) {
   var rules = strRule.split("\n");
   var regs = new Array();
   for (var i=0; i<rules.length; i++){
      var strAutoUrl = rules[i].trim();
      if (strAutoUrl == "") continue;
      if (strAutoUrl.substr(0,2).toLowerCase() == "r/") {
          regs.push(new RegExp(strAutoUrl.substr(2)));
      } else {
          var strReg = "^" + strAutoUrl.replace(/[\^\$\.\+\?\=\!\:\|\\\/\(\)\[\]\{\}]/g, '\\$&').replace("*", ".*") + "$";
          regs.push(new RegExp(strReg, "i"));
      }
   }
   return regs;
}

function clearAutoRegulars() {
    settings.autoRegulars = null;
    settings.autoExceptRegulars = null;
}

if (isWin) {
   chrome.browserAction.onClicked.addListener(function(tab){
      setIeCore(tab, !tabsMode[tab.id]);
   });

   chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
      updateIeCoreState(tab,tabsMode[tabId]);
   });

   chrome.contextMenus.create({
      title:chrome.i18n.getMessage("openInIeCore"),
      contexts:["link"],
      onclick:function(clickInfo){
         openInIE(clickInfo.linkUrl);
      }
   });
}

(function() {
  var ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
})();
