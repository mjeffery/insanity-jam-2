(function(exports) {
	function CastAction(agent, sensor) {
		Action.call(this, agent, sensor);
	}

	CastAction.prototype = Object.create(Action.prototype);
	CastAction.prototype.constructor = CastAction;

	_.extend(CastAction.prototype, {
		start: function() {
			var agent = this.agent;
			
			agent.cast();
			agent.events
				 .onActionComplete
				 .addOnce(this.complete, this);
		}
	});

	exports.CastAction = CastAction;
})(this);
