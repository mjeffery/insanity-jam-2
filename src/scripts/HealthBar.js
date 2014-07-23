(function(exports) {
	function HealthBar(game, x, y, team) {
		Phaser.Sprite.call(this, game, x, y, 'hp-guages', 'guage-bg');

		var guage = this._guage = game.make.sprite(0, 1, 'hp-guages', team + '-hp-guage');
		var overlay = game.make.sprite(-3, -3, 'hp-guages', team + '-hp-guage-overlay');

		this.addChild(guage);
		this.addChild(overlay);

		var rect = this._rect = new Phaser.Rectangle(0, 0, guage.width, guage.height);
		guage.crop(rect);
	}

	_.extend(HealthBar, {
		preload: function(load) {
			load.atlasJSONHash('hp-guages', 'assets/atlas/health guages.png', 'assets/atlas/health guages.json');
		}
	});

	HealthBar.prototype = Object.create(Phaser.Sprite.prototype);
	HealthBar.prototype.constructor = HealthBar;

	_.extend(HealthBar.prototype, {
	
	});

	exports.HealthBar = HealthBar;
})(this);
