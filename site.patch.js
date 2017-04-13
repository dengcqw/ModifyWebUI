
var utils = require('./utils.js');
var siteIds = require('./site.id.js').siteIds;


/* 解决各站点一些特殊问题的函数 */
var patches = {};

patches[siteIds.bilibili] = [
  ()=> { /* 拷贝元素，移除事件 */
    var viewportScale = utils.getViewportScale();
    if (viewportScale == 0.5) {
      utils.waitElement(1000,
        function() {
          return document.getElementById('page').childNodes[0].childNodes[2];
        },
        utils.cloneAndReplace
      );
    } else {
      utils.waitElement(1000,
        function() {
          return document.querySelector('#video-opt');
        },
        utils.cloneAndReplace
      );
    }
  },
  ()=>{ /* 引藏底部栏 */
    utils.waitElement(1000,
      function() {
        return document.getElementById('b_app_link');
      },
      function(element) {
        element.style.zIndex = '-100';
        return element;
      }
    )
  }
];

module.exports = patches;
