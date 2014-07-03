'use strict';

var Ground = function(game, x, y, width, height, frame) {
    Phaser.TileSprite.call(this, game, x, y, width, height, 'ground');
    this.game.physics.arcade.enableBody(this);

    this.autoScroll(-200, 0);
    this.body.allowGravity = false;
    this.body.immovable = true;
};

Ground.prototype = Object.create(Phaser.TileSprite.prototype);
Ground.prototype.constructor = Ground;

Ground.prototype.update = function() {

};

module.exports = Ground;