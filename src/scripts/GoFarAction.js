(function(exports) {
	function GoFarAction(agent, sensor) {
		Action.call(this, agent, sensor);
	}

	GoFarAction.prototype = Object.create(Action.prototype);
	GoFarAction.prototype.constructor = GoFarAction;

	_.extend(GoFarAction.prototype, {
		start: function() {
			var agent = this.agent,
				sensor = this.sensor,
				speed = (agent.x < sensor.x) ? -Enemy.Move.Speed : Enemy.Move.Speed;

			agent.retreat(speed);
		},

		think: function() {
			var agent = this.agent,
				sensor = this.sensor;

			if(Math.abs(sensor.left - agent.x) > Enemy.Distance.Far) {
				this.events.onComplete.dispatch(this);
			}
		}
	});

	exports.GoFarAction = GoFarAction;
})(this);
