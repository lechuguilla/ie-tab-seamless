var settings = chrome.extension.getBackgroundPage().settings;

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-40906461-2']);
_gaq.push(['_trackPageview']);

function load() {
    for (var i=0; i<document.all.length; i++) {
        var ele = document.all[i];
        var i18n = ele.getAttribute('i18n');
        if (i18n) {
            ele.innerText = chrome.i18n.getMessage(i18n);
        }
    }

    if (settings.autoUrls) document.getElementById('autoUrls').value = settings.autoUrls;
    if (settings.autoExceptUrls) document.getElementById('autoExceptUrls').value = settings.autoExceptUrls;
    document.getElementById('ckbEnableAuto').checked = settings.enableAuto;
    document.getElementById('btnSave').onclick = save;
}
function save() {
    settings.autoUrls = document.getElementById('autoUrls').value;
    settings.autoExceptUrls = document.getElementById('autoExceptUrls').value;
    settings.enableAuto = document.getElementById('ckbEnableAuto').checked;

    localStorage.setItem('autoUrls',settings.autoUrls);
    localStorage.setItem('autoExceptUrls',settings.autoExceptUrls);

    chrome.extension.getBackgroundPage().clearAutoRegulars();
    document.getElementById('msg').style.opacity = '1.0';
    document.getElementById('msg').className = 'fadeInClass';
    setTimeout(function() {
        document.getElementById('msg').className = 'fadeOutClass';
        document.getElementById('msg').style.opacity = '0.0';
    }, 1500);
}
window.onload = load;

(function() {
  var ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
})();
