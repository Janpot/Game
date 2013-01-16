
  
// Naive implementation of an object pool to reduce garbage collection
var ObjectPool = function () {
  this.objects = [];
  this.allocated = [];
};

ObjectPool.prototype.get = function () {
  for (var i = 0; i < this.allocated.length; i++) {
    if (!this.allocated[i]) {
      this.allocated[i] = true;
      return this.objects[i]
    }
  }
  var idx = this.objects.length;
  var object = {
    $id: idx
  };
  this.objects[idx] = object;
  this.allocated[idx] = true;
  return object;
};


ObjectPool.prototype.release = function (object) {
  this.allocated[object.$id] = false;
};
