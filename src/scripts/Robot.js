(function(exports) {
	
	function Robot(game, collisionGroups, x, y, debug) {
		var physics = game.physics;

		this.game = game;
		this.debug = !!debug;

		this.collisionGroups = collisionGroups;	

		this._parts = [];

		var left = this.left = {}, 
			right = this.right = {};

		//offset is from torso @(324, 234)
		this.startx = (x || 0) - 324;
		this.starty = (y || 0) - 234;

		this._temp = {
			circle: { x:0, y:0, radius:0 },
			rect: new Phaser.Rectangle(),
			accumulator: {
				min: { x: 0, y: 0 },
				max: { x: 0, y: 0 }
			}
		};
		
		left.thigh = this.addPart(305, 331, 'robot left thigh');
		right.thigh = this.addPart(348, 332, 'robot right thigh');

		left.arm = this.addPart(275, 218, 'robot left arm');
		right.arm = this.addPart(372, 218, 'robot right arm');

		var torso = this.torso = this.addPart(324, 234, 'robot chest');

		var head = this.head = this.addPart(325, 171, 'robot head');	

		left.foot = this.addPart(290, 420, 'robot left boot');
		right.foot = this.addPart(361, 420, 'robot right boot');

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

		this.damageSources = [];
		this.addDamage(left.hand, [28 - 30, 16 + 5], 20);
		this.addDamage(right.hand, [28 - 25, 15 + 5], 20);
		this.addDamage(left.foot, [0, -15], 30);
		this.addDamage(right.foot, [0, -15], 30);

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
				}
			}
		);

		right.legController = left.legController.mirror(right.hip, right.knee);
		right.armController = left.armController.mirror(right.shoulder, right.elbow);

		left.legController.extend(1);
		right.legController.extend(1);
		left.armController.retract(1);
		right.armController.retract(1);
	}

	_.extend(Robot, {
		Attack: {
			Speed: {
				Min: 600,
				Max: 2000
			}
		},
		preload: function(load) {
			load.atlasJSONArray('player atlas', 'assets/atlas/player.png', 'assets/atlas/player.json');
			load.physics('player physics', 'assets/physics/new robot.json');
		}
	});

	Robot.prototype = {

		addPart: function(x, y, key) {
			var part = this.game.add.sprite(x + this.startx, y + this.starty, 'player atlas', key + '.png');

			this.game.physics.p2.enable(part, this.debug);
			part.body.clearShapes();
			part.body.loadPolygon('player physics', key);
			part.body.setCollisionGroup(this.collisionGroups.player.body);
			part.body.collides(this.collisionGroups.world);

			this._parts.push(part);

			return part;
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
						scale = [1, 3.5, 6, 9, 12, 15];
					}
					else {
						controller = side.legController;
						scale = [1, 3, 6, 9, 12, 15];
					}
					action = (_.contains(command, 'extend')) ? 'extend' : 'retract';

					controller[action](scale[timesPressed - 1] || 18);
				})
		}
	};

	var tmpRect = new Phaser.Rectangle();

	Object.defineProperties(Robot.prototype, {
		cameraRect: {
			get: function() {
				var minx, miny, max, maxy;

				_.chain(this._parts)
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
				
				 tmpRect.setTo(minx, miny, maxx - minx, maxy - miny);
				 tmpRect.x += this.game.camera.x;
				 tmpRect.y += this.game.camera.y;

				 return tmpRect;
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
