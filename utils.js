

var getViewportScale = (function () {
  var scale = undefined;
  return function() {
    if (scale) {
      return scale;
    }
    var viewport = document.querySelector('meta[name="viewport"]');
    scale = 1;
    if (viewport && viewport.content) {
      var matchResult = viewport.content.match(/initial-scale=([0-9]?\.?[0-9]?)/);
      if (matchResult && matchResult[1] == '0.5') {
        scale = 0.5;
      }
    }
    return scale;
  }
})();

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

function cloneAElement(aElement) {
  var spanEle = document.createElement('span');
  spanEle.className = aElement.className;
  spanEle.id = aElement.id;
  spanEle.innerHTML = aElement.innerHTML;
  return spanEle;
}

function replaceAElement(parentEle) {
  var subAElements = parentEle.querySelectorAll('a');
  for (var i = 0; i < subAElements.length; i++) {
    (function(element) {
      parentEle.replaceChild(cloneAElement(element), element);
    })(subAElements[i]);
  }
  return parentEle;
}

/* 拷贝元素，移除事件 */
function cloneAndReplaceElement(element) {
  var cloneEle;
  if (element.tagName.toLowerCase() == 'a') {
    cloneEle = cloneAElement(element);
  } else {
    cloneEle = element.cloneNode(true);
  }

  element.parentNode.replaceChild(cloneEle, element);
  replaceAElement(cloneEle);
  return cloneEle;
}

module.exports = {
  getViewportScale,
  getValidElement,
  waitElement,
  pipeline,
  cloneAndReplaceElement,
}

