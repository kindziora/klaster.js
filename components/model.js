/**
 *
 */
cls.model._buildModelPreChangeObj = function () {
    cls._modelprechange = {};
    cls._modelprechangeReal = {};
    cls._modelpresize = 0;
    for (var key in cls.model.field) {
        if (cls.has(cls.model.field, key)) {
            cls._modelprechange[key] = cls.model.field[key].toString();
            var base = {};
            if (Object.prototype.toString.call(cls.model.field[key]) === "[object Array]") {
                base = [];
            }

            if (typeof cls.model.field[key] !== 'string') {
                cls._modelprechangeReal[key] = $.extend(true, base, cls.model.field[key]);
            } else {
                cls._modelprechangeReal[key] = cls.model.field[key];
            }

            cls._modelpresize++;
        }
    }
};
/**
 * eval is better for this, js supports no byref arguments
 * @param {type} variable
 * @param {type} level
 * @param {type} index
 * @returns {@exp;cls@pro;model@call;getValue}
 */
cls.model.get = function (notation) {
    try {
        if (typeof cls.model.field[notation] === 'undefined' && notation.indexOf('[') !== -1) {
            return eval("(typeof cls.model.field." + notation + "!== 'undefined' ) ? cls.model.field." + notation + ": undefined;");
        } else {
            return cls.model.field[notation];
        }
    } catch (err) {
        return undefined;
    }
};
cls.model.set = function (notation, value) {
    if (typeof cls.model.field[notation] === 'undefined' && notation.indexOf('[') !== -1) {
        var parent = cls.model._getParentObject(notation);
        eval("if( (typeof " + parent + "!== 'undefined')) cls.model.field." + notation + "=" + JSON.stringify(value) + ";");
    } else {
        cls.model.field[notation] = value;
    }
};

cls.model._getParentObject = function (notation, ns) {
    if (typeof ns === 'undefined')
        ns = 'cls.model.field.';
    var parent = false;
    if (!notation)
        return parent;
    if (notation.indexOf(']') > notation.indexOf('.')) {
        parent = ns + notation.replace(notation.match(/\[(.*?)\]/gi).pop(), '');
    } else {
        var p = notation.split('.');
        p.pop();
        parent = ns + p.join('.');
    }
    return parent;
};

cls.model._delete = function (notation) {
    if (typeof cls.model.field[notation] === 'undefined' && notation.indexOf('[') !== -1) {
        try {
            // var parent = cls.model._getParentObject(notation);

            eval("if(typeof cls.model.field." + notation + "!== 'undefined' ) delete cls.model.field." + notation + ";");
        } catch (err) {
            cls.debug(err);
        }
    } else {
        delete cls.model.field[notation];
    }
};

/*
 * gets executed after a change on dom objects
 * "this" is the dom element responsible for the change
 */
cls.changed = function () {
    if (typeof cls.model.event !== "undefined" && typeof cls.model.event.sync === "function") {
        cls.model.event.sync.call(cls.model, this);
    }

    if (typeof cls.sync === "function") {
        cls.sync.call(cls, this);
    }

    me.model2view.call($(this));

    if (typeof cls.view.postRender !== 'undefined') {
        cls.view.postRender();
    }


    return true;
};

/**
 *
 * @param {type} value
 * @param {type} old
 */
cls.updateValue = function (value, old) {
    if (typeof value !== 'undefined') {
        //$(this).setValue(value);
        //cls.model.field[$(this).getName()] = value;
        cls.model.set($(this).getName(), value);
    } else {
        cls.model._delete($(this).getName());
        //delete cls.model.field[$(this).getName()];
    }
};

cls.modelchanged = function (field) {

    var compare = function (fieldName) {
        if (typeof cls._modelprechange[fieldName] === 'undefined') {
            return true;
        } else {
            if (cls._modelprechange[fieldName] != cls.model.field[fieldName])
                return true;
        }
        return false;
    };
    if (typeof field !== 'undefined') {

        return compare(field);
    } else {
        var modelsize = 0;
        for (var key in cls.model.field) {
            if (cls.has(cls.model.field, key)) {
                modelsize++;
                if (compare(key))
                    return true;
            }
        }

        if (cls._modelpresize !== modelsize)
            return true;
    }


    return false;
};

/**
 * http://stackoverflow.com/questions/27030/comparing-arrays-of-objects-in-javascript
 * @param {type} o1
 * @param {type} o2
 * @returns {Array|$@call;extend.diffObjects.diff|undefined}
 */
cls.diffObjects = function (o1, o2) {

    if ((o1 == null)) {
        if (Object.prototype.toString.call(o2) == "[object Object]") {
            o1 = {};
        } else {
            o1 = [];
        }

    }
    if ((o2 == null)) {
        o2 = [];
        if (Object.prototype.toString.call(o1) == "[object Object]") {
            o2 = {};
        } else {
            o2 = [];
        }
    }

    // choose a map() impl.
    // you may use $.map from jQuery if you wish
    var map = Array.prototype.map ?
        function (a) {
            return Array.prototype.map.apply(a, Array.prototype.slice.call(arguments, 1));
        } :
        function (a, f) {
            var ret = new Array(a.length), value;
            for (var i = 0, length = a.length; i < length; i++)
                ret[i] = f(a[i], i);
            return ret.concat();
        };
    // shorthand for push impl.
    var push = Array.prototype.push;
    // check for null/undefined values
    if ((o1 == null) || (o2 == null)) {
        if (o1 != o2)
            return [["", "null", o1 != null, o2 != null]];
        return undefined; // both null
    }

    function getUndefinedLength(arr) {
        return arr.filter(function () {
            return true;
        }).length;
    }

    // compare arrays
    if (Object.prototype.toString.call(o1) == "[object Array]") {
        var o1l = getUndefinedLength(o1), o2l = getUndefinedLength(o2);
        if (o1l != o2l) {
            // return [["", "length", o1l, o2l]]; // different length
        }
        var diff = [];
        for (var i = 0; i < o1.length; i++) {
            // per element nested diff
            var innerDiff = cls.diffObjects(o1[i], o2[i]);
            if (innerDiff) { // o1[i] != o2[i]
                // merge diff array into parent's while including parent object name ([i])
                push.apply(diff, map(innerDiff, function (o, j) {
                    o[0] = "[" + i + "]" + o[0];
                    return o;
                }));
            }
        }
        // if any differences were found, return them
        if (diff.length)
            return diff;
        // return nothing if arrays equal
        return undefined;
    }

    // compare object trees
    if (Object.prototype.toString.call(o1) == "[object Object]") {
        var diff = [];
        // check all props in o1
        for (var prop in o1) {
            // the double check in o1 is because in V8 objects remember keys set to undefined
            if ((typeof o2[prop] == "undefined") && (typeof o1[prop] != "undefined")) {
                // prop exists in o1 but not in o2
                diff.push(["[" + prop + "]", "undefined", o1[prop], undefined]); // prop exists in o1 but not in o2

            } else {
                // per element nested diff
                var innerDiff = cls.diffObjects(o1[prop], o2[prop]);
                if (innerDiff) { // o1[prop] != o2[prop]
                    // merge diff array into parent's while including parent object name ([prop])
                    push.apply(diff, map(innerDiff, function (o, j) {
                        o[0] = "[" + prop + "]" + o[0];
                        return o;
                    }));
                }

            }
        }
        for (var prop in o2) {
            // the double check in o2 is because in V8 objects remember keys set to undefined
            if ((typeof o1[prop] == "undefined") && (typeof o2[prop] != "undefined")) {
                // prop exists in o2 but not in o1
                diff.push(["[" + prop + "]", "undefined", undefined, o2[prop]]); // prop exists in o2 but not in o1

            }
        }
        // if any differences were found, return them
        if (diff.length)
            return diff;
        // return nothing if objects equal
        return undefined;
    }
    // if same type and not null or objects or arrays
    // perform primitive value comparison
    if (o1 != o2)
        return [["", "value", o1, o2]];
    // return nothing if values are equal
    return undefined;
};

/**
 *
 * @returns {Array}
 */
cls.getChangedModelFields = function () {
    return cls.diffObjects(cls._modelprechangeReal, cls.model.field);
};
