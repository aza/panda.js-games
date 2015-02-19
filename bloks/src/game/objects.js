game.module(
    'game.objects'
)
.body(function() {

var BLOCKS = [
    'yellow',
    'green',
    'red',
    'blue',
    'orange'
];

game.createClass('Block', {
    type: 0,
    pos: { x: 0, y: 0 },
    score: 50,
    selected: false,
    killed: false,
    scoreMultiplier: 0,
    specials: {
        bomb: 1,
        clock: 2,
        twotimes: 3
    },
    special: false,

    init: function(x, y, type) {
        this.type = type;
        this.pos.x = y;
        this.pos.y = x;

        this.container = new game.Container();

        this.selectSprite = new game.Sprite('block.png');
        this.selectSprite.anchor.x = this.selectSprite.anchor.y = 0.5;
        this.selectSprite.visible = false;
        this.selectSprite.alpha = 0.8;
        this.selectSprite.scale.x = this.selectSprite.scale.y = 1.8;
        this.container.addChild(this.selectSprite);

        this.sprite = new game.Sprite('block' + (this.type + 1) + '.png');

        this.container.position.y = x * (this.sprite.width - 12);
        this.container.position.x = y * (this.sprite.width + 4);

        // this.sprite.interactive = true;
        // this.sprite.mousedown = this.sprite.touchstart = this.touchstart.bind(this);
        // this.sprite.mouseover = this.sprite.touchmove = this.touchmove.bind(this);
        // this.sprite.mouseup = this.sprite.mouseupoutside = this.sprite.touchend = this.sprite.touchendoutside = this.touchend.bind(this);

        this.container.addChild(this.sprite);

        this.count = Math.random();

        this.sprite2 = new game.Sprite('white.png');
        this.sprite2.visible = false;
        this.sprite2.position.x = 0;
        this.sprite2.position.y = 0;
        this.container.addChild(this.sprite2);

        this.special = (Math.random() > 0.95 && (game.Settings.SPECIALS - game.scene.specialsCounter) > 0) ? Math.floor(Math.random() * 3) + 1 : 0;

        if (this.special === this.specials.bomb) this.sprite2.setTexture('bomb.png');
        if (this.special === this.specials.clock) this.sprite2.setTexture('clock.png');
        if (this.special === this.specials.twotimes) this.sprite2.setTexture('double.png');

        if (this.special) {
            game.scene.specialsCounter++;
            this.sprite2.visible = true;
        }

        this.container.alpha = 0;
        var id = (x * 7) + y - x;
        
        game.scene.addTimer((x * 0.15 + 0.5) * 1000, this.ready.bind(this));
    },

    ready: function() {
        this.container.alpha = 1;

        if (this.pos.x === 0) game.audio.playSound('error');
        if (this.pos.y === 7 && this.pos.x === 0) {
            game.scene.addTimer(500, function() {
                game.scene.start();
            });
        }
    },

    update: function() {
        this.container.position.x = this.container.position.x.round(4);
        this.container.position.y = this.container.position.y.round(4);

        this.count += 10 * game.system.delta;

        if (this.selected) {
            this.selectSprite.scale.x = this.selectSprite.scale.y = 0.5 + Math.sin(this.count) / 20;
            this.selectSprite.rotation += 0.1;
        }
    },

    touchstart: function() {
        if (this.killed || game.scene.ended || !game.scene.started || game.scene.timer.pausedAt) return;
        if (game.scene.grid.selection.length === 0) this.select();
    },

    touchmove: function(event) {
        if (game.scene.grid.selection.length === 0 || this.killed) return;

        if (event.global.x - game.scene.grid.pos.x >= this.container.position.x && event.global.x - game.scene.grid.pos.x <= this.container.position.x + this.sprite.width && event.global.y - game.scene.grid.pos.y >= this.container.position.y && event.global.y - game.scene.grid.pos.y <= this.container.position.y + this.sprite.height) {
            var last = game.scene.grid.selection[game.scene.grid.selection.length - 1];

            var distx = Math.abs(this.pos.x - last.pos.x);
            var disty = Math.abs(this.pos.y - last.pos.y);

            if (distx < 2 && disty < 2 && this.type === last.type && !game.tweenEngine.getTweenForObject(this.container)) {
                if (!this.selected) {
                    this.select();
                }
                else {
                    for (var i = game.scene.grid.selection.length - 1; i >= 0; i--) {
                        if (game.scene.grid.selection[i] !== this) game.scene.grid.selection[i].unselect();
                        else break;
                    }
                }
            }
        }
    },

    touchend: function() {
        if (game.scene.grid.selection.length > 2 && !game.scene.ended) {
            game.scene.grid.doSpecials();

            var totalScore = game.scene.grid.getScore();
            var multiplier = game.scene.grid.getMultiplier();

            game.Settings.SCORE += totalScore * multiplier;

            var text = new game.TextParticle(game.scene.grid.selection[game.scene.grid.selection.length - 1].pos.x, game.scene.grid.selection[game.scene.grid.selection.length - 1].pos.y, totalScore * multiplier);

            for (var i = 0; i < game.scene.grid.selection.length; i++) {
                game.scene.grid.selection[i].kill();
                var particle = new game.ScoreParticle(game.scene.grid.selection[i].container.position.x, game.scene.grid.selection[i].container.position.y, i, game.scene.grid.selection[i].score * multiplier);
            }
            game.scene.grid.reorder();
        }
        else {
            if (game.scene.grid.selection.length === 2) game.audio.playSound('error');
            for (var i = game.scene.grid.selection.length - 1; i >= 0; i--) {
                game.scene.grid.selection[i].unselect();
            }
        }

        game.scene.grid.selection.length = 0;
    },

    select: function(silent) {
        if (this.selected || game.tweenEngine.getTweenForObject(this.container)) return;

        if (game.scene.grid.selection.length === 0) game.scene.grid.root = this.pos.x;

        var pos = game.scene.grid.selection.length * 2;
        if (pos > 14) {
            var over = pos - 14;
            pos = 14 - over;
        }

        if (!silent) {
            if (game.scene.grid.selection.length === 0) game.scene.grid.rate = 1;
            else game.scene.grid.rate += 0.12;

            game.audio.playSound('block', false, false, false, game.scene.grid.rate);
        }

        this.selected = true;
        game.scene.grid.selection.push(this);

        this.sprite.setTexture('block_hover' + (this.type + 1) + '.png');
        this.sprite2.position.y = 4;
        this.sprite2.alpha = 0.5;
    },

    unselect: function() {
        if (game.scene.grid.rate > 1) game.scene.grid.rate -= 0.12;
        this.selected = false;
        game.scene.grid.selection.erase(this);
        this.sprite2.position.y = 0;
        this.sprite2.alpha = 1.0;
        this.sprite.setTexture('block' + (this.type + 1) + '.png');
    },

    kill: function() {
        if (this.special === this.specials.bomb) game.STATS.KILLEDBOMBS++;
        if (this.special === this.specials.clock) game.STATS.KILLEDCLOCKS++;
        game.STATS.KILLEDBLOCKS++;
        game.updateStorage();
        this.selected = false;
        this.killed = true;
        this.container.visible = false;
    },

    moveFrom: function(x, y, newdist) {
        var _x = this.container.position.x;
        var _y = this.container.position.y;
        this.container.position.x = x;
        this.container.position.y = y;
        var dist = Math.abs(y - _y);

        if (newdist) dist = newdist * 100;

        dist = dist.limit(100, 200);
        
        game.scene.addTween(this.container.position, { x: _x, y: _y }, (dist / 300) * 1000, { easing: 'Bounce.Out' }).start();
    }
});

game.createClass('Grid', {
    pos: { x: 62, y: 0 },
    sprites: [],
    size: 104 + 4,
    fading: false,
    selection: [],
    rows: 8,
    cols: 6,

    init: function() {
        this.types = [];
        for (var i = 0; i < BLOCKS.length; i++) {
            for (var b = 0; b < Math.round(this.rows * this.cols / BLOCKS.length) + 1; b++) {
                this.types.push(i);
            }
        }
        this.types = this.types.shuffle();

        this.data = [];
        for (var x = 0; x < this.rows; x++) {
            this.data[x] = [];
            for (var y = 0; y < this.cols; y++) {
                this.data[x][y] = this.types.pop();
            }
        }

        this.container = new game.Container();
        this.container.position.x = this.pos.x;
        this.container.position.y = this.pos.y;
        this.container.addTo(game.scene.stage);

        for (var y = 0; y < this.data.length; y++) {
            for (var x = 0; x < this.data[y].length; x++) {
                var block = new game.Block(y, x, this.data[y][x]);
                this.data[y][x] = block;
                this.container.addChild(block.container);
            }
        }
    },

    doSpecials: function() {
        var specials = [];

        for (var i = 0; i < this.selection.length; i++) {
            var special = this.selection[i].special;

            if (special) specials[special] = true;

            if (special === game.Block.prototype.specials.bomb) {
                var block = this.selection[i];

                var left = this.get(block.pos.x - 1, block.pos.y);
                if (left) left.select(true);
                var right = this.get(block.pos.x + 1, block.pos.y);
                if (right) right.select(true);
                var up = this.get(block.pos.x, block.pos.y - 1);
                if (up) up.select(true);
                var down = this.get(block.pos.x, block.pos.y + 1);
                if (down) down.select(true);
                var leftup = this.get(block.pos.x - 1, block.pos.y - 1);
                if (leftup) leftup.select(true);
                var rightup = this.get(block.pos.x + 1, block.pos.y - 1);
                if (rightup) rightup.select(true);
                var leftdown = this.get(block.pos.x - 1, block.pos.y + 1);
                if (leftdown) leftdown.select(true);
                var rightdown = this.get(block.pos.x + 1, block.pos.y + 1);
                if (rightdown) rightdown.select(true);
            }
            if (special === game.Block.prototype.specials.clock) {
                game.Settings.TIME += 10 * 1000;
            }
        }

        if (specials[game.Block.prototype.specials.bomb]) game.audio.playSound('explosion');
        else if (specials[game.Block.prototype.specials.clock]) game.audio.playSound('time');
    },

    getScore: function() {
        var score = 0;

        for (var i = 0; i < this.selection.length; i++) {
            score += this.selection[i].score;
        }

        // var bonus = this.selection.length - 3;
        // score += bonus * this.selection[0].score;

        return score;
    },

    getMultiplier: function() {
        var multiplier = 0;

        for (var i = 0; i < this.selection.length; i++) {
            // multiplier += this.selection[i].scoreMultiplier;
            if (this.selection[i].special === this.selection[i].specials.twotimes) multiplier += 2;
        };
        
        return multiplier || 1;
    },

    fadeOut: function() {
        this.fading = true;
        if (this.gotMovingBlocks()) return setTimeout(this.fadeOut.bind(this), 500);

        for (var x = this.data.length - 1; x >= 0; x--) {
            this.data[x] = this.data[x].shuffle();
        }

        this.fadeTimer = new game.Timer();
        this.fadeTimer.callback = this._fadeOut.bind(this);
    },

    _fadeOut: function() {
        this.fading = true;

        this.data = this.data.shuffle();
        for (var x = this.data.length - 1; x >= 0; x--) {
            for (var y = this.data[x].length - 1; y >= 0; y--) {
                if (!this.data[x][y].killed) return this.data[x][y].kill();
            }
        }

        game.scene.showRestartButton();
        this.fadeTimer = null;
        this.fading = false;
    },

    update: function() {
        if (this.fadeTimer && this.fadeTimer.time() > 0.04) {
            this.fadeTimer.set(0);
            this.fadeTimer.callback();
        }
        for (var y = 0; y < this.data.length; y++) {
            for (var x = 0; x < this.data[y].length; x++) {
                this.data[y][x].update();
            }
        }
    },

    gotMovingBlocks: function() {
        for (var y = 0; y < this.data.length; y++) {
            for (var x = 0; x < this.data[y].length; x++) {
                if (game.tweenEngine.getTweenForObject(this.data[y][x].container)) return true;
            }
        }
        return false;
    },

    reorder: function() {
        var dists = [];

        // move down
        for (var x = this.data.length - 1; x >= 0; x--) {
            for (var y = this.data[x].length - 1; y >= 0; y--) {
                if (this.data[x][y].killed) {
                    var pos = x - 1;

                    var upper = this.get(y, pos);
                    while (upper && upper.killed) {
                        pos--;
                        upper = this.get(y, pos);
                    }

                    if (upper) {
                        this.data[x][y].container.visible = true;
                        this.data[x][y].killed = false;
                        this.data[x][y].container.alpha = 1;
                        this.data[x][y].sprite.setTexture(upper.sprite.texture);
                        this.data[x][y].type = upper.type;
                        this.data[x][y].moveFrom(upper.container.position.x, upper.container.position.y);
                        this.data[x][y].scoreMultiplier = upper.scoreMultiplier;
                        this.data[x][y].selectSprite.visible = false;
                        if (upper.special) {
                            if (upper.special === upper.specials.bomb) this.data[x][y].sprite2.setTexture('bomb.png');
                            if (upper.special === upper.specials.clock) this.data[x][y].sprite2.setTexture('clock.png');
                            if (upper.special === upper.specials.twotimes) this.data[x][y].sprite2.setTexture('double.png');

                            this.data[x][y].sprite2.alpha = 1;
                            this.data[x][y].sprite2.position.y = 0;
                            this.data[x][y].sprite2.visible = true;
                            this.data[x][y].special = upper.special;
                        }
                        else {
                            this.data[x][y].sprite2.visible = false;
                            this.data[x][y].special = false;
                        }

                        var dist = Math.abs(this.data[x][y].pos.y - upper.pos.y);
                        if (!dists[y] || dists[y] && dists[y] < dist) dists[y] = dist;
                        upper.killed = true;
                        upper.container.alpha = 0;
                        upper.selectSprite.visible = false;
                        upper.sprite2.alpha = 1;
                        upper.sprite2.position.y = 0;
                        upper.sprite2.visible = upper.special ? false : false; // TODO
                        upper.special = false;
                    }
                }
            };
        };

        // spawn new blocks on empty ones
        for (var x = this.data.length - 1; x >= 0; x--) {
            for (var y = this.data[x].length - 1; y >= 0; y--) {
                if (this.data[x][y].killed) {
                    var block = this.data[x][y];
                    block.container.visible = true;
                    block.type = Math.round(Math.random() * (BLOCKS.length - 1));
                    block.container.alpha = 1;
                    block.sprite.setTexture('block' + (block.type + 1) + '.png');
                    block.killed = false;
                    block.selected = false;
                    block.selectSprite.visible = false;
                    block.special = false;
                    block.sprite2.visible = false;
                    block.sprite2.alpha = 1;
                    block.sprite2.position.y = 0;

                    block.special = (Math.random() > 0.95 && (game.Settings.SPECIALS - game.scene.specialsCounter) > 0) ? Math.floor(Math.random() * 3) + 1 : 0;

                    if (block.special) {
                        game.scene.specialsCounter++;
                        if (block.special === block.specials.bomb) block.sprite2.setTexture('bomb.png');
                        if (block.special === block.specials.clock) block.sprite2.setTexture('clock.png');
                        if (block.special === block.specials.twotimes) block.sprite2.setTexture('double.png');
                        block.sprite2.visible = true;
                    }

                    if (!dists[y]) dists[y] = 1;
                    block.moveFrom(block.container.position.x, -(100 * dists[y] - block.container.position.y), dists[y]);
                }
            }
        }
    },

    get: function(x, y) {
        return this.data[y] ? this.data[y][x] : null;
    },

    gridXtoRealX: function(x) {
        return this.pos.x + x * this.size;
    },

    gridYtoRealY: function(y) {
        return this.pos.y + y * 92;
    },

    getBlockFromMousePos: function(x, y) {
        x = Math.floor((x - this.pos.x) / this.size);
        y = Math.floor((y - this.pos.y) / 92);
        return this.get(x, y);
    }
});

game.createClass('HealthBar', {
    init: function() {
        this.sprite = new game.TilingSprite('healthbar.png', game.system.width);
        this.sprite.position.y = game.system.height - this.sprite.height;
        this.sprite.scale.x = 0;
        this.sprite.addTo(game.scene.stage);

        game.scene.addTween(this.sprite.scale, {
            x: 1
        }, 3000, {
            delay: 500,
            easing: 'Quadratic.Out'
        }).start();
    },

    update: function() {
        if (!game.scene.started) return;

        this.percent = ((game.Settings.TIME - game.scene.timer.time()) / game.Settings.TIME) * 100;
        if (this.percent < 0) this.percent = 0;
        this.sprite.scale.x = this.percent / 100;

        if (this.percent === 0) game.scene.endGame();
    }
});

game.createClass('StatusText', {
    init: function() {
        this.sprite = new game.BitmapText('', { font: 'Pixel' });
        this.sprite.position.x = game.system.width / 2 - this.sprite.textWidth / 2;
        this.sprite.position.y = 751 + 32;
        this.sprite.visible = false;
        game.scene.stage.addChild(this.sprite);
    },

    setText: function(text, callback) {
        this.sprite.setText(text);
        this.sprite.updateTransform();
        this.sprite.position.x = game.system.width / 2 - this.sprite.textWidth / 2 * this.sprite.scale.x;

        if (!text) this.sprite.visible = false;
        else this.sprite.visible = true;
        
        if (!callback) return;
        game.scene.addTimer(1000, function() {
            if (typeof callback === 'function') callback();
        });
    },

    blink: function() {
        this.sprite.alpha = this.sprite.alpha === 0 ? 1 : 0;
        game.scene.addTimer(1000, this.blink.bind(this));
    },

    hide: function() {
        this.sprite.text = '';
        this.sprite.visible = false;
    }
});

});
