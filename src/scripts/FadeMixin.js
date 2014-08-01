(function(exports) {
	
exports.FadeMixin = Mixin.create({
	fader: function() {
		var game = this.game,
			fader = this.add.sprite(0, 0,'black');
		
		fader.width = 800;
		fader.height = 600;
		fader.fixedToCamera = true;
		game.world.bringToTop(fader);
		fader.bringToTop();

		return fader;
	},

	fadeIn: function(delay, duration) {
		var game = this.game,
			fader = this.fader(),
			tween = game.add.tween(fader)
						.to({ alpha: 0 }, duration, undefined, true, delay);

		
		return {
			onComplete: tween.onComplete
		};
	},

	fadeOut: function(duration, delay) {
		var game = this,game,
			fader = this.fader(),
			tween = this.add.tween(fader)
						.to({ alpha: 1 }, duration)
						.to({ alpha: 1 }, delay || 0);

		fader.alpha = 0;

		tween.start();

		return { onComplete: tween.onComplete };	
	}
});


})(this);
