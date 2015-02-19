game.module(
	'game.ui'
)
.body(function() {
	
game.createClass('Button', {
    init: function(x, y, frame, callback, onetime) {
        this.y = y;
        this.callback = callback;
        this.onetime = onetime || false;
        this.sprite = new game.Sprite(frame);
        this.sprite.interactive = true;
        this.sprite.buttonMode = true;
        this.sprite.click = this.sprite.tap = this.click.bind(this);
        this.sprite.mousedown = this.sprite.touchstart = this.mousedown.bind(this);
        this.sprite.mouseup = this.sprite.mouseupoutside = this.sprite.touchend = this.sprite.touchendoutside = this.mouseup.bind(this);
        this.sprite.position.x = x;
        this.sprite.position.y = y;
        game.scene.stage.addChild(this.sprite);
    },

    mousedown: function() {
        this.sprite.alpha = 0.5;
        this.sprite.position.y = this.y + 4;
    },

    mouseup: function() {
        this.sprite.alpha = 1.0;
        this.sprite.position.y = this.y;
    },

    click: function() {
        game.audio.playSound('select');
        if (typeof this.callback === 'function') {
            this.callback();
            if (this.onetime) this.callback = null;
        }
    },

    update: function() {
        this.sprite.alpha = this.sprite.alpha.round(0.4);
    }
});

game.createClass('Logo', {
    init: function(y) {
        this.l1 = new game.Sprite('logo1.png');
        this.l1.position.x = 84;
        this.l1.position.y = -this.l1.height;
        game.scene.stage.addChild(this.l1);

        this.l2 = new game.Sprite('logo2.png');
        this.l2.position.x = this.l1.position.x + this.l1.width + 4;
        this.l2.position.y = -this.l2.height;
        game.scene.stage.addChild(this.l2);

        this.l3 = new game.Sprite('logo3.png');
        this.l3.position.x = this.l2.position.x + this.l2.width + 4;
        this.l3.position.y = -this.l3.height;
        game.scene.stage.addChild(this.l3);

        this.l4 = new game.Sprite('logo4.png');
        this.l4.position.x = this.l3.position.x + this.l3.width + 4;
        this.l4.position.y = -this.l4.height;
        game.scene.stage.addChild(this.l4);

        this.l5 = new game.Sprite('logo5.png');
        this.l5.position.x = this.l4.position.x + this.l4.width + 4;
        this.l5.position.y = -this.l5.height;
        game.scene.stage.addChild(this.l5);

        game.scene.addTween(this.l1.position, { y: y }, 1000, { easing: 'Bounce.Out' }).start();
        game.scene.addTween(this.l2.position, { y: y }, 1000, { delay: 200, easing: 'Bounce.Out' }).start();
        game.scene.addTween(this.l3.position, { y: y }, 1000, { delay: 400, easing: 'Bounce.Out' }).start();
        game.scene.addTween(this.l4.position, { y: y + 4 }, 1000, { delay: 600, easing: 'Bounce.Out' }).start();
        game.scene.addTween(this.l5.position, { y: y }, 1000, { delay: 500, easing: 'Bounce.Out' }).start();
        game.scene.addTimer(380, function() {
            game.audio.playSound('error');
        });
        game.scene.addTimer(380 + 200, function() {
            game.audio.playSound('error');
        });
        game.scene.addTimer(380 + 400, function() {
            game.audio.playSound('error');
        });
        game.scene.addTimer(380 + 600, function() {
            game.audio.playSound('error');
        });
        game.scene.addTimer(380 + 500, function() {
            game.audio.playSound('error');
        });
    }
});

game.createClass('Fader', {
    init: function(visible) {
        this.sprite = new game.Graphics();
        this.sprite.beginFill(0x000000);
        this.sprite.moveTo(0, 0);
        this.sprite.lineTo(game.system.width, 0);
        this.sprite.lineTo(game.system.width, game.system.height);
        this.sprite.lineTo(0, game.system.height);
        this.sprite.visible = visible || false;
        game.scene.stage.addChild(this.sprite);
        game.scene.addObject(this);
    },

    fadeIn: function(callback) {
        game.scene.addTween(this.sprite, { alpha: 0 }, 1000, { delay: 200, onComplete: function() {
            if (typeof callback === 'function') callback();
        }}).start();
    },

    fadeOut: function(callback) {
        this.sprite.alpha = 0;
        this.sprite.visible = true;
        game.scene.addTween(this.sprite, { alpha: 1 }, 1000, { onComplete: function() {
            if (typeof callback === 'function') callback();
        }}).start();
    },

    update: function() {
        this.sprite.alpha = this.sprite.alpha.round(0.2);
    }
});

});
