"use strict";

var validator = require('node-validator'),
    chalk = require('chalk');

module.exports = {
    /**
     * @param {Object} options
     *
     * @return {Object}
     */
    getConfig: function (options) {
        var check = validator.isObject()
                .withRequired('src', validator.isString())
                .withRequired('dist', validator.isString())
                .withRequired('distFolder', validator.isString())
                .withRequired('babelHelpers', validator.isString())
            ;

        validator.run(check, options, function (errorCount, errors) {
            if (errorCount > 0) {
                console.log("\n" + chalk.red(chalk.inverse('webui-grunt-babel: '),
                        'invalid getConfig options.') + "\n");

                errors.forEach(function (error) {
                    console.log('  ' + chalk.bgBlue('parameter:') + ' ' + error.parameter);
                    console.log('  ' + chalk.bgBlue('value:') + ' ' + error.value);
                    console.log('  ' + chalk.red(error.message) + "\n");
                });
                process.exit(1);
            }
        });

        var config = {
            path: {
                src: options.src + '/',
                dist: options.dist + '/'
            },
            babel: {
                dist: {
                    files: [{
                        expand: true,
                        cwd: '<%= path.src %>',
                        src: ['**/*.js'],
                        dest: '<%= path.dist %>',
                        ext: '.js'
                    }]
                }
            },
            replace: {
                dist: {
                    options: {
                        patterns: [
                            {
                                match: new RegExp("^define\\('" + options.distFolder + "\/", 'g'),
                                replacement: "define('"
                            }
                        ]
                    },
                    files: [
                        {
                            expand: true,
                            cwd: '<%= path.dist %>',
                            src: ['**/*.js'],
                            dest: '<%= path.dist %>',
                            ext: '.js'
                        }
                    ]
                }
            },
            uglify: {
                dist: {
                    expand: true,
                    cwd: '<%= path.dist %>',
                    src: ['**/*.js'],
                    dest: '<%= path.dist %>',
                    ext: '.js'
                },
                babelHelpers: {
                    files: {}
                }
            },
            watch: {
                dist: {
                    files: ['<%= path.src %>**/*.js'],
                    tasks: ['babel', 'replace', 'uglify'],
                    options: {
                        spawn: false,
                        reload: true
                    }
                },
                devDist: {
                    files: ['<%= path.src %>**/*.js'],
                    tasks: ['babel', 'replace'],
                    options: {
                        spawn: false,
                        reload: true
                    }
                }
            }
        };

        config.uglify.babelHelpers.files[options.babelHelpers] = [options.babelHelpers];

        return config;
    },
    /**
     * @param {Object} grunt
     */
    registerTasks: function (grunt) {
        grunt.loadNpmTasks('grunt-contrib-uglify');
        grunt.loadNpmTasks('grunt-babel');
        grunt.loadNpmTasks('grunt-contrib-watch');
        grunt.loadNpmTasks('grunt-replace');

        grunt.registerTask('dist', [
            'babel:dist',
            'replace:dist',
            'uglify:dist',
            'uglify:babelHelpers'
        ]);

        grunt.registerTask('dev-dist', [
            'babel:dist',
            'replace:dist',
            'uglify:babelHelpers'
        ]);
    }
};
