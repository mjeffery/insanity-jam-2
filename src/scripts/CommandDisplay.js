(function(exports) {

	function CommandDisplay(game, commandKeyPool, commandsToKeyCodes) {
		Phaser.Group.call(this, game);	
		
		_.extend(this, {
			commandKeyPool: commandKeyPool,
			commandsToKeyCodes: commandsToKeyCodes,
		});

		var timerBar = this.timerBar = this.add(new TimerBar(game, -50, 18));
		timerBar.visible = false;
		timerBar.value = 0;
	}

	_.extend(CommandDisplay, {
		Spacing: {
			Height: 32,
			Gap: 4
		},
		Tween: {
			Duration: 500,
		},
		CommandLifetime: 3000,

		preload: function(load) {
		}
	});

	CommandDisplay.prototype = Object.create(Phaser.Group.prototype);
	CommandDisplay.prototype.constructor = CommandDisplay;

	_.extend(CommandDisplay.prototype, {
		moveAllUp: function() {
			var newY, stride = CommandDisplay.Spacing.Height + CommandDisplay.Spacing.Gap;

			this.forEach(function(commandString) {
				if(!(commandString instanceof CommandString)) return;

				newY = commandString.y - stride;
				this.game.add.tween(commandString)
					.to({ y: newY }, CommandDisplay.Tween.Duration)
					.start();
			}, this);
		},

		onStringStart: function() {
			var string = new CommandString(
				this.game, 
				this.commandKeyPool, 
				this.x, this.y
			);

			this.add(string);
			this.workingString = string;

			this.timerBar.visible = true;
		},

		onStringEnd: function() {
			this.workingString.fadeOut(CommandDisplay.CommandLifetime);
			this.workingString = undefined;
			this.moveAllUp();
			this.timerBar.visible = false;
		},

		onCommand: function(command) {
			if(!!this.workingString) {
				var keycode = this.commandsToKeyCodes[command];
				if(keycode)
					this.workingString.addKey(keycode);		
				else
					console.error('cannot find keycode for command \"' + command + '\"');
			}
		},

		onTimerChanged: function(curr, max, ratio) {
			this.timerBar.value = ratio;
		}

	});

	exports.CommandDisplay = CommandDisplay;
})(this);
