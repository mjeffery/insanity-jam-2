(function(exports) {
	
	function ActionEvents() {
		this.onStart = new Phaser.Signal();
		this.onComplete = new Phaser.Signal();
	}

	function Action(agent, sensor) {
		this.agent = agent;
		this.sensor = sensor;
		this.started = false;
		this.completed = false;
		this.events = new ActionEvents(); 
	}

	Action.prototype = {
		update: function() {
			if(!this.started) {
				this.start();
				this.started = true;
				this.events.onStart.dispatch(this);
			}

			if(!this.completed) 
				this.think();

			if(this.completed)
				this.events.onComplete.dispatch(this);
		},

		start: function() { },
		think: function() { },

		complete: function() {
			this.completed = true;
		}
	}

	exports.Action = Action;
})(this);
