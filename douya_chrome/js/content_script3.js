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

// This content script will interpret page 'https://www.douban.com/accounts/'
// and related sub pages to inject extension's configurable options.
if (location.pathname !== '/accounts' &&
    location.pathname !== '/accounts/' &&
    location.pathname !== '/accounts/apptokens' &&
    location.pathname !== '/accounts/profile' &&
    location.hostname + location.pathname !== 'accounts.douban.com/') {
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
    <script type="text/javascript" src="` + chrome.runtime.getURL('js/helper.js') + `" async></script>
    <script type="text/javascript" src="` + chrome.runtime.getURL('js/client_script3.js') + `" async></script>
  `);

  // If it is not '/accounts/?tab=groups' URL, we will only inject tabs
  // and do nothing else.
  if (getURLParameter('tab') !== 'groups' || (location.pathname !== '/accounts/' &&
      location.hostname + location.pathname !== 'accounts.douban.com/')) {
    $('.xbar div').children(":first").after(`
      <a href="/accounts/?tab=groups">小组设置</a>
      `);
    $('body').show();
    return;
  }

  // Inject tabs and set '小组设置' as activated.
  $('.xbar').html(`
    <div>
      <a href="/accounts/apptokens">第三方应用授权</a>
      <span class="now"><span>小组设置</span></span>
      <a href="/accounts/profile">基本设置</a>
    </div>
    `);

  // Remove texts in right side.
  $('.aside').remove();

  // Remove main form & table.
  $('form').remove();

  // Remove link button at bottom.
  $('.group_banned').remove();

  // Inject the setting options.
  $('.article').append(`
    <table style="clear:both" width="100%" align="center" cellpadding="5">
      <tr>
        <td class="m" valign="top" align="right">头像设置 :</td>
        <td valign="top">
          <label>
          <input name="avatar" type="radio" value="0">
          显示豆瓣头像
        </label>
          <label>
          <input name="avatar" type="radio" value="1">
          显示用户性别
        </label>
        </td>
      </tr>
      <tr>
        <td class="m" valign="top" align="right">标签设置 :</td>
        <td valign="top">
          <label class="tag">新注册</label>&nbsp;-&nbsp;
          <input name="newreg_count" type="number" onkeydown="return false" min="1" max="30" step="1">
          <select name="newreg_unit">
           <option value="H">时</option>
           <option value="D">天</option>
           <option value="W">周</option>
           <option value="M">月</option>
        </select> 内注册的用户
          <br />
          <label class="tag">深水帖</label>&nbsp;-&nbsp;
          <input name="oldtopic_count" type="number" onkeydown="return false" min="1" max="30" step="1">
          <select name="oldtopic_unit">
           <option value="H">时</option>
           <option value="D">天</option>
           <option value="W">周</option>
           <option value="M">月</option>
        </select> 前发表的话题
        </td>
      </tr>
      <tr>
        <td class="m" valign="top" align="right">过滤话题（按性别）: </td>
        <td valign="top">
          <label>
        <input name="gender" type="radio" value="0">
        显示所有话题
      </label>
          <label>
        <input name="gender" type="radio" value="1">
        仅显示女生话题
      </label>
          <label>
        <input name="gender" type="radio" value="2">
        仅显示男生话题
      </label>
        </td>
      </tr>
      <tr>
        <td class="m" valign="top" align="right">过滤话题（按标签）: </td>
        <td valign="top">
          <label>
          <input type="checkbox" name="tag_blacklist">
          隐藏&nbsp;<label class="tag">黑名单</label>&nbsp;类话题
          </label>
          <label>
          <input type="checkbox" name="tag_newreg">
          隐藏&nbsp;<label class="tag">新注册</label>&nbsp;类话题
          </label>
          <label>
          <input type="checkbox" name="tag_oldtopic">
          隐藏&nbsp;<label class="tag">深水帖</label>&nbsp;类话题
          </label>
        </td>
      </tr>
      <tr>
        <td class="m" valign="top" align="right">过滤话题（按内容）: </td>
        <td valign="top">
          <label>
          <input type="checkbox" name="content_pic">
          仅显示带图片的话题
          </label>
        </td>
      </tr>
      <tr>
        <td></td>
        <td><span class="bn-flat"><input id="save" type="submit" value="更新设置"></span></td>
      </tr>
    </table>
  `);

  // Allow user to save settings.
  $('#save').attr('onclick', 'updateSettings();');

  // Read current settings from storage API.
  sendMessage({
    action: 'requestSettings'
  }, function(settings) {

    // Load data onto settings page.
    $("input[name=avatar][value=" + settings.avatar + "]").attr('checked', 'checked');
    $("input[name=gender][value=" + settings.filter_gender + "]").attr('checked', 'checked');
    $.each(settings.tags, function(i, tag) {
      if (tag.name === 'newreg') {
        $('input[name=newreg_count]').val(tag.limit);
        $("select[name=newreg_unit] > option[value=" + tag.unit + "]")
          .attr('selected', 'selected');
      } else if (tag.name === 'oldtopic') {
        $('input[name=oldtopic_count]').val(tag.limit);
        $("select[name=oldtopic_unit] > option[value=" + tag.unit + "]")
          .attr('selected', 'selected');
      }
    });
    $.each(settings.filter_tags, function(i, filter) {
      $("input[name=tag_" + filter + "]").attr('checked', 'checked');
    });
    $.each(settings.filter_contents, function(i, filter) {
      $("input[name=content_" + filter + "]").attr('checked', 'checked');
    });

    // Make sure the body is visible.
    if ($('body').css('display') == 'none') {
      $('body').show();
    }

    // Code for statCounter custom tags.
    var statCounterTags = `
      <script type="text/javascript">
        var tags = {
          "Version": "${chrome.runtime.getManifest().version}",
          "Avatar": "${settings.avatar}",
          "Gender": "${settings.filter_gender}"
        };
        var _statcounter = _statcounter || [];
        _statcounter.push({"tags": tags});
      </script>
    `;

    // Web statistics.
    installWebStatisic(statCounterTags);
  });
});

})();
