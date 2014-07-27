(function(exports) {
	function PlayerSensor(player) {
		this.player = player;
	
		this._rect = new Phaser.Rectangle();
	}

	PlayerSensor.prototype = {
		update: function() {
			this._rect.copyFrom(this.player.cameraRect);
		}
	};

	Object.defineProperties(PlayerSensor.prototype, {
		x: { get: function() { return this._rect.centerX; } },
		y: { get: function() { return this._rect.centerY; } },
		left: { get: function() { return this._rect.left; } },
		right: { get: function() { return this._rect.right; } }
	});

	exports.PlayerSensor = PlayerSensor;
})(this);
