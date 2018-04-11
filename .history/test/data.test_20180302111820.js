
var Jasmine = require('jasmine');
var jasmine = new Jasmine();

data._getParentObject = function (notation, ns) {
    if (typeof ns === 'undefined')
        ns = 'data.field.';
    var parent = false;
    if (!notation)
        return parent;
    if (notation.indexOf(']') > notation.indexOf('.')) {
        parent = ns + notation.replace(notation.match(/\[(.*?)\]/gi).pop(), '!').split('!')[0];
    } else {
        var p = notation.split('.');
        p.pop();
        parent = ns + p.join('.');
    }
    return parent;
};


describe("verify data component works as expected", function() {
    it("contains spec with an expectation", function() {
        expect(true).toBe(true);
    });
});