(function(exports) {
	function FightCamera(game, x, y, fighters) {
		Phaser.Sprite.call(this, game, x, y);
		this.anchor.setTo(0.5,0.5);
		this.fighters = fighters;

		var w = FightCamera.Bounds.Width,
			h = FightCamera.Bounds.Height;

		this.rects = _.map(fighters, function(f) {
			return new Phaser.Rectangle(f.x - w/2, f.y - h/2, w, h);
		}, this);

		this.target = new Phaser.Rectangle(x, y, 800, 600);
	}

	_.extend(FightCamera, {
		Bounds: {
			Width: 200,
			Height: 400,
			Padding: 25
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
				rects[i].x = fighters[i].x - FightCamera.Bounds.Width / 2;
				rects[i].y = fighters[i].y - FightCamera.Bounds.Height / 2;

				target.x += fighters[i].x;
				target.y += fighters[i].y;
			}

			target.x = (target.x / fighters.length) - 400;
			target.y = (target.y / fighters.length) - 300;
			
			var left = rects[0].x - FightCamera.Bounds.Padding;
			var right = rects[0].right + FightCamera.Bounds.Padding;
			var top = rects[0].y - FightCamera.Bounds.Padding;
			var bottom = rects[0].bottom + FightCamera.Bounds.Padding;

			if(target.left > left) {
				target.x = left;
			}
			else if(target.right < right) {
				target.x = right - 800;
			}

			if(target.top > top) {
				target.y = top;
			}
			else if(target.bottom < bottom) {
				target.y = bottom - 600;
			}

			this.x = target.x + 400;
			this.y = target.y + 300;
		}
	});

	exports.FightCamera = FightCamera;
})(this);
