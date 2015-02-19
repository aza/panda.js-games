game.module(
    'game.objects'
)
.body(function() {

game.createClass('Player', {
    jumpPower: 750,

    init: function() {
        var x = game.system.width / 2;
        var y = 500;

        this.sprite = new game.Animation(
            'player1.png',
            'player2.png'
        );
        this.sprite.position.set(x, y);
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.animationSpeed = 0.1;
        this.sprite.play();
        this.sprite.addTo(game.scene.stage);
        game.scene.addObject(this);

        this.body = new game.Body({
            position: { x: x, y: y },
            velocityLimit: { x: 100, y: 1000 },
            collideAgainst: [0],
            collisionGroup: 1,
        });
        this.body.collide = this.collide.bind(this);
        this.body.addShape(new game.Rectangle(132, 36));
        game.scene.world.addBody(this.body);

        this.smokeEmitter = new game.Emitter({
            angle: Math.PI,
            angleVar: 0.1,
            endAlpha: 1,
            life: 400,
            lifeVar: 200,
            count: 2,
            speed: 400,
            textures: ['particle.png']
        });
        this.smokeEmitter.addTo(game.scene.stage);
        game.scene.addEmitter(this.smokeEmitter);

        this.flyEmitter = new game.Emitter({
            life: 0,
            rate: 0,
            positionVar: { x: 50, y: 50 },
            targetForce: 200,
            speed: 100,
            velocityLimit: { x: 100, y: 100 },
            endAlpha: 1,
            textures: ['particle2.png'],
            position: {
                x: this.sprite.position.x + 30,
                y: this.sprite.position.y - 30
            }
        });
        this.flyEmitter.addTo(game.scene.stage);
        this.flyEmitter.emit(5);
        game.scene.addEmitter(this.flyEmitter);
    },

    collide: function() {
        if (!game.scene.ended) {
            game.scene.gameOver();
            this.body.velocity.y = -200;
            this.smokeEmitter.rate = 0;
        }
        this.body.velocity.x = 0;
        return true;
    },

    jump: function() {
        if (this.body.position.y <= 0) return;
        this.body.velocity.y = -this.jumpPower;
        game.audio.playSound('jump');
    },

    update: function() {
        this.sprite.position.x = this.body.position.x;
        this.sprite.position.y = this.body.position.y;

        this.smokeEmitter.position.x = this.sprite.position.x - 60;
        this.smokeEmitter.position.y = this.sprite.position.y;

        this.flyEmitter.target.x = this.sprite.position.x + 30;
        this.flyEmitter.target.y = this.sprite.position.y - 30;
    }
});

game.createClass('Obstacle', {
    groundTop: 800,
    width: 132,
    minY: 150,
    maxY: 550,
    height: 232,
    speed: -300,

    init: function() {
        var y = Math.round(Math.random(this.minY, this.maxY));

        var topHeight = y - this.height / 2;
        this.topBody = new game.Body({
            position: { x: game.system.width + this.width / 2, y: topHeight / 2 },
            velocity: { x: this.speed },
            collisionGroup: 0
        });
        var topShape = new game.Rectangle(this.width, topHeight);
        this.topBody.addShape(topShape);
        game.scene.world.addBody(this.topBody);

        var bottomHeight = this.groundTop - topHeight - this.height;
        this.bottomBody = new game.Body({
            position: { x: game.system.width + this.width / 2, y: topHeight + this.height + bottomHeight / 2 },
            velocity: { x: this.speed },
            collisionGroup: 0
        });
        var bottomShape = new game.Rectangle(this.width, bottomHeight);
        this.bottomBody.addShape(bottomShape);
        game.scene.world.addBody(this.bottomBody);

        this.goalBody = new game.Body({
            position: { x: game.system.width + this.width / 2 + this.width + game.scene.player.body.shape.width, y: topHeight + this.height / 2 },
            velocity: { x: this.speed },
            collisionGroup: 1,
            collideAgainst: [1]
        });
        this.goalBody.collide = function() {
            game.scene.world.removeBody(this);
            game.scene.addScore();
            return false;
        };
        var goalShape = new game.Rectangle(this.width, this.height + game.scene.player.body.shape.height);
        this.goalBody.addShape(goalShape);
        game.scene.world.addBody(this.goalBody);

        this.topSprite = new game.Sprite('bar.png', game.system.width + this.width / 2, topHeight, {
            anchor: { x: 0.5, y: 0.0 },
            scale: { y: -1 }
        });
        this.topSprite.addTo(game.scene.obstacleContainer);

        this.bottomSprite = new game.Sprite('bar.png', game.system.width + this.width / 2, topHeight + this.height, {
            anchor: { x: 0.5, y: 0.0 },
        });
        this.bottomSprite.addTo(game.scene.obstacleContainer);
    },

    remove: function() {
        game.scene.world.removeBody(this.topBody);
        game.scene.world.removeBody(this.bottomBody);
        game.scene.world.removeBody(this.goalBody);
        game.scene.obstacleContainer.removeChild(this.topSprite);
        game.scene.obstacleContainer.removeChild(this.bottomSprite);
        game.scene.removeObject(this);
    },

    update: function() {
        this.topSprite.position.x = this.bottomSprite.position.x = this.topBody.position.x;
        if (this.topSprite.position.x + this.width / 2 < 0) this.remove();
    }
});

game.createClass('Cloud', {
    init: function(path, x, y, speed) {
        this.sprite = new game.Sprite(path);
        this.sprite.position.set(x, y);
        this.speed = speed;
    },

    update: function() {
        this.sprite.position.x += this.speed * game.scene.cloudSpeedFactor * game.system.delta;
        if (this.sprite.position.x + this.sprite.width <= 0) this.sprite.position.x = game.system.width;
    }
});

game.createClass('Logo', {
    init: function() {
        this.container = new game.Container();
        this.container.position.y = -150;
        this.container.addTo(game.scene.stage);

        var logo1 = new game.Sprite('logo1.png', game.system.width / 2, 0, { anchor: { x: 0.5, y: 0.5 }});
        logo1.addTo(this.container);

        var logo2 = new game.Sprite('logo2.png', game.system.width / 2, 80, { anchor: { x: 0.5, y: 0.5 }});
        logo2.addTo(this.container);

        game.scene.addTween(this.container.position, {
            y: 200
        }, 1500, {
            delay: 100,
            easing: 'Back.Out'
        }).start();

        game.scene.addTween(logo1.position, {
            y: -20
        }, 1000, {
            repeat: Infinity,
            yoyo: true,
            easing: 'Quadratic.InOut'
        }).start();

        game.scene.addTween(logo2.position, {
            y: 100
        }, 1000, {
            repeat: Infinity,
            yoyo: true,
            easing: 'Quadratic.InOut'
        }).start();
    },

    remove: function() {
        game.scene.addTween(this.container, {
            alpha: 0
        }, 1000, {
            onComplete: this.container.remove.bind(this)
        }).start();
    }
});

});
