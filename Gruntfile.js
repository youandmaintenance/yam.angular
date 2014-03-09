module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({
    sass: {                            // Task
      dist: {                          // Target
        options: {
          includePaths: ['scss/'],
          outputStyle: 'expanded'
        },
        files: {                             // Dictionary of files
          'css/yam.css': 'scss/yam.scss'     // 'destination': 'source'
        }
      },
    },
    watch: {
      sass: {
        files: ['scss/*.scss'],
        tasks: ['scss'],
        options: {
          spawn: false,
        },
      },
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
  grunt.loadNpmTasks('grunt-sass');

  grunt.registerTask('scss', ['sass']);
  grunt.registerTask('default', ['watch']);
  grunt.registerTask('iconify', ['grunticon::yamIcons']);
};
