(function(exports) {
	function Game() {}

	Game.preload = function(load) {
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

			var worldCollisionGroup = physics.p2.createCollisionGroup();

			var robot = this.robot = new Robot(this.game, worldCollisionGroup, debugBodies);

			var ground = add.tileSprite(400, 568, 800, 64, 'dirt', 0);
			physics.p2.enable(ground, debugBodies);
			ground.body.setRectangleFromSprite(ground);
			ground.body.static = true;
			ground.body.setCollisionGroup(worldCollisionGroup);
			ground.body.collides(robot.collisionGroups.bodyParts);
			
			/*
			var keys = this.input.keyboard.createCursorKeys();
			keys.down.onDown.add(robot.squat, robot);
			keys.up.onDown.add(robot.jump, robot);
			keys.left.onDown.add(robot.defend, robot);
			keys.right.onDown.add(robot.punch, robot);
			*/

			var commandBuffer = this.commandBuffer = new CommandBuffer(this.game);
			commandBuffer.events.onStringEnd.add(robot.processCommandString, robot);

			add.bitmapText(150, 20, 'minecraftia', 'Press "DOWN" to squat and "UP" to jump!', 16);
			add.bitmapText(130, 40, 'minecraftia', 'Press "RIGHT" to punch and "LEFT" to defend!', 16);
		},

		update: function() {
			this.commandBuffer.update();
		}
	};

	exports.Game = Game;	
})(this);
