(function(exports) {
	function AscendAction(agent) {
		Action.call(this, agent);
	}

	AscendAction.prototype = Object.create(Action.prototype);
	AscendAction.prototype.constructor = AscendAction;

	exports.AscendAction = AscendAction;
})(this);
