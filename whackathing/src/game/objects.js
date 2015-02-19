game.module(
    'game.objects'
)
.require(
    'engine.renderer'
)
.body(function() {

game.createClass('Monster', 'Sprite', {
    interactive: true,
    active: true,

    init: function(x) {
        this.id = game.scene.monsters.length + 1;

        this._super('media/monster' + this.id + '.png', x, game.system.height - 204);

        this.anchor.set(0.5, 0.0);

        this.timer = new game.Timer();
        this.bounce(2000);

        game.scene.monsterContainer.addChild(this);
    },

    bounce: function(delay) {
        if(game.scene.ended) {
            this.active = false;
            game.scene.checkForGameOver();
            return;
        }

        this.interactive = true;

        game.scene.addTween(this.position, {y: game.system.height - 204 - this.height}, 1000, {
            delay: (delay || 200) + Math.random() * 2000,
            onStart: this.reset.bind(this),
            onComplete: this.bounce.bind(this),
            easing: game.Tween.Easing.Quadratic.InOut,
            repeat: 1,
            yoyo: true
        }).start();
    },

    gameOver: function() {
        this.interactive = false;
        game.scene.addTween(this.position, {y: game.system.height - 204 - 150}, 400, {
            onComplete: this.gameOverNext.bind(this),
            easing: game.Tween.Easing.Quadratic.InOut,
            repeat: 1,
            yoyo: true
        }).start();
    },

    gameOverNext: function() {
        var next = null;
        for (var i = 0; i < game.scene.monsters.length; i++) {
            if(game.scene.monsters[i] === this) {
                next = game.scene.monsters[i+1] ? game.scene.monsters[i+1] : game.scene.monsters[0];
            }
        }
        next.gameOver();
    },

    reset: function() {
        game.audio.playSound('spawn' + this.id);
        var image = 'media/monster' + Math.round(Math.random(1, 5)) + '.png';
        this.timer.reset();
        this.scale.x = Math.random() > 0.5 ? 1 : -1;
        this.setTexture(game.Texture.fromImage(image));
    },

    emit: function() {
        game.audio.playSound('hit');
        game.scene.emitter.position.x = this.position.x;
        game.scene.emitter.emit(10);
        this.bounce();
    },

    mousedown: function() {
        this.interactive = false;
        var points = Math.round((2000 - this.timer.time()) * 0.01);
        var speed = (game.system.height - 204 - this.position.y) / 2;
        game.scene.addScore(points, this.position.x, this.position.y);
        game.tweenEngine.stopTweensForObject(this.position);
        game.scene.addTween(this.position, {y: game.system.height - 204}, speed, {
            onComplete: this.emit.bind(this)
        }).start();
    }
});

});
