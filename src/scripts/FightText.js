(function(exports) {
	function FightText(game, key) {
		Phaser.Sprite.call(this, game, 400, 300, 'instructions-atlas', key);
		this.anchor.setTo(0.5, 0.5);
		this.fixedToCamera = true;

		this.onComplete = new Phaser.Signal();
	}

	_.extend(FightText, {
		preload: function(load) {
			load.atlasJSONArray('instructions-atlas', 'assets/atlas/instructions.png', 'assets/atlas/instructions.json');
		}
	});

	FightText.prototype = Object.create(Phaser.Sprite.prototype);
	FightText.prototype.constructor = FightText;

	_.extend(FightText.prototype, {
		start: function() {
			var tween = game.add.tween(this)
				.to({ y: 250 }, 1000);
				//.to({ y: 350 }, 1250);
				//.to({ y: 1000 }, 300);

			tween.onComplete.addOnce(function() {
				this.onComplete.dispatch();
				this.destroy();
			}, this);

			tween.start();

			return this.onComplete;
		}
	})

	exports.FightText = FightText;
})(this);
