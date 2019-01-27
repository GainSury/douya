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

// This content script will interpret page 'https://www.douban.com/group/'
// and update its document contents and layouts to fit extension's features.
if (location.href != 'https://www.douban.com/group/') {
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
    <script type="text/javascript" src="` + chrome.runtime.getURL('js/client_script1.js') + `" async></script>
  `);

  // Update nav bar's background color.
  $('.nav').css('background', '#FFF6EE');

  // Move some links from right side to top.
  var link1 = $('.info > a').attr('href'); //小组主页
  var link2 = $('.more > a').attr('href'); //加入的小组
  var a1 = $('.info > :nth-child(2)').html(); //发起 & 回应

  $('h1').append(`
    <p>
      <a href="${link1}">小组主页</a>
      &nbsp; | &nbsp;
      <a href="${link2}">加入的小组</a>
      &nbsp; | &nbsp;` + a1 + `
    </p>
  `);

  // Remove panel in right side.
  $('.aside').remove();

  // Remove paginator.
  $('.paginator').remove();

  // Remove banners.
  $('.pro-banner').remove();

  // Remove all rows from main table. Extend table width to 950px.
  $('.pl').remove();
  $('.article').css('width', '950px');

  // Add table headers.
  $('.olt > tbody').append(`
    <tr class="th">
      <td class="td-subject">话题</td>
      <td class="td-name">作者</td>
      <td class="td-tag">标签</td>
      <td class="td-reply">回应</td>
      <td class="td-like">喜欢</td>
      <td class="td-group">小组</td>
      <td class="td-update">最后回应</td>
    </tr>
  `);

  // Fields for loading additional topics.
  $('.article').append(`
    <img id="loading" src="` + chrome.runtime.getURL('img/loading.svg') + `">
    <input id="loadmore" class="button" type="submit" value="显示更多话题"
           onclick="requestMyTopics(); $('#loadmore').hide();">
  `);
});

})();
