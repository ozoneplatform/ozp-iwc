module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
		src: {
			metrics: [
				'app/js/common/util.js',
				'app/js/metrics/statistics/sample.js',
				'app/js/metrics/statistics/binary_heap.js',
				'app/js/metrics/statistics/exponentially_decaying_sample.js',
				'app/js/metrics/metrics.js'
			],
			server: [
				'<%= src.metrics %>',
				'app/js/common/**/*.js',
				'app/js/server/es5-sham.min.js',
				'app/js/server/util/**/*.js',
				'app/js/server/security/**/*.js',
				'app/js/server/network/**/*.js',
				'app/js/server/transport/participant.js',
				'app/js/server/transport/internalParticipant.js',
				'app/js/server/transport/router.js',
				'app/js/server/transport/**/*.js',
				'app/js/server/*/**/*.js'
			],
			client: [
				'app/js/common/**/*.js',
				'app/js/client/**/*.js'
			],
			test: [
				'app/test/**/*'
			],
			all: [
				'<%= src.metrics %>',
				'<%= src.server %>',
				'<%= src.client %>'
			]
		},
		output: {
			serverJs: 'app/js/<%= pkg.name %>-server',
			clientJs: 'app/js/<%= pkg.name %>-client',
			metricsJs: 'app/js/<%= pkg.name %>-metrics'
		},
		concat: {
      server: {
        src: '<%= src.server %>',
        dest: '<%= output.serverJs %>.js'
      },
			client: {
				src: '<%= src.client %>',
        dest: '<%= output.clientJs %>.js'
			},
			metrics: {
				src: '<%= src.metrics %>',
        dest: '<%= output.metricsJs %>.js'
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
      },
			metrics: {
        src: '<%= concat.metrics.dest %>',
        dest: '<%= output.metricsJs %>.min.js'
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
				files: ['Gruntfile.js','<%= src.all %>'],
				tasks: ['concat']
			}
    },
		connect: {
			app: {        
				options:{ port: 13000,base: "app" }
			},
			tests: {        
				options:{ port: 14000, base: ["app","test/tests"]	}
			},
			pingers: {        
				options:{	port: 14001, base: ["app","test/pingers"]	}
			},
			doc: {
				options: { port: 13001, base: "doc" }
			},			
			demo1: {
				options: { port: 15000, base: ["app","demo/bouncingBalls"] }
			},
			demo2: {
				options: { port: 15001, base: ["app","demo/bouncingBalls"] }
			},
			demo3: {
				options: { port: 15002, base: ["app","demo/bouncingBalls"] }
			},
			demo4: {
				options: { port: 15003, base: ["app","demo/bouncingBalls"] }
			},
			gridsterDemo: {
				options: { port: 15004, base: ["app","demo/gridster"] }
			}
		}

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-jsdoc');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-connect');
	
  // Default task(s).
  grunt.registerTask('default', ['concat','uglify','jsdoc']);
  grunt.registerTask('test', ['concat','uglify','connect','watch:test']);
};