'use strict';

var Bird = function(game, x, y, frame) {
    Phaser.Sprite.call(this, game, x, y, 'bird', frame);
    this.anchor.setTo(0.5, 0.5);

    this.animations.add('flap');
    this.animations.play('flap', 12, true);

    this.flapSound = this.game.add.audio('flap');
    this.alive = false;

    this.game.physics.arcade.enableBody(this);
    this.body.allowGravity = false;
};

Bird.prototype = Object.create(Phaser.Sprite.prototype);
Bird.prototype.constructor = Bird;

Bird.prototype.flap = function() {
    if(!this.onGround) {
        this.flapSound.play();
    }
    this.body.velocity.y = -400;
    this.game.add.tween(this).to({ angle: -40 }, 100).start();
};

Bird.prototype.update = function() {
    if(this.angle < 90 && this.alive) {
        this.angle += 2.5;
    }
};

module.exports = Bird;