(function(exports) {
	function Enemy(game, x, y) {
		Phaser.Sprite.call(this, game, x, y, 'enemy-idle-atlas');
		this.anchor.setTo(0.5, 0.5);

		console.log(Phaser.Animation.generateFrameNames('idle__', 0, 9, '.png', 3));

		this.animations.add('idle', Phaser.Animation.generateFrameNames('idle__', 0, 9, '.png', 3), 10, true);
		this.animations.play('idle');
	}

	_.extend(Enemy, {
		preload: function(load) {
			load.atlasJSONArray('enemy-idle-atlas', 'assets/atlas/robot idle.png', 'assets/atlas/robot idle.json');
		}
	});

	Enemy.prototype = Object.create(Phaser.Sprite.prototype);
	Enemy.prototype.constructor = Enemy;

	exports.Enemy = Enemy;
})(this);
