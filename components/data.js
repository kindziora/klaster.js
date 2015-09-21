var k_data = (function ($) {
    var data = {
        'field' : {}
    };
 
    data.has = function (obj, key) {
        return hasOwnProperty.call(obj, key);
    };
    /**
     *
     */
    data._buildModelPreChangeObj = function () {
        data._modelprechange = {};
        data._modelprechangeReal = {};
        data._modelpresize = 0;
        for (var key in data['field']) {
            if (data.has(data['field'], key)) {
                data._modelprechange[key] = data['field'][key].toString();
                var base = {};
                if (Object.prototype.toString.call(data['field'][key]) === "[object Array]") {
                    base = [];
                }

                if (typeof data['field'][key] !== 'string') {
                    data._modelprechangeReal[key] = $.extend(true, base, data['field'][key]);
                } else {
                    data._modelprechangeReal[key] = data['field'][key];
                }

                data._modelpresize++;
            }
        }
    };
    /**
     * eval is better for this, js supports no byref arguments
     * @param {type} variable
     * @param {type} level
     * @param {type} index
     * @returns {@exp;data@pro;model@call;getValue}
     */
    data.get = function (notation) {
        try {
            if (typeof data['field'][notation] === 'undefined' && notation.indexOf('[') !== -1) {
                return eval("(typeof data.field." + notation + "!== 'undefined' ) ? data.field." + notation + ": undefined;");
            } else {
                return data['field'][notation];
            }
        } catch (err) {
            return undefined;
        }
    };

    data.set = function (notation, value) {
        if (typeof data['field'][notation] === 'undefined' && notation.indexOf('[') !== -1) {
            var parent = data._getParentObject(notation);
            eval("if( (typeof " + parent + "!== 'undefined')) data.field." + notation + "=" + JSON.stringify(value) + ";");
        } else {
            data['field'][notation] = value;
        }
    };

    data._getParentObject = function (notation, ns) {
        if (typeof ns === 'undefined')
            ns = 'data.field.';
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

    data._delete = function (notation) {
        if (typeof data['field'][notation] === 'undefined' && notation.indexOf('[') !== -1) {
            try {
                // var parent = data._getParentObject(notation);

                eval("if(typeof data['field']." + notation + "!== 'undefined' ) delete data['field']." + notation + ";");
            } catch (err) {
                data.debug(err);
            }
        } else {
            delete data['field'][notation];
        }
    };


    /**
     *
     * @param {type} value
     * @param {type} old
     */
    data.updateValue = function (value, old) {
        if (typeof value !== 'undefined') { 
            data.set($(this).getName(), value);
        } else {
            data._delete($(this).getName()); 
        }
    };

    data.changed = function (field) {

        var compare = function (fieldName) {
            if (typeof data._modelprechange[fieldName] === 'undefined') {
                return true;
            } else {
                if (data._modelprechange[fieldName] != data['field'][fieldName])
                    return true;
            }
            return false;
        };
        if (typeof field !== 'undefined') {

            return compare(field);
        } else {
            var modelsize = 0;
            for (var key in data['field']) {
                if (data.has(data['field'], key)) {
                    modelsize++;
                    if (compare(key))
                        return true;
                }
            }

            if (data._modelpresize !== modelsize)
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
    data.diffObjects = function (o1, o2) {

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
                var innerDiff = data.diffObjects(o1[i], o2[i]);
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
                    var innerDiff = data.diffObjects(o1[prop], o2[prop]);
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
    data.getChangedModelFields = function () {
        return data.diffObjects(data._modelprechangeReal, data.field);
    };
    return data;
}(jQuery));