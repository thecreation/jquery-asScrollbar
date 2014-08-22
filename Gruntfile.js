'use strict';

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
        // Task configuration.
        // -- clean config -------------------------------------------------------
        clean: {
            files: ['dist', 'css']
        },

        // -- concat config ------------------------------------------------------
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist_basic: {
                src: ['src/jquery.asScrollbar.js', 'src/jquery.asScrollable.js'],
                dest: 'dist/jquery.asScrollable.js',
            },
            dist_extras: {
                src: ['src/jquery.asScrollbar.js', 'src/jquery.asScrollSide.js'],
                dest: 'dist/jquery.asScrollSide.js',
            },
            dist_all: {
                src: ['src/jquery.asScrollbar.js', 'src/jquery.asScrollable.js', 'src/jquery.asScrollSide.js'],
                dest: 'dist/jquery.asScrollbar_all.js',
            }
        },
        // -- uglify config -------------------------------------------------------
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist_basic: {
                src: '<%= concat.dist_basic.dest %>',
                dest: 'dist/jquery.asScrollable.min.js',
            },
            dist_extras: {
                src: '<%= concat.dist_extras.dest %>',
                dest: 'dist/jquery.asScrollSide.min.js',
            },
            dist_all: {
                src: '<%= concat.dist_all.dest %>',
                dest: 'dist/jquery.asScrollbar_all.min.js',
            },
        },

        // -- jsbeautifier config --------------------------------------------------
        jsbeautifier: {
            files: ["src/**/*.js", 'Gruntfile.js'],
            options: {
                "indent_size": 4,
                "indent_char": " ",
                "indent_level": 0,
                "indent_with_tabs": false,
                "preserve_newlines": true,
                "max_preserve_newlines": 10,
                "jslint_happy": false,
                "brace_style": "collapse",
                "keep_array_indentation": false,
                "keep_function_indentation": false,
                "space_before_conditional": true,
                "eval_code": false,
                "indent_case": false,
                "unescape_strings": false
            }
        },

        // -- jshint config ---------------------------------------------------------
        jshint: {
            gruntfile: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: 'Gruntfile.js'
            },
            src: {
                options: {
                    jshintrc: 'src/.jshintrc'
                },
                src: ['src/**/*.js']
            }
        },

        // -- watch config -----------------------------------------------------------
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            src: {
                files: '<%= jshint.src.src %>',
                tasks: ['jshint:src', 'qunit']
            }
        },

        // -- Clean Config -----------------------------------------------------------
        less: {
            dist: {
                files: {
                    'css/asScrollbar.css': 'less/asScrollbar.less'
                }
            }
        },

        // -- replace Config ----------------------------------------------------------
        replace: {
            bower: {
                src: ['bower.json'],
                overwrite: true, // overwrite matched source files
                replacements: [{
                    from: /("version": ")([0-9\.]+)(")/g,
                    to: "$1<%= pkg.version %>$3"
                }]
            },
            jquery: {
                src: ['asScrollbar.jquery.json'],
                overwrite: true, // overwrite matched source files
                replacements: [{
                    from: /("version": ")([0-9\.]+)(")/g,
                    to: "$1<%= pkg.version %>$3"
                }]
            }
        }
    });

    // -- Main Tasks ------------------------------------------------------------------
    // These plugins provide necessary tasks.
    require('load-grunt-tasks')(grunt, {
        pattern: ['grunt-*']
    });

    // Default task.
    grunt.registerTask('default', ['js', 'clean', 'dist', 'css']);
    grunt.registerTask('dist', ['concat', 'uglify']);
    grunt.registerTask('css', ['less']);
    grunt.registerTask('js', ['jsbeautifier', 'jshint']);

    grunt.registerTask('version', [
        'replace:bower',
        'replace:jquery'
    ]);
};
