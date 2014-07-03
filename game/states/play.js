'use strict';

var Bird = require('../prefabs/bird');
var Ground = require('../prefabs/ground');
var Pipe = require('../prefabs/pipe');
var PipeGroup = require('../prefabs/pipeGroup');
var Scoreboard = require('../prefabs/scoreboard');

function Play() {}

Play.prototype = {
    create: function() {
        this.score = 0;

        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.physics.arcade.gravity.y = 1200;
        this.background = this.game.add.sprite(0, 0, 'background');

        this.bird = new Bird(this.game, 100, this.game.world.centerY);
        this.game.add.existing(this.bird);

        this.pipes = this.game.add.group();

        this.ground = new Ground(this.game, 0, 400, 335, 112);
        this.game.add.existing(this.ground);

        // Keys
        this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);

        this.flapKey = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.flapKey.onDown.addOnce(this.startGame, this);
        this.flapKey.onDown.add(this.bird.flap, this.bird);

        this.game.input.onDown.addOnce(this.startGame, this);
        this.game.input.onDown.add(this.bird.flap, this.bird);

        this.instructionsGroup = this.game.add.group();
        this.instructionsGroup.add(this.game.add.sprite(this.game.world.centerX, 100, 'getReady'));
        this.instructionsGroup.add(this.game.add.sprite(this.game.world.centerX, 325, 'instructions'));
        this.instructionsGroup.setAll('anchor.x', 0.5);
        this.instructionsGroup.setAll('anchor.y', 0.5);

        this.scoreText = this.game.add.bitmapText(this.game.world.centerX, 10, 'flappyfont', this.score.toString(), 24);
        this.scoreText.visible = false;

        this.scoreSound = this.game.add.audio('score');
        this.pipeHitSound = this.game.add.audio('pipeHit');
        this.groundHitSound = this.game.add.audio('groundHit');
    },

    startGame: function() {
        this.bird.body.allowGravity = true;
        this.bird.alive = true;
        this.scoreText.visible = true;

        // Pipes timer
        this.pipeGenerator = this.game.time.events.loop(Phaser.Timer.SECOND * 1.25, this.generatePipes, this);
        this.pipeGenerator.timer.start();

        var tween = this.game.add.tween(this.instructionsGroup).to({
            alpha: 0
        }, 350, Phaser.Easing.Linear.NONE, true);

        tween.onComplete.add(function(t) {
            t.destroy();
        }, this);
    },

    generatePipes: function() {
        var pipeY = this.game.rnd.integerInRange(-100, 100);
        var pipeGroup = this.pipes.getFirstExists(false);

        if (!pipeGroup) {
            pipeGroup = new PipeGroup(this.game, this.pipes);
        }

        pipeGroup.reset(this.game.width + 20, pipeY);
    },

    update: function() {
        this.game.physics.arcade.collide(this.bird, this.ground, this.deathHandler, null, this);
        this.pipes.forEach(function(pipeGroup) {
            this.checkScore(pipeGroup);
            this.game.physics.arcade.collide(this.bird, pipeGroup, this.deathHandler, null, this);
        }, this);
    },

    checkScore: function(pipeGroup) {
        if(pipeGroup.exists && !pipeGroup.hasScored && pipeGroup.topPipe.world.x <= this.bird.world.x) {
            pipeGroup.hasScored = true;
            this.score++;
            this.scoreText.setText(this.score.toString());
            this.scoreSound.play();
        }
    },

    deathHandler: function(bird, enemy) {
        if(enemy instanceof Ground && !this.bird.onGround) {
            this.groundHitSound.play();
        } else if (enemy instanceof Pipe){
            this.pipeHitSound.play();
        }
        this.scoreboard = new Scoreboard(this.game);
        this.game.add.existing(this.scoreboard);
        this.scoreboard.show(this.score);
        this.bird.onGround = true;

        this.bird.kill();
        this.pipes.callAll('stop');
        this.pipeGenerator.timer.stop();
        this.ground.stopScroll();
    },

    shutdown: function() {
        this.game.input.keyboard.removeKey(Phaser.Keyboard.SPACEBAR);
        this.bird.destroy();
        this.pipes.destroy();
        this.scoreboard.destroy();
    },
};

module.exports = Play;
