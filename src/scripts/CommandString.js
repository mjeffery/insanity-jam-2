(function(exports){
	function CommandString(game, commandKeyPool, x, y) {
		Phaser.Group.call(this, game);

		_.extend(this, {
			commandKeyPool: commandKeyPool,
			x: x || 0,
			y: y || 0
		});

	}

	_.extend(CommandString, {
		Spacing: {
			Width: 32,
			Gap: 2
		},
		Fade: {
			Duration: 1500
		}
	});

	CommandString.prototype = Object.create(Phaser.Group.prototype);
	CommandString.prototype.constructor = CommandString;

	_.extend(CommandString.prototype, {
		addKey: function(keycode) {
			var key = this.commandKeyPool.obtain(keycode);

			this.add(key);
			this.recenter();
		},

		recenter: function() {
			var count = this.countLiving();
			if(count === 0) return;

			var newWidth = count * CommandString.Spacing.Width + 
						   (count - 1) * CommandString.Spacing.Gap,
				currx = - newWidth / 2,
				stride = CommandString.Spacing.Width + CommandString.Spacing.Gap;
		
			this.forEachAlive(function(key) {
				key.position.x = currx;
				currx += stride;
			});
		},

		fadeOut: function(delay) {
			this.forEach(function(key) {
				this.game.add.tween(key)
					.to( { alpha: 0 }, CommandString.Fade.Duration, undefined, true, delay)
					.onComplete.addOnce(this._onComplete, this);
			}, this)
		},

		_onComplete: function(key) {
			this.remove(key);
			this.commandKeyPool.release(key);
		}
	});

	exports.CommandString = CommandString;
})(this);
