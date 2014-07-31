(function(exports) {
	function PunchAction(agent, sensor) {
		Action.call(this, agent, sensor);	
	}
	
	PunchAction.prototype = Object.create(Action.prototype);
	PunchAction.prototype.constructor = PunchAction;

	_.extend(PunchAction.prototype, {
		start: function() {
			var agent = this.agent,
				sensor = this.sensor,
				speed = agent.x < sensor.x ? Enemy.Move.Speed : -Enemy.Move.Speed; 

			agent.punch(speed);
			agent.events.onActionComplete
					    .addOnce(this.complete, this);
		}
	});

	exports.PunchAction = PunchAction;
})(this);
