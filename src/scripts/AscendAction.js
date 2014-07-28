(function(exports) {
	function AscendAction(agent) {
		Action.call(this, agent);
	}

	AscendAction.prototype = Object.create(Action.prototype);
	AscendAction.prototype.constructor = AscendAction;

	_.extend(AscendAction.prototype, {
		start: function() {
			this.agent.ascend(Enemy.Move.Ascend.Height, Enemy.Move.Ascend.Duration);	
		},

		think: function() {
			if(this.agent.state === 'idle')
				this.complete();
		}
	});

	exports.AscendAction = AscendAction;
})(this);
