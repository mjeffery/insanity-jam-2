(function(exports) {
	function DropAction(agent) {
		Action.call(this, agent);
	}	

	DropAction.prototype = Object.create(Action.prototype);
	DropAction.prototype.constructor = DropAction;

	_.extend(DropAction.prototype, {
		start: function() {
			this.agent.drop(300);
			this.agent.events.onActionComplete.addOnce(this.complete, this);
		}
	});

	exports.DropAction = DropAction;
})(this);
