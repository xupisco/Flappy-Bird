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