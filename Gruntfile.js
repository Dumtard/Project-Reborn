module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      main: {
        options: {
          transform: [
            ['babelify', {
              loose: 'all'
            }]
          ]
        },
        src: ['./Client/Main.js'],
        dest: '/srv/http/public/dumtard/test/games/Reborn/js/main.js'
      }
    },

    uglify: {
      options: {
        banner: '/* Dumtard :) */\n'
      },
      dist: {
        src: '/srv/http/public/dumtard/test/games/Reborn/js/main.js',
        dest: '/srv/http/public/dumtard/test/games/Reborn/js/main.min.js'
      }
    },

    watch: {
      files: ["Client/*.js", "Client/**/*.js", "Shared/*.js", "Shared/**/*.js"],
      tasks: ['browserify', 'uglify']
    }
  });
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
};
