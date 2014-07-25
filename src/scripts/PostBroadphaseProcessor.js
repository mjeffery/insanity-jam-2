(function(exports) {
	function PostBroadphaseProcessor(game) {
		this._callbacks = [];
		game.physics.p2.setPostBroadphaseCallback(this.callback, this);
	}

	PostBroadphaseProcessor.prototype = {
		callback: function(body1, body2) {
			var ctx, fn, retVal, 
				failed = false,
				callbacks = this._callbacks || [];

			for(var i = 0; i < callbacks.length; i++) {
				fn = callbacks[i].fn;
				ctx = callbacks[i].ctx || {};

				if(!failed || callbacks[i].always) {
					retVal = fn.call(ctx, body1, body2);
					if(!failed) failed = !retVal;
				}
			}
			
			return !failed;
		},

		addCallback: function(callback, context, always) {
			this._callbacks.push({
				fn: callback,
				ctx: context,
				always: always
			});
		}
	}

	exports.PostBroadphaseProcessor = PostBroadphaseProcessor;
})(this);
