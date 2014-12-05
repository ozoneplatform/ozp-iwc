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
        watch: {
            app: {
                files: ['Gruntfile.js', 'js/**.*', 'index.html'],
                options: {
                    livereload: true,
                    spawn: false
                }
            }
        },
        connect: {
            app: {
                options: {
                    port: 13000,
                    base: [ '.']
                }
            }
        }

    };

    // load all grunt tasks matching the `grunt-*` pattern
    require('load-grunt-tasks')(grunt);

    grunt.initConfig(config);

    // Default task(s).
    grunt.registerTask('default', ['connect','watch']);

};