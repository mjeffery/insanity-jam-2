(function(exports) {
	function WaitAction(agent, delay) {
		Action.call(this, agent);
		this.delay = delay;
		this.timer = 0;
	}

	WaitAction.prototype = Object.create(Action.prototype);
	WaitAction.prototype.constructor = WaitAction;

	_.extend(WaitAction.prototype, {
		start: function() {
			this.agent.idle();
		},

		think: function() {
			this.timer += this.agent.game.time.physicsElapsed;
			if(this.timer > this.delay)
				this.complete();
		}
	});

	exports.WaitAction = WaitAction;
})(this);
