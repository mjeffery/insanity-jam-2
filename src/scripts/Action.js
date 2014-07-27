(function(exports) {
	
	function ActionEvents() {
		this.onStart = new Phaser.Signal();
		this.onComplete = new Phaser.Signal();
	}

	function Action(agent, sensor) {
		this.agent = agent;
		this.sensor = sensor;
		this.started = false;
		this.events = new ActionEvents(); 
	}

	Action.prototype = {
		update: function() {
			if(!this.started) {
				this.start();
				this.started = true;
				this.events.onStart.dispatch(this);
			}

			this.think();
		},

		start: function() { },
		think: function() { },

		complete: function() {
			this.events.onComplete.dispatch(this);
		}
	}

	exports.Action = Action;
})(this);
