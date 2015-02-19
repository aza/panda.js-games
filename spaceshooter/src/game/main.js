game.module(
    'game.main'
)
.require(
    'game.assets',
    'game.objects'
)
.body(function() {

game.createScene('Main', {
	animationSpeed: 0.1,

    init: function() {
    	this.world = new game.World(0, 0);

        // Create scaled container for pixel art
    	this.mainContainer = new game.Container().addTo(this.stage);
    	this.mainContainer.scale.set(4, 4);

    	var bg = new game.TilingSprite('desert-backgorund-looped.png');
    	bg.speed.y = 80;
    	bg.addTo(this.mainContainer);
    	this.addObject(bg);

    	this.player = new game.Player();

        // Spawn new enemy every second
    	this.addTimer(1000, this.spawnEnemy.bind(this), true);
    	this.spawnEnemy();
    },

    spawnEnemy: function() {
    	var enemy = new game.Enemy();
    },

    keydown: function(key) {
    	if (key === 'X') this.player.shoot();
    }
});

});
