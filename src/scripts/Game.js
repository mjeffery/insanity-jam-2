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

			var squat = this.squat = this.input.keyboard.addKey(Phaser.Keyboard.DOWN);
			squat.onDown.add(function() {
				robot.squat();
			});
			
			var jump = this.squat = this.input.keyboard.addKey(Phaser.Keyboard.UP);
			jump.onDown.add(function() {
				robot.jump();
			});

			add.bitmapText(150, 20, 'minecraftia', 'Press "DOWN" to squat and "UP" to jump!', 16);
		},

		update: function() {

		}
	};

	exports.Game = Game;	
})(this);
