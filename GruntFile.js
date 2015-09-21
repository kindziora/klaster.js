module.exports = function (grunt) {


    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['components/skeleton.js', 'components/dom.js', 'components/data.js','klaster.js'],
                dest: 'build/klaster.dev.js'
            }
        },
        'closure-compiler': {
            frontend: {
                closurePath: '/home/alex/Downloads/compiler-latest',
                js: 'build/klaster.dev.js',
                jsOutputFile: 'build/klaster.rl.js',
                maxBuffer: 500,
                options: {
                    compilation_level: 'ADVANCED_OPTIMIZATIONS',
                    language_in: 'ECMASCRIPT5_STRICT'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-closure-compiler');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['concat', 'closure-compiler']);

};