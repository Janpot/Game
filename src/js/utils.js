var game = game || {};

game.utils = (function () {
  
  var twoPi = 2 * Math.PI;
  
  return {
    
    // Binds a scope to a function
    bind: function (scope, fn) {
      return function () {
        fn.apply(scope, arguments)
      };
    },
  
    angleBetweenVector2: function (v1, v2) {
      // calculates the angle between two vectors, ranges from -pi to pi
      var angle = Math.atan2(v2.y, v2.x) - Math.atan2(v1.y, v1.x);
      if (angle > Math.PI) {
        return angle - twoPi;
      } else if (angle < -Math.PI) {
        return angle + twoPi;
      } else {
        return angle;
      }
    },
    
    isBetweenVectors: function (v1, v2, u) {
      // tests whether vector u lies in the area defined by the angle
      // between v1 and v2
      var angleU = game.Utils.angleBetweenVector2(v1, u);
      var angleVectors = game.Utils.angleBetweenVector2(v1, v2);
      return angleVectors > 0 ? 0 < angleU && angleU < angleVectors : angleVectors < angleU && angleU < 0;
    },
    
    intersectXYPlane: function (ray) {
      var t = - ray.origin.z / ray.direction.z;
      var x = ray.origin.x + ray.direction.x * t;
      var y = ray.origin.y + ray.direction.y * t;
      return new THREE.Vector2(x, y);
    },
    
    midPoint: function (P1, P2) {
      return new THREE.Vector2().sub(P2, P1).multiplyScalar(0.5).addSelf(P1);
    },
    
    perpendicular: function (v) {
      return new THREE.Vector2(-v.y, v.x);
    },
    
    angleSignBetween: function (v1, v2) {
      // calculates sign of the angle between two vectors, -1, 0 or 1
      var dot = v2.dot(game.utils.perpendicular(v1));
      if (dot === 0) {
        return 0;
      } else {
        return dot > 0 ? 1 : -1;
      };
    }
  
  }
  
}) ();