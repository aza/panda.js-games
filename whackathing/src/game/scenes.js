game.module(
    'game.scenes'
)
.require(
    'engine.scene'
)
.body(function() {

game.createScene('Main', {
    score: 0,
    time: 20000,
    monsters: [],

    init: function() {
        this.login();

        this.stage.addChild(new game.Sprite('media/bg.png'));
        this.missLayer = new game.Container();
        this.missLayer.interactive = false;
        this.missLayer.hitArea = new game.HitRectangle(0,0,game.system.width, game.system.height);
        this.missLayer.mousedown = this.missLayer.touchstart = function(e) {
            game.scene.addScore(-10, e.global.x, e.global.y);
        };
        this.stage.addChild(this.missLayer);
        this.monsterContainer = new game.Container();
        this.stage.addChild(this.monsterContainer);
        this.stage.addChild(new game.Sprite('media/fg.png', 0, game.system.height - 204, {interactive: true, click: function() {}}));

        this.scoreText = new game.BitmapText(this.score.toString(), {font: 'Pixel'});
        this.scoreText.position.x = 15;
        this.stage.addChild(this.scoreText);

        this.emitter = new game.Emitter();
        this.emitter.position.y = game.system.height - 204;
        this.emitter.container = this.stage;
        this.emitter.rate = 0;
        this.emitter.textures.push('media/particle.png');
        this.emitter.angle = -Math.PI / 2;
        this.emitter.angleVar = 0.5;
        this.emitter.positionVar.x = 40;
        this.emitter.speed = 200;
        this.emitter.life = 500;
        this.emitter.lifeVar = 300;
        this.emitter.accelSpeed = 400;
        this.emitter.accelSpeedVar = 100;
        this.emitter.endAlpha = 1;
        this.addEmitter(this.emitter);

        this.logo = new game.Sprite('media/logo.png', game.system.width / 2, 250, {
            anchor: {x:0.5, y:0.5},
            scale: {x:0, y:0}
        });
        this.addTween(this.logo.scale, {x:1, y:1}, 500, {delay: 100, easing: game.Tween.Easing.Back.Out}).start();
        this.addTween(this.logo.position, {y: this.logo.position.y + 20}, 2000, {
            easing: game.Tween.Easing.Quadratic.InOut,
            repeat: true,
            yoyo: true
        }).start();
        this.stage.addChild(this.logo);

        var madewith = new game.Sprite('media/madewithpanda.png', game.system.width / 2, game.system.height - 16, {
            anchor: {x:0.5, y:1.0}
        });
        this.stage.addChild(madewith);

        var word = game.device.mobile ? 'TOUCH' : 'CLICK';
        this.startText = new game.BitmapText(word + ' TO START', {font: 'Pixel'});
        this.startText.position.x = game.system.width / 2 - this.startText.textWidth / 2;
        this.stage.addChild(this.startText);
    },

    login: function() {
        if(!game.socialService) return;
        if(game.socialService.isLoggedIn()) return;

        game.socialService.login();
    },

    showLeaderboard: function() {
        if(!game.socialService) return;
        if(!game.socialService.isLoggedIn()) return;

        game.socialService.showLeaderboard();
    },

    submitScore: function() {
        if(!game.socialService) return;
        if(!game.socialService.isLoggedIn()) return;

        if(CocoonJS.App.onMessageBoxConfirmed.listeners.length === 0) {
            CocoonJS.App.onMessageBoxConfirmed.addEventListener(this.submitScore.bind(this));    
        }

        game.socialService.submitScore(this.score, function(error) {
            if (error) CocoonJS.App.showMessageBox('Error submitting score', 'Do you want to submit again?');
        });
    },

    mousedown: function() {
        if(this.monsters.length === 0) this.startGame();
    },

    startGame: function() {
        this.stage.removeChild(this.startText);
        this.stage.removeChild(this.logo);
        game.tweenEngine.stopTweensForObject(this.logo.position);

        this.missLayer.interactive = true;

        this.monsters.push(new game.Monster(72 + 40 + 200 * 0));
        this.monsters.push(new game.Monster(72 + 40 + 200 * 1));
        this.monsters.push(new game.Monster(72 + 40 + 200 * 2));
        this.monsters.push(new game.Monster(72 + 40 + 200 * 3));
        this.monsters.push(new game.Monster(72 + 40 + 200 * 4));

        this.addTimer(this.time, function() {
            game.scene.ended = true;
        });

        var ready = new game.Sprite('media/ready.png', 0, 300, {
            anchor: {x: 1.0, y: 1.0}
        });
        this.addTween(ready.position, {x: game.system.width + ready.width}, 2500, {onComplete: function() {
            game.scene.stage.removeChild(ready);
        }}).start();
        this.stage.addChild(ready);
    },

    checkForGameOver: function() {
        for (var i = this.monsters.length - 1; i >= 0; i--) {
            if(this.monsters[i].active) return;
        }
        this.gameOver();
    },

    gameOver: function() {
        this.submitScore();

        this.missLayer.interactive = false;
        this.monsters[0].gameOver();
        game.audio.musicVolume = 0.5;
        game.audio.playMusic('music');

        var text = new game.Sprite('media/gameover.png', game.system.width / 2, 250, {anchor: {x:0.5, y:0.5}});
        this.addTween(text.position, {y: text.position.y + 50}, 1000, {
            easing: game.Tween.Easing.Quadratic.InOut,
            repeat: true,
            yoyo: true
        }).start();
        this.stage.addChild(text);

        var restartButton = new game.Sprite('media/restart.png', game.system.width / 2, game.system.height - 260, {
            anchor: {x:0.5, y:0.5},
            interactive: true,
            mousedown: function() {
                game.audio.stopMusic();
                game.system.setScene('Main');
            }
        });
        this.stage.addChild(restartButton);

        if(game.socialService && game.socialService.isLoggedIn()) {
            var leaderboardButton = new game.Sprite('media/leaderboards.png', game.system.width / 2, game.system.height - 120, {
                anchor: {x:0.5, y:0.5},
                interactive: true,
                mousedown: this.showLeaderboard.bind(this)
            });
            this.stage.addChild(leaderboardButton);
        }

        var highScore = parseInt(game.storage.get('highScore')) || 0;

        text = new game.BitmapText('BEST '+highScore.toString(), {font: 'Pixel'});
        text.position.x = game.system.width / 2 - text.textWidth / 2;
        this.stage.addChild(text);

        if(this.score > highScore) {
            game.storage.set('highScore', this.score);
            text = new game.BitmapText('NEW HIGHSCORE!', {font: 'Pixel'});
            text.position.x = game.system.width / 2 - text.textWidth / 2;
            text.position.y = 40 + 16;
            this.stage.addChild(text);
            game.audio.playSound('highscore');
        }
    },

    addScore: function(score, x, y) {
        if(score > 0) game.audio.playSound('score');
        else game.audio.playSound('miss');

        var text = new game.BitmapText(score.toString(), {font: 'Pixel'});
        text.position.x = x - text.textWidth / 2;
        text.position.y = y - text.textHeight / 2;
        this.addTween(text.position, {y: text.position.y - 50}, 1000, {onComplete: function() {
            game.scene.stage.removeChild(text);
        }}).start();
        this.stage.addChild(text);

        this.score += score;
        if(this.score < 0) this.score = 0;
        this.scoreText.setText(this.score.toString());
    }
});

});
