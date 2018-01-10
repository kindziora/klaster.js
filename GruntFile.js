module.exports = function (grunt) {

    require("load-grunt-tasks")(grunt); // npm install --save-dev load-grunt-tasks

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';',
                banner: '/*! <%= pkg.name %> Version: <%= pkg.version %> <%= grunt.template.today("dd-mm-yyyy HH:MM:ss") %> */\n'
            },
            dist: {
                src: ['components/skeleton.js', 'components/dom.js', 'bower_components/fast-json-patch/dist/fast-json-patch.js', 'components/data.js', 'klaster.js'],
                dest: './build/klaster.es2015.dev.js'
            }
        },
        "babel": {
            options: {
                sourceMap: true,
                presets: ['es2015']
            },
            dist: {
                files: { 
                    "build/klaster.es5.dev.js" : "build/klaster.es2015.dev.js"
                }
            }
        },
        'closure-compiler': {
            frontend: {
                closurePath: './buildtools/google',
                js: './build/klaster.es5.dev.js',
                jsOutputFile: './build/klaster.rl.js',
                maxBuffer: 500,
                options: {
                    compilation_level: 'ADVANCED_OPTIMIZATIONS',
                    language_in: 'ECMASCRIPT5'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-closure-compiler');
 
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['concat', 'babel','closure-compiler']); 

};