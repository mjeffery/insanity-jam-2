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

		var torso = this.torso = this.addPart(375, 228.6, 'robot torso');

		var head = this.head = this.addPart(370, 180, 'robot head');	
		head.mass = 1;

		left.thigh = this.addPart(335, 335.6, 'robot thigh left');

		left.foot = this.addPart(298.5, 436.5, 'robot foot left');
		left.foot.body.mass = 1;
	
		right.thigh = this.addPart(407.6, 339.1, 'robot thigh right');

		right.foot = this.addPart(460.6, 458.3, 'robot foot right');
		right.foot.body.mass = 1;

		left.knee = this.addJoint(left.foot, [22,-69], left.thigh, [-4,61]);
		right.knee = this.addJoint(right.foot, [-33, -71], right.thigh, [2,62]);

		left.hip = this.addJoint(left.thigh, [12,-58], torso, [-18,53]);
		right.hip = this.addJoint(right.thigh, [-14,-57], torso, [15, 55]);

		this.neck = this.addJoint(torso, [0,-49], head, [0,0]);
		
		left.legController = new LimbController(
			left.hip, 
			{
				retracted: {
					limit: -3 * Math.PI / 4,
					motorDir: 1
				},
				extended: {
					limit: Math.PI / 8,
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
					limit: -Math.PI / 8,
					motorDir: 1
				}
			}
		);

		right.legController = left.legController.mirror(right.hip, right.knee);
	}

	_.extend(Robot, {
		preload: function(load) {
			load.image('robot head', 'assets/img/robot head.png');
			load.image('robot torso', 'assets/img/robot torso.png');
			load.image('robot thigh left', 'assets/img/robot thigh left.png');
			load.image('robot thigh right', 'assets/img/robot thigh right.png');
			load.image('robot foot left', 'assets/img/robot foot left.png');
			load.image('robot foot right', 'assets/img/robot foot right.png');

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

		destroy: function() {
			
		}
	};

	exports.Robot = Robot;
})(this);
