(function(exports) {
	function EnemyMagicMissile(game, collisionGroups, x, y) {
		Phaser.Sprite.call(this, game, x, y, 'magic-missile');
		this.anchor.setTo(0.5, 0.5);
		
		this.animations.add('loop', [0, 1, 2, 3], 15, true);
		this.animations.play('loop');

		game.physics.p2.enable(this);
		this.body.clearShapes();
		this.body.addCircle(20);
		this.body.mass = 5;
		this.body.setCollisionGroup(collisionGroups.enemy.magic);
		this.body.collides(collisionGroups.world, this.onCollidesGround, this);
		this.body.collides(collisionGroups.player.body, this.onCollidesPlayer, this);

		this.checkWorldBounds = true;
		this.outOfBoundsKill = true;

		this.state = 'none';
		this.collisionGroups = collisionGroups;

		_.extend(this.events, {
			onExplode: new Phaser.Signal()
		});
	}

	_.extend(EnemyMagicMissile, {
		preload: function(load) {
			load.spritesheet('magic-missile', 'assets/spritesheet/magic missile.png', 128, 128, 4);
		}
	});

	EnemyMagicMissile.prototype = Object.create(Phaser.Sprite.prototype);
	EnemyMagicMissile.prototype.constructor = EnemyMagicMissile;
	
	_.extend(EnemyMagicMissile.prototype, {
		update: function() {
			switch(this.state) {
				case 'charging':
					this.body.setZeroVelocity();
					break;
			}
		},

		charge: function(x, y) {
			this.reset(x, y);
			this.body.setZeroVelocity();
			this.lifespan = 0;

			this.state = 'charging';
		},

		fire: function(vx, vy) {
			switch(this.state) {
				case 'none':
				case 'charging':
					this.dir = (vx < 0) ? Phaser.LEFT : Phaser.RIGHT;

					this.body.moveRight(vx);
					this.body.moveDown(vy);

					this.state = 'falling';
					break;
			}
		},

		onCollidesGround: function(body, groundBody, shape, groundShape) {
			switch(this.state) {
				case 'falling':
					this.lifespan = 10000;
					this.state = 'grounded';
					this.body.moveLeft( this.dir === Phaser.LEFT ? 500 : -500);
					break;
			}
		},

		onCollidesPlayer: function(body, playerBody, shape, playerShape) {
			this.kill();
			//TODO spawn explosion
			this.events.onExplode.dispatch(this);
		}
	});

	exports.EnemyMagicMissile = EnemyMagicMissile;
})(this);
