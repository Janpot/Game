var Player = require('../shared/Player');
var utils = require('../shared/utils');
var dynamics = require('../shared/dynamics');

var ServerPlayer = module.exports = function (id, factory, cfg) {
  Player.call(this, id, factory, cfg);
  
};

ServerPlayer.prototype = Object.create(Player.prototype);

ServerPlayer.prototype.update = function(delta, now) {
  Player.prototype.update.call(this, delta, now);
  
  if (this.gun.firing) {
    var s = undefined;
    var victim = undefined;
    for (var i = 0; i < this.game.players.length; i++) {
      var enemy = this.game.players[i];
      if (enemy !== this) {
        var pastState = enemy.stateBuffer.get(now);
        var sEnemy = dynamics.collidePointCircle(this.gun.shot.origin, this.gun.shot.track, pastState.position, enemy.boundingRadius);
        if (sEnemy && (s === undefined || s > sEnemy)) {
          s = sEnemy;
          victim = enemy;
        }
      }
    }
    
    if (victim) {
      victim.health = Math.max(victim.health - 20, 0);
    }
  }
};