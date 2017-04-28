
var tvgHTMLCast = require('./html/tvgCast.html');
var tvgHTMLStatus = require('./html/tvgStatus.html');
var tvgHTMLURLError = require('./html/tvgURLError.html');

var refreshImgData = require('./html/img/refresh.png');
var casticonData = require('./html/img/casticon.png');

var utils = require('./utils.js');
var siteMgr = require('./site.manager.js');

var thisSiteId = require('./site.id.js').getIdentifier(location.host);

/* style-loader/useable to control injection*/
function injectCSS() {
  var normalCssStyle = require('./html/tvgctrl.less');
  var doubleCssStyle = require('./html/tvgctrl@2x.less');
  var threeCssStyle = require('./html/tvgctrl@3x.less');
  if (utils.getViewportScale() == 2) { /* 1px = 1pixel */
    normalCssStyle.unuse();
    doubleCssStyle.use();
    threeCssStyle.unuse();
  } else if (utils.getViewportScale() == 3) {
    normalCssStyle.unuse();
    doubleCssStyle.unuse();
    threeCssStyle.use();
  } else {
    normalCssStyle.use();
    doubleCssStyle.unuse();
    threeCssStyle.unuse();
  }
}

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
  ele.addEventListener('click', clickCallBack('playErrClick'));
  ele = statusView.querySelector('#casterr');
  ele.addEventListener('click', clickCallBack('castErrClick'));
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
  }, 500);
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

  injectCSS();

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
  var zIndex = siteMgr.getzIndexValue(thisSiteId);
  castView.style.zIndex = zIndex;
  errView.style.zIndex = zIndex;
  statusView.style.zIndex = zIndex;

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

var checkOrigButtontTimer;
var checkCount = 0;

function main() {
  console.log("WebEvent: in main() test =========================");
  if (window.tvgPlayer && document.querySelector(".tvgbg")) {
    console.log("WebEvent: tvgPlayer exist." + checkCount++);
    if (checkOrigButtontTimer) {
      clearInterval(checkOrigButtontTimer);
      checkOrigButtontTimer = undefined;
    }
    return;
  }
  var anchorLayout = siteMgr.queryMap[thisSiteId]();
  if (!anchorLayout || anchorLayout.length <= 0) {
    console.log("WebEvent: anchor do not exist.");
    return;
  } else {
    clearInterval(checkOrigButtontTimer);
    checkOrigButtontTimer = undefined;

    console.log("WebEvent: anchor exist.");

    /* init black cover */
    anchorLayout.style.backgroundColor = '#000';

    window.tvgPlayer = new TVGPlayerCover(anchorLayout);
    QYQD.webEvent(JSON.stringify({event:"tvgPlayerInit"}));

    /* some page refresh did not reload document,
      so re-inject by element checking */
    clearInterval(window.checkTVGPlayerTimer);
    window.checkTVGPlayerTimer = setInterval(main, 1500);
  }
}

console.log("WebEvent: inject success=========================================.");

/* main */
main();
if (!window.tvgPlayer) {
  checkOrigButtontTimer = setInterval(main.bind(this), 200);
}

/* stop auto play */
if (!window.tvg_stopPlayTimer) {
  var video = document.querySelector('video');
  window.tvg_stopPlayTimer = setInterval(function() {
    console.log("----> msg: ", video);
    if (video && video.isplaying) {
      video.pause();
      if (video.webkitExitFullscreen) {
        video.webkitExitFullscreen();
      }
    }
  }, 200);
}

/* execption process */
console.log('apply patches for ' + thisSiteId);
try {
  siteMgr.patchesMap[thisSiteId].map(patchFn=>patchFn());
} catch(err) {
  QYQD.log(err);
}



