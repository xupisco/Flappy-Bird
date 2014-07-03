(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

//global variables
window.onload = function () {
  var game = new Phaser.Game(288, 505, Phaser.AUTO, 'flappy-bird-reborn');

  // Game States
  game.state.add('boot', require('./states/boot'));
  game.state.add('gameover', require('./states/gameover'));
  game.state.add('menu', require('./states/menu'));
  game.state.add('play', require('./states/play'));
  game.state.add('preload', require('./states/preload'));
  

  game.state.start('boot');
};
},{"./states/boot":7,"./states/gameover":8,"./states/menu":9,"./states/play":10,"./states/preload":11}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
'use strict';

var Pipe = function(game, x, y, frame) {
    Phaser.Sprite.call(this, game, x, y, 'pipe', frame);
    this.anchor.setTo(0.5, 0.5);
    this.game.physics.arcade.enableBody(this);

    this.body.allowGravity = false;
    this.body.immovable = true;
};

Pipe.prototype = Object.create(Phaser.Sprite.prototype);
Pipe.prototype.constructor = Pipe;

Pipe.prototype.update = function() {

};

module.exports = Pipe;
},{}],5:[function(require,module,exports){
'use strict';

var Pipe = require('./pipe');

var PipeGroup = function(game, parent) {
    Phaser.Group.call(this, game, parent);
    
    this.topPipe = new Pipe(this.game, 0, 0, 0);
    this.add(this.topPipe);

    this.bottomPipe = new Pipe(this.game, 0, 440, 1);
    this.add(this.bottomPipe);

    this.hasScored = false;

    this.setAll('body.velocity.x', -200);
};

PipeGroup.prototype = Object.create(Phaser.Group.prototype);
PipeGroup.prototype.constructor = PipeGroup;

PipeGroup.prototype.reset = function(x, y) {
    this.topPipe.reset(0, 0);
    this.bottomPipe.reset(0, 440);

    this.x = x;
    this.y = y;

    this.setAll('body.velocity.x', -200);
    this.hasScored = false;

    this.exists = true;
};

PipeGroup.prototype.checkWorldBounds = function() {
    if(!this.topPipe.inWorld) {
        this.exists = false;
    }
};

PipeGroup.prototype.update = function() {
    this.checkWorldBounds();
};

module.exports = PipeGroup;

},{"./pipe":4}],6:[function(require,module,exports){
'use strict';

var Scoreboard = function(game) {
    var gameover;
    Phaser.Group.call(this, game);

    gameover = this.create(this.game.world.centerX, 100, 'gameover');
    gameover.anchor.setTo(0.5, 0.5);

    this.scoreboard = this.create(this.game.world.centerX, 200, 'scoreboard');
    this.scoreboard.anchor.setTo(0.5, 0.5);

    this.scoreText = this.game.add.bitmapText(this.scoreboard.width, 180, 'flappyfont', '', 18);
    this.bestScoreText = this.game.add.bitmapText(this.scoreboard.width, 230, 'flappyfont', '', 18);

    this.startButton = this.game.add.button(this.game.world.centerX, 300, 'startButton', this.startClick, this);
    this.startButton.anchor.setTo(0.5, 0.5);
    this.startButton.input.useHandCursor = true;

    this.add(this.scoreText);
    this.add(this.bestScoreText);
    this.add(this.startButton);

    this.x = 0;
    this.y = this.game.height;
};

Scoreboard.prototype = Object.create(Phaser.Group.prototype);
Scoreboard.prototype.constructor = Scoreboard;

Scoreboard.prototype.show = function(score) {
    var medal, bestScore;
    this.scoreText.setText(score.toString());

    if(!!localStorage) {
        bestScore = localStorage.getItem('bestScore');
        if(!bestScore || bestScore < score) {
            bestScore = score;
            localStorage.setItem('bestScore', score);
        }
    } else {
        bestScore = 'N/D';
    }

    this.bestScoreText.setText(bestScore.toString());

    if(score >= 10 && score < 20) {
        medal = this.game.add.sprite(-65, 7, 'medals', 1);
        medal.anchor.setTo(0.5, 0.5);
        this.scoreboard.addChild(medal);
    } else if(score >= 20) {
        medal = this.game.add.sprite(-65, 7, 'medals', 0);
        medal.anchor.setTo(0.5, 0.5);
        this.scoreboard.addChild(medal);
    }

    if(medal) {
        var emitter = this.game.add.emitter(medal.x, medal.y, 400);
        this.scoreboard.addChild(emitter);
        emitter.width = medal.width;
        emitter.height = medal.height;

        emitter.makeParticles('particle');

        emitter.setRotation(-100, 100);
        emitter.setXSpeed(0, 0);
        emitter.setYSpeed(0, 0);
        emitter.minParticleScale = 0.25;
        emitter.maxParticleScale = 0.5;
        emitter.setAll('body.allowGravity', false);

        emitter.start(false, 1000, 1000);
    }

    this.game.add.tween(this).to({ y: 0 }, 1000, Phaser.Easing.Bounce.Out, true);
};

Scoreboard.prototype.startClick = function() {
    this.game.state.start('play');
}

Scoreboard.prototype.update = function() {

};

module.exports = Scoreboard;
},{}],7:[function(require,module,exports){
'use strict';

function Boot() {
}

Boot.prototype = {
    preload: function() {
        this.game.global = {
            owner: 'Leandro',
        };

        this.load.image('preloader', 'assets/preloader.gif');
    },

    create: function() {
        this.game.input.maxPointers = 1;
        this.game.stage.backgroundColor = '#3498db';
        this.game.state.start('preload');
    }
};

module.exports = Boot;
},{}],8:[function(require,module,exports){
'use strict';

function GameOver() {}

GameOver.prototype = {
    preload: function() {

    },

    create: function() {
        this.game.stage.backgroundColor = '#000';
        var style = {
            font: '40px Arial',
            fill: '#ffffff',
            align: 'center'
        };
        this.titleText = this.game.add.text(this.game.world.centerX, 100, 'Game Over!', style);
        this.titleText.anchor.setTo(0.5, 0.5);

        this.congratsText = this.game.add.text(this.game.world.centerX, 200, 'You Win!', {
            font: '32px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        this.congratsText.anchor.setTo(0.5, 0.5);

        this.instructionText = this.game.add.text(this.game.world.centerX, 300, 'Click To Play Again', {
            font: '16px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        this.instructionText.anchor.setTo(0.5, 0.5);
    },
    
    update: function() {
        if (this.game.input.activePointer.justPressed()) {
            this.game.state.start('play');
        }
    }
};
module.exports = GameOver;
},{}],9:[function(require,module,exports){
'use strict';

function Menu() {}

Menu.prototype = {
    preload: function() {

    },

    create: function() {
        this.background = this.game.add.sprite(0, 0, 'background');
        this.ground = this.game.add.tileSprite(0, 400, 335, 112, 'ground');
        this.ground.autoScroll(-200, 0);

        this.titleGroup = this.game.add.group();
        this.title = this.game.add.sprite(0, 0, 'title');

        this.bird = this.game.add.sprite(200, 5, 'bird');
        this.bird.animations.add('flap');
        this.bird.animations.play('flap', 12, true)

        this.titleGroup.add(this.title);
        this.titleGroup.add(this.bird);

        this.titleGroup.x = 30;
        this.titleGroup.y = 100;

        this.game.add.tween(this.titleGroup).to({
            y: 115
        }, 350, Phaser.Easing.Linear.NONE, true, 0, 1000, true);

        this.startButton = this.game.add.button(this.game.world.centerX, 300, 'startButton', this.startClick, this);
        this.startButton.anchor.setTo(0.5, 0.5);
        this.startButton.input.useHandCursor = true;
    },

    startClick: function() {
        this.game.state.start('play');
    },

    update: function() {

    }
};

module.exports = Menu;
},{}],10:[function(require,module,exports){
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

},{"../prefabs/bird":2,"../prefabs/ground":3,"../prefabs/pipe":4,"../prefabs/pipeGroup":5,"../prefabs/scoreboard":6}],11:[function(require,module,exports){
'use strict';

function Preload() {
    this.asset = null;
    this.ready = false;
}

Preload.prototype = {
    preload: function() {
        this.asset = this.add.sprite(this.width / 2, this.height / 2, 'preloader');
        this.asset.anchor.setTo(0.5, 0.5);
        this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
        this.load.setPreloadSprite(this.asset);

        this.load.image('background', 'assets/background.png');
        this.load.image('ground', 'assets/ground.png');
        this.load.image('title', 'assets/title.png');
        this.load.image('startButton', 'assets/start-button.png');
        this.load.image('instructions', 'assets/instructions.png');
        this.load.image('getReady', 'assets/get-ready.png');

        // Scoreboard
        this.load.image('scoreboard', 'assets/scoreboard.png');
        this.load.image('gameover', 'assets/gameover.png');
        this.load.spritesheet('medals', 'assets/medals.png', 44, 46, 2);
        this.load.image('particle', 'assets/particle.png');

        this.load.audio('score', 'assets/score.wav');
        this.load.audio('flap', 'assets/flap.wav');
        this.load.audio('pipeHit', 'assets/pipe-hit.wav');
        this.load.audio('groundHit', 'assets/ground-hit.wav');

        this.load.spritesheet('bird', 'assets/bird.png', 34, 24, 3);
        this.load.spritesheet('pipe', 'assets/pipes.png', 54, 320, 2);

        this.load.bitmapFont('flappyfont', 'assets/fonts/flappyfont/flappyfont.png', 'assets/fonts/flappyfont/flappyfont.fnt');
    },

    create: function() {
        this.asset.cropEnabled = false;
    },

    update: function() {
        if ( !! this.ready) {
            this.game.state.start('menu');
        }
    },

    onLoadComplete: function() {
        this.ready = true;
    }
};

module.exports = Preload;
},{}]},{},[1])