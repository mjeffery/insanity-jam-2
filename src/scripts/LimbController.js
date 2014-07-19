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
		extend: function(speed) {
			var limb = this.limb, 
				torso = this.torso;

			this.driveJoint(torso.joint, speed, torso.options.extended);
			this.driveJoint(limb.joint, speed, limb.options.extended);

			this.state = 'extending';
		},

		retract: function(speed) {
			var limb = this.limb, 
				torso = this.torso;

			this.driveJoint(torso.joint, speed, torso.options.retracted);
			this.driveJoint(limb.joint, speed, limb.options.retracted);

			this.state = 'retracting';
		},
		
		update: function() {
			
		},

		driveJoint: function(joint, speed, options) {
			if(options.motorDir > 0) 
				joint.lowerLimit = options.limit;
			else
				joint.upperLimit = options.limit;

			if(!joint.motorIsEnabled()) joint.enableMotor();
			joint.setMotorSpeed(speed * options.motorDir);
		},

		mirror: function(torsoJoint, limbJoint) {
			return new LimbController(
				torsoJoint,
				negateJointOptions(this.torso.options),
				limbJoint,
				negateJointOptions(this.limb.options)
			);

			function negateDriveOptions(driveOpts) {
				return {
					limit: -driveOpts.limit,
					motorDir: -driveOpts.motorDir
				}
			}

			function negateJointOptions(jointOptions) {
				return {
					retracted: negateDriveOptions(jointOptions.retracted),
					extended: negateDriveOptions(jointOptions.extended)
				}
			}
		},

	};

	exports.LimbController = LimbController;

})(this);
