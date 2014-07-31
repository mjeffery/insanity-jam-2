(function(exports) {
	function EnemyPunchDamage(game, collisionGroups, x, y) {
		Phaser.Sprite.call(this, game, x, y);

		game.physics.p2.enable(this);
		this.body.clearShapes();
		this.body.addCircle(40);
		this.body.mass = 1.2;//4;
		this.body.setCollisionGroup(collisionGroups.enemy.damage);
		this.body.collides(collisionGroups.player.body);

		this.collisionGroups = collisionGroups;

		this.blocked = {
			left: false,
			right: false
		},
		this.isBlocked = false;
	}

	EnemyPunchDamage.prototype = Object.create(Phaser.Sprite.prototype);
	EnemyPunchDamage.prototype.constructor = EnemyPunchDamage;

	_.extend(EnemyPunchDamage.prototype, {
		onBlockStatus: function(side, isBlocking) {
			this.blocked[side] = isBlocking;
		},

		update: function() {
			if(!this.alive) return;

			var blocked = this.blocked,
				prevBlocked = this.isBlocked,
				isBlocked =  (this.body.velocity.x < 0 && blocked.left ||
			   				  this.body.velocity.x > 0 && blocked.right); 

			//TODO check in bounds of torso?

			if(prevBlocked != isBlocked) {		
				var blockedGroup = this.collisionGroups.enemy.blocked,
					unblockedGroup = this.collisionGroups.enemy.damage;

				this.body.setCollisionGroup(isBlocked ? blockedGroup : unblockedGroup);
				this.isBlocked = isBlocked;

				if(isBlocked) console.log('punch is blocked')
				else console.log('punch will hit!');
			}
		}
	});

	exports.EnemyPunchDamage = EnemyPunchDamage;
})(this);
