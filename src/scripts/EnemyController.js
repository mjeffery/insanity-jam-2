(function(exports) {
	function EnemyController(player, enemy) {
		this.acceptsCommands = true;
		this.thinking = false;

		this.enemy = enemy;
		this.player = player;
		this.sensor = new PlayerSensor(player);

		this.actionQueue = [];
	}

	EnemyController.prototype = {
		update: function() {
			this.sensor.update();		
			if(this.actionQueue.length > 0) {
				var action = this.actionQueue[0];
				action.update();
			}
		},

		chooseNextAction: function() {
			this.actionQueue.push(new GoNearAction(this.enemy, this.sensor));
		},

		pushAction: function(action) {
			this.actionQueue.push(action);
			action.events.onComplete.addOnce(onActionComplete, this);
		},

		onActionComplete: function() {
			this.actionQueue.shift();
			if(this.actionQueue.length === 0) {
				
			}
		},

		onMatchStart: function() {
			this.chooseNextAction();
		},

		onCommandPause: function() {
			this.acceptsCommands = false;
		},

		onCommandResume: function() {
			this.acceptsCommands = true;

			if(this.actionQueue.length === 0) 
				chooseNextAction();
		}
	};

	exports.EnemyController = EnemyController;
})(this);
