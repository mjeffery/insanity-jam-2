(function(exports) {
	function HintKey(game, x, y, frame) {
		Phaser.Sprite.call(this, game, x, y, 'command-keys', frame);
		this.anchor.setTo(0.5, 0.5);
		this.alpha = 0.0;
	}

	_.extend(HintKey, {
		preload: function(load) {
			load.spritesheet('command-keys', 'assets/spritesheet/command keys.png', 32, 32, 8);
		}
	});

	HintKey.prototype = Object.create(Phaser.Sprite.prototype);
	HintKey.prototype.constructor = HintKey;

	_.extend(HintKey.prototype, {
		show: function() {
			if(this.tween) this.tween.stop();

			var tween = this.tween = this.game.add.tween(this)
				.to({alpha: 0.5 }, 250);
			
			tween.onComplete.addOnce(function() {
					this.tween = null;
				}, this);

			tween.start();
		},

		hide: function() {
			if(this.tween) this.tween.stop();

			var tween = this.tween = this.game.add.tween(this)
				.to({ alpha: 0 }, 250);

			tween.onComplete.addOnce(function() {
					this.tween = null;
				}, this);
		
			tween.start();
		}
	});

	exports.HintKey = HintKey;
})(this);
