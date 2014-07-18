module.exports = function(grunt) {
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		connect: {
			options: {
				hostname: 'localhost',
				open: true
			},
			dev: {
				options: {
					base: ['./bower_components', './src'],
					livereload: true,
				}
			},
			dist: {
				options: {
					base: ['./dist'],
					keepalive: true
				}
			}
		},
		watch: {
			dev: {
				files: ['src/**/*.{html,js,css,png,mp3,ogg}'],
				options: {
					livereload: true
				}
			}
		},
		clean: {
			build: ['.tmp/**', 'dist/**']
		},
		copy: {
			build: {
				files: [{
					expand: true,
					cwd: 'src/',
					src: ['index.html', 'style.css'],
					dest: 'dist'
				}]
			}
		},
		filerev: {
			assets: {
				src: 'src/assets/**/*.{png,mp3,ogg,json,xml}',
				dest: 'dist/assets'
			}
		},
		filerev_replace: {
			assets: {
				src: '.tmp/concat/scripts.js',
				options: {
					assets_root: 'dist/', 
					view_root: 'src/'
				}	
			}
		},
		useminPrepare: {
		html: 'src/index.html',	
			options: {
				dest: 'dist'
			}
		},
		usemin: {
			html: 'dist/index.html',
			options: {
				dirs: ['dist']
			}
		}
	});

	grunt.registerTask('serve', ['connect:dev', 'watch']);

	grunt.registerTask('dist', ['build', 'connect:dist']);

	grunt.registerTask('build', [
		'clean:build', 
		'useminPrepare',
		'concat',
		'uglify',
		'copy:build', 
		'filerev',
		'usemin',
		'replacePrepare',
		'replace'
	]);

	function escape_for_regexp( string ) {
    	return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  	}

	grunt.registerTask('replacePrepare', function() {
		var summary = grunt.filerev.summary;

		var replace = {
			generated: {
				src: 'dist/scripts.js',
				overwrite: true,
				replacements: []
			}
		};

		for(var key in summary) {
			var newKey = escape_for_regexp(key.substring(4).replace(/\\/g, '/'));   //remove src/
			var newVal = '"' + summary[key].substring(5).replace(/\\/g, '/') + '"'; //remove dist/

			replace.generated.replacements.push({
				from: new RegExp('[\'"]' + newKey + '[\'"]', 'ig'),
				to: newVal
			});
		}

		grunt.config.set('replace', replace);
	});
};