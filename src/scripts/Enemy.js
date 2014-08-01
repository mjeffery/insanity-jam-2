(function(exports) {

	function Enemy(game, collisionGroups, x, y) {
		Phaser.Sprite.call(this, game, x, y);
		this.initialize(100);

		this.anchor.setTo(0.5, 0.5);

		game.physics.arcade.enable(this);
		this.body.setSize(73, 256);

		var victim = this.victim = game.add.existing(new EnemyVictim(this.game, 0, 0, 73, 256));
		this.addChild(victim);

		_.extend(this.events, {
			onCommandPause: new Phaser.Signal(),		// fires when the enemy cannot receive commands 
			onCommandResume: new Phaser.Signal(),		// fires when the enemy can receive commands
			onActionComplete: new Phaser.Signal(),		// fires when an "action" completes
		});

		this.collisionGroups = collisionGroups;

		this._startY = y;
		this._facing = Phaser.LEFT;
		this._state = 'none';
		this._touchedGround = false;
		this._acceptCommands = true;
		this._vulnerable = true;

		var punchBullet = this._punchBullet = new EnemyPunchDamage(game, this.collisionGroups, 0, 0);
		this.game.add.existing(punchBullet);
		punchBullet.kill();

		var missiles = this._missiles = game.add.group();
		for(var i = 0; i < 5; i++) {
			var missile = new EnemyMagicMissile(this.game, collisionGroups);
			missiles.add(missile);
			missile.kill();
		}

		this.idle();
	}

	_.extend(Enemy, {
		Knockback: {
			Gravity: 500,
			TurnThreshold: 20,
			Launch: {
				X: 200,
				Y: -450
			}
		},
		WakeUp: {
			Time: 1.5	
		},
		StandUp: {
			Time: 500 
		},
		Distance: {
			Far: 500,
			Mid: 300,
			Near: 150 
		},
		Move: {
			Speed: 200,
			CrossSpeed: 600, 
			Ascend: {
				Height: 250,
				Duration: 750
			}
		},
		Punch: {
			Offset: {
				X: 0,
				Y: -150
			},
			Velocity: {
				X: 850,
				Y: -450
			},
			Lifetime: 200
		},
		Cast: {
			Offset: {
				X: 95,
				Y: -115
			},
			Velocity: {
				X: 250,
				Y: 550,
			},
			StartingScale: 0.1,
			Duration: 1500,
			Cooldown: {
				Duration: 0.33
			}
		},
		
		preload: function(load) {
			load.atlasJSONArray('enemy-atlas', 'assets/atlas/enemy.png', 'assets/atlas/enemy.json');
			load.atlasJSONArray('enemy-extra-atlas', 'assets/atlas/enemy extra.png', 'assets/atlas/enemy extra.json');
		}
	});

	Enemy.prototype = Object.create(Phaser.Sprite.prototype);
	Enemy.prototype.constructor = Enemy;

	HasHpMixin(Enemy.prototype);

	_.extend(Enemy.prototype, {

		magicMissile: function() {
			var x = this.x + (this.facing === Phaser.LEFT ? -Enemy.Cast.Offset.X : Enemy.Cast.Offset.X),
				y = this.y + Enemy.Cast.Offset.Y,
				vx = this.facing == Phaser.LEFT ? -Enemy.Cast.Velocity.X : Enemy.Cast.Velocity.Y,
				vy = Enemy.Cast.Velocity.Y,
				missile = this._missiles.getFirstDead();

			this._chargingMissile = missile;

			missile.charge(x, y);

			missile.scale.setTo(Enemy.Cast.StartingScale, Enemy.Cast.StartingScale);
			this.game.add.tween(missile.scale)
				.to({ x: 1, y: 1}, Enemy.Cast.Duration, undefined, true)
				.onComplete.addOnce(function() {
					this._castCooldown = 0;
					this._castComplete = true;
					missile.fire(vx, vy);
				}, this);
		},

		takeDamage: function(side, origin, speed) {
			if(!this._vulnerable) return;

			var vx = Enemy.Knockback.Launch.X,
				vy = Enemy.Knockback.Launch.Y;

			vx = (side === Phaser.LEFT ? vx : -vx);

			this.knockback(vx, vy);
			this._punchBullet.kill();

			this._hp -= 10; //TODO calculate damage

			this.events.onDamage.dispatch(this._hp, this._maxHp);
				
		},

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

				case 'punching':
					if(!this._firedPunchBullet &&
					   this.animations.currentFrame.name === 'slash__003.png') 
					{
						var game = this.game,
							x = this.x + Enemy.Punch.Offset.X,
							y = this.y + Enemy.Punch.Offset.Y,
							vx = this.facing == Phaser.RIGHT ? Enemy.Punch.Velocity.X : -Enemy.Punch.Velocity.X,
							vy = -Enemy.Punch.Velocity.Y,
							bullet = this._punchBullet;
								
						bullet.reset(x, y);
						bullet.lifespan = Enemy.Punch.Lifetime;
						bullet.body.velocity.x = vx; 
						bullet.body.velocity.y = vy;

						this._firedPunchBullet = true;
					}
					break;

				case 'casting':
					if(this._castComplete) {
						this._castCooldown += this.game.time.physicsElapsed;
						if(this._castCooldown > Enemy.Cast.Cooldown.Duration) {
							this._castCooldown = -10000; // treating this like yet another control flag
							this.animations.play('stop-cast')
								.onComplete.addOnce(function() {
									this.idle();
									this.events.onActionComplete.dispatch(this, 'cast');
								}, this);
						}
					}
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

				default:
					if(this._dropping) {
						this._dropping = false;

						this.body.acceleration.y = 0;

						this.game.add.tween(this)
							.to({ y: this._startY }, 200)
							.start(); //TODO magic number
					}
			}
		},


		punch: function(speed) {
			switch(this.state) {
				case 'none':
				case 'idle':
					this.startPunch(speed);
					break;

				case 'advancing':
					this.doPunch(speed);
					break;

				case 'retreating':
					this.stopRetreat(function() {
						this.startPunch(speed);
					});
					break;
			}	
		},

		cast: function() {
			switch(this.state) {
				case 'none':
				case 'idle':
					this.doCast();
					break;

				case 'advancing':
					this.stopAdvance(this.doCast);
					break;

				case 'retreating':
					this.stopRetreat(this.doCast);
					break;
			}
		},

		idle: function() {
			switch(this.state) {
				case 'idle': return;
				case 'none':
				case 'standing':
				case 'ascending':
				case 'punching':
				case 'casting':
					this.doIdle();
					break;

				case 'advancing':
					this.stopAdvance(this.doIdle);
					break;

				case 'retreating':
					this.stopRetreat(this.doIdle);
			}
		},

		advance: function(speed) {

			switch(this.state) {
				case 'advancing': 
					this.body.velocity.x = speed;
					this.setFacing(speed);
					break;

				case 'none':
				case 'idle': 
					this.doAdvance(speed);
					break;

				case 'retreating':
					this.stopRetreat(function() {
							this.doAdvance(speed);
						});

					this.body.velocity.x = speed;
					break;
			}
		},

		retreat: function(speed) {
			switch(this.state) {
				case 'retreating': 
					this.body.velocity.x = speed;
					this.setFacing(-speed);
					break;

				case 'none':
				case 'idle':
					this.doRetreat(speed);
					break;

				case 'advancing':

					this.stopAdvance(function() {
							this.doRetreat(speed);
						});

					this.body.velocity.x = speed;
					break;
			}	
		},

		ascend: function(height, duration) {
			switch(this.state) {
				case 'none':
				case 'idle':
					this.doAscend(height, duration);
					break;

				case 'advancing':
					this.stopAdvance(function() {
						this.doAscend(height, duration) 
					});

					this.body.velocity.x = 0;
					break;

				case 'retreating':
					this.stopRetreat(function() {
						this.doAscend(height, duration);
					});

					this.body.velocity.x = 0;
					break;
			}
		},

		drop: function(duration) {
			if(!this._dropping && this.ascended) {
				this._dropping = true;
				this.ascended = false;
				this.body.acceleration.y = Enemy.Knockback.Gravity;
			}
		},

		knockback: function(velx, vely) {
			this._vulnerable = false;

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
			if(this.hp <= 0) return;

			this._vulnerable = true;
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
					this.acceptCommands = true;
					this.body.setSize(73, 256, 0, 0);
					this.idle();
				}, this);

			this.state = 'standing';
		},

		doCast: function() {
			this.switchToMainAtlas();
			this.animations.play('start-cast')
				.onComplete.addOnce(function() {
					this.animations.play('casting');
					this.magicMissile();
				}, this);

			this._castComplete = false;
			this._castCooldown = 0;

			this.body.velocity.x = 0;
			this.state = 'casting';
		},

		startPunch: function(speed) {
			this.switchToMainAtlas();
			this.setFacing(speed);
			this.animations.play('start-advance')
				.onComplete.addOnce(function() {
					this.doPunch(speed);
				}, this); 

			this.body.velocity.x = speed;
			this.state = 'punching';
		},

		doPunch: function(speed) {
			this.switchToExtraAtlas();
			this.setFacing(speed);
			this.animations.play('slash')
				.onComplete.addOnce(this.stopPunch, this);
			
			//TODO how to make kinematic bullet?
			this._firedPunchBullet = false;
			
			this.body.velocity.x = speed;
			this.body.velocity.y = 0; // what?
			if(this.state !== 'punching')
				this.state = 'punching';
		},

		stopPunch: function() {
			this.switchToMainAtlas();
			this.animations.play('stop-advance')
				.onComplete.addOnce(function() {
					this.idle();
					this.events.onActionComplete.dispatch(this, 'punch');
				}, this);
		},

		doIdle: function() {
			this.switchToMainAtlas();
			this.animations.play('idle');

			this.body.velocity.setTo(0, 0); 
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

		stopAdvance: function(callback, context) {
			context = context || this;
			if(this.state !== 'advancing') 
				callback.apply(this);
			else {
				this.animations.play('stop-advance') 
					.onComplete.addOnce(callback, context);
			}
		},

		stopRetreat: function(callback, context) {
			context = context || this;
			if(this.state !== 'retreating')
				callback.apply(this);
			else {
				this.animations.play('stop-retreat')
					.onComplete.addOnce(callback, context);
			}
		},
		
		doAscend: function(height, duration) {
			this.switchToMainAtlas();	
			this.animations.play('idle');

			var tween = this.game.add.tween(this)
				.to({ y: this._startY - height }, duration, Phaser.Easing.Quadratic.InOut);

			tween.onComplete.addOnce(function() {
				this.idle();
				this.events.onActionComplete.dispatch(this, 'ascend');
			}, this);

			tween.start();

			this.state = 'ascending';
		},

		setFacing: function(xVal) {
			if(xVal < 0) {
				this.facing = Phaser.LEFT;
			}
			else {
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

			this.animations.add('slash', Phaser.Animation.generateFrameNames('slash__', 0, 7, '.png', 3), 15); 
			this.animations.add('stand', Phaser.Animation.generateFrameNames('stand__', 0, 7, '.png', 3), 10);
		},

		onBlockStatus: function(side, isBlocking) {
			this._punchBullet.onBlockStatus(side, isBlocking);
		}
	});

	var tmpRect = new Phaser.Rectangle();

	Object.defineProperties(Enemy.prototype, {
		facing: {
			get: function() {
				return this._facing;
			},
			set: function(val) {
				if(val === Phaser.RIGHT) {
					this.scale.x = -1;
					this._facing = Phaser.RIGHT;
				}
				else {
					this.scale.x = 1;
					this._facing = Phaser.LEFT;
				}
			}
		},
		state: {
			get: function() {
				return this._state;
			},
			set: function(val) {
				this.prevState = this._state;
				this._state = val;
			}
		},
		ascended: {
			get: function() {
				return this.y < this._startY;
			}
		},
		dropping: {
			get: function() {
				return this._dropping;
			}
		},
		vulnerable: {
			get: function() {
				return this._vulnerable;
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
