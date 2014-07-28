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

			if(!sensor.withinDistance(agent, Enemy.Distance.Far)) {
				this.complete();
			}
		}
	});

	exports.GoFarAction = GoFarAction;
})(this);
