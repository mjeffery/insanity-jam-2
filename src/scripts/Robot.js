(function(exports) {
	
	function Robot(game, worldCollisionGroup, debug) {
		var physics = game.physics;

		this.game = game;
		this.debug = !!debug;

		this.collisionGroups = {
			bodyParts: physics.p2.createCollisionGroup(),
			world: worldCollisionGroup
		};

		var left = this.left = {}, 
			right = this.right = {};

		left.thigh = this.addPart(335, 335.6, 'robot thigh left');
		right.thigh = this.addPart(407.6, 339.1, 'robot thigh right');

		left.arm = this.addPart(100, 100, 'robot arm left');
		right.arm = this.addPart(300, 100, 'robot arm right');
		
		var torso = this.torso = this.addPart(375, 228.6, 'robot torso');

		var head = this.head = this.addPart(370, 180, 'robot head');	
		head.mass = 1;

		left.foot = this.addPart(298.5, 436.5, 'robot foot left');
		left.foot.body.mass = 1;
	
		right.foot = this.addPart(460.6, 458.3, 'robot foot right');
		right.foot.body.mass = 1;

		left.hand = this.addPart(200, 300, 'robot hand left');
		right.hand = this.addPart(400, 300, 'robot hand right');

		left.knee = this.addJoint(left.foot, [22,-69], left.thigh, [-4,61]);
		right.knee = this.addJoint(right.foot, [-33, -71], right.thigh, [2,62]);

		left.hip = this.addJoint(left.thigh, [12,-58], torso, [-18,53]);
		right.hip = this.addJoint(right.thigh, [-14,-57], torso, [15, 55]);

		left.shoulder = this.addJoint(left.arm, [84-64,20-64], torso, [27-64,22-64]);
		right.shoulder = this.addJoint(right.arm, [43-64,19-64], torso, [103-64,28-64]);

		left.elbow = this.addJoint(left.hand, [57-64,191-128], left.arm, [33-64,115-64]);
		right.elbow = this.addJoint(right.hand, [70-64,188-128], right.arm, [94-64,116-64]);

		this.neck = this.addJoint(torso, [0,-49], head, [0,0]);
		
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
					limit: Math.PI / 8,
					motorDir: -1
				},
				extended: {
					limit: -3 * Math.PI / 8,
					motorDir: 1
				}
			},
			left.elbow,
			{
				retracted: {
					limit: -Math.PI / 8,
					motorDir: 2
				},
				extended: {
					limit: Math.PI,
					motorDir: -1.75
				}
			}
		);

		right.legController = left.legController.mirror(right.hip, right.knee);
		right.armController = left.armController.mirror(right.shoulder, right.elbow);

		var keyboard = game.input.keyboard,
			keys = this.keys = {
				retractLeftArm: keyboard.addKey(Phaser.Keyboard.S),
				retractRightArm: keyboard.addKey(Phaser.Keyboard.L),
				extendLeftArm: keyboard.addKey(Phaser.Keyboard.A),
				extendRightArm: keyboard.addKey(Phaser.Keyboard.COLON),
				retractLeftLeg: keyboard.addKey(Phaser.Keyboard.F),
				retractRightLeg: keyboard.addKey(Phaser.Keyboard.J),
				extendLeftLeg: keyboard.addKey(Phaser.Keyboard.D),
				extendRightLeg: keyboard.addKey(Phaser.Keyboard.K)
			};
		
		keys.retractLeftArm.onDown.add(function() { left.armController.retract(3); });
		keys.extendLeftArm.onDown.add(function() { left.armController.extend(5); });

		keys.retractRightArm.onDown.add(function() { right.armController.retract(3); });
		keys.extendRightArm.onDown.add(function() { right.armController.extend(5); });

		keys.retractLeftLeg.onDown.add(function() { left.legController.retract(1); });
		keys.extendLeftLeg.onDown.add(function() { left.legController.extend(10); });

		keys.retractRightLeg.onDown.add(function() { right.legController.retract(1); });
		keys.extendRightLeg.onDown.add(function() { right.legController.extend(10); });


		left.legController.extend(1);
		right.legController.extend(1);
		left.armController.retract(1);
		right.armController.retract(1);
	}

	_.extend(Robot, {
		preload: function(load) {
			load.image('robot head', 'assets/img/robot head.png');
			load.image('robot torso', 'assets/img/robot torso.png');
			load.image('robot thigh left', 'assets/img/robot thigh left.png');
			load.image('robot thigh right', 'assets/img/robot thigh right.png');
			load.image('robot foot left', 'assets/img/robot foot left.png');
			load.image('robot foot right', 'assets/img/robot foot right.png');
			load.image('robot arm left', 'assets/img/robot arm left.png');
			load.image('robot arm right', 'assets/img/robot arm right.png');
			load.image('robot hand left', 'assets/img/robot hand left.png');
			load.image('robot hand right', 'assets/img/robot hand right.png');

			load.physics('robot physics', 'assets/physics/robot.json');
		}
	});

	Robot.prototype = {

		addPart: function(x, y, key) {
			var part = this.game.add.sprite(x, y, key);

			this.game.physics.p2.enable(part, this.debug);
			part.body.clearShapes();
			part.body.loadPolygon('robot physics', key);
			part.body.setCollisionGroup(this.collisionGroups.bodyParts);
			part.body.collides(this.collisionGroups.world);

			return part;
		},

		addJoint: function(body1, anchor1, body2, anchor2) {
			var joint = this.game.physics.p2.createRevoluteConstraint(body1, anchor1, body2, anchor2);

			joint.upperLimitEnabled = true;
			joint.upperLimit =  Math.PI / 8;
			joint.lowerLimitEnabled = true;
			joint.lowerLimit =  -Math.PI / 8;

			return joint;
		}, 

		squat: function() {
			this.left.legController.retract(1);
			this.right.legController.retract(1);
		},

		jump: function() {
			this.left.legController.extend(10);
			this.right.legController.extend(10);
		},

		punch: function() {
			this.left.armController.extend(5);
			this.right.armController.extend(5);
		},

		defend: function() {
			this.left.armController.retract(3);
			this.right.armController.retract(3);
		},

		destroy: function() {
			
		}
	};

	exports.Robot = Robot;
})(this);
