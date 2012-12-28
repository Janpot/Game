var twoD = require('./twoD');

var twoPi = 2 * Math.PI;

var utils = module.exports = {};

// Binds a scope to a function
utils.bind = function (scope, fn) {
  return function () {
    fn.apply(scope, arguments)
  };
};

utils.angleBetweenVector2 = function (v1, v2) {
  // calculates the angle between two vectors, ranges from -pi to pi
  var angle = Math.atan2(v2.y, v2.x) - Math.atan2(v1.y, v1.x);
  if (angle > Math.PI) {
    return angle - twoPi;
  } else if (angle < -Math.PI) {
    return angle + twoPi;
  } else {
    return angle;
  }
};

utils.isBetweenVectors = function (v1, v2, u) {
  // tests whether vector u lies in the area defined by the angle
  // between v1 and v2
  var angleU = utils.angleBetweenVector2(v1, u);
  var angleVectors = utils.angleBetweenVector2(v1, v2);
  return angleVectors > 0 ? 0 < angleU && angleU < angleVectors : angleVectors < angleU && angleU < 0;
};

utils.intersectXYPlane = function (ray) {
  var t = - ray.origin.z / ray.direction.z;
  var x = ray.origin.x + ray.direction.x * t;
  var y = ray.origin.y + ray.direction.y * t;
  return new twoD.Vector(x, y);
};

utils.midPoint = function (P1, P2) {
  return new twoD.Vector().sub(P2, P1).multiplyScalar(0.5).addSelf(P1);
};

utils.perpendicular = function (v) {
  return new twoD.Vector(-v.y, v.x);
};

utils.angleSignBetween = function (v1, v2) {
  // calculates sign of the angle between two vectors, -1, 0 or 1
  var dot = v2.dot(utils.perpendicular(v1));
  if (dot === 0) {
    return 0;
  } else {
    return dot > 0 ? 1 : -1;
  };
};

utils.interpolate = function(a, b, fraction) {
  return (a + (b - a) * fraction);
};





