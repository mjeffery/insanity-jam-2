(function(exports) {
	function Game() {}

	Game.preload = function(load) {
		load.image('robot-head', 'assets/img/robot head.png');
		load.image('robot-torso', 'assets/img/robot torso.png');
		load.image('robot-thigh-left', 'assets/img/robot thigh left.png');
		load.image('robot-thigh-right', 'assets/img/robot thigh right.png');
		load.image('robot-foot-left', 'assets/img/robot foot left.png');
		load.image('robot-foot-right', 'assets/img/robot foot right.png');
	};

	Game.prototype = {
		create: function() {
			var physics = this.game.physics,
				add = this.add,
				debugBodies = false;
			
			this.game.stage.setBackgroundColor('#6495ED');

			physics.startSystem(Phaser.Physics.P2JS);
			
			var bodyPartsCollisionGroup = physics.p2.createCollisionGroup();

			var torso = add.sprite(400, 300, 'robot-torso');
			physics.p2.enable(torso, debugBodies);
			torso.body.addPolygon({}, [[35,3], [18,50], [42,120], [83,121], [108,55], [90,6]]);
			torso.body.static = true;
			torso.body.setCollisionGroup(bodyPartsCollisionGroup);
			

			var head = add.sprite(400, 300, 'robot-head');	
			physics.p2.enable(head, debugBodies);

			var left = {}, right = {};

			left.thigh = add.sprite(350, 300, 'robot-thigh-left');
			physics.p2.enable(left.thigh, debugBodies);
			//left.thigh.body.addPolygon({}, [[42,0],[15,127],[42,127],[50,7]]);
			left.thigh.body.setCollisionGroup(bodyPartsCollisionGroup);

			left.foot = add.sprite(300, 400, 'robot-foot-left');
			physics.p2.enable(left.foot, debugBodies);
			//left.foot.body.addPolygon({}, [[80,54],[109,55],[121,190],[8,193],[54,159]]);
			left.foot.body.setCollisionGroup(bodyPartsCollisionGroup);
			
			right.thigh = add.sprite(450, 300, 'robot-thigh-right');
			physics.p2.enable(right.thigh, debugBodies);
			//right.thigh.body.addPolygon({}, []);
			right.thigh.body.setCollisionGroup(bodyPartsCollisionGroup);

			right.foot = add.sprite(450, 400, 'robot-foot-right');
			physics.p2.enable(right.foot, debugBodies);
			//right.foot.body.addPolygon({}, []);
			right.foot.body.setCollisionGroup(bodyPartsCollisionGroup);

			left.knee = physics.p2.createRevoluteConstraint(left.foot, [22,-69], left.thigh, [-4,61]);
			left.knee.upperLimitEnabled = true;
			left.knee.upperLimit = Math.PI / 8;
			left.knee.lowerLimitEnabled = true;
			left.knee.lowerLimit = -Math.PI / 8;

			left.hip = physics.p2.createRevoluteConstraint(left.thigh, [12,-58], torso, [-18,53]);
			left.hip.upperLimitEnabled = true;
			left.hip.upperLimit = Math.PI / 8;
			left.hip.lowerLimitEnabled = true;
			left.hip.lowerLimit = -Math.PI / 8;
		},

		update: function() {

		}
	};

	exports.Game = Game;	
})(this);
