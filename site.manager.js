
var getValidElement = require('./utils.js').getValidElement;
var siteIds = require('./site.id.js').siteIds;

var patchesMap = require('./site.patch.js');

var queryMap = (function () {
  var queryMap = {};
  queryMap[siteIds.iqiyi] =    function() {
	  return getValidElement(
		function() {
			var ele = document.getElementsByClassName('m-video-player')[0];
			if (ele) return ele;
		},
		function() {
			return document.getElementsByClassName('m-live-video-player')[0];
		},
	  );
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
    return document.getElementsByClassName('player-view')[0];
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
        var ele = document.querySelector('.ykplayer');
        if (ele) return ele;
      },
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
  siteIds,
  queryMap,
  getzIndexValue,
  patchesMap,
}
