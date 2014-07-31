(function(exports) {
	function CrossAction(agent, sensor, distance) {
		Action.call(this, agent, sensor);
		this.distance = distance || Enemy.Distance.Mid;
	}

	CrossAction.prototype = Object.create(Action.prototype);
	CrossAction.prototype.constructor = CrossAction;

	_.extend(CrossAction.prototype, {
		start: function() {
			var agent = this.agent,
				sensor = this.sensor,
				side = agent.x > sensor.x ? Phaser.RIGHT : Phaser.LEFT;

		
			if(side === Phaser.RIGHT) {
				this.target = sensor.left - this.distance;
				agent.advance(-Enemy.Move.CrossSpeed);
			}
			else {
				this.target = sensor.right + this.distance;
				agent.advance(Enemy.Move.CrossSpeed);
			}

			this.side = side;
		},
		think: function() {
			var agent = this.agent,
				side = this.side,
				target = this.target;

			if(
				(side === Phaser.RIGHT && agent.x < target) ||
				(side === Phaser.LEFT &&  agent.x > target)
			) {
				this.complete();
			}
		}
	});

	exports.CrossAction = CrossAction;
})(this);
