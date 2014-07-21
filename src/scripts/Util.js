(function(exports) {
	exports.Util = {
		override: function(proto, name, fn) {
			var superFn = proto[name];
			proto[name] = function() {
				var prevSuper = this.__super;

				this.__super = superFn;
				var retVal = fn.apply(this, arguments);
				this.__super = prevSuper;

				return retVal;
			}
		}
	};
})(this);
