module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({
    compass: {
      dist: {
        options: {
          config: 'config.rb'
        }
      }
    },
    watch: {
      //jsTest: {
      //  files: ['spec/{,*/}*.js'],
      //  tasks: ['newer:jshint:test', 'karma']
      //},
      grunticon: {
        files: ['images/icons/{,*/}*.svg'],
        tasks: ['grunticon'],
        options: {
          spawn: true,
        }
      },
      compass: {
        files: ['scss/*.scss'],
        tasks: ['compass'],
        options: {
          spawn: true,
        }
      }
    },
    grunticon: {
      yamIcons: {
        files: [
          {
            expand: true,
            cwd: 'images/icons',
            src: ['svg/*.svg', 'png/*.png'],
            dest: 'images/icons/compiled'
          }
        ],
        options: {
          datasvgcss: '_icons.svg.scss',
          datapngcss: '_icons.png.scss',
          urlpngcss:  '_icons.fallback.scss'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-grunticon');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compass');
  //grunt.loadNpmTasks('grunt-sass');

  grunt.registerTask('compass', ['compass']);
  grunt.registerTask('default', ['watch']);
  grunt.registerTask('watch', ['grunticon', 'compass']);
  grunt.registerTask('iconify', ['grunticon::yamIcons']);

  //grunt.registerTask('test', [
  //  'clean:server',
  //  'concurrent:test',
  //  'autoprefixer',
  //  'connect:test',
  //  'karma'
  //]);
};
