game.module(
    'game.objects'
)
.body(function() {

game.createClass('GameField', {
    fieldSize: 7,
    tileTypes: 7,
    tiles: [],
    activeTile: null,
    ready: true,
    comboCount: 0,
    removedTilesCount: 0,
    container: null,

    init: function(x, y) {
        this.container = new game.Container();

        var tile;
        for (var i = 0; i < this.fieldSize * this.fieldSize; i++) {
            tile = new game.Tile(this, i);
            do {
                tile.type = Math.round(Math.random(1, this.tileTypes));
            }
            while (this.isMatch(tile));

            tile.initSprite();
            tile.sprite.addTo(this.container);

            this.tiles.push(tile);
        }

        this.container.position.set(x - this.container.width / 2, y - this.container.height / 2);

        var bg = new game.Sprite('gamefield.png');
        bg.anchor.set(0.5, 0.5);
        bg.position.set(x - this.container.position.x, y - this.container.position.y);
        this.container.addChildAt(bg, 0);

        this.initEmitter();
    },

    initEmitter: function() {
        this.starEmitter = new game.Emitter();
        this.starEmitter.container = game.scene.stage;
        this.starEmitter.textures.push('star.png');
        this.starEmitter.rate = 0;
        this.starEmitter.speed = 80;
        this.starEmitter.speedVar = 20;
        this.starEmitter.life = 1500;
        this.starEmitter.rotate = 5;
        this.starEmitter.rotateVar = 2;
        this.starEmitter.startScale = 2;
        this.starEmitter.endScale = 0;
        this.starEmitter.endAlpha = 1;

        game.scene.addEmitter(this.starEmitter);
    },

    getRowNumber: function(tile) {
        return Math.floor(tile.index / this.fieldSize);
    },

    getColNumber: function(tile) {
        return tile.index % this.fieldSize;
    },

    isSameRow: function(tileA, tileB) {
        return (this.getRowNumber(tileA) === this.getRowNumber(tileB));
    },

    isSameCol: function(tileA, tileB) {
        return (this.getColNumber(tileA) === this.getColNumber(tileB));
    },

    swapTiles: function(tileA, tileB, reverse) {
        this.ready = false;

        this.swapA = tileA;
        this.swapB = tileB;

        var aIndex = tileA.index;
        var bIndex = tileB.index;

        tileA.index = bIndex;
        tileB.index = aIndex;
        this.tiles[aIndex] = tileB;
        this.tiles[bIndex] = tileA;

        tileA.tweenPosition();
        tileB.tweenPosition(this.swapEnd.bind(this, reverse));

        game.audio.playSound('sliding');
    },

    swapEnd: function(reverse) {
        if (reverse) this.ready = true;
        else this.checkForMatches();
    },

    isMatch: function(tile) {
        var left = this.tiles[tile.index - 1];
        var left2 = this.tiles[tile.index - 2];
        var right = this.tiles[tile.index + 1];
        var right2 = this.tiles[tile.index + 2];
        var up = this.tiles[tile.index - this.fieldSize];
        var up2 = this.tiles[tile.index - this.fieldSize * 2];
        var down = this.tiles[tile.index + this.fieldSize];
        var down2 = this.tiles[tile.index + this.fieldSize * 2];

        // If 2 same left (same row)
        if (left && left2) {
            if (this.isSameRow(tile, left) && this.isSameRow(tile, left2)) {
                if (tile.type === left.type && tile.type === left2.type) {
                    return true;
                }
            }
        }

        // If 2 same right (same row)
        if (right && right2) {
            if (this.isSameRow(tile, right) && this.isSameRow(tile, right2)) {
                if (tile.type === right.type && tile.type === right2.type) {
                    return true;
                }
            }
        }

        // If same left and right (same row)
        if (left && right) {
            if (this.isSameRow(tile, left) && this.isSameRow(tile, right)) {
                if (tile.type === left.type && tile.type === right.type) {
                    return true;
                }
            }
        }

        // If 2 same up
        if (up && up2) {
            if (tile.type === up.type && tile.type === up2.type) return true;
        }

        // If 2 same down
        if (down && down2) {
            if (tile.type === down.type && tile.type === down2.type) return true;
        }

        // If same up and down
        if (up && down) {
            if (tile.type === up.type && tile.type === down.type) return true;
        }

        return false;
    },

    removeRow: function(row, removedTiles) {
        for (var i = 0; i < this.tiles.length; i++) {
            if (this.getRowNumber(this.tiles[i]) === row) {
                if (removedTiles.indexOf(this.tiles[i].index) === -1) {
                    removedTiles.push(this.tiles[i].index);
                }
            }
        }
    },

    checkForMatches: function() {
        var matchedTiles = [];
        var i;

        // Check for tiles that should be removed
        for (i = 0; i < this.tiles.length; i++) {
            if (this.isMatch(this.tiles[i])) matchedTiles.push(this.tiles[i].index);
        }

        if (matchedTiles.length > 0) {
            this.comboCount++;
            this.removedTilesCount += matchedTiles.length;

            // Remove tiles
            for (i = matchedTiles.length - 1; i >= 0; i--) {
                this.tiles[matchedTiles[i]].remove(i === matchedTiles.length - 1 ? this.removeEnd.bind(this) : false, i, true);
            }
        }
        // No tiles to remove, round end
        else {
            if (this.removedTilesCount === 0) {
                // No tiles removed, swap tiles back
                this.swapTiles(this.swapA, this.swapB, true);
            }
            else {
                // Check if there is no more possible moves
                if (!this.checkForPossibleMoves()) {
                    // Remove 10 random tiles
                    game.scene.showCenterText('NO MORE MOVES');
                    this.removeRandomTiles(10);
                    return;
                }

                if (this.comboCount > 1) {
                    game.scene.showCenterText(this.comboCount + 'x COMBO');
                }

                // Decrease moves
                game.scene.addMoves(-1);

                // Reset
                this.comboCount = 0;
                this.removedTilesCount = 0;

                if (game.scene.moves > 0) {
                    this.ready = true;
                }
                else {
                    game.scene.gameOver();
                    this.removeRandomTiles(this.fieldSize * this.fieldSize, function() {
                        game.scene.showCenterText('GAME OVER');
                    });
                }
            }
        }
    },

    removeRandomTiles: function(count, callback) {
        var removedTiles = [];

        do {
            var randomIndex = Math.round(Math.random(0, this.tiles.length - 1));
            if (removedTiles.indexOf(randomIndex) === -1) removedTiles.push(randomIndex);
        }
        while (removedTiles.length < count);

        callback = callback || this.removeEnd.bind(this);

        for (var i = removedTiles.length - 1; i >= 0; i--) {
            this.tiles[removedTiles[i]].remove(i === removedTiles.length - 1 ? callback : false, i);
        }
    },

    checkForPossibleMoves: function() {
        for (var i = 0; i < this.tiles.length; i++) {
            var tile = this.tiles[i];
            var tileType = tile.type;

            var left = this.tiles[tile.index - 1];
            var right = this.tiles[tile.index + 1];
            var up = this.tiles[tile.index - this.fieldSize];
            var down = this.tiles[tile.index + this.fieldSize];

            var tiles = [];
            if (left && this.isSameRow(tile, left)) tiles.push(left);
            if (right && this.isSameRow(tile, right)) tiles.push(right);
            if (up) tiles.push(up);
            if (down) tiles.push(down);

            for (var o = 0; o < tiles.length; o++) {
                var target = tiles[o];

                var targetType = target.type;

                // Swap types
                tile.type = targetType;
                target.type = tileType;

                // Check for match
                var match = this.isMatch(tile);

                // Swap types back
                tile.type = tileType;
                target.type = targetType;

                if (match) return true;
            }
        }
        return false;
    },

    removeEnd: function() {
        this.repositionTiles();
    },

    getDroppingTileForCol: function(col, index) {
        for (var i = index; i >= 0; i--) {
            if (!this.tiles[i].removed && this.getColNumber(this.tiles[i]) === col) {
                return this.tiles[i];
            }
        }
    },

    repositionTiles: function() {
        var dropIndexes = [];

        // Get new indexes for tiles
        for (var i = this.tiles.length - 1; i >= 0; i--) {
            if (this.tiles[i].removed) {
                var droppingTile = this.getDroppingTileForCol(this.getColNumber(this.tiles[i]), i);

                if (droppingTile) {
                    var droppingTileIndex = droppingTile.index;
                    var currentTile = this.tiles[i];

                    this.tiles[i] = droppingTile;
                    this.tiles[i].index = i;
                    dropIndexes.push(i);
                    this.tiles[droppingTileIndex] = currentTile;
                    currentTile.index = droppingTileIndex;
                }
            }
        }

        if (dropIndexes.length > 0) {
            // Drop tiles
            for (var i = dropIndexes.length - 1; i >= 0; i--) {
                this.tiles[dropIndexes[i]].drop(i === 0 ? this.dropEnd.bind(this) : false);
            }            
        }
        else {
            this.dropEnd();
        }
    },

    dropEnd: function() {
        var removedTiles = [];

        // Fill removed tiles
        for (var i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i].removed) removedTiles.push(this.tiles[i].index);
        }

        for (var i = removedTiles.length - 1; i >= 0; i--) {
            this.tiles[removedTiles[i]].respawn(i === removedTiles.length - 1 ? this.respawnEnd.bind(this) : false, i);
        }
    },

    respawnEnd: function() {
        this.checkForMatches();
    }
});

game.createClass('Tile', {
    sprite: null,
    gameField: null,
    index: 0,
    type: 0,
    removed: false,
    margin: 10,
    size: 0,
    score: 20,
    // Tween times
    removeTime: 100,
    respawnTime: 200,
    dropTime: 600,
    swapTime: 200,

    init: function(gameField, index) {
        this.gameField = gameField;
        this.index = index;
    },

    initSprite: function() {
        this.sprite = new game.Container();

        this.anim = game.Animation.fromFrames('tile' + this.type);
        this.anim.textures.push(game.Texture.fromFrame('tile' + this.type + '_01.png'));
        this.size = this.anim.width;
        this.anim.animationSpeed = 0.2;
        this.anim.loop = false;
        this.anim.anchor.set(0.5, 0.5);

        var shadow = new game.Sprite('shadow.png');
        shadow.anchor.set(0.5, 1.0);
        shadow.position.set(0, this.size / 2);

        this.sprite.interactive = true;
        this.sprite.mousedown = this.sprite.touchstart = this.mousedown.bind(this);

        this.sprite.addChild(shadow);
        this.sprite.addChild(this.anim);
        this.sprite.position.set(this.getX(), this.getY());
        this.animTimer();
    },

    animTimer: function() {
        game.scene.addTimer(Math.random() * 60000, this.animate.bind(this));
    },

    animate: function() {
        this.anim.gotoAndPlay(0);
        this.anim.onComplete = this.animTimer.bind(this);
    },

    respawn: function(callback, index) {
        this.type = Math.round(Math.random(1, this.gameField.tileTypes));
        var textures = [];
        textures.push(game.Texture.fromFrame('tile' + this.type + '_01.png'));
        textures.push(game.Texture.fromFrame('tile' + this.type + '_02.png'));
        textures.push(game.Texture.fromFrame('tile' + this.type + '_03.png'));
        textures.push(game.Texture.fromFrame('tile' + this.type + '_04.png'));
        textures.push(game.Texture.fromFrame('tile' + this.type + '_01.png'));
        this.anim.textures = textures;
        this.anim.gotoAndStop(0);

        this.sprite.alpha = 1;
        this.sprite.position.set(this.getX(), this.getY());
        this.sprite.scale.set(0, 0);
        this.removed = false;

        game.tweenEngine.stopTweensForObject(this.sprite);

        var tween = game.scene.addTween(this.sprite.scale, {
            x: 1, y: 1
        }, this.respawnTime, {
            easing: 'Back.Out',
            delay: index * 60,
            onStart: function() {
                game.audio.playSound('blob');
            }
        });

        if (typeof callback === 'function') tween.onComplete(callback);

        tween.start();
    },

    getX: function() {
        return this.index % this.gameField.fieldSize * (this.size + this.margin) + this.size / 2;
    },

    getY: function() {
        return Math.floor(this.index / this.gameField.fieldSize) * (this.size + this.margin) + this.size / 2;
    },

    drop: function(callback) {
        this.shouldDrop = false;
        var tween = game.scene.addTween(this.sprite.position, {
            x: this.getX(),
            y: this.getY()
        }, this.dropTime, {
            easing: 'Bounce.Out'
        });

        if (typeof callback === 'function') tween.onComplete(callback);

        tween.start();
    },

    tweenPosition: function(callback) {
        var tween = game.scene.addTween(this.sprite.position, {
            x: this.getX(),
            y: this.getY()
        }, this.swapTime, {
            easing: 'Quadratic.Out'
        });

        if (typeof callback === 'function') tween.onComplete(callback);

        tween.start();
    },

    mousedown: function() {
        if (this.gameField.ready) {
            this.gameField.activeTile = this;
        }
    },

    emitStars: function(score) {
        this.gameField.starEmitter.position.x = this.sprite.worldTransform.tx;
        this.gameField.starEmitter.position.y = this.sprite.worldTransform.ty;
        this.gameField.starEmitter.emit(game.system.webGL ? 10 : 5);

        game.audio.playSound('pickup');

        if (score) this.addScore();
    },

    addScore: function() {
        var score = this.score * this.gameField.comboCount;

        game.scene.addScore(score);

        var scoreText = new game.BitmapText(score.toString(), { font: 'Cartoon' });
        scoreText.position.x = this.gameField.container.position.x + this.sprite.position.x - scoreText.textWidth / 2;
        scoreText.position.y = this.gameField.container.position.y + this.sprite.position.y - scoreText.textHeight / 2;
        game.scene.stage.addChild(scoreText);

        var speed = 1000;
        game.scene.addTween(scoreText.position, {
            y: '-20'
        }, speed, {
            onComplete: function() {
                game.scene.stage.removeChild(scoreText);
            }
        }).start();

        game.scene.addTween(scoreText, {
            alpha: 0
        }, speed / 2, {
            delay: speed / 2
        }).start();
    },

    remove: function(callback, index, score) {
        this.removed = true;

        var tween = game.scene.addTween(this.sprite, {
            alpha: 0
        }, this.removeTime, {
            delay: index * 100,
            onStart: this.emitStars.bind(this, score)
        });

        if (typeof callback === 'function') tween.onComplete(callback);

        tween.start();
    }
});

});
