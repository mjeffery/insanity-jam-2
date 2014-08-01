(function(exports) {
	function Preload() {}

	Preload.prototype = {
		preload: function() {
			var x = 250,
				y = 296,
				add = this.add,
				load = this.load;

			add.sprite(x, y, 'loading-bar-bg');

			var loadingBar = add.sprite(x, y, 'loading-bar');
			load.setPreloadSprite(loadingBar);

			load.bitmapFont('minecraftia', 'assets/font/minecraftia.png', 'assets/font/minecraftia.xml');

			Robot.preload(load);
			Ground.preload(load);
			CommandKeyPool.preload(load);
			TimerBar.preload(load);
			CommandDisplay.preload(load);
			Instructions.preload(load);
			HealthBar.preload(load);
			Enemy.preload(load);
			Intro.preload(load);
			EnemyMagicMissile.preload(load);

			load.onLoadComplete.addOnce(this.onLoadComplete, this);					
		},
		create: function() {
			this.stage.setBackgroundColor('#530301');
		},
		onLoadComplete: function() {
			this.fadeOut(300, 700).onComplete.add(function() {
				this.state.start('intro');
			}, this);
		}
	};

	FadeMixin(Preload.prototype);

	exports.Preload = Preload;
})(this);
