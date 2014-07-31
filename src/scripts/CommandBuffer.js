(function(exports) {

	function CommandBuffer(game) {
		_.extend(this, {
			game: game,
			keyboard: game.input.keyboard,

			keys: {},
			events: {
				onCommand: new Phaser.Signal(),		 // when a key is pressed
				onStringStart: new Phaser.Signal(),  // when a new command string starts
				onTimerChanged: new Phaser.Signal(), // when the string timer changes
				onStringEnd: new Phaser.Signal()	 // when a command string ends
			},

			_inputEnabled: false,
			_stringTimer: 0,
			_stringTimerMax: 1,

			keyTimer: 0,
			keyTimerMax: 0.333,

			state: 'waiting',
			enabled: true,
			buffer: []
		});

		this.mapKey(Phaser.Keyboard.A, 'left arm extend');
		this.mapKey(Phaser.Keyboard.S, 'left arm retract');
		this.mapKey(Phaser.Keyboard.D, 'left leg extend');
		this.mapKey(Phaser.Keyboard.F, 'left leg retract');
		this.mapKey(Phaser.Keyboard.COLON, 'right arm extend');
		this.mapKey(Phaser.Keyboard.L, 'right arm retract');
		this.mapKey(Phaser.Keyboard.K, 'right leg extend');
		this.mapKey(Phaser.Keyboard.J, 'right leg retract');
	}

	_.extend(CommandBuffer.prototype, {
		update: function() {
			if(this.state === 'in string') {
				var dt = this.game.time.physicsElapsed;
				
				this.keyTimer += dt;
				this.stringTimer += dt;

				if(this.keyTimer >= this.keyTimerMax ||
				   this.stringTimer >= this.stringTimerMax)
				{
					this.endString();
				}
			}
		},

		startString: function() {
			this.events.onStringStart.dispatch(this);
			this.stringTimer = 0;
			this.state = 'in string';
		},

		endString: function() {
			var bufferCopy = this.buffer;
			this.buffer = [];

			this.events.onStringEnd.dispatch(bufferCopy, this);
			this.state = 'waiting';
		},

		pushCommand: function(command) {
			if(this.state === 'waiting') this.startString();

			this.buffer.push(command);
			this.keyTimer = 0;
			this.events.onCommand.dispatch(command, this);
		},

		timerChanged: function() {
			var curr = this.stringTimer,
				max = this.stringTimerMax,
				ratio = max === 0 ? 0 : curr / max;

			this.events.onTimerChanged.dispatch(curr, max, ratio, this);
		},

		mapKey: function(keycode, command) {
			var key = this.keyboard.addKey(keycode); 
			this.keys[keycode] = { key: key, command: command };

			key.onDown.add(this.onKeyDown, this);
		},

		onKeyDown: function(key) {
			if(this._inputEnabled) {
				var data = this.keys[key.keyCode];
				if(data) this.pushCommand(data.command);
			}
		},

		onInputEnabled: function() {
			this._inputEnabled = true;
		},

		onInputDisabled: function() {
			this._inputEnabled = false;
		}
	});

	Object.defineProperties(CommandBuffer.prototype, {
		stringTimer: {
			get: function() {
				return this._stringTimer;
			},
			set: function(value) {
				value = Math.max(value, 0);
				value = Math.min(value, this.stringTimerMax);

				if(this._stringTimer !== value) {
					this._stringTimer = value;
					this.timerChanged();
				}
			}
		},

		stringTimerMax: {
			get: function() {
				return this._stringTimerMax;
			},
			set: function(value) {
				newMax = Math.max(0, newMax);

				if(newMax !== this._stringTimerMax) {
					this._stringTimerMax = newMax;
					if(this._stringTimer > newMax) 
						this._stringTimer = newMax;

					this.timerChanged();
				}
			}
		},

		commandsToKeyCodes: {
			get: function() {
				return _.chain(this.keys)
						.mapValues('command')
						.invert()
						.value();
			}
		}

	})

	exports.CommandBuffer = CommandBuffer;
})(this);
