(function() {

var tvgHTMLCast = require('./html/tvgCast.html');
var tvgHTMLStatus = require('./html/tvgStatus.html');
var tvgHTMLURLError = require('./html/tvgURLError.html');

var refreshImgData = require('./html/img/refresh.png');
var casticonData = require('./html/img/casticon.png');

var siteMgr = require('./site.manager.js');
var siteId = siteMgr.getIdentifier(location.host);

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
  var zIndex = siteMgr.getzIndexValue(siteId);
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

function waitElement(interval, queryFn, callback) {
  if (queryFn == undefined || callback == undefined) return;
  if (!queryFn instanceof Function) return;
  var timeoutFn = function() {
    var ele = queryFn();
    if (ele && ele instanceof Element) {
      callback(ele);
    } else {
      setTimeout(timeoutFn, interval);
    };
  };
  timeoutFn();
};

function pipeline(/* funs */) { /* 柯里化的管道 */
  var args = Array.prototype.slice.call(arguments); // turn to array obj
  return function(seed) {
    return args.reduce(function(l, r) { return r(l); }, seed);
  }
}

function main() {
  console.log("WebEvent: in main() test =========================");
  if (window.tvgPlayer && document.querySelector(".tvgbg")) {
    console.log("WebEvent: tvgPlayer exist.");
    return;
  }
  var anchorLayout = siteMgr.queryMap[siteId]();
  if (!anchorLayout || anchorLayout.length <= 0) {
    console.log("WebEvent: anchor do not exist.");
    return;
  } else {
    clearInterval(window.tvgcheckTimer);
    console.log("WebEvent: anchor exist.");

    /* init black cover */
    anchorLayout.style.background = 'black';

    window.tvgPlayer = new TVGPlayerCover(anchorLayout);
    QYQD.webEvent(JSON.stringify({event:"tvgPlayerInit"}));

    /* some page refresh did not reload document,
      so re-inject by element checking */
    window.tvgcheckTimer = setInterval(main, 1000);
  }
}

console.log("WebEvent: inject success=================");

/* main */
if (window.tvgPlayer || window.tvgcheckTimer) { /* 不需要重复注入 */
  QYQD.log('re-inject web_refresh.js, just return');
  return;
}

main();

if (!window.tvgPlayer) { /* 创建对象失败，使用定时器重试 */
  window.tvgcheckTimer = setInterval(main.bind(this), 200);
}


/* execption process */

/* bilibili: replace open clicent button to disable refresh page */
waitElement(1000,
  function() {
    return document.querySelector('a.launch-app');
  },
  function(element) { /*  修改元素 */
    if (element instanceof Element && element.tagName.toLowerCase() == 'a') {
      console.log('bilibili: change launch app element');
      var spanEle = document.createElement('span');
      spanEle.className = element.className;
      spanEle.innerHTML = element.innerHTML;
      element.parentNode.replaceChild(spanEle, element);
    }
    return spanEle;
  }
);
})();
