(function(exports) {
	function GoMidAction(agent, sensor) {
		Action.call(this, agent, sensor);
	}

	GoMidAction.Slop = 10;

	GoMidAction.prototype = Object.create(Action.prototype);
	GoMidAction.prototype.constructor = GoMidAction;

	_.extend(GoMidAction.prototype, {
		start: function() {
			var agent = this.agent,
				sensor = this.sensor,
				side = agent.x > sensor.x ? Phaser.RIGHT : Phaser.LEFT;

			this.side = side;

			if(side == Phaser.RIGHT) {
				if(agent.x < sensor.right + Enemy.Distance.Mid - GoMidAction.Slop) 
					agent.retreat(Enemy.Move.Speed);
				else 
					agent.advance(-Enemy.Move.Speed);
			}
			else {
				if(agent.x < sensor.left - Enemy.Distance.Mid + GoMidAction.Slop)
					agent.advance(Enemy.Move.Speed);
				else 
					agent.retreat(-Enemy.Move.Speed);
			}
		},

		think: function() {
			var agent = this.agent,
				sensor = this.sensor;

			if(
				(
				 	this.side == Phaser.RIGHT &&
					Math.abs(sensor.right + Enemy.Distance.Mid - agent.x) < GoMidAction.Slop
				) ||
				(
				 	this.side == Phaser.LEFT &&
					Math.abs(sensor.left - Enemy.Distance.Mid - agent.x) < GoMidAction.Slop
				)
			) {
				this.complete();
			}
		}
	});

	exports.GoMidAction = GoMidAction;
})(this);
