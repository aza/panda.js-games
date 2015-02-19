game.module(
    'game.particles'
)
.body(function() {

game.createClass('TextParticle', {
    init: function(x, y, text) {
        this.sprite = new game.BitmapText(text.toString(), { font: 'Pixel' });
        this.sprite.position.x = game.scene.grid.gridXtoRealX(x);
        this.sprite.position.y = game.scene.grid.gridYtoRealY(y) - this.sprite.textHeight / 2 + 30;
        this.sprite.addTo(game.scene.stage);

        game.scene.addTween(this.sprite.position, { y: this.sprite.position.y - 80 }, 2000, { onComplete: this.remove.bind(this) }).start();
    },

    remove: function() {
        this.sprite.remove();
    }
});

game.createClass('ScoreParticle', {
    score: null,

    init: function(x, y, count, score) {
        this.score = score;

        this.sprite = new game.Sprite('block.png');
        this.sprite.position.x = x + game.scene.grid.pos.x;
        this.sprite.position.y = y + game.scene.grid.pos.y;
        this.sprite.alpha = 0;
        this.sprite.anchor.x = this.sprite.anchor.y = 0.5;
        
        game.scene.stage.addChild(this.sprite);

        game.scene.addTimer(count * 0.1 * 1000, this.show.bind(this));
    },

    show: function() {
        this.sprite.alpha = 1;
        game.scene.addTween(this.sprite.position, {
            x: game.system.width / 2,
            y: game.system.height - 200
        }, 200, { onComplete: this.kill.bind(this) }).start();
    },

    kill: function() {
        game.scene.addScore(this.score);
        game.scene.stage.removeChild(this.sprite);
    }
});

});
