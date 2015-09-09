module.exports = function (grunt) {

    var fs = require('fs');
    var path = './components/';

    grunt.registerTask('default', 'Updates the viewCache File', function () {

        var files = fs.readdirSync(path);
        var cachedFiles = {};
        for (var i in files) {
            if (files[i].indexOf('.json') === -1) {
                cachedFiles[files[i].split('.')[0]] = fs.readFileSync(path + files[i], 'utf8');
            }
        }
        console.log(JSON.stringify(cachedFiles, null, 2));
        fs.writeFileSync(path + 'cached.json', JSON.stringify(cachedFiles, null, 2), 'utf8');
        
    });
};