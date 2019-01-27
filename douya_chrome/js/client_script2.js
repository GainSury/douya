//
//  Douban Extension (Chrome)
//
//  Created by Kevin (haoxi911@gmail.com)
//
//  Copyright (c) 2017 Kevin (Hao)
//  All rights reserved.
//

// This script will be injected into page 'https://www.douban.com/group/xx/'
// as a normal browser-end script to support extension features and enhance
// page's user experience.

// Save all topics as an array object.
var allTopics = [];

// Save all blacklisted users.
var allBlacklist = [];

// Save extension settings.
var allSettings = {};
var allNewReg, allOldTopic;

// Save user's profile.
var myProfile = {};

// Read extension's version number.
var versionNumber = '';

// Code for statCounter custom tags.
var statCounterTags = `
  <script type="text/javascript">
    var tags = {"Version": versionNumber, "Group": $('h1').text().trim()};
    if (myProfile.id) {
      $.extend(tags, {"UserID": myProfile.id});
    }
    if (myProfile.loc) {
      $.extend(tags, {"Location": myProfile.loc.name});
    }
    if (myProfile.gender === 'M') {
      $.extend(tags, {"Gender": "男"});
    } else if (myProfile.gender === 'F') {
      $.extend(tags, {"Gender": "女"});
    }
    var _statcounter = _statcounter || [];
    _statcounter.push({"tags": tags});
  </script>
`;

// Index offset when request topics.
var offset = 0;

// Indicate if AJAX request is in progress.
var loading = false;

// Maximum topics loaded with scrolling.
var maxScrollLoad = 500;

// Request image resources that will be used.
var images = ['male.svg', 'female.svg', 'alien.svg'];
sendMessage({
  action: 'requestImageURLs',
  images: images
}, function(response) {
  images = response.urls;
});

// Request extension's version.
sendMessage({
  action: 'requestVersion'
}, function(manifest) {
  versionNumber = manifest.version;
  if (!Cookies.get("ck")) {
    installOnlineChat(myProfile, versionNumber);
    installWebStatisic(statCounterTags);
  }
});

if (Cookies.get("ck")) {

  // Request blacklisted users if user logged in.
  sendMessage({
    action: 'requestBlacklist'
  }, function(response) {
    allBlacklist = response.urls;
  });

  // Request user's basic information.
  sendMessage({
    action: 'requestUserInfo',
    uid: window._GLOBAL_NAV.USER_ID
  }, function(response) {
    myProfile = response;
    installOnlineChat(response, versionNumber);
    installWebStatisic(statCounterTags);
  });
}

// Request extension settings.
sendMessage({
  action: 'requestSettings'
}, function(settings) {
  allSettings = settings;
  $.each(allSettings.tags, function(i, tag) {
    if (tag.name === 'newreg') {
      allNewReg = tag;
    } else if (tag.name === 'oldtopic') {
      allOldTopic = tag;
    }
  });
});

// Process JSON response and render data to GUI.
function handleResponse(response) {

  // Update loading status.
  loading = false;
  $('#loading').hide();

  // Filter invalid response.
  if (!response.topics || response.topics.length <= 0) {
    return;
  }

  // Update offset (by default, increasing 100).
  offset += response.topics.length;

  for (var i = 0; i < response.topics.length; i++) {
    var topic = response.topics[i];

    // Handle duplicated topics.
    for (var j = allTopics.length - 1; j >= 0; j--) {
      if (allTopics[j].url == topic.url) {
        // Remove the duplicated topic at index 'j'.
        allTopics.splice(j, 1);
        $('tr[class=""]:nth-child(' + j + ')').remove();
        break;
      }
    }

    // Get gender icon image.
    var gender = images[2];
    if (topic.author.gender == 'M') {
      gender = images[0];
    } else if (topic.author.gender == 'F') {
      gender = images[1];
    }

    // Tags of the topic.
    var tags = [];

    // Don't filter user's own topics.
    if (topic.author.url !== myProfile.url) {

      // Filter topics by gender.
      if ((allSettings.filter_gender === 1 && topic.author.gender !== 'F') ||
          (allSettings.filter_gender === 2 && topic.author.gender !== 'M')) {
        continue;
      }

      // Filter topics by contents.
      if (topic.cover_url.length == 0 && allSettings.filter_contents.indexOf('pic') >= 0) {
        continue;
      }

      // detect new registered users.
      if (isDateInRange(topic.author.reg_time, allNewReg)) {
        if (allSettings.filter_tags.indexOf('newreg') >= 0) {
          continue;
        } else {
          tags.push('新注册');
        }
      }

      // detect blacklisted user.
      if (allBlacklist.indexOf(topic.author.url) >= 0) {
        if (allSettings.filter_tags.indexOf('blacklist') >= 0) {
          continue;
        } else {
          tags.push('黑名单');
        }
      }

      // detect old topics.
      if (!isDateInRange(topic.create_time, allOldTopic)) {
        if (allSettings.filter_tags.indexOf('oldtopic') >= 0) {
          continue;
        } else {
          tags.push('深水帖');
        }
      }

    } else {
      tags.push('我发表的话题'); // my own topic.
    }

    // Compose HTML document.
    var topicHTML = `
      <tr class="pl">
        <td class="td-subject">
    `;

    // Display image thumbnail if there is image inside the topic.
    if (topic.cover_url.length > 0) {
      topicHTML += `<div><img class="cover" src="${topic.cover_url}"></div>`;
    }

    // Continue the rest.
    topicHTML += `
          <span><a href="${topic.url}" title="${topic.title}">${topic.title}</a></span>
        </td>
        <td class="td-name">
          <div>
            <img class="gender" src="${gender}" alt="${topic.author.gender}">
            <img class="avatar" src="${topic.author.avatar}" alt="${topic.author.name}">
          </div>
          <span><a href="${topic.author.url}" title="${topic.author.name}">${topic.author.name}</a></span>
        </td>
        <td class="td-tag">${tags.map(tag => `<label class="tags">${tag}</label>`).join('&nbsp;')}</td>
        <td class="td-reply">${topic.comments_count}</td>
        <td class="td-like">${topic.like_count}</td>
        <td class="td-create" title="${topic.create_time}">${topic.create_time.substr(5, 11)}</td>
        <td class="td-update" title="${topic.update_time}">${topic.update_time.substr(5, 11)}</td>
      </tr>
    `;
    $('.olt > tbody').append(topicHTML);

    // Update current topic.
    allTopics.push(topic);
  }

  var img1 = '.gender', img2 = '.avatar';
  if (allSettings.avatar === 1) {
    img2 = [img1, img1 = img2][0]; /* swap */
  }

  // Set z-index on the two avatar <img> elements.
  $(img1).css('z-index', '1');
  $(img2).css('z-index', '2');

  // Hide top <img> when mouse hover.
  $('.td-name > div').hover(function() {
    $(this).find(img2).fadeOut(100);
  }, function() {
    $(this).find(img2).fadeIn(100);
  });

  // Display enlarged topic image when mouse enter.
  $(".td-subject > div").mouseenter(function() {
    if (!$(this).find(".cover").length) {
      $(".enlarged-cover").hide();
      $(".enlarged-arrow").hide();
      return; /* no topic image found */
    }
    var pos = $(this).position();
    $(".enlarged-cover > img").attr(
      "src",$(this).find(".cover").attr("src")
    );
    $(".enlarged-cover").css({
        "top": (pos.top - 43) + "px",
        "left": (pos.left - 135) + "px"
    }).show();
    $(".enlarged-arrow").css({
        "top": (pos.top + 7) + "px",
        "left": (pos.left - 15) + "px"
    }).show();
  });
  $(".td-subject > div").mouseleave( function() {
    $(".enlarged-cover").hide();
    $(".enlarged-arrow").hide();
  });

  // Display 'Load More Topics' if page is not scrollable.
  if ($(document).height() <= $(window).height()) {
    $('#loadmore').css('display', 'block');
  }
}

// Read more topics via background script.
function requestGroupTopics() {

  // Update loading status.
  loading = true;
  $('#loading').css('display', 'block');

  // Send request to background script.
  sendMessage({
    action: 'requestGroupTopics',
    group: $('input[name="group"]').val(),
    start: offset,
    count: 100
  }, handleResponse);
}

// Load the first batch of topics.
if (offset == 0) {
  requestGroupTopics();

  // Make sure the body is visible.
  if ($('body').css('display') == 'none') {
    $('body').show();
  }
}

// The enlarged topic image.
$('body').append(`<div class="enlarged-cover"><img></div><div class="enlarged-arrow"></div>`);

// Auto loading topics when page scrolls.
$(window).scroll(function() {
  if (!loading && $(window).scrollTop() >= ($(document).height() - $(window).height() - 700)) {
    if (offset < maxScrollLoad) {
      $('#loadmore').hide();
      requestGroupTopics();
    } else {
      $('#loadmore').css('display', 'block');
    }
  }
});
