

var getViewportScale = (function () {
  var scale = undefined;
  return function() {
    if (scale) {
      return scale;
    }
    var viewport = document.querySelector('meta[name="viewport"]');
    scale = 1;
    if (viewport && viewport.content) {
      if (viewport.content.includes('initial-scale=0.5')) {
        scale = 2;
      } else if (viewport.content.includes('initial-scale=0.3')) {
        scale = 3
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
    if (ele instanceof Element) {
      callback(ele);
    } else if (ele instanceof Array && ele.length > 0) {
      ele.map((element)=>element && callback(element));
    } else {
      setTimeout(timeoutFn, interval);
    }
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
  var spanEle = document.createElement('a');
  spanEle.className = aElement.className;
  spanEle.id = aElement.id;
  spanEle.innerHTML = aElement.innerHTML;
  spanEle.style.cssText = aElement.style.cssText; /* copy inline style */
  return spanEle;
}

function replaceAElement(parentEle) {
  var subAElements = parentEle.querySelectorAll('a');
  for (var i = 0; i < subAElements.length; i++) {
    (function(element) {
      element.parentNode.replaceChild(cloneAElement(element), element);
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
    replaceAElement(cloneEle);
  }

  element.parentNode.replaceChild(cloneEle, element);
  return cloneEle;
}

/* 传入的参数，转成一个数组 */
function flatten() {
  var array = [];
  for(var i=0; i<arguments.length; i++) {
    if (!arguments[i]) continue;

    if (arguments[i].length) {
      for (var j = 0; j<arguments[i].length; j++) {
        array.push(arguments[i][j]);
      }
    } else {
      array.push(arguments[i]);
    }
  }
  return array;
}

module.exports = {
  getViewportScale,
  getValidElement,
  waitElement,
  pipeline,
  cloneAndReplaceElement,
  flatten,
}

