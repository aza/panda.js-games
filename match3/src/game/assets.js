game.module(
    'game.assets'
)
.body(function() {
    
game.addAsset('tiles.json');
game.addAsset('gamefield.png');
game.addAsset('shadow.png');
game.addAsset('star.png');
game.addAsset('font.fnt');
game.addAsset('stripes.png');

game.addAudio('audio/blob.m4a', 'blob');
game.addAudio('audio/pickup.m4a', 'pickup');
game.addAudio('audio/sliding.m4a', 'sliding');

});
