game.module(
    'game.main'
)
.require(
    'game.assets',
    'game.objects'
)
.body(function() {

game.createScene('Main', {
    backgroundColor: 0xf2e275,
    score: 0,
    moves: 0,

    init: function() {
        var stripes = new game.Sprite('stripes.png');
        stripes.anchor.set(0.5, 0.5);
        stripes.center();
        stripes.addTo(this.stage);
        this.addTween(stripes, {
            rotation: Math.PI * 2
        }, 1000 * 60 * 3, {
            repeat: Infinity
        }).start();

        this.gameField = new game.GameField(game.system.width / 2, game.system.height / 2);
        this.gameField.container.addTo(this.stage);

        this.scoreText = new game.BitmapText('', { font: 'Cartoon' });
        this.scoreText.position.set(12, game.system.height - 45);
        this.addScore(0);
        this.stage.addChild(this.scoreText);

        this.movesText = new game.BitmapText('', { font: 'Cartoon' });
        this.movesText.position.set(game.system.width / 2 - 100, game.system.height - 45);
        this.addMoves(20);
        this.stage.addChild(this.movesText);
    },

    addMoves: function(amount) {
        this.moves += amount;
        this.movesText.setText('MOVES: ' + this.moves.toString());
    },

    addScore: function(amount) {
        this.score += amount;
        this.scoreText.setText('SCORE: ' + this.score.toString());
    },

    mouseup: function() {
        this.gameField.activeTile = null;
    },

    swipe: function(dir) {
        if (!this.gameField.activeTile) return;

        var tile = this.gameField.activeTile;

        if (dir === 'right') {
            var target = this.gameField.tiles[tile.index + 1];
            if (target && this.gameField.isSameRow(tile, target)) {
                this.gameField.swapTiles(tile, target);
            }
        }
        else if (dir === 'left') {
            var target = this.gameField.tiles[tile.index - 1];
            if (target && this.gameField.isSameRow(tile, target)) {
                this.gameField.swapTiles(tile, target);
            }
        }
        else if (dir === 'up') {
            var target = this.gameField.tiles[tile.index - this.gameField.fieldSize];
            if (target) this.gameField.swapTiles(tile, target);
        }
        else if (dir === 'down') {
            var target = this.gameField.tiles[tile.index + this.gameField.fieldSize];
            if (target) this.gameField.swapTiles(tile, target);
        }

        tile = null;
    },

    showCenterText: function(text) {
        var centerText = new game.BitmapText(text, { font: 'Cartoon' });
        var time = 2000;

        centerText.position.x = game.system.width / 2;
        centerText.position.y = game.system.height / 2;
        centerText.scale.set(0, 0);
        centerText.pivot.x = centerText.textWidth / 2;
        centerText.pivot.y = centerText.textHeight / 2;
        this.stage.addChild(centerText);

        this.addTween(centerText.scale, {
            x: 2, y: 2
        }, 300, {
            easing: 'Back.Out'
        }).start();

        this.addTween(centerText.position, {
            y: '-60'
        }, time, {
            onComplete: function() {
                centerText.remove();
            }
        }).start();

        this.addTween(centerText, {
            alpha: 0
        }, time / 2, {
            delay: time / 2
        }).start();
    },

    gameOver: function() {
        var highScore = game.storage.get('highScore', 0);
        if (this.score > highScore) {
            // Store new highscore
            game.storage.set('highScore', this.score);
        }
    }
});

});
