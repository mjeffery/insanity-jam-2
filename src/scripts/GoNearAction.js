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

			if(sensor.withinDistance(agent, Enemy.Distance.Near + 10))
				this.complete();
			else
				agent.advance(speed);
		},

		think: function() {
			var agent = this.agent,
				sensor = this.sensor;

			if(sensor.withinDistance(agent, Enemy.Distance.Near)) {
				this.complete();
			}
			else /*if(!sensor.withinDistance(agent, Enemy.Distance.Far)) */ {
				var speed = sensor.x < agent.x ? -Enemy.Move.Speed : Enemy.Move.Speed;
				agent.advance(speed);
			}
		}
	});

	exports.GoNearAction = GoNearAction;
})(this);
