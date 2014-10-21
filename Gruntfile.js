module.exports = function(grunt) {
    /* jshint camelcase: false */
    var sampleDataBase={
                            "path":"data-schemas/mock",
                            options: {
                                directory: false,
                                index: "index.json"
                            }
                        };

    // Project configuration.
    var config = {
        pkg: grunt.file.readJSON('package.json'),
        
        src: {
            common: [
                'app/js/common/event.js',
                'app/js/common/**/*.js',
                'bower_components/es6-promise/promise.js'
            ],
            metrics: [
                '<%= src.common %>',
                'app/js/metrics/statistics/sample.js',
                'app/js/metrics/statistics/binary_heap.js',
                'app/js/metrics/statistics/exponentiallyDecayingSample.js',
                'app/js/metrics/statistics/exponentiallyWeightedMovingAverage.js',
                'app/js/metrics/baseMetric.js',
                'app/js/metrics/types/*.js',
                'app/js/metrics/metricsRegistry.js'
            ],
            bus: [
                '<%= src.common %>',
                '<%= src.metrics %>',
                'app/js/bus/util/**/*.js',
                'app/js/bus/security/**/*.js',
                'app/js/bus/network/**/*.js',
                'app/js/bus/transport/participant.js',
                'app/js/bus/transport/internalParticipant.js',
                'app/js/bus/transport/router.js',
                'app/js/bus/transport/**/*.js',
                'app/js/bus/storage/**/*.js',
                'app/js/bus/api/commonApiValue.js',
                'app/js/bus/api/commonApiCollectionValue.js',
                'app/js/bus/api/*.js',
                'app/js/bus/api/**/*.js',
                'app/js/bus/*/**/*.js'
            ],
            client: [
                '<%= src.common %>',
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
            busJs: 'dist/js/<%= pkg.name %>-bus.js',
            clientJs: 'dist/js/<%= pkg.name %>-client.js',
            metricsJs: 'dist/js/<%= pkg.name %>-metrics.js',
            busJsMin: 'dist/js/<%= pkg.name %>-bus.min.js',
            clientJsMin: 'dist/js/<%= pkg.name %>-client.min.js',
            metricsJsMin: 'dist/js/<%= pkg.name %>-metrics.min.js',
            allJs: ['<%=output.busJs %>', '<%=output.clientJs %>', '<%=output.metricsJs %>'],
            allJsMin: ['<%=output.busJsMin %>', '<%=output.clientJsMin %>', '<%=output.metricsJsMin %>']
        },
        concat_sourcemap: {
            options: {
                sourcesContent: true
            },
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
            options: {
                sourceMap:true,
                sourceMapIncludeSources: true,
                sourceMapIn: function(m) { return m+".map";}
            },
            bus: {
                src: '<%= concat_sourcemap.bus.dest %>',
                dest: '<%= output.busJsMin %>'
            },
            client: {
                src: '<%= concat_sourcemap.client.dest %>',
                dest: '<%= output.clientJsMin %>'
            },
            metrics: {
                src: '<%= concat_sourcemap.metrics.dest %>',
                dest: '<%= output.metricsJsMin %>'
            }
        },

        // Copies minified and non-minified js into dist directory
        copy: {
            jssrc: {
                files: [
                    {
                        src: ['js/defaultWiring.js','*.html','tools/**/*'],
                        dest: './dist/',
                        cwd: 'app',
                        expand: true,
                        nonull:true
                    }
                ]
            }
        },
        clean: {
          dist: ['./dist/', './app/js/ozpIwc-*.js']
        },
        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                options: {
                    paths: [
                        'app/js/'
                    ],
//                    themedir: 'path/to/custom/theme/',
                    outdir: 'dist/doc'
                }
            }
        },
        watch: {
            concatFiles: {
                files: ['Gruntfile.js', '<%= src.all %>','app/**/*'],
                tasks: ['concat_sourcemap', 'copy'],
                options: {
                    interrupt: true,
                    spawn: false
                }
                
            },
            test: {
                files: ['Gruntfile.js', 'dist/**/*', '<%= src.test %>'],
                options: {
                    livereload: true,
                    spawn: false
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
                '<%= src.all %>',
                '!app/js/common/es5-sham.min.js',
                '!app/js/common/es5-shim.min.js',
                '!app/js/common/promise-1.0.0.js'
                
            ],
            test: {
                src: ['<%= src.test %>']
            }
        },
        connect: {
            app: {
                options: {
                    port: 13000,
                    base: [sampleDataBase,'dist']
                }
            },
            tests: {
                options: {port: 14000, base: ["dist", "test",sampleDataBase]}
            },
            mockParticipant: {
                options: {port: 14001, base: ["dist","test/mockParticipant"]}
            },
            testBus: {
                options:{ port: 14002, base: ['dist',sampleDataBase] }
            },
            demo1: {
                options: { port: 15000, base: ["dist","demo/bouncingBalls"] }
            },
            demo2: {
                options: { port: 15001, base: ["dist","demo/bouncingBalls"] }
            },
            demo3: {
                options: { port: 15002, base: ["dist","demo/bouncingBalls"] }
            },
            demo4: {
                options: { port: 15003, base: ["dist","demo/bouncingBalls"] }
            },
            gridsterDemo: {
                options: { port: 15004, base: ["dist","demo/gridster"] }
            },
            intentsDemo: {
                options:{	port: 15006, base: ["dist","demo/intentDemo","test/tests/unit"]}
            }
        },
        dist: {

        }

    };

    // load all grunt tasks matching the `grunt-*` pattern
    require('load-grunt-tasks')(grunt);

    grunt.initConfig(config);

    // Default task(s).
    grunt.registerTask('build', ['concat_sourcemap', 'uglify', 'copy']);
    grunt.registerTask('dist', ['jshint','build', 'yuidoc']);
    grunt.registerTask('testOnly', ['build','connect:tests','connect:testBus','connect:mockParticipant', 'watch']);
    grunt.registerTask('test', ['build','connect','watch']);
    grunt.registerTask('default', ['dist']);

};
