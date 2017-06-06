
var utils = require('./utils.js');
var siteIds = require('./site.id.js').siteIds;


/* 解决各站点一些特殊问题的函数 */
var patches = {};

patches[siteIds.bilibili] = [
  ()=> { /* 打开客户端，分享收藏缓存 tool bar */
    var viewportScale = utils.getViewportScale();
    if (viewportScale == 0.5) {
      utils.waitElement(1000,
        ()=>document.getElementById('page').childNodes[0].childNodes[2],
        utils.cloneAndReplaceElement
      );
    } else {
      utils.waitElement(1000,
        ()=>document.querySelector('#video-opt'),
        utils.cloneAndReplaceElement
      );
    }
  },
  ()=>{ /* 引藏底部栏 */
    utils.waitElement(1000,
      ()=>document.getElementById('b_app_link'),
      (element)=>{ element.style.zIndex = '-100'; return element; }
    );
  }
];

patches[siteIds.acfun] = [
  ()=>{ /* 下滑时，顶部下载提示 */
    utils.waitElement(1000,
      ()=>document.getElementById('prompt-box'),
      (element)=>{ element.style.zIndex = '-100'; return element; }
    );
  },
  ()=>{ /* 打开客户端，分享收藏缓存 tool bar */
    utils.waitElement(1000,
      ()=>document.querySelector('.block-toolbar'),
      utils.cloneAndReplaceElement
    );
  },
  ()=> { /* 底部下载app按键 */
    utils.waitElement(1000,
      ()=>document.getElementById('bottom-download'),
      utils.cloneAndReplaceElement
    );
  }
];

patches[siteIds.mgtv] = [
  ()=> {
    utils.waitElement(1000,
      ()=>{
        var parentEle = document.querySelector('.v5-area-bar');
        if (!parentEle) {
          return undefined;
        }
        return utils.flatten(
          parentEle.querySelector('.bd>.list'), /* 分享 bar */
          document.getElementsByClassName('mg-appopen-btnopen mg-stat'), /* 下载app 元素 */
		  document.getElementsByClassName('btn mg-stat'), /* 下载app 元素 */
		  document.getElementsByClassName('video-comment') /* 全部评论（其中包含下载） */
        )
      },
      utils.cloneAndReplaceElement
    );
  }
]

patches[siteIds.iqiyi] = [
  ()=> {
    utils.waitElement(1000,
      ()=>document.getElementById('bottomNativePopup'), /* 立即下载 float bar*/
      (element)=>{element.style.opacity = '0';}
    );
  },
  ()=> {
    utils.waitElement(1000,
      ()=>utils.flatten( /* 同样操作的元素可以拼成数组 */
        document.getElementsByClassName('m-video-action'), /* 分享等 */
        document.getElementsByClassName('m-link'), /* 底部意见反馈 */
        document.getElementsByClassName('link-app'), /* 右上角下载app */
        document.getElementsByClassName('c-btn c-btn-block c-btn-block-lxx') /* 打开爱奇异，大按键 */
      ),
      utils.cloneAndReplaceElement
    );
  }
]

module.exports = patches;
