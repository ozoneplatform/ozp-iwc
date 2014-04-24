module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
		src: {
			server: [
			'app/js/common/**/*.js',
			'app/js/server/es5-sham.min.js',
			'app/js/server/metrics.js',
			'app/js/server/security/**/*.js',
			'app/js/server/network/**/*.js',
			'app/js/server/transport/participant.js',
			'app/js/server/transport/router.js',
			'app/js/server/transport/**/*.js',
			'app/js/server/api/**/*.js'
			],
			client: [
				'app/js/common/**/*.js',
				'app/js/client/**/*.js'
			],
			test: [
				'app/test/**/*'
			]
		},
		output: {
			serverJs: 'app/js/<%= pkg.name %>-server',
			clientJs: 'app/js/<%= pkg.name %>-client'
		},
		concat: {
      server: {
        src: '<%= src.server %>',
        dest: '<%= output.serverJs %>.js'
      },
			client: {
				src: '<%= src.client %>',
        dest: '<%= output.clientJs %>.js'
			}
		},
    uglify: {
      server: {
        src: '<%= concat.server.dest %>',
        dest: '<%= output.serverJs %>.min.js'
      },
			client: {
        src: '<%= concat.client.dest %>',
        dest: '<%= output.clientJs %>.min.js'
      }
    },
		jsdoc : {
        dist : {
            src: ['<%= src.server %>','<%=src.client%>'],
            options: {
                destination: 'doc'
            }
        }
    },
    watch: {
			jsdoc: {
	      files: ['Gruntfile.js','<%= jsdoc.dist.src %>'],
				tasks: ['jsdoc']
			},
			test: {
				files: ['Gruntfile.js','<%= src.server %>','<%= src.client %>'],
				tasks: ['concat']
			}
    },
		connect: {
			app: {        
				options:{ port: 13000,base: "app" }
			},
			tests: {        
				options:{ port: 14000, base: "test/tests"	}
			},
			pingers: {        
				options:{	port: 14001, base: "test/pingers"	}
			},
			doc: {
				options: { port: 13001, base: "doc" }
			}
		}

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-jsdoc');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-connect');
	
  // Default task(s).
  grunt.registerTask('default', ['uglify','jsdoc']);
  grunt.registerTask('test', ['uglify','connect','watch']);
};