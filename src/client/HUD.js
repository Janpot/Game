var GameObject = require('../shared/GameObject');

var HUD;
module.exports = HUD = function (factory, player) {
  GameObject.call(this, factory);
  
  this.player = player;
  this.domElement = document.createElement('div');
  this.domElement.style.cssText = [
    'position: absolute', 
    'bottom: 0px',
    'right: 0px',
    'padding: 3px',
    'background-color: white',
    'font-family: Helvetica, Arial, sans-serif',
    'font-size: 24px',
    'font-weight: bold', 
    'line-height: 15px'
  ].join('; ');
  
  this.text = document.createTextNode('HP: ' + this.player.health);
  this.domElement.appendChild(this.text);
};

HUD.prototype = Object.create(GameObject.prototype);

HUD.prototype.initialize = function (game) {
  GameObject.prototype.initialize.call(this, game);
  
  
};

HUD.prototype.render = function (delta, now) {
  GameObject.prototype.render.call(this, delta, now);
  
  this.text.data = 'HP: ' + this.player.health;
};