game.module(
    'game.objects'
)
.body(function() {

// Base Entity with body and sprite
game.createClass('Entity', {
	collideAgainst: [],

	init: function(x, y) {
		this.initSprite(x, y);
		this.initBody();
		this.ready();
		game.scene.addObject(this);
	},

	ready: function() {},

	remove: function() {
		this.sprite.remove();
		this.body.remove();
	},

	initSprite: function() {},

	initBody: function() {
		this.body = new game.Body({
			position: {
				x: this.sprite.position.x * 4,
				y: this.sprite.position.y * 4
			},
			collisionGroup: this.collisionGroup,
			collideAgainst: this.collideAgainst
		});
		this.body.addShape(new game.Rectangle(this.sprite.width * 4, this.sprite.height * 4));
		this.body.addTo(game.scene.world);
		this.body.parent = this;
	},

	update: function() {
		this.onUpdate();
		this.sprite.position.x = this.body.position.x / 4;
		this.sprite.position.y = this.body.position.y / 4;
	},

	onUpdate: function() {}
});

// Extend Player from Entity class
game.createClass('Player', 'Entity', {
	speed: 500,
	collisionGroup: 0,
	// Player collides with Enemy
	collideAgainst: 1,

    initSprite: function() {
    	var x = game.system.width / 4 / 2;
    	var y = game.system.height / 4 - 24;

    	this.sprite = new game.Sprite('ship.png');
    	this.sprite.anchor.set(0.5, 0.5);
    	this.sprite.position.set(x, y);
    	this.sprite.addTo(game.scene.mainContainer);

    	var fire = new game.SpriteSheet('fire.png', 10, 9).anim();
    	fire.animationSpeed = game.scene.animationSpeed;
    	fire.play();
    	fire.anchor.set(0.5, 0);
    	fire.position.y = this.sprite.height / 2;
    	fire.addTo(this.sprite);
    },

    ready: function() {
    	this.body.collide = this.kill.bind(this);
    },

    shoot: function() {
    	// Prevent shooting when killed
    	if (!this.sprite.parent) return;

    	var bullet = new game.Bullet(this.sprite.position.x, this.sprite.position.y);
    },

    kill: function() {
    	var explosion = new game.Explosion(this.sprite.position.x, this.sprite.position.y);
    	this.remove();

    	// Restart game
    	game.scene.addTimer(3000, function() {
    		game.system.setScene('Main');
    	});
    },

    onUpdate: function() {
    	// Prevent from going out of screen
    	if (this.body.position.x > game.system.width) this.body.position.x = game.system.width;
    	if (this.body.position.x < 0) this.body.position.x = 0;

    	// Handle input
    	if (game.keyboard.down('LEFT')) this.body.velocity.x = -this.speed;
    	else if (game.keyboard.down('RIGHT')) this.body.velocity.x = this.speed;
    	else this.body.velocity.x = 0;
    }
});

game.createClass('Bullet', 'Entity', {
	collisionGroup: 0,
	collideAgainst: 1,

	initSprite: function(x, y) {
		this.sprite = new game.SpriteSheet('laser-bolts.png', 5, 13).anim();
		this.sprite.anchor.set(0.5, 0.5);
		this.sprite.animationSpeed = game.scene.animationSpeed;
		this.sprite.position.set(x, y);
		this.sprite.play();
		this.sprite.addTo(game.scene.mainContainer);
	},

	ready: function() {
		this.body.velocity.y = -700;
		this.body.collide = this.collide.bind(this);
	},

	collide: function(body) {
		this.remove();
		// Kill Enemy when colliding with it
		body.parent.kill();
	},

	onUpdate: function() {
		// Remove when out of screen
		if (this.sprite.position.y + this.sprite.height / 2 < 0) this.remove();
	}
});

game.createClass('Enemy', 'Entity', {
	speed: 400,
	collisionGroup: 1,

	initSprite: function() {
		// Random start position
		var x = Math.random(16, game.system.width / 4 - 32);

		this.sprite = new game.SpriteSheet('enemy-small.png', 16, 16).anim();
		this.sprite.anchor.set(0.5, 0.5);
		this.sprite.position.set(x, -this.sprite.height / 2);
		this.sprite.animationSpeed = game.scene.animationSpeed;
		this.sprite.play();
		this.sprite.addTo(game.scene.mainContainer);
	},

	ready: function() {
		this.body.velocity.y = this.speed;
	},

	kill: function() {
		var explosion = new game.Explosion(this.sprite.position.x, this.sprite.position.y);
		this.remove();
	},

	onUpdate: function() {
		// Remove when out of screen
		if (this.sprite.position.y - this.sprite.height / 2 > game.system.height / 4) this.remove();
	}
});

game.createClass('Explosion', {
	init: function(x, y) {
		this.sprite = new game.SpriteSheet('explosion.png', 16, 16).anim();
		this.sprite.animationSpeed = game.scene.animationSpeed * 2;
		this.sprite.anchor.set(0.5, 0.5);
		this.sprite.position.set(x, y),
		this.sprite.addTo(game.scene.mainContainer);
		this.sprite.loop = false;
		this.sprite.onComplete = this.remove.bind(this);
		this.sprite.play();
	},

	remove: function() {
		// Because of bug in Pixi, we cannot remove
		// animation right when calling onComplete (fixed on Pixi v3)
		this.sprite.visible = false;

		// Fix: Remove sprite on next frame
		game.scene.addTimer(0, function() {
			this.sprite.remove();
		}.bind(this));
	}
});

});
