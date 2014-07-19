(function(exports) {

	function LimbController(torsoJoint, torsoOptions, limbJoint, limbOptions) {
		_.extend(this, {
			state: 'relaxed',
			torso: {
				joint: torsoJoint,
				options: _.defaults(torsoOptions || {}, {
					extended: {
						limit: -Math.PI / 8,
						motorDir: 1
					},
					retracted: {
						limit: 3 * Math.PI / 4,
						motorDir: -1
					}
				})
			},
			limb: {
				joint: limbJoint,
				options: _.defaults(limbOptions || {}, {
					extended: {
						limit: -Math.PI / 8,
						motorDir: 1
					},
					retracted: {
						limit: 3 * Math.PI / 4,
						motorDir: -1
					}
				})
			}
		});
	}

	LimbController.prototype = {
		extend: function() {
			var limb = this.limb, 
				torso = this.torso;

			this.driveJoint(torso.joint, 1, torso.options.extended);
			this.driveJoint(limb.joint, 1, limb.options.extended);

			this.state = 'extending';
		},

		retract: function() {
			var limb = this.limb, 
				torso = this.torso;

			this.driveJoint(torso.joint, 1, torso.options.retracted);
			this.driveJoint(limb.joint, 1, limb.options.retracted);

			this.state = 'retracting';
		},
		
		update: function() {
			
		},

		driveJoint: function(joint, speed, options) {
			if(options.motorDir > 0) 
				joint.lowerLimit = options.limit;
			else
				joint.upperLimit = options.limit;

			if(!joint.motorIsEnabled()) join.enableMotor();
			joint.setMotorSpeed(speed * options.motorDir);
		}

	};

	exports.LimbController = LimbController;

})(this);
