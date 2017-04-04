
var tvgHTMLCast = require('./html/tvgCast.html');
var tvgHTMLStatus = require('./html/tvgStatus.html');
var tvgHTMLURLError = require('./html/tvgURLError.html');

var refreshImgData = require('./html/img/refresh.png');
var casticonData = require('./html/img/casticon.png');
var tvImgData = require('./html/img/tv.png');

// outapp icon
var outappIcon = {
  letv: require('./html/img/src_letv.png'),
  tencent: require('./html/img/src_tencent.png'),
  pptv: require('./html/img/src_pptv.png'),
  youku: require('./html/img/src_youku.png'),
  sohu: require('./html/img/src_sohu.png')
}

function clickCallBack(eventName) {
  return function(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    console.log('javascript: WebEvent Triggered: ' + eventName);
    QYQD.log('WebEvent Triggered: ' + eventName);
    QYQD.webEvent(JSON.stringify({event:eventName}));
  }
}

function initCastView(castView) {
  castView.addEventListener('click', clickCallBack('castVideo'));

  var jumpEle = castView.querySelector('#tvgjumpToApp');
  if (jumpEle == undefined) {
    throw new Error('jump to app element not exist');
    return;
  }

  jumpEle.addEventListener('click', clickCallBack('jumpToApp'));
}

function initCastStatusView(statusView) {
  statusView.addEventListener('click', function(event){
    event.preventDefault();
    event.stopImmediatePropagation();
  });

  var ele = statusView.querySelector('#switch-btn');
  ele.addEventListener('click', clickCallBack('switchDevice'));
  ele = statusView.querySelector('#playerr');
  ele.addEventListener('click', clickCallBack('refreshWeb'));
  ele = statusView.querySelector('#casterr');
  ele.addEventListener('click', clickCallBack('refreshWeb'));
}

function initURLErrorView(errView) {
  errView.addEventListener('click', clickCallBack('refreshWeb'));
}

function updateRefreshIcon(documentRef, refreshBase64Data) {
  if (refreshBase64Data == undefined) {
    throw new Error('refresh icon data is null');
    return;
  }

  var refreshImgs = documentRef.getElementsByClassName('tvgRefresh');
  for (var i = 0; i < refreshImgs.length; i++) {
    refreshImgs[i].src = refreshBase64Data;
  }
}

function startCastingAnimation(statusView) {
  var spanElement = statusView.querySelector('#casting>span');
  var loadDots = ['', '.', '..', '...'];
  var idx = 0;
  setInterval(function() {
    spanElement.innerHTML = loadDots[idx++];
    if (idx >= 4) {
      idx = 0;
    }
  }, 100);
}

function createElement(doc, htmlStr) {
  var element = doc.createElement('div');
  if (!element) throw new Error("create error");
  element.innerHTML = htmlStr;
  return element.firstChild;
}

/*
 * event send to native:
 *  castVideo 投屏
 *  jumpToApp 跳到第三方app
 *  switchDevice 切换设备
 *  refreshWeb 刷新页面
 */
function TVGPlayerCover(coverRef) {
  var documentRef = coverRef.ownerDocument;

  console.log('create view and append as child');
  var castView = createElement(documentRef, tvgHTMLCast);
  var errView = createElement(documentRef, tvgHTMLURLError);
  var statusView = createElement(documentRef, tvgHTMLStatus);
  coverRef.appendChild(castView);
  coverRef.appendChild(errView);
  coverRef.appendChild(statusView);

  /* insert base64 img */
  updateRefreshIcon(documentRef, refreshImgData);
  startCastingAnimation(statusView);

  /* add click event */
  initCastView(castView);
  initURLErrorView(errView);
  initCastStatusView(statusView);

  function hideAllView() {
    castView.style.visibility = 'hidden';
    statusView.style.visibility = 'hidden';
    errView.style.visibility = 'hidden';
  }

  /* outapp 站外投屏 inapp 站内投屏 */
  function changeCastViewStatus(status/*outapp, inapp*/, srcName) {
    var display = 'none';
    if (status == 'outapp') {
      display = 'block';
    }
    if (srcName && typeof srcName == 'string' && srcName.length) {
      var base64Data = outappIcon[srcName];
      if (base64Data) {
        castView.querySelector('#tvgSrcIcon').src = base64Data;
      } else {
        console.log('icon not found: ' + srcName);
      }
    }
    castView.querySelector('#tvgjumpToApp').style.display = display;
  }

  hideAllView();

  return {
    castView, errView, statusView, /* maybe not need */
    switchToView: function(viewName, status/*option*/, addtional/*optional data*/) {
      if (typeof viewName == 'string' && this.hasOwnProperty(viewName)) {

        if (viewName == 'statusView') {
          if (status == undefined) throw new Error('switch to statusView, need init status');
          this.changeStatus(status, addtional);
        }
        if (viewName == 'castView' && status) {
          changeCastViewStatus(status, addtional);
        }

        hideAllView();
        this[viewName].style.visibility = 'visible';
      } else {
        throw new Event('switch to unkonwn view: ' + viewName);
      }
    },
    switchToCastView: function(status/*outapp, inapp(default)*/, srcName/*outapp need*/) {
      this.switchToView('castView', status, srcName);
    },
    switchToURLErrView: function() {
      this.switchToView('errView');
    },
    switchToStatusView: function(status, deviceName) {
      this.switchToView('statusView', status, deviceName);
    },
    changeStatus:function(status/*playing, casting, playerr, casterr*/, deviceName) {
      if (typeof status != 'string') throw new Error('status error: '+status);

      var statusDiv = this.statusView.querySelector('#'+status);
      if (statusDiv == undefined) throw new Error('unknown status: '+status);
      if (this.currentStatus) {
        this.currentStatus.style.display = 'none';
      }
      statusDiv.style.display = 'block';
      this.currentStatus = statusDiv;

      this.updateDeviceName(deviceName);
    },
    updateDeviceName:function(deviceName) {
      /* update device name if provide */
      if (deviceName && typeof deviceName == 'string' && deviceName.length) {
        var devNameDiv = this.statusView.querySelector('#devicename');
        devNameDiv.innerText = deviceName;
      }
    },
    hideSwitchBtn: function(hidden/*YES or NO stringValue*/) {
      this.statusView.querySelector('#switch-btn').style.display = hidden == 'YES'?'none':'block';
    }
  }
}

// webpack 会打包css
//var tvgCss = require('./output/tvgcss.js');
//function insertStyleSheets(cssString) {
//var css = documentRef.createElement("style");
//css.type = "text/css";
//css.innerHTML = cssString;
//document.body.appendChild(css);
//}
//insertStyleSheets(tvgCss);

//if (!QYQD) {
  //throw new Error('QYQD not dfined');
//}

function getAnchorLayout() {
  var href = window.location.host;
  if(href.search(".iqiyi.com") >= 0) {
    return document.getElementsByClassName('m-video-player')[0];
  } else if(href.search(".acfun.") >= 0) {
    return document.getElementsByClassName('block-player')[0];
  } else if(href.search(".bilibili.com") >= 0) {
    console.log("javascript: in bilibili.");
    var playerContainer = document.getElementsByClassName('player-container');
    if (playerContainer == null || playerContainer.length == 0) {
      playerContainer = document.getElementsByClassName('live-over');
      if(playerContainer == null || playerContainer.length == 0) playerContainer = document.getElementsByClassName('player-ctnr');
      if (playerContainer == null || playerContainer.length == 0) {
        return;
      }
    }
    return playerContainer[0];
  } else if(href.search('.mgtv.com') >= 0) {
    console.log("javascript: in mgtv.");
    return document.getElementsByClassName('video-area')[0];
  } else if(href.search('.sohu.') >= 0) {
    return document.getElementsByClassName('x-cover-playbtn-wrap')[0];
  } else if(href.search('.le.') >= 0) {
    return document.getElementsByClassName('hv_box_mb')[0];
  } else if(href.search('.v.qq.') >= 0) {
    return document.getElementsByClassName('site_player_inner')[0];
  } else if(href.search('.pptv.') >= 0) {
    document.getElementsByClassName('playbox')[0].style.position='relative';
    return document.getElementsByClassName('playbox')[0];
  } else if(href.search('.youku.') >= 0) {
    console.log("javascript: in youku.");
    if(document.getElementsByClassName('x-video-button')[0] == null) {
      console.log("javascript: no x-video-button");
      document.getElementsByClassName('video')[0].style.position = 'relative';
      return document.getElementsByClassName('video')[0];
    } else {
      console.log("javascript: has x-video-button");
      return document.getElementsByClassName('x-video-button')[0];
    }
  } else if(href.search('.baidu.') >= 0) {
    var ele = document.querySelector('.video-thumb-outer>.video-thumb-inner-hack');
    if (ele) {
      return ele;
    } else if(document.getElementById('videoPlay') != null) {
      return document.getElementById('videoPlay').parentNode;
    }
  } else {
	  return document.getElementsByClassName('ui-li-divider')[0];
  }
}

var checkOrigButtontTimer;

function main() {
  if (window.tvgPlayer && window.tvgPlayer.castView.ownerDocument) {
    QYQD.log('tvgPlayer exist');
    clearInterval(checkOrigButtontTimer);
    return;
  }
  var anchorLayout = getAnchorLayout();
  if (!anchorLayout || anchorLayout.length <= 0) {
    console.log("javascript: in start");
    return;
  } else {
    clearInterval(checkOrigButtontTimer);
    console.log("javascript: anchor exist.");

    /* init black cover */
    anchorLayout.style.background = 'black';

    window.tvgPlayer = new TVGPlayerCover(anchorLayout);
    QYQD.webEvent(JSON.stringify({event:"tvgPlayerInit"}));
  }
}

main();

/* main */
checkOrigButtontTimer = setInterval(main.bind(this), 200);

