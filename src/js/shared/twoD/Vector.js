// this is basically a copy of the three.js Vector2 class

var Vector = module.exports = function (x, y) {
  this.x = x || 0;
  this.y = y || 0;
};

Vector.prototype.set = function (x, y) {
  this.x = x;
  this.y = y;

  return this;
};

Vector.prototype.copy = function (v) {
  this.x = v.x;
  this.y = v.y;

  return this;
};

Vector.prototype.add = function (a, b) {
  this.x = a.x + b.x;
  this.y = a.y + b.y;

  return this;
};

Vector.prototype.addSelf = function (v) {
  this.x += v.x;
  this.y += v.y;

  return this;
};

Vector.prototype.sub = function (a, b) {
  this.x = a.x - b.x;
  this.y = a.y - b.y;

  return this;
};

Vector.prototype.subSelf = function (v) {
  this.x -= v.x;
  this.y -= v.y;

  return this;
};

Vector.prototype.multiplyScalar = function (s) {
  this.x *= s;
  this.y *= s;

  return this;
};

Vector.prototype.divideScalar = function (s) {
  if (s) {
    this.x /= s;
    this.y /= s;
  } else {
    this.set(0, 0);
  }

  return this;
};

Vector.prototype.negate = function() {
  return this.multiplyScalar(- 1);
};

Vector.prototype.dot = function (v) {
  return this.x * v.x + this.y * v.y;
};

Vector.prototype.lengthSq = function () {
  return this.x * this.x + this.y * this.y;
};

Vector.prototype.length = function () {
  return Math.sqrt(this.lengthSq());
};

Vector.prototype.normalize = function () {
  return this.divideScalar(this.length());
};

Vector.prototype.distanceTo = function (v) {
  return Math.sqrt(this.distanceToSquared(v));
};

Vector.prototype.distanceToSquared = function (v) {
  var dx = this.x - v.x, dy = this.y - v.y;
  return dx * dx + dy * dy;
};

Vector.prototype.setLength = function (l) {
  return this.normalize().multiplyScalar(l);
};

Vector.prototype.lerpSelf = function (v, alpha) {
  this.x += (v.x - this.x) * alpha;
  this.y += (v.y - this.y) * alpha;

  return this;
};

Vector.prototype.equals = function(v) {
  return ((v.x === this.x) && (v.y === this.y));
};

Vector.prototype.clone = function () {
  return new Vector(this.x, this.y);
};