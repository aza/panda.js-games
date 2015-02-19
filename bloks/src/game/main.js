game.module(
    'game.main'
)
.require(
    'game.assets',
    'game.ui',
    'game.objects',
    'game.particles'
)
.body(function() {

game.STATS = {};

game.updateStorage = function() {
    game.storage.set('highScore', game.STATS.HIGHSCORE);
    game.storage.set('playTimes', game.STATS.PLAYTIMES);
    game.storage.set('newHighScores', game.STATS.NEWHIGHSCORES);
    game.storage.set('killedBlocks', game.STATS.KILLEDBLOCKS);
    game.storage.set('killedBombs', game.STATS.KILLEDBOMBS);
    game.storage.set('killedClocks', game.STATS.KILLEDCLOCKS);
};

game.createScene('Game', {
    started: false,
    ended: false,
    specialsCounter: 0,

    init: function() {
        game.Settings = {
            TIME: 60 * 1000,
            SPECIALS: 40,
            SCORE: 0
        };

        this.grid = new game.Grid();
        this.addObject(this.grid);

        this.healthBar = new game.HealthBar();
        this.addObject(this.healthBar);

        this.entityContainer = new game.Container();
        this.stage.addChild(this.entityContainer);

        this.scoreText = new game.BitmapText('00000', { font: 'Pixel' });
        this.scoreText.position.x = game.system.width / 2 - this.scoreText.textWidth / 2;
        this.scoreText.position.y = 751 + 32;
        this.scoreText.visible = false;
        this.stage.addChild(this.scoreText);

        this.statusText = new game.StatusText();
        this.statusText.setText('CONNECT 3 OR MORE');

        this.timer = new game.Timer();
        this.timer.pause();
    },

    start: function() {
        var me = this;
        game.audio.playSound('count');
        this.statusText.setText('READY', function() {
            game.audio.playSound('count');
            me.statusText.setText('SET', function() {
                game.audio.playSound('count');
                game.scene.started = true;
                game.scene.timer.resume();
                game.audio.playMusic('music');
                me.statusText.setText('GO!', function() {
                    game.scene.statusText.hide();
                    game.scene.scoreText.visible = true;
                });
            });
        });
    },

    endGame: function() {
        game.audio.stopMusic();
        game.audio.playSound('gameover');
        this.ended = true;
        this.timer.pause();
        this.grid.fadeOut();
        this.removeObject(this.healthBar);
        
        if (parseInt(game.STATS.HIGHSCORE) < game.Settings.SCORE) {
            this.statusText.setText('NEW HIGHSCORE');
            this.statusText.sprite.position.y = (game.system.height - 100).round(4);
            this.statusText.blink();

            game.STATS.HIGHSCORE = game.Settings.SCORE;
        }

        game.STATS.PLAYTIMES++;
        game.updateStorage();
    },

    showRestartButton: function() {
        new game.Button(game.system.width / 2 - 160, 400, 'button2.png', function() {
            game.system.setScene('Game');
        });
    },

    mousedown: function(event) {
        this.isMouseDown = true;

        var block = this.grid.getBlockFromMousePos(event.global.x, event.global.y);
        if (block) block.touchstart();
    },

    mouseup: function() {
        this.isMouseDown = false;

        if (this.grid.selection.length > 0) {
            this.grid.selection[0].touchend();
        }
    },

    mousemove: function(event) {
        if (this.isMouseDown) {
            var block = this.grid.getBlockFromMousePos(event.global.x, event.global.y);
            if (block) block.touchmove(event);
        }
    },

    addScore: function(count) {
        game.audio.playSound('score');

        var current = parseInt(this.scoreText.text, 10);
        
        var newScore = current + count;

        var text = newScore.toString();
        
        var zeros = 5 - text.length;
        for (var i = 0; i < zeros; i++) {
            text = '0' + text;
        };

        this.scoreText.setText(text);
        this.scoreText.updateTransform();
        this.scoreText.position.x = game.system.width / 2 - this.scoreText.textWidth / 2;
    },

    back: function() {
        if (this.ended && !this.grid.fading && !this.fader.fading) this.restart();
    },

    restart: function() {
        if (!this.ended || this.fader.fading) return;

        this.music.stop();
        this.fader.fadeOut(function() {
            game.system.setGame(SceneTitle);
        });
    },

    newgame: function() {
        if (!this.ended || this.fader.fading) return;

        this.music.stop();
        this.fader.fadeOut(function() {
            game.system.setGame(SceneGame);
        });
    },

    getPlaytimes: function() {
        return game.STATS.PLAYTIMES;
    },

    getScore: function() {
        return game.Settings.SCORE;
    }
});

game.createScene('Title', {
    init: function() {
        game.STATS.HIGHSCORE = game.storage.get('highScore', 0);
        game.STATS.PLAYTIMES = game.storage.get('playTimes', 0);
        game.STATS.NEWHIGHSCORES = game.storage.get('newHighScores', 0);
        game.STATS.KILLEDBLOCKS = game.storage.get('killedBlocks', 0);
        game.STATS.KILLEDBOMBS = game.storage.get('killedBombs', 0);
        game.STATS.KILLEDCLOCKS = game.storage.get('killedClocks', 0);

        var logo = new game.Logo(204);
        var button = new game.Button(game.system.width / 2 - 160, 400, 'button1.png', this.startGame.bind(this), true);
        
        var highscoreText = new game.BitmapText('HIGHSCORE: ' + game.STATS.HIGHSCORE.toString(), { font: 'Pixel' });
        highscoreText.position.x = game.system.width / 2 - highscoreText.textWidth / 2;
        highscoreText.position.y = (game.system.height - 100).round(4);
        highscoreText.addTo(this.stage);

        game.audio.playMusic('music2');

        this.fader = new game.Fader();
    },

    startGame: function() {
        this.fader.fadeOut(function() {
            game.system.setScene('Game');
        });
    }
});

});
