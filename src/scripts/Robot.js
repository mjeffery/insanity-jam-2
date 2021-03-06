(function(exports) {
	
	function Robot(game, collisionGroups, materials, x, y, debug) {
		var physics = game.physics;

		_.extend(this, {
			game: game,
			debug: !!debug,

			events: {
				onInputEnabled: new Phaser.Signal(),    // fires when input is enabled
				onInputDisabled: new Phaser.Signal(),	// fires when input is disabled
				onBlockStatus: new Phaser.Signal()
			},
			
			collisionGroups: collisionGroups,	
			materials: materials,

			_damageEnabled: true,
			_inputEnabled: false,

			_invincible: false,
			_invincibilityTimer: 0,

			_asleep: false,
			_wakeUpTimer: 0,
			_tightening: false,

			blocking: {
				right: false,
				left: false
			}
		});

		this.initialize(100);

		this._parts = [];

		var left = this.left = {}, 
			right = this.right = {};

		//offset is from torso @(324, 234)
		this.startx = (x || 0) - 324;
		this.starty = (y || 0) - 234;

		this._temp = {
			circle: { x:0, y:0, radius:0 },
			rect: new Phaser.Rectangle()
		};

		left.thigh = this.addPart(305, 331, 'robot left thigh', true);
		right.thigh = this.addPart(348, 332, 'robot right thigh', true);

		left.arm = this.addPart(275, 218, 'robot left arm');
		right.arm = this.addPart(372, 218, 'robot right arm');

		var torso = this.torso = this.addPart(324, 234, 'robot chest', true);

		var head = this.head = this.addPart(325, 171, 'robot head');	

		left.foot = this.addPart(290, 420, 'robot left boot', true);
		right.foot = this.addPart(361, 420, 'robot right boot', true);

		left.hand = this.addPart(266, 214, 'robot left fist');
		right.hand = this.addPart(382, 214, 'robot right fist');

		left.knee = this.addJoint(left.foot, [48 - (67/2),8 - (91/2)], left.thigh, [13-(24/2),112-(121/2)]);
		right.knee = this.addJoint(right.foot, [-(48-(67/2)),8 - (91/2)], right.thigh, [-(13-(24/2)),112-(121/2)]);

		left.hip = this.addJoint(left.thigh, [11 - (24/2),10 - (121/2)], torso, [17 - (72/2), 103 - (113/2)]);
		right.hip = this.addJoint(right.thigh, [-(11 - (24/2)), 10 - (121/2)], torso, [63 - (72/2), 103 - (113/2)]);

		left.shoulder = this.addJoint(left.arm, [70 - (83/2), 11 - (48/2)], torso, [8 - (72/2), 18 - (113/2)]);
		right.shoulder = this.addJoint(right.arm, [-(70 - (83/2)), 11 - (48/2)], torso, [63 - (72/2), 18 - (113/2)]);

		left.elbow = this.addJoint(left.hand, [8 - (53/2), 78 - (83/2)], left.arm, [4 - (83/2), 43 - (48/2)]);
		right.elbow = this.addJoint(right.hand, [-(8 - (53/2)), 78 - (83/2)], right.arm, [-(4 - (83/2)), 43 - (48/2)]);

		this.neck = this.addJoint(torso, [0,-7 - (113/2)], head, [0,0]);


		this._coreParts = [torso];

		this.damageSources = [];
		this.addDamage(left.hand, [28 - 30, 16 + 5], 20);
		this.addDamage(right.hand, [28 - 25, 15 + 5], 20);
		this.addDamage(left.foot, [0, -15], 30);
		this.addDamage(right.foot, [0, -15], 30);

		/*
		this.addVictim(torso);
		this.addVictim(left.thigh);
		this.addVictim(left.foot);
		this.addVictim(right.thigh);
		this.addVictim(right.foot);
		*/

		left.legController = new LimbController(
			left.hip, 
			{
				retracted: {
					limit: -3 * Math.PI / 4,
					motorDir: 1
				},
				extended: {
					limit: 0,
					motorDir: -1
				},
				relaxed: {
					lowerLimit: -3 * Math.PI / 4,
					upperLimit: Math.PI / 2 
				}
			},
			left.knee,
			{
				retracted: {
					limit:  3 * Math.PI / 4,
					motorDir: -1
				},
				extended: {
					limit: 0,
					motorDir: 1
				},
				relaxed: {
					lowerLimit: 0,
					upperLimit: 3 * Math.PI / 4
				}
			}
		);

		left.armController = new LimbController(
			left.shoulder,
			{
				retracted: {
					limit: 5 * Math.PI / 16,
					motorDir: -1
				},
				extended: {
					limit: -3 * Math.PI / 16,
					motorDir: 1
				},
				relaxed: {
					lowerLimit: - Math.PI / 4,
					upperLimit: 5 * Math.PI / 16
				}
			},
			left.elbow,
			{
				retracted: {
					limit: -2 * Math.PI / 8,
					motorDir: 2
				},
				extended: {
					limit: 3 * Math.PI / 4,
					motorDir: -2
				},
				relaxed: {
					lowerLimit: -2 * Math.PI / 8,
					upperLimit: 3 * Math.PI / 4
				}
			}
		);

		right.legController = left.legController.mirror(right.hip, right.knee);
		right.armController = left.armController.mirror(right.shoulder, right.elbow);

		this.controllers = [ right.legController, right.armController, left.legController, left.armController];
		
		right.armController.events.onStateChange.add(this.onRightArmStateChange, this);
		left.armController.events.onStateChange.add(this.onLeftArmStateChange, this);

		this.tighten();


		var bodyRect = this.bodyRect;
		var arcade = this.arcade = game.add.sprite(bodyRect.x, bodyRect.y);
		game.physics.arcade.enable(arcade);
		arcade.body.setSize(bodyRect.width, bodyRect.height);

		this.events.onDefeated.addOnce(function() {
			this.game.time.events.add(150, function() {
				var physics = this.game.physics.p2;
				physics.removeConstraint(this.neck);
				physics.removeConstraint(this.left.elbow);
				physics.removeConstraint(this.left.shoulder);
				physics.removeConstraint(this.right.elbow);
				physics.removeConstraint(this.right.shoulder);
				physics.removeConstraint(this.left.hip);
				physics.removeConstraint(this.left.knee);
				physics.removeConstraint(this.right.hip);
				physics.removeConstraint(this.right.knee);
			}, this);
		}, this);

	}

	_.extend(Robot, {
		Attack: {
			Speed: {
				Min: 600,
				Max: 1200
			}
		},
		Invincibility: {
			Duration: 1
		},
		WakeUp: {
			Duration: 2
		},
		Magic: {
			UpwardForce: 10000
		},
		preload: function(load) {
			load.atlasJSONArray('player atlas', 'assets/atlas/player.png', 'assets/atlas/player.json');
			load.physics('player physics', 'assets/physics/new robot.json');
		}
	});

	Robot.prototype = {

		update: function() {
			// collision shape for the enemy...
			var bodyRect = this.bodyRect;
			this.arcade.body.x = bodyRect.x;
			this.arcade.body.y = bodyRect.y;
			this.arcade.body.setSize(bodyRect.width, bodyRect.height);

			// handle invincibility
			if(this._invincible) {
				this._invincibilityTimer -= this.game.time.physicsElapsed;
				if(this._invincibilityTimer <= 0)
					this._invincible = false;
			}	

			//TODO should be state instead of flags
			if(this._asleep && this.hp > 0) {
				this._wakeUpTimer -= this.game.time.physicsElapsed;
				if(this._wakeUpTimer <= 0) {
					this._asleep = false;
					this._tightening = true;
					this.tighten();
				}
			}
			else if(this._tightening) {
				var anyRestoring = false;
				_.forEach(this.controllers, function(ctrl) {
					if(ctrl.state === 'restoring')
						anyRestoring = true;
				});

				if(!anyRestoring) {
					this._tightening = false;
					this.inputEnabled = true;
				}
			}

			// update controllers
			_.forEach(this.controllers, function(controller) {
				controller.update();
			});
		},

		addPart: function(x, y, key, canDamage) {
			var part = this.game.add.sprite(x + this.startx, y + this.starty, 'player atlas', key);

			this.game.physics.p2.enable(part, this.debug);
			part.body.clearShapes();
			part.body.loadPolygon('player physics', key);
			part.body.setCollisionGroup(this.collisionGroups.player.body);
			part.body.setMaterial(this.materials.robot);
			part.body.collides(this.collisionGroups.world);
			
			if(canDamage) {
				part.body.collides(this.collisionGroups.enemy.damage, this.onCollideFist, this); 
				part.body.collides(this.collisionGroups.enemy.blocked, this.onCollideBlocked, this);
				part.body.collides(this.collisionGroups.enemy.magic, this.onCollideMagic, this);
			}

			this._parts.push(part);

			return part;
		},

		addHintKeys: function(torso) {
			var hints = this.hintKeys = [
				new HintKey(this.game, -120, -90, 0), // A
				new HintKey(this.game, -70, -90, 1),  // S
				new HintKey(this.game, -70, 100, 2),  // D
				new HintKey(this.game, -70, 50, 3),    // F
				new HintKey(this.game, 70, 50, 4),
				new HintKey(this.game, 70, 100, 5),
				new HintKey(this.game, 70, -90, 6),
				new HintKey(this.game, 120, -90, 7)
			];

			_.forEach(hints, torso.addChild, torso);
		},

		hideHints: function() {
			_.forEach(this.hintKeys, function(hint) {
				hint.hide();
			});
		},

		showHints: function() {
			_.forEach(this.hintKeys, function(hint) {
				hint.show();
			})
		},

		addDamage: function(bodyPart, position, radius) {
			var x = bodyPart.x + position[0],
				y = bodyPart.y + position[1],
				dmg = this.game.add.existing(new PlayerDamage(this.game, x, y, radius));
			
			this.game.physics.p2.enable(dmg, false);
			dmg.body.clearShapes();
			dmg.body.addCircle(radius);
			dmg.body.mass = 0.01;

			this.game.physics.p2.createLockConstraint(bodyPart, dmg, position);
			
			this.damageSources.push(dmg);
		},

		addJoint: function(body1, anchor1, body2, anchor2) {
			var joint = this.game.physics.p2.createRevoluteConstraint(body1, anchor1, body2, anchor2);

			joint.upperLimitEnabled = true;
			joint.upperLimit =  Math.PI / 8;
			joint.lowerLimitEnabled = true;
			joint.lowerLimit =  -Math.PI / 8;

			return joint;
		}, 

		processCommandString: function(commandString) {
			if(!this._inputEnabled) return;

			var side, controller, action, scale, self = this;

			_.chain(commandString)
				.groupBy()
				.reduce(function(memo, value, key) {
					memo[key] = value.length || 0;
					return memo;
				}, {})
				.forEach(function(timesPressed, command) {
					side = (_.contains(command, 'left'))  ? self.left : self.right;
					if(_.contains(command, 'arm')) {
						controller = side.armController;
						scale = [1, 4.5, 6, 9, 12, 15];
					}
					else {
						controller = side.legController;
						scale = [1, 3, 6, 9, 12, 15];
					}
					action = (_.contains(command, 'extend')) ? 'extend' : 'retract';

					controller[action](scale[timesPressed - 1] || 18);
				})
		},

		takeDamage: function(amount) {
			if(this._invincible) return;

			this.relax();
			this._damageEnabled = false;
			this.inputEnabled = false;

			this.hp -= amount || 0;

			this.startInvincibility();
			this.startWakeUp();
		},

		chipDamage: function(amount) {
			if(this._invincible) return;

			this.hp -= amount || 0;

			this.startInvincibility(0.2);
		},

		relax: function() {
			this.left.armController.relax();
			this.left.legController.relax();
			this.right.armController.relax();
			this.right.legController.relax();
		},

		tighten: function() {
			this.left.legController.extend(1);
			this.right.legController.extend(1);
			this.left.armController.retract(1);
			this.right.armController.retract(1);
		},

		startInvincibility: function(duration) {
			this._invincible = true;
			this._invincibilityTimer = duration || Robot.Invincibility.Duration;
		},
		
		startWakeUp: function() {
			this._asleep = true;
			this._wakeUpTimer = Robot.WakeUp.Duration;
		},

		onContact: function(body, myShape, theirShape, equation) {
			if(theirShape.collisionGroup === this.collisionGroups.enemy.damage.mask) {
				this.takeDamage(15);
			}
			else if(theirShape.collisionGroup === this.collisionGroups.enemy.blocked.mask) {
				this.chipDamage(5);
			}
		},

		onCollideFist: function(body, punchBody, shape, punchShape) {
			this.takeDamage(8);
		},

		onCollideBlocked: function(body, blockedBody, shape, blockedShape) {
			this.chipDamage(2);
		},

		onCollideMagic: function(body, magicBody, shape, magicShape) {
			if(this._invincible) return;
			
			this.takeDamage(15);

			var x = this.torso.x, 
				y = this.torso.y - 2000;

			body.applyForce([0, Robot.Magic.UpwardForce], x, y);
			this.torso.body.applyForce([0, Robot.Magic.UpwardForce / 2], x, y); 
		},

		onMatchStart: function() {
			this.addHintKeys(this.torso);
			this.inputEnabled = true;
		},

		onLeftArmStateChange: function(newState, oldState) {
			console.log('left arm: \"' + oldState + '\" -> \"' + newState + '\"');

			var oldValue = this.blocking.left,
				newValue = (newState === 'retracted');
			
			if(oldValue !== newValue) {
				this.blocking.left = newValue;
				this.events.onBlockStatus.dispatch('left', newValue);
			}
		},

		onRightArmStateChange: function(newState, oldState) {
			console.log('right arm: \"' + oldState + '\" -> \"' + newState + '\"');

			var oldValue = this.blocking.right,
				newValue = (newState === 'retracted');
			
			if(oldValue !== newValue) {
				this.blocking.right = newValue;
				this.events.onBlockStatus.dispatch('right', newValue);
			}
		}
	};

	var tmpCameraRect = new Phaser.Rectangle(),
		tmpBodyRect = new Phaser.Rectangle();

	function calcBounds(parts, out) {
		var minx, miny, max, maxy;

		_.chain(parts)
		 .map(function(part) {
			 return part.getBounds();
		 })
		 .forEach(function(bounds, index) {
			 if(index == 0) {
				minx = bounds.left;
				miny = bounds.top;
				maxx = bounds.right;
				maxy = bounds.bottom;
			 }
			 else {
				minx = Math.min(minx, bounds.left);
				miny = Math.min(miny, bounds.top);
				maxx = Math.max(maxx, bounds.right);
				maxy = Math.max(maxy, bounds.bottom);
			 }

		 });

		 minx -= 30;
		 maxx += 30;
		
		 out.setTo(minx, miny, maxx - minx, maxy - miny);
		 out.x += this.game.camera.x;
		 out.y += this.game.camera.y;
	}

	HasHpMixin(Robot.prototype);

	Object.defineProperties(Robot.prototype, {
		inputEnabled: {
			get: function() {
				return this._inputEnabled;
			},
			set: function(val) {
				if(val !== this._inputEnabled) {
					if(val) {
						this.events.onInputEnabled.dispatch(this);
						this.showHints();
					}
					else {
					 	this.events.onInputDisabled.dispatch(this);
						this.hideHints();
					}

					this._inputEnabled = val;
				}
			}
		},
		cameraRect: {
			get: function() {
				calcBounds(this._parts, tmpCameraRect);
				return tmpCameraRect;
			}
		},
		bodyRect: {
			get: function() {
				calcBounds(this._coreParts, tmpBodyRect);
				tmpBodyRect.x -= 40;
				tmpBodyRect.width += 80;

				return tmpBodyRect;
			}
		}
	});

	//////////////////////////////////////////////////////////////////////////////////////////

	function PlayerDamage(game, x, y, radius) {
		Phaser.Sprite.call(this, game, x, y);
	
		this.prev = {
			x: x, 
			y: y
		}

		this.visible = false;
		this._circle = {
		 	x: x, y: y, radius: radius
		};
	}

	PlayerDamage.prototype = Object.create(Phaser.Sprite.prototype);
	PlayerDamage.prototype.constructor = PlayerDamage;

	_.extend(PlayerDamage.prototype, {
		update: function() {
			this.prev.x = this.body.x;
			this.prev.y = this.body.y;
		},

		calculateVelocity: function() {
			var dist = Phaser.Point.distance(this.prev, this.body);
			return dist / game.time.physicsElapsed;
		}
	});

	Object.defineProperty(PlayerDamage.prototype, 'circle', {
		get: function() {
			this._circle.x = this.body.x;
			this._circle.y = this.body.y;
			
			return this._circle;
		}
	});

	exports.PlayerDamage = PlayerDamage;
	exports.Robot = Robot;
})(this);
