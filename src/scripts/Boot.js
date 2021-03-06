(function(exports) {
	function Boot() {}

	Boot.prototype = {
		preload: function() {
			this.load.image('loading-bar', 'assets/img/loading bar.png');
			this.load.image('loading-bar-bg', 'assets/img/loading bar bg.png');
			this.load.image('black', 'assets/img/black.png');
		},
		create: function() {
			this.state.start('preload');
			this.stage.setBackgroundColor('#530301');
		}
	}

	exports.Boot = Boot;
})(this);
