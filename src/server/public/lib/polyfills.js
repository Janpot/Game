window.performance = window.performance || {};
window.performance.now = (function() {
  var pageStart = new Date().getTime();
  return performance.now       ||
         performance.mozNow    ||
         performance.msNow     ||
         performance.oNow      ||
         performance.webkitNow ||
         function() { return new Date().getTime() - pageStart; };
})();