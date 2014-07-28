(function(exports) {
	function EnemyController(player, enemy, rnd) {
		this.acceptsCommands = true;
		this.thinking = false;

		this.enemy = enemy;
		this.player = player;
		this.sensor = new PlayerSensor(player);
		this.rnd = rnd;
		this.actionQueue = [];

		enemy.events.onDamage.add(this.onDamage, this);
		enemy.events.onCommandPause.add(this.onCommandPause, this);
		enemy.events.onCommandResume.add(this.onCommandResume, this);
	}

	EnemyController.prototype = {
		weightedSelect: function(weights, choices) {
			var sum = _.reduce(weights, function(a,b) { return a + b }),
				pick = this.rnd.integerInRange(0, sum),
				val = 0, i = 0;

			while(val < sum) {
				val += weights[i];
				if(val > pick) 
					return choices[i];

				i++;
			}

			return choices[choices.length - 1];
		},

		update: function() {
			this.sensor.update();		
			if(this.actionQueue.length > 0) {
				var action = this.actionQueue[0];
				action.update();
			}
		},

		chooseNextAction: function() {
			
			if(this.enemy.dropping) {
				this.do(['near'])
			}
			else if(this.enemy.ascended)
				this.do(['cross', 'pause', 'drop']);
			else {
				this.do(['mid', 'ascend']);
			}
			return;

			var weights = [], 
				choices = [],
				agent = this.enemy;

			if(agent.ascended) {
				choices.push(['near', 'mid', 'drop']);
				weights.push([3, 3, 3]);
			}
			else {
				choices.push(['near', 'pause'], ['near', 'mid'], 'mid', 'far', 'ascend');	
				weights.push(3, 3, 4, 2, 2);
			}

			var choice = this.weightedSelect(weights, choices);
			this.do(choice);
		},

		do: function(choice) {
			if(_.isArray(choice)) {
				_.forEach(choice, this.do, this);
			}
			else {
				console.log('doing \"' + choice + '\"');
				var action = this.createAction(choice);
				this.actionQueue.push(action);
				action.events.onComplete.addOnce(this.onActionComplete, this);
			}
		},

		createAction: function(name) {
			switch(name) {
				case 'near': return new GoNearAction(this.enemy, this.sensor);
				case 'mid': return new GoMidAction(this.enemy, this.sensor);
				case 'far': return new GoFarAction(this.enemy, this.sensor);
				case 'ascend': return new AscendAction(this.enemy);
				case 'drop': return new DropAction(this.enemy);
				case 'cross': return new CrossAction(this.enemy, this.sensor);
				case 'pause': return new WaitAction(this.enemy, 0.3);
			}
		},

		onActionComplete: function() {
			this.prevAction = this.actionQueue.shift();
			if(this.actionQueue.length === 0) {
				this.chooseNextAction();	
			}
		},

		onMatchStart: function() {
			this.chooseNextAction();
		},

		onDamage: function() {
			this.actionQueue.length = 0;
		},

		onCommandPause: function() {
			this.acceptsCommands = false;
		},

		onCommandResume: function() {
			this.acceptsCommands = true;

			if(this.actionQueue.length === 0) 
				this.chooseNextAction();
		}
	};

	exports.EnemyController = EnemyController;
})(this);
