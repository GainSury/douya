//
//  Douban Extension (Chrome)
//
//  Created by Kevin (haoxi911@gmail.com)
//
//  Copyright (c) 2017 Kevin (Hao)
//  All rights reserved.
//

// This script contains a couple of helper methods that we
// can use to help coding the project.

// Return the ID of this Douban Extension.
function getExtensionID() {
  return "okbegmdpgiceefipdjigeebadkehcpil";
}

// Send a message to background script and return a Promise.
function sendMessage(message, responseCallback) {
  if (responseCallback) {
    chrome.runtime.sendMessage(getExtensionID(), message, responseCallback);
  } else {
    var deferred = new $.Deferred();
    chrome.runtime.sendMessage(getExtensionID(), message, function(response) {
      if (response) {
        deferred.resolve(response);
      } else {
        // If an error occurs while connecting to the extension, the callback
        // will be called with no arguments and runtime.lastError will be set
        // to the error message.
        deferred.reject(runtime.lastError);
      }
    });
    return deferred.promise();
  }
}

// Return the URL parameter by matching parameter's name.
//- http://stackoverflow.com/questions/11582512/how-to-get-url-parameters-with-javascript
function getURLParameter(name) {
  return decodeURIComponent(
    (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)')
      .exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')
    ) || null;
}

// Return 'Date' object from date string like '2015-07-16 23:06:23'.
function getDateFromString(str) {
  return new Date(str.replace(' ', 'T') + 'Z');
}

// Return true if the passing date is inside of time range (from now).
function isDateInRange(dateString, range) {
  var date = getDateFromString(dateString);
  maxDate = new Date();
  if (range.unit === 'H') {
    maxDate.setHours(maxDate.getHours() - range.limit);
  } else if (range.unit === 'D') {
    maxDate.setDate(maxDate.getDate() - range.limit);
  } else if (range.unit === 'W') {
    maxDate.setDate(maxDate.getDate() - range.limit * 7);
  } else if (range.unit === 'M') {
    maxDate.setMonth(maxDate.getMonth() - range.limit);
  }
  return (date >= maxDate);
}

// Install online chat tool for customer support.
function installOnlineChat(userInfo, version) {

  // We currently use MEIQIA, it is similar to Olark
  // but has a better access speed in China.

  // Start of MEIQIA Code
  (function(m, ei, q, i, a, j, s) {
      m[i] = m[i] || function() {
          (m[i].a = m[i].a || []).push(arguments)
      };
      j = ei.createElement(q),
          s = ei.getElementsByTagName(q)[0];
      j.async = true;
      j.charset = 'UTF-8';
      j.src = '//static.meiqia.com/dist/meiqia.js?_=t';
      s.parentNode.insertBefore(j, s);
  })(window, document, 'script', '_MEIQIA');
  _MEIQIA('entId', 59580);

  // We also send metadata to MEIQIA.
  var metadata = {
    "版本": version,
    "浏览器": navigator.userAgent
  };
  if (Cookies.get('ck')) {    // user logged in
    $.extend(metadata, {
      "用户": userInfo.id,
      "注册时间": userInfo.reg_time,
      "name": userInfo.name,
      "avatar": userInfo.avatar
    });
    if (userInfo.intro.length > 0) {
      $.extend(metadata, {"签名": userInfo.intro});
    }
    if (userInfo.birthday) {
      $.extend(metadata, {"生日": userInfo.birthday});
    }
    if (userInfo.loc) {
      $.extend(metadata, {"address": userInfo.loc.name});
    }
    if (userInfo.gender === 'M') {
      $.extend(metadata, {"gender": "男"});
    }
    else if (userInfo.gender === 'F') {
      $.extend(metadata, {"gender": "女"});
    }
  }
  _MEIQIA('metadata', metadata);
}

// Install web statistic tool for marketing analysis.
function installWebStatisic(tags) {

  // Insert customized code for custom tags.
  $('body').append(tags);

  // We currently use StatCounter, the following code was
  // modified upon the StatCounter's sample code.
  $('body').append(`
    <!-- Start of StatCounter Code -->
    <script type="text/javascript">
    var sc_project=11355639;
    var sc_invisible=1;
    var sc_security="7e072154";
    var scJsHost = (("https:" == document.location.protocol) ?
    "https://secure." : "http://www.");
    (function() {
      var sc = document.createElement('script'); sc.type = 'text/javascript'; sc.async = true;
      sc.src = scJsHost + 'statcounter.com/counter/counter.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(sc, s);
    })();
    </script>
    <noscript><div class="statcounter"><a title="real time web
    analytics" href="http://statcounter.com/"
    target="_blank"><img class="statcounter"
    src="//c.statcounter.com/11355639/0/7e072154/1/" alt="real
    time web analytics"></a></div></noscript>
    <!-- End of StatCounter Code -->
  `);
}
