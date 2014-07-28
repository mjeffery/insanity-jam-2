(function(exports) {
	function GoNearAction(agent, sensor) {
		Action.call(this, agent, sensor);
	}

	GoNearAction.prototype = Object.create(Action.prototype);
	GoNearAction.prototype.constructor = GoNearAction;

	_.extend(GoNearAction.prototype, {
		start: function() {
			var agent = this.agent,
				sensor = this.sensor,
				speed = sensor.x < agent.x ? -Enemy.Move.Speed : Enemy.Move.Speed;
			
			agent.advance(speed);
		},

		think: function() {
			var agent = this.agent,
				sensor = this.sensor;

			if(Math.abs(sensor.right - agent.x) < Enemy.Distance.Near) {
				this.complete();
			}
		}
	});

	exports.GoNearAction = GoNearAction;
})(this);
