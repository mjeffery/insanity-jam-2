(function(exports) {

	function CommandKeyPool(game, size) {
		Phaser.Group.call(this, game);

		if(size === undefined) size = 50;
		this.createMultiple(size, 'command-keys');


		var codes = [Phaser.Keyboard.A, Phaser.Keyboard.S, Phaser.Keyboard.D, Phaser.Keyboard.F,
					 Phaser.Keyboard.J, Phaser.Keyboard.K, Phaser.Keyboard.L, Phaser.Keyboard.COLON];

		this.codesToFrames = _.reduce(codes, function(map, value, i) {
			map[value] = i;
			return map;
		}, {});
	}

	_.extend(CommandKeyPool, {
		preload: function(load) {
			load.spritesheet('command-keys', 'assets/spritesheet/command keys.png', 32, 32, 8);
		}
	});

	CommandKeyPool.prototype = Object.create(Phaser.Group.prototype);
	CommandKeyPool.prototype.constructor = CommandKeyPool;
	
	_.extend(CommandKeyPool.prototype, {
		obtain: function(keyCode) {
			var key = this.getFirstDead(),
				frame = this.codesToFrames[keyCode];

			this.remove(key, false, true);
			key.reset(0, -16); //TODO magic string, half height for offset
			key.alpha = 1;
			key.frame = frame;
			
			return key;
		},

		release: function(key) {
			key.kill();
			this.add(key);
		}
	});

	exports.CommandKeyPool = CommandKeyPool;
})(this);
