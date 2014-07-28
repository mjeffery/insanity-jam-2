(function(exports) {
	function GotoAction(agent, sensor) {
		Action.call(this, agent, sensor);
	}

	GotoAction.prototype = Object.create(GotoAction.prototype);
	GotoAction.prototype.constructor = GotoAction;

	_.extend(GotoAction.prototype, {
		start: function() {
			if(this.precondition())
				this.complete();
			else 
				this.gotoTarget();	
		},
		
		think: function() {
			var agent = this.agent,
				target = this.target;

			if(Math.abs(target - agent) < GotoAction.Delta) {
				if(this.postcondition()) 
					this.complete();
				else
					this.gotoTarget();
			}
		},

		gotoTarget: function() {
			var agent = this.agent,
				sensor = this.sensor,
				target = this.calculateTarget();
		
			if(agent.x < sensor.x) {
				if(target < agent.x) agent.retreat(Enemy.Move.Speed);
				else agent.advance(Enemy.Move.Speed);
			}
			else {
				if(target < angent.x) agent.advance(Enemy.Move.Speed);
				else agent.retreat(Enemy.Move.Speed);
			}

			this.target = target;
		},
		
		precondition: function() { return true; },

		postcondition: function() {
			return this.precondition();
		}
	});

	exports.GotoAction = GotoAction;
})
