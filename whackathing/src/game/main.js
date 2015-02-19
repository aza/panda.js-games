game.module(
    'game.main'
)
.require(
    'game.assets',
    'game.objects',
    'game.scenes'
)
.body(function(){

if(CocoonJS && CocoonJS.Social.GameCenter.nativeExtensionObjectAvailable) {
    var gc = CocoonJS.Social.GameCenter;
    game.socialService = gc.getSocialInterface();
}

// if(CocoonJS && CocoonJS.nativeExtensionObjectAvailable && CocoonJS.Ad) {
//     CocoonJS.Ad.onBannerReady.addEventListener(function(width,height) {
//         CocoonJS.Ad.setBannerLayout(CocoonJS.Ad.BannerLayout.BOTTOM_CENTER);
//         CocoonJS.Ad.showBanner();
//     });
//     CocoonJS.Ad.preloadBanner();
// }

});
