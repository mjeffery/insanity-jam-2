(function(exports) {
	function DropAction(agent) {
		Action.call(this, agent);
	}	

	DropAction.prototype = Object.create(Action.prototype);
	DropAction.prototype.constructor = DropAction;

	_.extend(DropAction.prototype, {
		start: function() {
			this.agent.drop();
			this.complete();
		}
	});

	exports.DropAction = DropAction;
})(this);
