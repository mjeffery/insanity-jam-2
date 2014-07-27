(function(exports) {
	function GoNearAction(agent, sensor) {
		Action.call(this, agent, sensor);
	}

	GoNearAction.prototype = Object.create(Action.prototype);
	GoNearAction.prototype.constructor = GoNearAction;

	_.extend(GoNearAction.prototype, {
		start: function() {

		},

		think: function() {

		}
	});

	exports.GoNearAction = GoNearAction;
})(this);