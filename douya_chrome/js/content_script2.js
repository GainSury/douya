//
//  Douban Extension (Chrome)
//
//  Created by Kevin (haoxi911@gmail.com)
//
//  Copyright (c) 2017 Kevin (Hao)
//  All rights reserved.
//

(function () {
'use strict';

// This content script will interpret page 'https://www.douban.com/group/xx'
// and update its document contents and layouts to fit extension's features.
if (location.href.indexOf('https://www.douban.com/group/') !== 0 ||
    location.pathname.split('/').length !== 4 ||
    location.pathname.split('/').pop().length !== 0) {
  $(document).ready(function() {
    $('body').show();
  });
  return;
}

// The document is hidden by default (defined in css), we manipulate HTML
// elements when DOM loaded, add / remove / update some elements as needed
// and finally display the revised page to customers.
$(document).ready(function() {

  // Inject scripts which will be executed in page context.
  $('head').append(`
    <script type="text/javascript" src="` + chrome.runtime.getURL('lib/js.cookie.js') + `" async></script>
    <script type="text/javascript" src="` + chrome.runtime.getURL('js/helper.js') + `" async></script>
    <script type="text/javascript" src="` + chrome.runtime.getURL('js/client_script2.js') + `" async></script>
  `);

  // Update nav bar's background color.
  $('.nav').css('background', '#FFF6EE');

  // Remove the landing bar (displayed if not logged in).
  $('#landing-bar').remove();

  // Move topic search box to top.
  $('.group-topic-search').detach().appendTo('#group-new-topic-bar');

  // Move some links from right or bottom to top.
  $('.group-misc').html($(".group-misc a")[0]);
  var text1 = $(".group-misc a").text();
  $('.group-misc').append(`
    &nbsp; | &nbsp;
    <a href="${location.pathname + 'members'}">小组成员</a>
  `);
  if (text1 == '退出小组') {
    $('.group-misc').append(`
      &nbsp; | &nbsp;
      <a href="${location.pathname + 'invite'}">邀请好友</a>
    `);
  }

  // Remove panel in right side.
  $('.aside').remove();

  // Remove search box and links at bottom.
  $('.group-topics-more').remove();

  // Remove all rows from main table. Extend table width to 950px.
  $('.olt > tbody').empty();
  $('.article').css('width', '950px');

  // Add table headers.
  $('.olt > tbody').append(`
    <tr class="th">
      <td class="td-subject">话题</td>
      <td class="td-name">作者</td>
      <td class="td-tag">标签</td>
      <td class="td-reply">回应</td>
      <td class="td-like">喜欢</td>
      <td class="td-create">发表时间</td>
      <td class="td-update">最后回应</td>
    </tr>
  `);

  // Fields for loading additional topics.
  $('.article').append(`
    <img id="loading" src="` + chrome.runtime.getURL('img/loading.svg') + `">
    <input id="loadmore" class="button" type="submit" value="显示更多话题"
           onclick="requestGroupTopics(); $('#loadmore').hide();">
  `);
});

})();
