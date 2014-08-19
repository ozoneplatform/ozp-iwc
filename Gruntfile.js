module.exports = function(grunt) {

    // Project configuration.
    var config = {
        pkg: grunt.file.readJSON('package.json'),
        src: {
            metrics: [
                'app/js/common/**/*.js',
                'app/js/metrics/statistics/sample.js',
                'app/js/metrics/statistics/binary_heap.js',
                'app/js/metrics/statistics/exponentiallyDecayingSample.js',
                'app/js/metrics/statistics/exponentiallyWeightedMovingAverage.js',
                'app/js/metrics/baseMetric.js',
                'app/js/metrics/types/*.js',
                'app/js/metrics/metricsRegistry.js'
            ],
            bus: [
                '<%= src.metrics %>',
                'app/js/bus/jquery-2.1.0.min.js',
                'app/js/common/event.js',
                'app/js/common/**/*.js',
                'app/js/bus/util/**/*.js',
                'app/js/bus/security/**/*.js',
                'app/js/bus/network/**/*.js',
                'app/js/bus/transport/participant.js',
                'app/js/bus/transport/internalParticipant.js',
                'app/js/bus/transport/router.js',
                'app/js/bus/transport/**/*.js',
                'app/js/bus/storage/**/*.js',
                'app/js/bus/api/*.js',
                'app/js/bus/api/**/*.js',
                'app/js/bus/*/**/*.js'
            ],
            client: [
                'app/js/common/**/*.js',
                'app/js/client/**/*.js'
            ],
            test: [
                'test/**/*'
            ],
            all: [
                '<%= src.metrics %>',
                '<%= src.bus %>',
                '<%= src.client %>'
            ]
        },
        output: {
            busJs: 'app/js/<%= pkg.name %>-bus.js',
            clientJs: 'app/js/<%= pkg.name %>-client.js',
            metricsJs: 'app/js/<%= pkg.name %>-metrics.js',
            busJsMin: 'app/js/<%= pkg.name %>-bus.min.js',
            clientJsMin: 'app/js/<%= pkg.name %>-client.min.js',
            metricsJsMin: 'app/js/<%= pkg.name %>-metrics.min.js',
            allJs: ['<%=output.busJs %>', '<%=output.clientJs %>', '<%=output.metricsJs %>'],
            allJsMin: ['<%=output.busJsMin %>', '<%=output.clientJsMin %>', '<%=output.metricsJsMin %>']
        },
        concat: {
            bus: {
                src: '<%= src.bus %>',
                dest: '<%= output.busJs %>'
            },
            client: {
                src: '<%= src.client %>',
                dest: '<%= output.clientJs %>'
            },
            metrics: {
                src: '<%= src.metrics %>',
                dest: '<%= output.metricsJs %>'
            }
        },
        uglify: {
            bus: {
                src: '<%= concat.bus.dest %>',
                dest: '<%= output.busJsMin %>'
            },
            client: {
                src: '<%= concat.client.dest %>',
                dest: '<%= output.clientJsMin %>'
            },
            metrics: {
                src: '<%= concat.metrics.dest %>',
                dest: '<%= output.metricsJsMin %>'
            }
        },

        // Copies minified and non-minified js into dist directory
        copy: {
          dist: {
            files: [
              {
                src: ['app/js/*.js'],
                dest: './dist/',
                cwd: '.',
                expand: true,
                flatten: true
              }
            ]
          }
        },
        clean: {
          dist: ['./dist/', './app/js/*.js']
        },
        jsdoc: {
            dist: {
                src: ['<%= src.bus %>', '<%= src.client %>'],
                options: {
                    destination: 'doc'
                }
            }
        },
        watch: {
            concatFiles: {
                files: ['Gruntfile.js', '<%= src.all %>'],
                tasks: ['concat']
            },
            test: {
                files: ['Gruntfile.js', '<%= output.allJs %>', '<%= src.test %>'],
                options: {
                    livereload: true
                }
            }
        },
        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= src.all %>'
            ],
            test: {
                src: ['<%= src.test %>']
            }
        },
        connect: {
            app: {
                options: {
                    port: 13000,
                    base: ["app", "sampleData" ],
                    index: "index.html",
                    debug: true
                }
            },
            tests: {
                options: {port: 14000, base: ["app", "test","sampleData"]}
            },
            mockParticipant: {
                options: {port: 14001, base: ["app","test/mockParticipant"]}
            },
            testBus: {
                options:{ port: 14002, base: ["test/integration/bus","app","sampleData"] }
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
            },
            intentsDemo: {
                options:{	port: 15006, base: ["app","demo/intentsSandbox","test/tests/unit"]}
            }
        },
        dist: {

        }

    };
    grunt.initConfig(config);

    for(var package in config.pkg.devDependencies) {
        if(package.match(/grunt\-/)) {
            grunt.loadNpmTasks(package);
        }
    }
//    grunt.loadNpmTasks('grunt-contrib-uglify');
//    grunt.loadNpmTasks('grunt-contrib-concat');
//    grunt.loadNpmTasks('grunt-jsdoc');
//    grunt.loadNpmTasks('grunt-contrib-watch');
//    grunt.loadNpmTasks('grunt-contrib-connect');
//    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Default task(s).
    grunt.registerTask('default', ['clean', 'concat', 'uglify', 'copy:dist', 'jsdoc']);
    grunt.registerTask('test', ['concat', 'uglify', 'connect', 'watch']);

};
