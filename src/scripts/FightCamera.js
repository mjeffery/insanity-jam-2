(function(exports) {

	var tmp = new Phaser.Point();
	var vel = new Phaser.Point();

	function FightCamera(game, x, y, fighters) {
		Phaser.Sprite.call(this, game, x, y);
		this.anchor.setTo(0.5,0.5);
		this.fighters = fighters;

		var w = FightCamera.Bounds.Width,
			h = FightCamera.Bounds.Height;

		this.rects = _.map(fighters, function(f) {
			return new Phaser.Rectangle(f.x - w/2, f.y - h/2, w, h);
		}, this);

		game.physics.arcade.enable(this);


		this.target = new Phaser.Rectangle(x, y, 800, 600);
	}

	_.extend(FightCamera, {
		Bounds: {
			Width: 200,
			Height: 400,
			Padding: 25
		},
		Spring: {
			Stiffness: 100,
			Damping: 50
		}
	});

	FightCamera.prototype = Object.create(Phaser.Sprite.prototype);
	FightCamera.prototype.constructor = FightCamera;

	_.extend(FightCamera.prototype, {
		update: function() {
			var rects = this.rects,
				fighters = this.fighters,
				target = this.target;

			target.x = target.y = 0;

			for(var i = 0; i < fighters.length; i++) {
				rects[i].copyFrom(fighters[i].cameraRect);
				
				target.x += rects[i].centerX;
				target.y += rects[i].centerY;
			}

			target.x = (target.x / fighters.length) - 400;
			target.y = (target.y / fighters.length) - 300;
			
			first = rects[0];

			if(target.left > first.left) {
				target.x = first.left;
			}
			else if(target.right < first.right) {
				target.x = first.right - 800;
			}

			if(target.top > first.top) {
				target.y = first.top;
			}
			else if(target.bottom < first.bottom) {
				target.y = first.bottom - 600;
			}

			// do a spring calculation
			tmp.setTo(target.centerX, target.centerY);
			Phaser.Point.subtract(tmp, this.body.position, tmp);
			tmp.multiply(FightCamera.Spring.Stiffness, FightCamera.Spring.Stiffness);

			vel.copyFrom(this.body.velocity);
			vel.multiply(FightCamera.Spring.Damping, FightCamera.Spring.Damping);

			Phaser.Point.subtract(tmp, vel, this.body.acceleration);
		}
	});

	exports.FightCamera = FightCamera;
})(this);
