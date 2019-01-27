//
//  Douban Extension (Chrome)
//
//  Created by Kevin (haoxi911@gmail.com)
//
//  Copyright (c) 2017 Kevin (Hao)
//  All rights reserved.
//

// Set loading animation.
document.getElementById("loading").src = chrome.runtime.getURL('img/loading_lg.svg');

// Redirect to Douban's settings page.
window.location.href = "https://accounts.douban.com/?tab=groups";
