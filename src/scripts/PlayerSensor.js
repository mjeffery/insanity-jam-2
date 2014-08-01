(function(exports) {
	function PlayerSensor(player) {
		this.player = player;
	
		this._rect = new Phaser.Rectangle();
	}

	PlayerSensor.prototype = {
		update: function() {
			this._rect.copyFrom(this.player.bodyRect);
		},

		withinDistance: function(sprite, distance) {
			var edge = sprite.x > this.x ? this.right : this.left;
			return Math.abs(edge - sprite.x) < distance;
		}
	};

	Object.defineProperties(PlayerSensor.prototype, {
		x: { get: function() { return this._rect.centerX; } },
		y: { get: function() { return this._rect.centerY; } },
		left: { get: function() { return this._rect.left; } },
		right: { get: function() { return this._rect.right; } },
		canPunch: { 
			get: function() {
				return this._rect.bottom < 400 &&
					   this._rect.top > 200;
			}
		}
	});

	exports.PlayerSensor = PlayerSensor;
})(this);
