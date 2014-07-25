(function(exports) {

	var tmp = new Phaser.Point();

	exports.SAT = {
		circleVsRect: function(circle, rect) {
			if(circle.x - circle.radius > rect.right) return false;
			if(circle.x + circle.radius < rect.left) return false;
			if(circle.y - circle.radius > rect.bottom) return false;
			if(circle.y + circle.radius < rect.top) return false;

			//TODO corner collisions...

			return true;
		}
	};
})(this);
