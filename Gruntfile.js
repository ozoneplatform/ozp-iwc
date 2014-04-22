module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
		srcFiles: 'app/js/**/*.js',
		testFiles: 'app/test/**/*',
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: '<%= srcFiles %>',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
		jsdoc : {
        dist : {
            src: '<%= srcFiles %>',
            options: {
                destination: 'doc'
            }
        }
    },
    watch: {
      files: ['<%= srcFiles %>','<%= testFiles %>'],
      tasks: ['jsdoc']
    }

  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-jsdoc');
	grunt.loadNpmTasks('grunt-contrib-watch');
  // Default task(s).
  grunt.registerTask('default', ['uglify','jsdoc']);

};