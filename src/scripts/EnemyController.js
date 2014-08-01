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
			var weights = [], 
				choices = [],
				agent = this.enemy;

				//if(this.sensor.canPunch) { // TODO check upright!
					choices.push(
						['near', 'punch'],
						['near', 'punch', 'punch'],
						['near', 'punch', 'pause', 'punch'],
						['near', 'punch', 'punch', 'punch']);
					weights.push(7, 5, 3, 3);
				//}
				
				choices.push(
					['mid', 'cast'],
					['far', 'cast'],
					['cast'],
					['cast', 'pause', 'cast']);
				weights.push(3, 3, 1, 3);

				choices.push(
					['near', 'mid'], 
					['near', 'mid', 'near'],
					['near', 'pause'],
					'mid', 
					'far',
					'pause',
					['ascend', 'mid', 'drop', 'pause'],
					['ascend', 'cross', 'drop', 'pause'],
					['ascend', 'mid', 'cast', 'drop', 'pause'],
					['ascend', 'cross', 'mid', 'cast', 'drop', 'pause']);
				
			weights.push(5, 5, 5, 5, 2, 5, 2, 2, 2, 2);
		

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
			var agent = this.enemy,
				sensor = this.sensor;

			switch(name) {
				case 'near': return new GoNearAction(agent, sensor);
				case 'mid': return new GoMidAction(agent, sensor);
				case 'far': return new GoFarAction(agent, sensor);
				case 'ascend': return new AscendAction(agent);
				case 'drop': return new DropAction(agent);
				case 'far cross':
				case 'cross': return new CrossAction(agent, sensor);
				case 'near cross': return new CrossAction(agent, sensor, Enemy.Distance.Near); 
				case 'punch': return new PunchAction(agent, sensor);
				case 'cast': return new CastAction(agent, sensor);
				default:
					return new WaitAction(agent, 1);
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
