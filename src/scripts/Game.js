(function(exports) {
	function Game() {}

	Game.preload = function(load) {
		load.image('robot-head', 'assets/img/robot head.png');
		load.image('robot-torso', 'assets/img/robot torso.png');
		load.image('robot-thigh-left', 'assets/img/robot thigh left.png');
		load.image('robot-thigh-right', 'assets/img/robot thigh right.png');
		load.image('robot-foot-left', 'assets/img/robot foot left.png');
		load.image('robot-foot-right', 'assets/img/robot foot right.png');

		load.physics('robot-physics', 'assets/physics/robot.json');

		load.image('dirt', 'assets/img/dirt.png');
	};

	Game.prototype = {
		create: function() {
			var physics = this.game.physics,
				add = this.add,
				debugBodies = false;
			
			this.game.stage.setBackgroundColor('#6495ED');

			physics.startSystem(Phaser.Physics.P2JS);
			physics.p2.gravity.y = 300;

			var bodyPartsCollisionGroup = physics.p2.createCollisionGroup();
			var worldCollisionGroup = physics.p2.createCollisionGroup();

			var ground = add.tileSprite(400, 568, 800, 64, 'dirt', 0);
			physics.p2.enable(ground, debugBodies);
			ground.body.setRectangleFromSprite(ground);
			ground.body.static = true;
			ground.body.setCollisionGroup(worldCollisionGroup);
			ground.body.collides(bodyPartsCollisionGroup);
			
			
			var left = {}, right = {};

			var torso = add.sprite(300, 200, 'robot-torso');
			physics.p2.enable(torso, debugBodies);
			torso.body.clearShapes();
			torso.body.loadPolygon('robot-physics', 'robot torso');
			torso.body.setCollisionGroup(bodyPartsCollisionGroup);

			var head = add.sprite(400, 300, 'robot-head');	
			physics.p2.enable(head, debugBodies);
			head.body.clearShapes();
			head.body.loadPolygon('robot-physics', 'robot head');
			head.mass = 1;
	
			left.thigh = add.sprite(350, 300, 'robot-thigh-left');
			physics.p2.enable(left.thigh, debugBodies);
			left.thigh.body.clearShapes();
			left.thigh.body.loadPolygon('robot-physics', 'robot thigh left');
			left.thigh.body.setCollisionGroup(bodyPartsCollisionGroup);
			left.thigh.body.collides(worldCollisionGroup);

			left.foot = add.sprite(300, 400, 'robot-foot-left');
			physics.p2.enable(left.foot, debugBodies);
			left.foot.body.clearShapes();
			left.foot.body.loadPolygon('robot-physics', 'robot foot left');
			left.foot.body.setCollisionGroup(bodyPartsCollisionGroup);
			left.foot.body.collides(worldCollisionGroup);
			left.foot.body.mass = 1;
			
			right.thigh = add.sprite(450, 300, 'robot-thigh-right');
			physics.p2.enable(right.thigh, debugBodies);
			right.thigh.body.clearShapes();
			right.thigh.body.loadPolygon('robot-physics', 'robot thigh right');
			right.thigh.body.setCollisionGroup(bodyPartsCollisionGroup);
			right.thigh.body.collides(worldCollisionGroup);

			right.foot = add.sprite(450, 400, 'robot-foot-right');
			physics.p2.enable(right.foot, debugBodies);
			right.foot.body.clearShapes();
			right.foot.body.loadPolygon('robot-physics', 'robot foot right');
			right.foot.body.setCollisionGroup(bodyPartsCollisionGroup);
			right.foot.body.collides(worldCollisionGroup);
			right.foot.body.mass = 1;

			left.knee = physics.p2.createRevoluteConstraint(left.foot, [22,-69], left.thigh, [-4,61]);
			right.knee = physics.p2.createRevoluteConstraint(right.foot, [-33, -71], right.thigh, [2,62]);
			left.knee.upperLimitEnabled = right.knee.upperLimitEnabled = true;
			left.knee.upperLimit = right.knee.upperLimit = Math.PI / 8;
			left.knee.lowerLimitEnabled = right.knee.lowerLimitEnabled = true;
			left.knee.lowerLimit = right.knee.lowerLimit = -Math.PI / 8;

			left.hip = physics.p2.createRevoluteConstraint(left.thigh, [12,-58], torso, [-18,53]);
			right.hip = physics.p2.createRevoluteConstraint(right.thigh, [-14,-57], torso, [15, 55]);
			left.hip.upperLimitEnabled = right.hip.upperLimitEnabled = true;
			left.hip.upperLimit = right.hip.upperLimit = Math.PI / 8;
			left.hip.lowerLimitEnabled = right.hip.lowerLimitEnabled = true;
			left.hip.lowerLimit = right.hip.lowerLimit = -Math.PI / 8;

			var neck = physics.p2.createRevoluteConstraint(torso, [0,-49], head, [0,0]);

			var robot = this.robot = {
				left: left,
				right: right,
				head: head,
				torso: torso,
				neck: neck
			}

		},

		update: function() {

		}
	};

	exports.Game = Game;	
})(this);
