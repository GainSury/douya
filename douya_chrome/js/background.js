//
//  Douban Extension (Chrome)
//
//  Created by Kevin (haoxi911@gmail.com)
//
//  Copyright (c) 2017 Kevin (Hao)
//  All rights reserved.
//

// Open Douban group when user clicked on extension icon.
chrome.browserAction.onClicked.addListener(
  function(activeTab) {
    chrome.tabs.create({ url: 'https://www.douban.com/group/' });
});
