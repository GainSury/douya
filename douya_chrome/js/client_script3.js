//
//  Douban Extension (Chrome)
//
//  Created by Kevin (haoxi911@gmail.com)
//
//  Copyright (c) 2017 Kevin (Hao)
//  All rights reserved.
//

// This script will be injected into page 'https://www.douban.com/accounts/'
// as a normal browser-end script to support extension features and enhance
// page's user experience.

// Read settings from webpage and persist them.
function updateSettings() {
  var settings = {

    /* 0 (user avatar), 1 (gender icon) */
    avatar: parseInt($('input[name=avatar]:checked').val()),

    /* tags: settings for each tag */
    tags: [{
      name: 'newreg',
      limit: parseInt($('input[name=newreg_count]').val()),
      unit: $('select[name=newreg_unit]').val()
    }, {
      name: 'oldtopic',
      limit: parseInt($('input[name=oldtopic_count]').val()),
      unit: $('select[name=oldtopic_unit]').val()
    }],

    /* filter topics by gender: 0 (all), 1 (female), 2 (male) */
    filter_gender: parseInt($('input[name=gender]:checked').val()),

    /* filter topics by tags */
    filter_tags: [],

    /* filter topics by contents */
    filter_contents: []
  };

  // update filter_tags array.
  if ($('input[name=tag_blacklist]:checked').length > 0) {
    settings.filter_tags.push('blacklist');
  }
  if ($('input[name=tag_newreg]:checked').length > 0) {
    settings.filter_tags.push('newreg');
  }
  if ($('input[name=tag_oldtopic]:checked').length > 0) {
    settings.filter_tags.push('oldtopic');
  }

  // update filter_contents array.
  if ($('input[name=content_pic]:checked').length > 0) {
    settings.filter_contents.push('pic');
  }

  // Save settings in background script.
  sendMessage({
    action: 'updateSettings',
    settings: settings
  }, function() {
    if (!$('#succeed')[0]) {
      $('.bn-flat').after('<span id=\'succeed\'>&nbsp;&nbsp;保存成功！</span>');
    }
  });
}
