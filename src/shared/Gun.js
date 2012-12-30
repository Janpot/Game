var GameObject = require('./GameObject');

var Gun;
module.exports = Gun = function (game, player) {
  GameObject.call(this, game);
  
  this.player = player;
  
  this.triggerPulled = false;

  this.firingRate = 150; // ms
  this.timeOfNextShot = 0;
  
  this.shot = false;
};

Gun.prototype = Object.create(GameObject.prototype);

Gun.prototype.update = function (delta, now) {
  
  if (!this.triggerPulled || now < this.timeOfNextShot) {
    this.shot = false;
  } else if (this.triggerPulled) {
    this.shot = true;
    this.timeOfNextShot = now + this.firingRate;
  }
  
  if (this.shot) {
    // TODO(Jan): this won't work on the server because addBullet only exists on the ClientGame
    // introduce some sort of factory to create environment specific objects on the server and client
    // Must be done before running update loop on the server!
    this.game.addBullet(this.player.position.clone(), this.player.lookDir.clone());
  }
  
};