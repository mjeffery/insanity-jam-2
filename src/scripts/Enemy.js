(function(exports) {

	function Enemy(game, collisionGroups, x, y) {
		Phaser.Sprite.call(this, game, x, y);
		this.anchor.setTo(0.5, 0.5);

		game.physics.arcade.enable(this);
		this.body.setSize(73, 256);

		var victim = this.victim = game.add.existing(new EnemyVictim(this.game, 0, 0, 73, 256));
		this.addChild(victim);

		_.extend(this.events, {
			onDamage: new Phaser.Signal(),
			onCommandPause: new Phaser.Signal(),		// fires when the enemy cannot receive commands 
			onCommandResume: new Phaser.Signal(),		// fires when the enemy can receive commands
		});

		this._startY = y;
		this._facing = Phaser.LEFT;
		this._state = 'none';
		this._touchedGround = false;
		this._acceptCommands = true;

		this.idle();

		var isLeft = true;
		game.input.keyboard.addKey(Phaser.Keyboard.T).onDown.add(function() {
			switch(this.state) {
				case 'idle':
					if(isLeft) {
						this.advance(-50);
						isLeft = false;
					}
					else {
						this.retreat(50);
						isLeft = true;
					}
					break;
				case 'retreating':
				case 'advancing':
					this.idle();
			}
		}, this);

		game.input.keyboard.addKey(Phaser.Keyboard.U).onDown.add(function() {
			this.knockback(-200, -300);
		}, this);
	}

	_.extend(Enemy, {
		Knockback: {
			Gravity: 300,
			TurnThreshold: 20
		},
		WakeUp: {
			Time: 1.5	
		},
		StandUp: {
			Time: 500 
		},
		Distance: {
			Far: 700,
			Mid: 300,
			Near: 150 
		},
		Move: {
			Speed: 150
		},
		
		preload: function(load) {
			load.atlasJSONArray('enemy-atlas', 'assets/atlas/enemy.png', 'assets/atlas/enemy.json');
			load.atlasJSONArray('enemy-extra-atlas', 'assets/atlas/enemy extra.png', 'assets/atlas/enemy extra.json');
		}
	});

	Enemy.prototype = Object.create(Phaser.Sprite.prototype);
	Enemy.prototype.constructor = Enemy;

	_.extend(Enemy.prototype, {

		update: function() {
			switch(this.state) {
				case 'knocked back':
					if(this.body.velocity.y > -Enemy.Knockback.TurnThreshold) {
						this.animations.play('fall-back');
						this.body.setSize(284, 42, 0, 30);
						this.body.bounce.setTo(0.3, 0.3);

						this.state = 'falling';
					}
					break;

				case 'waking up':
					this._wakeUpTimer += this.game.time.physicsElapsed;
					if(this._wakeUpTimer >= Enemy.WakeUp.Time)
						this.stand();
					break;
			}
		},

		onCollision: function() {
			switch(this.state) {
				case 'falling': 
				case 'waking up':
					this.body.velocity.x = 0.7 * this.body.velocity.x;
					if(!this._touchedGround) {
						this._touchedGround = true;
						this.wakeUp();
					}
					break;
			}
		},

		idle: function() {
			switch(this.state) {
				case 'idle': return;
				case 'none':
				case 'standing':
					this.doIdle();
					break;

				case 'advancing':
					this.acceptCommands = false;
					this.animations.play('stop-advance')
						.onComplete.addOnce(function() {
							this.acceptCommands = true;
							this.doIdle();
						}, this);
					break;

				case 'retreating':
					this.acceptCommands = false;
					this.animations.play('stop-retreat')
						.onComplete.addOnce(function() {
							this.acceptCommands = true;
							this.doIdle();
						}, this);
			}
		},

		advance: function(speed) {

			switch(this.state) {
				case 'advancing': return;
				case 'none':
				case 'idle': 
					this.doAdvance(speed);
					break;

				case 'retreating':
					this.acceptCommands = false;
					this.animations.play('stop-retreat')
						.onComplete.addOnce(function() {
							this.acceptCommands = true;
							this.doAdvance(speed);
						}, this);

					this.body.velocity.x = speed;
					break;
			}
		},

		retreat: function(speed) {
			switch(this.state) {
				case 'retreating': return; //TODO factor in speed!
				case 'none':
				case 'idle':
					this.doRetreat(speed);
					break;

				case 'advancing':
					this.acceptCommands = false;
					this.animations.play('stop-advance')
						.onComplete.addOnce(function() {
							this.acceptsCommands = true;
							this.doRetreat(speed);
						}, this);

					this.body.velocity.x = speed;
					break;
			}	
		},

		knockback: function(velx, vely) {
			this.acceptCommands = false;
			this.switchToMainAtlas();
			this.setFacing(-velx);
			this.animations.play('knocked-up');
		
			this.body.velocity.setTo(velx, vely);
			this.body.acceleration.y = Enemy.Knockback.Gravity;

			this._touchedGround = false;
			this.state = 'knocked back';
		},

		wakeUp: function() {
			this._wakeUpTimer = 0;
			this.state = 'waking up';
		},

		stand: function() {
			if(this.state != 'waking up') return;

			this.body.velocity.setTo(0, 0);
			this.body.acceleration.y = 0;

			this.game.add.tween(this)
				.to({ y: this._startY }, Enemy.StandUp.Time)
				.start();

			this.switchToExtraAtlas();
			this.animations.play('stand')
				.onComplete.addOnce(function(){
					this.acceptsCommands = true;
					this.body.setSize(73, 256, 0, 0);
					this.idle();
				}, this);

			this.state = 'standing';
		},

		doIdle: function() {
			this.switchToMainAtlas();
			this.animations.play('idle');

			this.body.velocity.x = 0;
			this.state = 'idle';
		},

		doAdvance: function(speed) {
			this.switchToMainAtlas();
			this.setFacing(speed);
			this.animations.play('start-advance')
				.onComplete.addOnce(function() {
					this.animations.play('advancing');
				}, this);

			this.body.velocity.x = speed;
			this.state = 'advancing';
		},

		doRetreat: function(speed) {
			this.switchToMainAtlas();
			this.setFacing(-speed);
			this.animations.play('start-retreat')
				.onComplete.addOnce(function() {
					this.animations.play('retreating');
				}, this);

			this.body.velocity.x = speed;
			this.state = 'retreating';
		},

		setFacing: function(xVal) {
			if(xVal < 0) {
				this.scale.x = 1;
				this.facing = Phaser.LEFT;
			}
			else {
				this.scale.x = -1;
				this.facing = Phaser.RIGHT;
			}
		},

		switchToMainAtlas: function() {
			if(this.key === 'enemy-atlas') return;

			this.loadTexture('enemy-atlas');
			this.anchor.setTo(0.5, 0.5);

			this.animations.add('idle', Phaser.Animation.generateFrameNames('idle__', 0, 9, '.png', 3), 10, true);

			this.animations.add('start-advance', Phaser.Animation.generateFrameNames('advance__', 0, 2, '.png', 3), 10);
			this.animations.add('advancing', Phaser.Animation.generateFrameNames('advance__', 3,5, '.png', 3), 10, true);
			this.animations.add('stop-advance', Phaser.Animation.generateFrameNames('advance__', 2, 0, '.png', 3), 10);

			this.animations.add('start-retreat', Phaser.Animation.generateFrameNames('retreat__', 0, 2, '.png', 3), 10);
			this.animations.add('retreating', Phaser.Animation.generateFrameNames('retreat__', 3,5, '.png', 3), 10, true);
			this.animations.add('stop-retreat', Phaser.Animation.generateFrameNames('retreat__', 2, 0, '.png', 3), 10);

			this.animations.add('knocked-up', ['knockback__000.png'], 1, true);
			this.animations.add('fall-back', Phaser.Animation.generateFrameNames('knockback__', 0, 5, '.png', 3), 10);
			this.animations.add('fallen', ['knockback__005.png'], 1, true);

			this.animations.add('start-cast', Phaser.Animation.generateFrameNames('wave_attack__', 0, 5, '.png', 3), 10);
			this.animations.add('casting', ['wave_attack__005.png'], 1, true);
			this.animations.add('stop-cast', Phaser.Animation.generateFrameNames('wave_attack__', 5, 0, '.png', 3), 10);
		},

		switchToExtraAtlas: function() {
			if(this.key === 'enemy-extra-atlas') return;

			this.loadTexture('enemy-extra-atlas');
			this.anchor.setTo(0.5, 0.5);

			this.animations.add('slash', Phaser.Animation.generateFrameNames('slash__', 0, 7, '.png', 3), 5);
			this.animations.add('stand', Phaser.Animation.generateFrameNames('stand__', 0, 7, '.png', 3), 10);
		}
	});

	var tmpRect = new Phaser.Rectangle();

	Object.defineProperties(Enemy.prototype, {
		state: {
			get: function() {
				return this._state;
			},
			set: function(val) {
				this.prevState = this._state;
				this._state = val;
			}
		},
		acceptCommands: {
			get: function() {
				return this._acceptCommands;
			},
			set: function(val) {
				if(val != this._acceptCommands) {
					if(val) 
						this.events.onCommandResume.dispatch(this);
					else
						this.events.onCommandPause.dispatch(this);
					this._acceptCommands = val;
				}
			}
		},
		cameraRect: {
			get: function() {
				var rect = this.getBounds();

				tmpRect.copyFrom(rect);
				tmpRect.x += this.game.camera.x;
				tmpRect.y += this.game.camera.y;

				return tmpRect;
			}
		}
	});

	function EnemyVictim(game, x, y, w, h) {
		Phaser.Sprite.call(this, game, x, y);
		this.anchor.setTo(0.5,0.5);

		game.physics.arcade.enable(this);
		this.body.setSize(w, h);

		this._square = new Phaser.Rectangle(x, y, w, h);
	}

	EnemyVictim.prototype = Object.create(Phaser.Sprite.prototype);
	EnemyVictim.prototype.constructor = EnemyVictim;
	
	Object.defineProperty(EnemyVictim.prototype, 'rect', {
		get: function() {
			this._square.x = this.body.x;
			this._square.y = this.body.y;

			return this._square;
		}
	})

	exports.Enemy = Enemy;
})(this);
