
var siteIds = {
  iqiyi:    "iqiyi",
  acfun:    "acfun",
  bilibili: "bilibili",
  mgtv:     "mgtv",
  sohu:     "sohu",
  letv:     "letv",
  qq:       "qq",
  pptv:     "pptv",
  youku:    "youku",
  baidu:    "baidu",
  tv:       "tv"
}

function getIdentifier(href) {
  if(href.search(".iqiyi.com") >= 0) {
    return siteIds.iqiyi;
  } else if(href.search(".acfun.") >= 0) {
    return siteIds.acfun;
  } else if(href.search(".bilibili.com") >= 0) {
    return siteIds.bilibili;
  } else if(href.search('.mgtv.com') >= 0) {
    return siteIds.mgtv;
  } else if(href.search('.sohu.') >= 0) {
    return siteIds.sohu;
  } else if(href.search('.le.') >= 0) {
    return siteIds.letv;
  } else if(href.search('.v.qq.') >= 0) {
    return siteIds.qq;
  } else if(href.search('.pptv.') >= 0) {
    return siteIds.pptv;
  } else if(href.search('.youku.') >= 0) {
    return siteIds.youku;
  } else if(href.search('.baidu.') >= 0) {
    return siteIds.baidu;
  } else {
    return siteIds.tv;
  }
}

function getValidElement(/*element query function list*/) {
  var args = Array.prototype.slice.call(arguments); // turn to array obj
  var ret;
  for (var index in arguments) {
    ret = arguments[index]();
    if (ret && ret instanceof Element) {
      return ret;
    }
  }
  return undefined;
}

var queryMap = (function () {
  var queryMap = {};
  queryMap[siteIds.iqiyi] =    function() {
    return document.getElementsByClassName('m-video-player')[0];
  };
  queryMap[siteIds.acfun] =    function() {
    return document.getElementsByClassName('block-player')[0];
  };
  queryMap[siteIds.bilibili] = function() {
    return getValidElement(
      function() { return document.querySelector('.player-container'); },
      function() { return document.querySelector('.live-over'); },
      function() { return document.querySelector('.player-ctnr'); }
    );
  };
  queryMap[siteIds.mgtv] =     function() {
    return document.getElementsByClassName('video-area')[0];
  };
  queryMap[siteIds.sohu] =     function() {
    return document.getElementsByClassName('x-cover-playbtn-wrap')[0];
  };
  queryMap[siteIds.letv] =     function() {
    return document.getElementsByClassName('hv_box_mb')[0];
  };
  queryMap[siteIds.qq] =       function() {
    return getValidElement(
      function() { return document.querySelector('.site_player_inner'); },
      function() { return document.getElementById('2016_player'); }
    );
  };
  queryMap[siteIds.pptv] =     function() {
    document.getElementsByClassName('playbox')[0].style.position='relative';
    return document.getElementsByClassName('playbox')[0];
  };
  queryMap[siteIds.youku] =    function() {
    return getValidElement(
      function() {
        var ele = document.querySelector('.video');
        if (ele) ele.style.position = 'relative';
        return ele;
      },
      function() {
        return document.getElementsByClassName('x-video-button')[0];
      }
    );
  };
  queryMap[siteIds.baidu] =    function() {
    return getValidElement(
      function() { return document.querySelector('.video-thumb-outer>.video-thumb-inner-hack'); },
      function() { return document.getElementById('videoPlay').parentNode; }
    );
  };
  queryMap[siteIds.tv] =       function() {
    return document.getElementsByClassName('ui-li-divider')[0];
  };

  return queryMap;
})();

function getzIndexValue(siteId) {
  var zIndexMap = {};
  zIndexMap[siteIds.acfun] = 99;
  zIndexMap[siteIds.iqiyi] = 999;

  return zIndexMap[siteId] || 100001;
}

module.exports = {
  getIdentifier,
  queryMap,
  getzIndexValue,
}
