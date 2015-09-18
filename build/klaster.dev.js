(function ($) {
    var data = {
        'field' : {}
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
        return data.diffObjects(data._modelprechangeReal, data['field']);
    };
    return data;
}(jQuery));;(function ($, api) {

    var dom = {
        /**
         * add filter expression
         * @returns {dom}
         */
        'addFilter': function (filter) {
            this.attr(api.filter, filter);
        },
        /**
         * get element name
         * @returns {dom}
         */
        'getName': function () {
            return this.attr(this.nameAttr());
        },
        /**
         * get name attribute
         * @returns {dom}
         */
        'nameAttr': function () {
            return this.attr(api.name.attr) ? api.name.attr : 'name';
        },
        /**
         * toggle element from dom and model
         * @returns {dom}
         */
        'toggleOmit': function () {
            this.attr(api.omit.attr, !(this.attr(api.omit.attr) ? (this.attr(api.omit.attr).toLowerCase() === "true") : false));
            return this;
        },
        /**
         * set value of dom element
         * @param value
         */
        'setValue': function (value) {
            this.data('value', value);
        },
        /**
         * get xpath of dom element, hopfully unique
         * @returns {*}
         */
        'getXPath': function () {
            var el = $(this).get(0);
            if (typeof el === "string") return document.evaluate(el, document, null, 0, null)
            if (!el || el.nodeType != 1) return ''
            if (el.id) return "//*[@id='" + el.id + "']"
            var sames = [].filter.call(el.parentNode.children, function (x) {
                return x.tagName == el.tagName
            })
            return dom.getXPath.call(el.parentNode) + '/' + el.tagName.toLowerCase() + (sames.length > 1 ? '[' + ([].indexOf.call(sames, el) + 1) + ']' : '')
        }
    };

    /**
     * get value(s) from dom element
     * @param {type} multiple
     * @return {type} value
     */
    function getValue(multiple) {
        /**
         * return undefined if this element will be omitted
         */
        if (this.parents('[' + api.omit.attr + '="true"]').get(0) || this.attr(api.omit.attr) === "true") {
            return undefined;
        }

        if (typeof multiple === 'undefined' || !multiple
            && typeof dom.multipleValues[this.attr('type')] !== 'function'
            && !this.attr(api.multiple.attr)) {
            return dom.value.call(this);
        } else {
            /* if multiple is active return values */
            return this.getValues(this.attr('type'));
        }

    }

    /**
     * if multiple values exist
     * @param type
     * @returns {*}
     */
    function getValues(type) {
        if (typeof dom.multipleValues[type] === 'undefined'
            && this.attr(api.multiple.attr)) {
            type = api.multiple.attr;
        }
        return dom.multipleValues[type].call(this);
    }

    /**
     * decide which value to return
     * @returns {*}
     */
    function value() {
        if (this.attr(api.omit.attr) === "true") {
            return undefined;
        }
        var value = $(this).val() || $(this).text() || $(this).html();
        if (typeof value === 'undefined' && $(this).data('value')) {
            value = $(this).data('value');
        } else if (typeof $(this).data('value') === '' && $(this).attr(api.value.attr) !== "") {
            value = $(this).attr(api.value.attr);
        }
        return value;
    }

    /**
     *
     * @type {{checked: Function, checkbox: Function, radio: Function, data-multiple: Function}}
     */
    dom.multipleValues = {
        "checked": function ($el, $elements) {

            if ($el.attr(api.multiple.attr) === 'false' || $('[' + $el.nameAttr() + '="' + $el.getName() + '"]').length === 1)
                return $el.is(':checked');
            var values = [],
                value = undefined;
            $elements.each(function () {
                value = dom.value.call($(this));
                if (typeof value !== 'undefined') {
                    values.push(value);
                }
            });
            return values;
        },
        "checkbox": function () {
            return dom.multipleValues.checked(this, $('[' + this.nameAttr() + '="' + this.getName() + '"]:checked'));
        },
        "radio": function () {
            return dom.multipleValues.checkbox;
        },
        "data-multiple": function () {
            return dom.multipleValues.checked(this, $('[' + this.nameAttr() + '="' + this.getName() + '"][data-checked="true"]'));
        }
    };

    /**
     * getAttr that holds view name
     * @param $scope
     * @returns {*}
     */
    dom.getView = function ($scope) {
        return $scope.attr(api.view.attr) || dom.getFieldView($scope.getName(), true);
    };

    /**
     * return view render method
     * @param {type} fieldN
     * @param {type} getname
     * @returns {cls.view@arr;views|String|Boolean}
     */
    dom.getFieldView = function (fieldN, getname) {

        if (typeof fieldN === 'undefined') {
            return false;
        }

        var viewMethod = false, name = false;
        if (typeof klaster.view.views[fieldN] === 'undefined') {
            if (fieldN.indexOf('[') !== -1) {
                var finestMatch = fieldN.match(/([a-z].*?\[\w.*\])/gi);
                if (typeof finestMatch !== 'undefined' && finestMatch)
                    finestMatch = finestMatch.pop();
                name = typeof klaster.view.views[fieldN.split('[')[0] + '[*]'] !== 'undefined' ? finestMatch.split('[').pop() + '[*]' : fieldN;
                viewMethod = typeof klaster.view.views[fieldN.split('[')[0] + '[*]'] !== 'undefined' ? klaster.view.views[finestMatch.split('[').pop() + '[*]'] : undefined;
            }
        } else {
            viewMethod = klaster.view.views[fieldN];
            name = fieldN;
        }
        var result = (getname) ? name : viewMethod;

        return typeof klaster.view.views[name] !== 'undefined' ? result : false;
    };


    /**
     * replace brackets [] with points
     * @param {type} change
     * @returns {undefined}
     */
   dom.normalizeChangeResponse = function (change) {

        if (change.substr(0, 1) !== '[')
            return change;

        if (!change)
            return;
        var match = (/\[(.*?)\]/).exec(change);
        var fieldnamei = change;
        if (match) {
            fieldnamei = change.replace(match[0], match[1]);
            while ((match = /\[([a-z].*?)\]/ig.exec(fieldnamei)) != null) {
                fieldnamei = fieldnamei.replace(match[0], '.' + match[1]);
            }
        }

        return fieldnamei;//.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
    }

    /**
     * no html decorated content
     * @param {type} $scope
     * @returns {unresolved}
     */
    dom.isPrimitiveValue = function ($scope) {
        return $scope.is("input") || $scope.is("select") || $scope.is("textarea");
    };

    /**
     * no html decorated content
     * @param {type} $scope
     * @param {type} decorated
     * @returns {undefined}
     */
    dom.setPrimitiveValue = function ($scope, decorated) {
        if ($scope.is("input") || $scope.is("select")) {
            $scope.val(decorated);
        } else if ($scope.is("textarea")) {
            $scope.text(decorated);
        }
    };
    
    /**
     *
     * @param {type} $scope
     * @param {type} decorated
     * @returns {undefined}
     */
    dom.setHtmlValue = function ($scope, decorated) {
 
      if (typeof decorated === 'undefined')
        decorated = '';
        
        $($scope).html(decorated);
        
    };

    /**
     * element has view render function
     * @param $scope
     * @returns {*}
     */
    dom.hasView = function ($scope) {
        return dom.getFieldView($scope.getName(), true);
    };
    
     /**
     * get jquery selector for element name
     * @param name
     * @param escapeit
     * @returns {string}
     */
    dom.getSelector = function (name, escapeit) {
        if (escapeit)
            name = name.replace(/\[/g, '\[').replace(/\]/g, '\]')
        return '[data-name="' + name + '"],[name="' + name + '"]';
    };
    
    /**
     * detect if element represents a list
     * @param $scope
     * @returns {*|boolean}
     */
    dom.isHtmlList = function ($scope) {
        return $scope.attr(api.view.attr) && $scope.attr(api.view.attr).indexOf(api.view.value.definition.iterate) !== -1;
    };
    

    $.fn.addFilter = dom.addFilter;
    $.fn.getValues = dom.getValues;
    $.fn.getValue = dom.getValue;
    $.fn.setValue = dom.setValue;
    $.fn.getName = dom.getName;
    $.fn.nameAttr = dom.nameAttr;
    $.fn.toggleOmit = dom.toggleOmit;
    $.fn.getXPath = dom.getXPath;

    return dom;
}(jQuery, k_docapi));;var prefix = 'data';

var k_docapi = {
    'Controller': {
        'this.interactions': {
            'dom-attribute name': {
                'on-name': 'event callback handler, params(e, controller) context(this) is jQuery dom element'
            }
        },
        'this.delay': 'integer delay in milliseconds used for changes on model call to sync function timeout',
        'change': 'callback that executes after change of model data(this.model.values) with a delay of milliseconds declared with this.delay default 0'

    },
    'dom-attributes': {
        'defaultvalues': {
            'attr': prefix + '-defaultvalues',
            'value': 'String value:"client" or "server" that means our app uses the field.values frtom dom or model/javascript'
        },
        'name': {
            'attr': prefix + '-name',
            'value': 'String containing name of element, not unique'
        },
        'omit': {
            'attr': prefix + '-omit',
            'value': 'String/that evaluates to boolean, whether ignoring the area for model representation data or not'
        },
        'filter': {
            'attr': prefix + '-filter',
            'value': 'filter expression javascript is valid'
        },
        'value': {
            'attr': prefix + '-value',
            'value': 'String, containing the value of an element, can be plain or json'
        },
        'multiple': {
            'attr': prefix + '-multiple',
            'value': 'String/that evaluates to boolean, whether this element is part of multiple elements like checkbox',
            'children': {
                'checked': {
                    'attr': prefix + '-checked',
                    'value': 'String/that evaluates to boolean, whether this element is will apear inside a list of multiple elements with similar data-name, like checkbox'
                }
            }
        },
        'delay': {
            'attr': prefix + '-delay',
            'value': 'number of miliseconds until sync'
        },
        'on': {
            'attr': prefix + '-on',
            'value': 'event that triggers matching action method, also alias is possible. eg. hover->klasterhover'
        },
        'view': {
            'attr': prefix + '-view',
            'value': {
                'desc': 'defines which view function callback is executed for rendering output',
                'params': {
                    '[viewname]': 'name of view render function (calls it) and uses return string to fill html of this element',
                    'for->[viewname]': 'name of view render function and calls it for every array item and uses return string to fill html of this elements'
                },
                definition: {
                    'iterate': 'foreach->'
                }
            }
        }
    }
};

var k_structure = {
    'delay': 10,
    'api': k_docapi,
    'interactions': {
        'test': {
            'click': function (e) {

            }
        }
    },
    'model': {
        'field': {},
        'event': {
            'postChange': function () {
            },
            'sync': function () {
            }
        }
    },
    'viewFilter' : {},
    'view': {
        'viewpath': 'view/', //if loading templates in realtime
        'fileextension': 'html.twig', //if loading templates in realtime
        'templates': false, //check for loading templates in realtime
        'templates_': {}, // array of templates by name => html or other markup
        'render': function (tplVars, tplName) { // template render function ... here you can add template engine support for twig, etc.
        },
        'views': {
            'test': function () {

            }
        }
    },
    'filter': {
    },
    'config': {
        'debug': true
    }
}