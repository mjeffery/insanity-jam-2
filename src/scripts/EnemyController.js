(function(exports) {
	function EnemyController(player, enemy) {
		this.acceptsCommands = true;

		this.enemy = enemy;
		this.player = player;
		this.sensor = new PlayerSensor(player);
	}

	EnemyController.prototype = {
		update: function() {
			this.sensor.update();		
		},

		onMatchStart: function() {
		
		},

		onCommandPause: function() {
			this.acceptsCommands = false;
		},

		onCommandResume: function() {
			this.acceptsCommands = true;
		}
	};

	exports.EnemyController = EnemyController;
})(this);
