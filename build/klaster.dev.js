var prefix = 'data';

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
        },
        'state' : {
           /* 'forename' :{result : false, msg : "not valid", value : "45345"} */
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
};var k_dom =(function ($, api) {
    api = api['dom-attributes'];
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
            return value.call(this);
        } else {
            /* if multiple is active return values */
            return getValues(this.attr('type'));
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
        if (typeof dom.child.view.views[fieldN] === 'undefined') {
            if (fieldN.indexOf('[') !== -1) {
                var finestMatch = fieldN.match(/([a-z].*?\[\w.*\])/gi);
                if (typeof finestMatch !== 'undefined' && finestMatch)
                    finestMatch = finestMatch.pop();
                name = typeof dom.child.view.views[fieldN.split('[')[0] + '[*]'] !== 'undefined' ? finestMatch.split('[').pop() + '[*]' : fieldN;
                viewMethod = typeof dom.child.view.views[fieldN.split('[')[0] + '[*]'] !== 'undefined' ? dom.child.view.views[finestMatch.split('[').pop() + '[*]'] : undefined;
            }
        } else {
            viewMethod = dom.child.view.views[fieldN];
            name = fieldN;
        }
        var result = (getname) ? name : viewMethod;

        return typeof dom.child.view.views[name] !== 'undefined' ? result : false;
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
     * replace brackets [] with ['']
     * @param {type} change
     * @returns {undefined}
     */
   dom.normalizeChangeResponseBrackets = function (change) {

        if (change.substr(0, 1) !== '[')
            return change;

        if (!change)
            return;
        var match = (/\[(.*?)\]/).exec(change);
        var fieldnamei = change;
        if (match) {
            fieldnamei = change.replace(match[0], match[1]);
            while ((match = /\[([a-z].*?)\]/ig.exec(fieldnamei)) != null) {
                fieldnamei = fieldnamei.replace(match[0], "['" + match[1] + "']");
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
    dom.setHtmlValue = function (decorated) {

      if (typeof decorated === 'undefined')
        decorated = '';
        
        $(this).html(decorated);
        
    };

    /**
     * element has view render function
     * @param $scope
     * @returns {*}
     */
    dom.hasView = function ($scope) {
        return $scope.attr(api.view.attr) || dom.getFieldView($scope.getName(), true);
    };
    
     /**
     * get jquery selector for element name
     * @param name
     * @param escapeit
     * @returns {string}
     */
    dom.getSelector = function (name, escapeit) {
        if (escapeit)
            name = name.replace(/\[/g, '\[').replace(/\]/g, '\]');
             
        return '[data-name="' + name + '"],[name="' + name + '"]';
    };
    
    /**
     * get jquery selector for element name
     * @param name
     * @param escapeit
     * @returns {string}
     */
    dom.getValidatorSelector = function (name, viewname) { 
            name = name.replace(/\[/g, '\[').replace(/\]/g, '\]');
            viewname = viewname.replace(/\[/g, '\[').replace(/\]/g, '\]');
        return '[data-name="' + name + '"][data-view="' + viewname + '"], [name="' + name + '"][data-view="' + viewname + '"]';
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
    $.fn.getValues = getValues;
    $.fn.getValue = getValue;
    $.fn.setValue = dom.setValue;
    $.fn.getName = dom.getName;
    $.fn.nameAttr = dom.nameAttr;
    $.fn.toggleOmit = dom.toggleOmit;
    $.fn.getXPath = dom.getXPath;

    return dom;
}(jQuery, k_docapi));;var k_data = (function ($) {
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
     * set state of a model field value and represent it in the state object eg.
     * {result: false, msg : "email ist nicht gültig"};
     **/
    data.setState = function(notation, value){
         
        //check if valid
        
        if(typeof value.result === 'undefined') {
            throw  {
               message : "A state has to contain a field 'result' of type boolean",
               name : "ValidationException"
            };
        }
          
        if (typeof data['state'] === 'undefined' ){
            data.state = $.extend(true, data.field);
        }
          
        if (typeof data['state'][notation] === 'undefined' && notation.indexOf('[') !== -1) {
            var parent = data._getParentObject(notation).replace(/\.field\./g, '.state.');
            eval("if( (typeof " + parent + "!== 'undefined')) data.state." + notation + "=" + JSON.stringify(value) + ";");
        } else {
            data['state'][notation] = value;
        }
    }
    
    /**
     * return state for a model field value eg.
     * {result: false, msg : "email ist nicht gültig"}
     **/
    data.getState = function(notation){
        try {
            if (typeof data['state'][notation] === 'undefined' && notation.indexOf('[') !== -1) {
                return eval("(typeof data.state." + notation + "!== 'undefined' ) ? data.state." + notation + ": undefined;");
            } else {
                return data['state'][notation];
            }
        } catch (err) {
            return undefined;
        }
    }
    
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
}(jQuery));;/**
 * klaster is a jquery filter plugin for extended filters by dom rules and javascript based on filter classes
 * @author Alexander Kindziora 2015
 *
 */

(function ($, structure, docapi, dom, model) {
    //"use strict";

    var me = {};
    var api = docapi['dom-attributes'];
     
    $.fn.klaster = function (child) {
        var cls = $.extend(structure, child);
        
        dom.child = cls;
        
        var $globalScope = this;
        
        cls.model = model = $.extend(model, child.model);
        
        /**
         * log debug messages
         */
        cls.debug = function () {
            if (cls.config.debug) {
                if (typeof arguments !== 'undefined') {
                    for (var msg in arguments) {
                        console.log(arguments[msg]);
                    }
                }
            }
        };
        
        /**
         * restriction of content by filter criteria eg. data-filter="this.a !== 0"
         */
        cls.updateViewFilter = function () {
            $globalScope.find('[data-filter]').each(function () {
                cls.viewFilter[$(this).getXPath()] = $(this).attr('data-filter');
            });
        };
 
        /**
         * before a view gets rendered
         * return true means render element, false remove it if existent in dom
         **/
        cls.preRenderView = function ($field, item) {
            if (typeof model.get($field.getName()) === 'undefined')
                return false;
                
            if (!$field.attr('data-filter'))
                return true;
            
            return eval("(" + $field.attr('data-filter').replace(new RegExp("this", "gi"), 'child.filter') + ")"); // execute operation eg. data-filter="1 == this.amount" or this.checkRights()
        };
        /**
         * 
         * after the rendering of a view 
         * trigger postRenderView view event, if existent
         **/
        cls.postRenderView = function ($field) {
            var funcName = dom.getView($field);

            if (typeof cls.view.event !== "undefined" && typeof cls.view.event.postRenderView !== 'undefined' && typeof cls.view.event.postRenderView[funcName] === 'function') {
                cls.view.event.postRenderView[funcName].call(model, $field, model.get($field.getName()));
            }

        };

        /*
         * gets executed before an event is triggered
         * set model state
         */
        cls.pre_trigger = function (e) {
            
            cls.updateViewFilter();
            model._buildModelPreChangeObj();

            if (typeof child.pre_trigger !== "undefined")
                return child.pre_trigger.call(this, e);
            return true;
        };
    
        /*
         * gets executed after an event is triggered
         * check if model has changed
         */
        cls.post_trigger = function (e, result) {
            
            if ((result != model.get($(this).getName())) || model.changed($(this).getName())) {
                
                cls.debug('changed', result, model.field[$(this).getName()], $(this).getName());
                
                cls.recognizeChange.setup.call(this);
          
                model.updateValue.call(this, result, model.field[$(this).getName()]);
              
                cls.model2View.call($(this));
             
            }

            if (typeof child.post_trigger !== "undefined")
                return child.post_trigger.call(this, e, child);
            return true;
        };
        
        /**
         * validate field by setting its state
         * return value if valid, otherwise return undefined so value does not go into model, if used as return value from interaction
         **/
        cls.validate = function(name, value, type) {
            if (typeof child.validator !== "undefined" && typeof child.validator[type] === "function") { 
                var validateResult = child.validator[type](value);
                
                validateResult.value = value;
                
                model.setState(name, validateResult);
              
                return validateResult.result ? value : undefined;
            }else{
                throw {
                   message : "Validator of type " + type + "does not exist.",
                   name : "ValidationException"
                }; 
            } 
        }
        
        /*
         * gets executed after a change on dom objects
         * "this" is the dom element responsible for the change
         */
        cls.changed = function () {
            if (typeof model.event !== "undefined" && typeof model.event.sync === "function") {
                model.event.sync.call(model, this);
            }
            return true;
        };
        
        /**
         * toggle a fiend and inform model
         **/
        cls.toggle = function ($scope) {
            if (typeof child.toggle === "function") {
                return child.toggle.call(this, $scope);
            } else {
                $scope.toggleOmit();
                cls.view2Model($scope);
            }
            return $scope;
        }.bind(cls);

         /**
         * set html decorated content and bind methods
         * this updates a partial area
         * @param {type} $html
         */
        function _set($html) {
            dom.setHtmlValue.call($(this), $html);
            cls.bind($(this));
            cls.postRenderView($(this));
        }

        /**
         * execute render view function for primitive values (no html)
         * @param $scope
         * @param scopeModelField
         * @returns {*}
         */
        cls.getDecoValPrimitive = function ($scope, scopeModelField) {
            var fieldN = $scope.getName(),
                viewName = dom.getView($scope),
                DecoValPrimitive = scopeModelField;
                 
            if (!cls.preRenderView($scope, scopeModelField) ) { // on off option
                return undefined;
            }

            if (viewName) {
                DecoValPrimitive = cls.view.views[viewName].call(cls, scopeModelField, fieldN, $scope);
            }
            return DecoValPrimitive;
        };
        
        /**
         * update list of elements hopefully partial update
         * @param $scope
         * @param field
         * @param change
         */
        cls.updateHtmlList = function ($scope, field, change) {
            var $child, index, $html;
            var viewName = dom.getView($scope);

            /**
             * differential function to add elements to a list of dom elements
             * add element
             */
            function addListElement() { 

                var m_index = 0;
                for (index in field) { //iterate over all items in array 

                    $child = $scope.find('[data-name="' + $scope.getName() + '\[' + index + '\]"]'); //get child by name

                    if (cls.preRenderView($scope, field[index])) { //check filters or other stuff that could avoid rendering that item
                        
                        $html = $(cls.view.views[viewName].call(cls.view, field[index], index, $scope)); //render view

                        var $close = $scope.find('[data-name="' + $scope.getName() + '\[' + m_index + '\]"]');

                        if ($child.get(0)) {
                            $child.replaceWith($html); //if sub element exists, replace it
                        } else if ($close.get(0)) {
                            $html.insertAfter($close); //insert after the last added 
                        } else {
                            $scope.append($html); //just append at the end
                        }

                        $html.data('value', field[index]); //apply private value to dom el
                        
                        cls.bind($html); //bind to app to new html               
                        cls.postRenderView($html); //execute post render on added child

                    } else {
                        $child.remove();
                    }


                    m_index = index;
                }
            }

            /**
             * remove dom representation of element inside list that does not exist in model
             */
            function killListElement() {
                $scope.children().each(function () {
                    var Elname = $(this).getName();
                    var name = /\[(.*?)\]/gi.exec(Elname)[1];

                    if (!model.get($(this).getName())
                        || typeof field[name] === 'undefined'
                        || !cls.preRenderView($scope, field[name])) {

                        $(this).remove();
                    }

                });
            }

            /**
             * decide what to update
             **/
            function decision(change){
                    
                if (change[1] === 'view-filter') {
                    killListElement();
                    addListElement();
                }
    
                if (change[1] === 'undefined') {
                    addListElement();
                }
    
                if (change[1] === 'length') {
                    if (change[2] < change[3]) { //increased
                        addListElement();
                    }
    
                    if (change[2] > change[3]) { //decreased
                        killListElement();
                    }
                }
                
    
                if (change[1] === 'value') { // value of subelement has changed
                    var _notation = change[0],
                        myChangedField = model.get(_notation), //get field that has changed
                        index = /\[(.*?)\]/gi.exec(_notation)[1]; //get index of item that has chnaged
    
                    $child = $scope.find(dom.getSelector(_notation, true)); //find listItem that has changed
    
                    if (typeof myChangedField !== 'undefined' && cls.preRenderView($scope, field[index])) {
                        $html = $(cls.view.views[viewName].call(cls.view, field[index], index, $scope)); // render subitem
    
                        if ($child.get(0)) {
                            $child.replaceWith($html);
                        }
    
                        $html.data('value', field[index]);
                        cls.bind($html);
                        cls.postRenderView($html);
    
                        if (!$child.get(0)) {
                            $scope.append($html);
                        }
                    } else { // value changed to undefined or filter does remove element
                        $child.remove(); // remove sub item
                    }
    
                }
                    
            }

            decision(change); //make decision what to update on list

        };
        
         //from server to model
        cls.server2Model = function (data) {
            //model.set.call(data.field, data.value);
            var $field = $(dom.getSelector(data.field));
            cls.post_trigger.call($field, e, data.value);
        };

        //from view to model
        cls.view2Model = function ($where) {
            ($where.find(cls.filter.events) || $(cls.filter.events)).each(function () {
                model.updateValue.call(this, $(this).getValue());
            });
        };
        
        cls.model2View = function () {
            var local = {}; 
            
            /**
             * executed after processing all name element dom representations
             * @param $scope
             * @param change
             * @param ready
             */
            local.finalIteratedAllViewEl = function ($scope, change, ready) {
                // and no view to display the change so try to display change with parent node
                var field_notation = dom.normalizeChangeResponse(change[0]);
                var match = field_notation;
                while (match !== '') {
                    match = model._getParentObject(match, '');
    
                    var findNotation = dom.getSelector(match, true);
    
                    var $myPEl = $globalScope.find(findNotation);
                    if (match !== "" && (dom.getFieldView(match) || (typeof $myPEl !== 'undefined' && $myPEl.attr(api.view.attr)))) {
                        ready();
                        $myPEl.each(local.eachViewRepresentation($myPEl.length, change, true, ready));
                        break;
                    }
                }
            };
    
    
            /**
             * each element set value or render view
             * @param cnt
             * @param change
             * @param foundRepresentation
             * @param ready
             * @returns {Function}
             */
            local.eachViewRepresentation = function (cnt, change, foundRepresentation, ready) {
                return function () {
                    
                    // check how to treat this field
                    var $scope = $(this), fieldN = $scope.getName();
                    var scopeModelField = model.get(fieldN);
                    var decoratedFieldValue;
    
                    function iteration(decoratedFieldValue) {
                        $scope.data('value', decoratedFieldValue);
                        cnt--;
                        if (cnt <= 0) {
                            if (!foundRepresentation) {
                                local.finalIteratedAllViewEl($scope, change, ready);
                            } else {
                                ready();
                            }
                        }
                    }
    
                    if (!dom.hasView($scope)) {
                        foundRepresentation = false;
                        iteration(scopeModelField);
                        return;
                    }
    
                    var cced = $scope.data('cvalue');
    
                    if (dom.isPrimitiveValue($scope)) { //if dom view element is of type primitive
                        decoratedFieldValue = cls.getDecoValPrimitive($scope, scopeModelField);
                        dom.setPrimitiveValue($scope, decoratedFieldValue);
                    } else { // field can contain html
    
                        if (dom.isHtmlList($scope)) {
                            //render partial list of html elements
    
                            if ($scope.getName().indexOf('[') === -1) { // address no array element
                                change[1] = 'view-filter';// why view filter?
                                change[2] = 2;
                                change[3] = 1;
                            } 
                            cls.updateHtmlList($scope, scopeModelField, change);// why trigger update list?
                            
                        } else { // not a list
     
                               var validateResult = model.getState($scope.getName());
                            if(typeof validateResult === 'undefined' || validateResult.view !== dom.getView($scope) ){
                                 if (cced !== scopeModelField) { // cached value of field != model.field value
                                    decoratedFieldValue = cls.getDecoValPrimitive($scope, scopeModelField);
                                    _set.call($scope, decoratedFieldValue); // bind html
                                    $scope.data('cvalue', scopeModelField); // set cached value for dom element
                                }
                            }else{
                                var template = cls.view.views[validateResult.view].call(cls, scopeModelField, $scope.getName());
                               
                                $scope = $($globalScope.find(dom.getValidatorSelector($scope.getName(), validateResult.view)));
                                _set.call($scope, template);
                                $scope.data('cvalue', scopeModelField); // set cached value for dom element
                      
                            }
                            
                        }
                    }
    
                    iteration(decoratedFieldValue);
    
                }
            }; 
            
            /**
             * access by model notation, returns closest match
             * Examples
             *
             * access: model.auto.name
             * dom:  <div data-name="auto"></div>
             * result: model.auto
             *
             * access: model.auto.name
             * dom:  <div data-name="auto"> <p data-name="auto.name"></p></div>
             * result: model.auto.name
             *
             * @param {type} notation
             * @returns {Boolean}
             */
            dom.findUntilParentExists = function (notation) {
                if (notation === '')
                    return false;
                var fieldNotation = dom.normalizeChangeResponse(notation);
                
                var fieldNotationBrackets = dom.normalizeChangeResponseBrackets(notation);
                
                var selector = dom.getSelector(fieldNotation, true);
                
                var tryDot = $globalScope.find(selector);
                
                var match = tryDot.length > 0 ? tryDot : $globalScope.find(dom.getSelector(fieldNotationBrackets, true));
                
                var cnt = match.length;
                if (cnt === 0) {
                    if (model._getParentObject(notation, '') === "")
                        return false;
                    return dom.findUntilParentExists(model._getParentObject(notation, ''));
                } else {
                    return match;
                }
            };
    
            /**
             * render all view areas that need to be rendered
             * @param changes
             */
            dom.updateAllViews = function (changes) {
    
                var addrN;
    
                $globalScope.find('[data-filter]').each(function () {
                    if (cls.viewFilter[$(this).getXPath()] !== $(this).attr('data-filter')) { // filter for this view has changed
                        changes.push([$(this).getName(), 'view-filter', cls.viewFilter[$(this).getXPath()], $(this).attr('data-filter')]);
                    }
                });
    
                var cacheEls = {};
    
                for (addrN in changes) { //only this fields need to be refreshed
    
                    var $els = dom.findUntilParentExists(changes[addrN][0]);
                    if (!$els)
                        continue;
                    changes[addrN][0] = $els.getName();
    
                    cacheEls[$els.getName()] = [$els, changes[addrN]];
                }
    
                for (var el in cacheEls) {
                    var $els = cacheEls[el][0], changes = cacheEls[el][1];
    
                    var cnt = $els.length;
                    
                    $els.each(local.eachViewRepresentation(cnt, changes, true, function ($els) {
                        return function(){
                            if (typeof model.event !== "undefined" && typeof model.event.postChange !== 'undefined' && typeof model.event.postChange[$els.getName()] === 'function') {
                                var changeCb = model.event.postChange[$els.getName()];
                                changeCb.call(model, model.get($els.getName()), changes, 'controller');
                            }
                        }
                    }($els)));
                }
            };
    
            dom.updateAllViews(model.getChangedModelFields() || []);
    
        };

        /**
         *recognize if filter values have changed and call someone
         *@description one common callback for changed is an ajax call with all values to a REST backend to update data
         *
         */
        cls.recognizeChange = function () {
            var mio = {};
            mio.changed = function (el) {
                cls.changed.call(el);
                delete cls.timeoutID;
            };
            mio.cancel = function () {
                if (typeof cls.timeoutID === "number") {
                    window.clearTimeout(cls.timeoutID);
                    delete cls.timeoutID;
                }
            };
            mio.setup = function () {
                var mes = this;
                mio.cancel();
                cls.timeoutID = window.setTimeout(function (msg) {
                    mio.changed(mes);
                }, $(mes).attr(api.delay.attr) || cls.delay);
            };
            return mio;
        }();
 
        /**
         *dispatch events for dom element
         */
        cls.dispatchEvents = function () {
            var events = $(this).attr(api.on.attr).split(','), i = 0, event = "", FinalEvents = {}, parts = "";
            for (i in events) {
                event = $.trim(events[i]);
                parts = event.split('->');
                if (parts.length > 1) {
                    FinalEvents[parts[0]] = parts[1];
                } else {
                    FinalEvents[parts[0]] = parts[0];
                }
            }
            return FinalEvents;
        };
        /**
         * find all filters and init there configs
         */
        cls.dispatchFilter = function (byElement) {
            return {
                'object': child,
                '$el': byElement
            };
        };
        
        /**
         * @todo rethink is this the best way to bind the methods?
         * bind dom to matching methods
         */
        cls.bind = function (element) {

            var events = {}, event = {}, name = "", method = "";
            var filter, $el;
            filter = cls.dispatchFilter(element);
            $el = element;
            /* variable injection via lambda function factory used in iteration */
            var factory = function (me, event) {
                return function (e, args) {
                    name = $(me).getName();
                    method = events[name][event];
                    var result = true;
                    if (false !== cls.pre_trigger.call(me, e)) {
                        if (typeof child.interactions[name] !== 'undefined' &&
                            typeof child.interactions[name][method] !== 'undefined') {
                            result = child.interactions[name][method].call(me, e, cls, args);
                            if ($(me).attr(api.omit.attr) === "true") {
                                result = $(me).getValue();
                            }
                        } else if (typeof child.interactions[method] !== 'undefined' &&
                            typeof child.interactions[method][event] !== 'undefined') {
                            result = child.interactions[method][event].call(me, e, cls, args);
                            if ($(me).attr(api.omit.attr) === "true") {
                                result = $(me).getValue();
                            }

                        } else {
                            result = $(me).getValue();
                        }
                        cls.post_trigger.call(me, e, result);
                    }

                };
            };
            //filter.fields = filter.$el.find('[name],[data-name]'),
            filter.events = filter.$el.find('[' + api.on.attr + ']');
            var InitValue = '';
            $(filter.events).each(function () {
                name = $(this).getName();
                events[name] = cls.dispatchEvents.call(this);
                for (event in events[name]) {
                    cls.debug('name:' + name + ', event:' + event);
                    $(this).off(event);
                    $(this).on(event, factory(this, event));
                    if ($el.attr('data-defaultvalues') !== 'model' && !$el.parents('[data-defaultvalues="model"]').get(0)) {
                        InitValue = $(this).getValue();
                        model.updateValue.call(this, InitValue);
                    }
                }
            });
            if ($el.attr('data-defaultvalues') === 'model') {
                cls.model2View.call($el);
            }
            return filter;
        };

        cls.init = function () {

            cls.filter = cls.bind(this);

            if (typeof child.init !== "undefined") {
                if (child.init(cls)) {
                    cls.recognizeChange.setup();
                }
            }
        }.bind(this);

        if (cls.view.templates) {
            // preloading alle templates, then init klaster interface
            var length = Object.keys(cls.view.views).length, cnt = 1;
            for (var v in cls.view.views) {
                $.get((cls.view.viewpath) + v + '.' + cls.view.fileextension + '?v=' + ((cls.config.debug) ? Math.random() : '1')).always(function (v) {
                    return function (content) {
                        cls.view.templates_[cls.view.views[v]] = content;
                        cls.view.templates_[v] = content;
                        if (length <= cnt) {
                            child.view.templates_ = cls.view.templates_;
                            cls.init();
                        }
                        cnt++;
                    };
                }(v));
            }
        } else {
            cls.init();
        }

    };
})(jQuery, k_structure, k_docapi, k_dom, k_data);