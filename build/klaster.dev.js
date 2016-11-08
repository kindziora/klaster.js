/*! klaster.js Version: 0.9.5 08-11-2016 23:40:39 */
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
            'postChange': { 'fieldabc' : "function () {}"},
            'sync': "function () {}"
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
        'debug': true,
        'skeleton' : true
    }
};var k_dom =(function (api) {
    api = api['dom-attributes'];
    var dom = {
        
        /**
         * document.querySelector("#main ul:first-child") instead of jquery or even zepto
         * /
        
        /**
         * add filter expression
         * @returns {dom}
         */
        'addFilter': function (filter) {
            this.setAttribute(api.filter, filter);
        },
        /**
         * get element name
         * @returns {dom}
         */
        'getName': function ($el) {
            if($el.nodeType !== 3)
                return $el.getAttribute(dom.nameAttr($el));
        },
        /**
         * get name attribute
         * @returns {dom}
         */
        'nameAttr': function ($el) {
            return $el.getAttribute(api.name.attr) ? api.name.attr : 'name';
        },
        /**
         * toggle element from dom and model
         * @returns {dom}
         */
        'toggleOmit': function ($el) {
            $el.setAttribute(api.omit.attr, !($el.getAttribute(api.omit.attr) ? ($el.getAttribute(api.omit.attr).toLowerCase() === "true") : false));
            return $el;
        }, 
        /**
         * get xpath of dom element, hopfully unique
         * @returns {*}
         */
        'getXPath': function ($el) {
            var el = $el;
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
    function getValue($el, multiple) {
        /**
         * return undefined if this element will be omitted
         */
        if (dom.getParents($el, '[' + api.omit.attr + '="true"]') || $el.getAttribute(api.omit.attr) === "true") {
            return undefined;
        }

        if (typeof dom.multipleValues[$el.getAttribute('type')] !== 'function'
            || $el.getAttribute(api.multiple.attr) === "false") {
            return value.call($el);
        } 
        
        if(multiple || $el.getAttribute(api.multiple.attr) === "true"
        || typeof dom.multipleValues[$el.getAttribute('type')] === 'function'){
            /* if multiple is active return values */
            return getValues.call($el, $el.getAttribute('type'));
        }

    }

    /**
     * if multiple values exist
     * @param type
     * @returns {*}
     */
    function getValues(type) {
        if (typeof dom.multipleValues[type] === 'undefined'
            && this.getAttribute(api.multiple.attr)) {
            type = api.multiple.attr;
        }
        return dom.multipleValues[type].call(this);
    }

    /**
     * decide which value to return
     * @returns {*}
     */
    function value() {
        if (this.getAttribute(api.omit.attr) === "true") {
            return undefined;
        }
        return this.getAttribute(api.value.attr) || this.value || this.innerHTML;
    }
    
    dom.value = value;
    
    /**
     *
     * @type {{checked: Function, checkbox: Function, radio: Function, data-multiple: Function}}
     */
    dom.multipleValues = {
        "checked": function ($el, $elements, single) {

            if ($el.getAttribute(api.multiple.attr) === 'false' || single || document.querySelectorAll('[' + $($el).el('nameAttr') + '="' + dom.getName($el) + '"]').length === 1)
                return $el.checked;

            var values = [],
                val = undefined;

            Array.prototype.forEach.call($elements, function (el, i) {
                val = value.call(el);
                if (typeof val !== 'undefined') {
                    values.push(val);
                }
            });

            return values;
        },
        "checkbox": function () {
            return dom.multipleValues.checked(this, document.querySelectorAll('[' + dom.nameAttr(this) + '="' + dom.getName(this) + '"]:checked'));
        },
        "radio": function () {
            return dom.multipleValues.checked(this, document.querySelectorAll('[' + dom.nameAttr(this) + '="' + dom.getName(this) + '"]:checked'), true);
        },
        "data-multiple": function () {
            return dom.multipleValues.checked(this, document.querySelectorAll('[' + dom.nameAttr(this) + '="' + dom.getName(this) + '"][data-checked="true"]'));
        }
    };

    dom.hasMultipleChoices = function ($scope) {

        var multiTypes = ["radio", "checkbox"];

        console.log(multiTypes, $scope.getAttribute('type'), multiTypes.indexOf($scope.getAttribute('type')));

        return multiTypes.indexOf($scope.getAttribute('type')) > -1 || $scope.getAttribute('data-multiple') === "true";
    };

    dom.selectMultiple = function ($scope, values) {
        if (typeof values !== 'undefined' && values !== null) {
            var instances = document.querySelectorAll('[' + dom.nameAttr($scope) + '="' + dom.getName($scope) + '"]');

            if( Object.prototype.toString.call( values ) !== '[object Array]' ) {
                values = [values];
            } 

            Array.prototype.forEach.call(instances, function (el) {
                el.checked = values[0];
            });
        }
    };
    
    dom.getHtml = function($scope) {
        return $scope.innerHTML;
    };
    
    /**
     * setting the HTML
     */
    dom.setHtml = function($scope, content) {
        $scope.innerHTML = content;
    };
     

    dom.getParents = function($scope, selector) {
         var foundElem;
          while ($scope && $scope !== document) {
            foundElem = $scope.parentNode.querySelector(selector);
            if(foundElem) {
              return foundElem;
            } 
            $scope = $scope.parentNode;
          }
          return null;
    }

    /**
     * getAttr that holds view name
     * @param $scope
     * @returns {*}
     */
    dom.getView = function ($scope) {
        return $scope.getAttribute(api.view.attr) || dom.getFieldView(dom.getName($scope), true);
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
    
    dom.is = function($scope, type) {
        return $scope.tagName.toLowerCase() === type.toLowerCase();
    }

    /**
     * no html decorated content
     * @param {type} $scope
     * @returns {unresolved}
     */
    dom.isPrimitiveValue = function ($scope) {
        return dom.is($scope, "input") || dom.is($scope, "select") || dom.is($scope, "textarea");
    };

    /**
     * no html decorated content
     * @param {type} $scope
     * @param {type} decorated
     * @returns {undefined}
     */
    dom.setPrimitiveValue = function ($scope, decorated) {
        if($scope.getAttribute(api.value.attr) !== null) {
            $scope.setAttribute(api.value.attr, decorated);
        }else{
            
            if($scope.type ==="textarea"){
                $scope.innerHTML = decorated;
            }else{
                $scope.value = decorated;
            }
            
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
        
        this.innerHTML = decorated;
        
    };

    /**
     * element has view render function
     * @param $scope
     * @returns {*}
     */
    dom.hasView = function ($scope) {
        return $scope.getAttribute(api.view.attr) || dom.getFieldView(dom.getName($scope), true);
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
        return $scope.getAttribute(api.view.attr) && $scope.getAttribute(api.view.attr).indexOf(api.view.value.definition.iterate) !== -1;
    };
    /**
     * create dom el from string
     **/
    dom.parseHTML = function (html) {
        var t = document.createElement('template');
        t.innerHTML = html;
        return t.content.cloneNode(true).childNodes[0];
    }
 
    dom.getValues = getValues;
    dom.getValue = getValue;
    
    return dom;
}(k_docapi));
;var k_data = (function ($) {
    var data = {
        'field' : {}
    };
 
  
    
    var hasOwn = Object.prototype.hasOwnProperty;
    var toStr = Object.prototype.toString;
    
    var isArray = function isArray(arr) {
    	if (typeof Array.isArray === 'function') {
    		return Array.isArray(arr);
    	}
    
    	return toStr.call(arr) === '[object Array]';
    };
    
    var isPlainObject = function isPlainObject(obj) {
    	if (!obj || toStr.call(obj) !== '[object Object]') {
    		return false;
    	}
    
    	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
    	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
    	// Not own constructor property must be Object
    	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
    		return false;
    	}
    
    	// Own properties are enumerated firstly, so to speed up,
    	// if last one is own, then all properties are own.
    	var key;
    	for (key in obj) { /**/ }
    
    	return typeof key === 'undefined' || hasOwn.call(obj, key);
    };
    
   data.extend = function() {
    	var options, name, src, copy, copyIsArray, clone;
    	var target = arguments[0];
    	var i = 1;
    	var length = arguments.length;
    	var deep = false;
    
    	// Handle a deep copy situation
    	if (typeof target === 'boolean') {
    		deep = target;
    		target = arguments[1] || {};
    		// skip the boolean and the target
    		i = 2;
    	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
    		target = {};
    	}
    
    	for (; i < length; ++i) {
    		options = arguments[i];
    		// Only deal with non-null/undefined values
    		if (options != null) {
    			// Extend the base object
    			for (name in options) {
    				src = target[name];
    				copy = options[name];
    
    				// Prevent never-ending loop
    				if (target !== copy) {
    					// Recurse if we're merging plain objects or arrays
    					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
    						if (copyIsArray) {
    							copyIsArray = false;
    							clone = src && isArray(src) ? src : [];
    						} else {
    							clone = src && isPlainObject(src) ? src : {};
    						}
    
    						// Never move original objects, clone them
    						target[name] = data.extend(deep, clone, copy);
    
    					// Don't bring in undefined values
    					} else if (typeof copy !== 'undefined') {
    						target[name] = copy;
    					}
    				}
    			}
    		}
    	}
    
    	// Return the modified object
    	return target;
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
            if (data.has(data['field'], key) && data['field'][key] !== null  && typeof data['field'][key] !== 'undefined') {
                data._modelprechange[key] = data['field'][key]; // data['field'][key].toString()
                var base = {};
                if (Object.prototype.toString.call(data['field'][key]) === "[object Array]") {
                    base = [];
                }

                if (typeof data['field'][key] !== 'string' && typeof data['field'][key] !== 'number') {
                    data._modelprechangeReal[key] = data.extend(true, base, data['field'][key]);
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
            data.state = JSON.parse(JSON.stringify(data.field));
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
    data.getOld = function (notation) {
        try {
            if (typeof data['_modelprechangeReal'][notation] === 'undefined' && notation.indexOf('[') !== -1) {
                return eval("(typeof data._modelprechangeReal." + notation + "!== 'undefined' ) ? data._modelprechangeReal." + notation + ": undefined;");
            } else {
                return data['_modelprechangeReal'][notation];
            }
        } catch (err) {
            return undefined;
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
            parent = ns + notation.replace(notation.match(/\[(.*?)\]/gi).pop(), '!').split('!')[0];
        } else {
            var p = notation.split('.');
            p.pop();
            parent = ns + p.join('.');
        }
        return parent;
    };

    data._delete = data.delete = function (notation) {
        if (typeof data['field'][notation] === 'undefined' && notation.indexOf('[') !== -1) {
            try {
                var parent = data._getParentObject(notation);
                 eval(
                    "if(Object.prototype.toString.call(" + parent + ") === '[object Array]' ){" +
                    "" + parent + ".splice(" + parent + ".indexOf(data['field']." + notation + "),1);" +
                    "} else {" +
                        "if(typeof data['field']." + notation + "!== 'undefined')" +
                            " delete data['field']." + notation + ";" +
                    "}");
                /**
                 * to keep indexes

                eval("if(typeof data['field']." + notation + "!== 'undefined' ){ delete data['field']." + notation + ";" +
                    "if(Object.prototype.toString.call(" + parent + ") === '[object Array]' ) " + parent + ".length--;" +
                    "}");
                 */
            } catch (err) {
                console.log(err);
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
            data.set(this.getAttribute('name') || this.getAttribute('data-name'), value);
        } else {
            data._delete(this.getAttribute('name') || this.getAttribute('data-name')); 
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
                 return [["", "length", o1l, o2l]]; // different length
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
}(k_dom));
;/**
 * klaster is a jquery filter plugin for extended filters by dom rules and javascript based on filter classes
 * @author Alexander Kindziora 2015
 *
 */

(function (structure, docapi, dom, model) {
    //"use strict";

    var me = {};
    var api = docapi['dom-attributes'];

    window.$k = function (selector) {
        return klaster.bind(document.querySelector(selector));
    };

    function klaster(child) {

        var skeleton = {};
        if (structure.config.skeleton) {
            skeleton = JSON.parse(JSON.stringify(structure));
            skeleton.api = null;
        }

        var cls = model.extend(structure, child);

        dom.child = cls;

        var $globalScope = this;

        cls.model = model = model.extend(model, child.model);

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
            Array.prototype.forEach.call($globalScope.querySelectorAll('[data-filter]'), function (el, i) {
                cls.viewFilter[dom.getXPath(el)] = el.getAttribute('data-filter');
            });
        };

        /**
         * before a view gets rendered
         * return true means render element, false remove it if existent in dom
         **/
        cls.preRenderView = function ($field, item) {
            if (typeof model.get(dom.getName($field)) === 'undefined' ||
                $field.getAttribute(api.view) === "__static")
                return false;

            if (!$field.getAttribute('data-filter'))
                return true;

            return eval("(" + $field.getAttribute('data-filter').replace(new RegExp("this", "gi"), 'child.filter') + ")"); // execute operation eg. data-filter="1 == this.amount" or this.checkRights()
        };
        /**
         * 
         * after the rendering of a view 
         * trigger postRenderView view event, if existent
         **/
        cls.postRenderView = function ($field) {
            var funcName = dom.getView($field);

            if (typeof cls.view.event !== "undefined" && typeof cls.view.event.postRenderView !== 'undefined' && typeof cls.view.event.postRenderView[funcName] === 'function') {
                cls.view.event.postRenderView[funcName].call(model, $field, model.get(dom.getName($field)));
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
            var name = dom.getName(this);
            var modelState = model.get(name);

            if ((result != modelState) || model.changed(name)) {

                cls.debug('changed', result, model.getOld(name), name);

                cls.recognizeChange.setup.call(this);

                model.updateValue.call(this, result, model.field[name]);

                if (typeof child.post_trigger !== "undefined")
                    child.post_trigger.call(this, e, child);

                cls.model2View.call(this);

            }
            return true;
        };

        /**
         * validate field by setting its state
         * return value if valid, otherwise return undefined so value does not go into model, if used as return value from interaction
         **/
        cls.validate = function (name, value, type) {
            if (typeof child.validator !== "undefined" && typeof child.validator[type] === "function") {
                var validateResult = child.validator[type].call(model, value, name);

                validateResult.value = value;

                model.setState(name, validateResult);

                return validateResult.result ? value : undefined;
            } else {
                throw {
                    message: "Validator of type " + type + "does not exist.",
                    name: "ValidationException"
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
            if (typeof child.sync !== "undefined" && typeof child.sync === "function") {
                child.sync.call(model, this);
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
            dom.setHtmlValue.call(this, $html);
            if (typeof $html !== 'undefined' && $html.nodeType !== 3)
                cls.bind(this);

            cls.postRenderView(this);
        }

        /**
         * execute render view function for primitive values (no html)
         * @param $scope
         * @param scopeModelField
         * @returns {*}
         */
        cls.getDecoValPrimitive = function ($scope, scopeModelField) {
            var fieldN = dom.getName($scope),
                viewName = dom.getView($scope),
                DecoValPrimitive = scopeModelField;

            if (!cls.preRenderView($scope, scopeModelField)) { // on off option
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
                    var name = dom.getName($scope),
                        $child = $scope.querySelector('[data-name="' + name + '\[' + index + '\]"]'); //get child by name

                    if (cls.preRenderView($scope, field[index])) { //check filters or other stuff that could avoid rendering that item

                        $html = dom.parseHTML(cls.view.views[viewName].call(cls.view, field[index], index, $scope)); //render view

                        var $close = $scope.querySelector('[data-name="' + name + '\[' + m_index + '\]"]');

                        if ($child) {
                            $child.parentNode.replaceChild($html, $child);
                        } else if ($close) {
                            $close.parentNode.insertBefore($html, $close.nextSibling);
                        } else {
                            $scope.appendChild($html); //just append at the end
                        }

                        cls.bind($html); //bind to app to new html               
                        cls.postRenderView($html); //execute post render on added child

                    } else {
                        $child.parentNode.removeChild($child);
                    }

                    m_index = index;
                }
            }

            /**
             * remove dom representation of element inside list that does not exist in model
             */
            function killListElement() {

                Array.prototype.forEach.call($scope.childNodes, function (el, i) {
                    var Elname = dom.getName(el);
                    if (typeof Elname === 'undefined') {
                        el.parentNode.removeChild(el);
                    } else {
                        var name = /\[(.*?)\]/gi.exec(Elname)[1];

                        if (!model.get(Elname)
                            || typeof field[name] === 'undefined'
                            || !cls.preRenderView($scope, field[name])) {

                            el.parentNode.removeChild(el);
                        }
                    }

                });

            }

            /**
             * decide what to update
             **/
            function decision(change) {

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

                    $child = $scope.querySelector(dom.getSelector(_notation, true)); //find listItem that has changed

                    if (typeof myChangedField !== 'undefined' && cls.preRenderView($scope, field[index])) {
                        $html = dom.parseHTML(cls.view.views[viewName].call(cls.view, field[index], index, $scope)); // render subitem

                        if ($child) {
                            $child.parentNode.replaceChild($html, $child);
                        }

                        cls.bind($html);
                        cls.postRenderView($html);

                        if (!$child) {
                            $scope.appendChild($html);
                        }
                    } else { // value changed to undefined or filter does remove element
                        $child.parentNode.removeChild($child); // remove sub item
                    }

                }

            }

            decision(change); //make decision what to update on list

        };

        /**
         * update html element if changed || validation error view
         **/
        cls.updateHtmlElement = function ($scope, scopeModelField, changed) {

            var name = dom.getName($scope);
            var error = model.getState(name);
            var cced = model.getOld(name);
            if ((typeof error === 'undefined' || error.result) || (typeof error !== 'undefined' && dom.getView($scope) !== error.view)) { // kein fehler aufgetreten
                if (cced !== scopeModelField) { // cached value of field != model.field value
                    var decoratedFieldValue = cls.getDecoValPrimitive($scope, scopeModelField);
                    _set.call($scope, decoratedFieldValue); // bind html 
                }
            } else { // field view was defined i a validator is it gets rendered also if value is not in model and by that equal to undefined
                var template = cls.view.views[error.view].call(cls, scopeModelField, name);

                var $field = $globalScope.querySelector(dom.getValidatorSelector(name, error.view));
                _set.call($field, template);
            }
        };

        //from server to model
        cls.server2Model = function (data) {
            //model.set.call(data.field, data.value);
            var $field = $globalScope.querySelector(dom.getSelector(data.field));
            cls.post_trigger.call($field, e, data.value);
        };

        //from view to model
        cls.view2Model = function ($where) {
            Array.prototype.forEach.call(($where.querySelectorAll(cls.filter.events) || $globalScope.querySelectorAll(cls.filter.events)), function (el, i) {
                model.updateValue.call(el, dom.value.call(el));
            });
        };

        cls.model2View = function () {
            var local = {};
            var $triggerSrc = this;

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
                    var $myPEl = $scope.parents(findNotation);

                    var viewName = $myPEl.getAttribute(api.view.attr);
                    var viewMethod = cls.view.views[viewName];

                    /**
                     * improve performance here!!!
                     **/
                    if (match !== "" && (dom.getFieldView(match) || (typeof $myPEl !== 'undefined' && typeof viewMethod !== 'undefined'))) {
                        ready();
                        Array.prototype.forEach.call($myPEl, local.eachViewRepresentation($myPEl.length, change, true, ready));
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
                return function (el) {

                    // check how to treat this field
                    var $scope = el, fieldN = dom.getName(el);
                    var v = $scope.getAttribute(api.view.attr);
                    var scopeModelField = model.get(fieldN);
                    var decoratedFieldValue;



                    if (v === '__static') {
                        dom.setPrimitiveValue($scope, scopeModelField);
                        return;
                    }

                    if ($triggerSrc === $scope) {
                        return;
                    }

                    function iteration(decoratedFieldValue) {
                        cnt--;
                        if (cnt <= 0) {
                            if (!foundRepresentation) {
                                local.finalIteratedAllViewEl($scope, change, ready);
                            } else {
                                ready();
                            }
                        }
                    }

                    /* if ($scope.attr('type') === "radio") {
                         foundRepresentation = false;
                         iteration(scopeModelField);
                         return;
                     }*/

                    if (dom.isPrimitiveValue($scope)) { //if dom view element is of type primitive
                        decoratedFieldValue = cls.getDecoValPrimitive($scope, scopeModelField);

                        if (dom.hasMultipleChoices($scope)) {
                            dom.selectMultiple($scope, decoratedFieldValue);
                        } else {
                            dom.setPrimitiveValue($scope, decoratedFieldValue);
                        }

                    } else { // field can contain html

                        if (dom.isHtmlList($scope)) {
                            //render partial list of html elements

                            if (dom.getName($scope).indexOf('[') === -1) { // address no array element
                                change[1] = 'view-filter';// why view filter?
                                change[2] = 2;
                                change[3] = 1;
                            }
                            cls.updateHtmlList($scope, scopeModelField, change);// why trigger update list?

                        } else { // not a list
                            cls.updateHtmlElement($scope, scopeModelField, change);
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

                var tryDot = $globalScope.querySelectorAll(selector);

                var match = tryDot.length > 0 ? tryDot : $globalScope.querySelectorAll(dom.getSelector(fieldNotationBrackets, true));

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

                Array.prototype.forEach.call($globalScope.querySelectorAll('[data-filter]'), function (el) {
                    if (cls.viewFilter[dom.getXPath(el)] !== el.getAttribute('data-filter')) { // filter for this view has changed
                        changes.push([dom.getName(el), 'view-filter', cls.viewFilter[dom.getXPath(el)], el.getAttribute('data-filter')]);
                    }
                });

                var cacheEls = {};
                var name = undefined;
                for (addrN in changes) { //only this fields need to be refreshed

                    var $els = dom.findUntilParentExists(changes[addrN][0]);
                    if (!$els)
                        continue;

                    name = dom.getName($els[0]);
                    changes[addrN][0] = name;

                    cacheEls[name] = [$els, changes[addrN]];
                }

                for (var el in cacheEls) {
                    var $els = cacheEls[el][0], changes = cacheEls[el][1];

                    var cnt = $els.length;

                    Array.prototype.forEach.call($els, local.eachViewRepresentation(cnt, changes, true, function ($els) {
                        var name = dom.getName($els[0]);
                        return function (el) {
                            if (typeof model.event !== "undefined" && typeof model.event.postChange !== 'undefined' && typeof model.event.postChange[name] === 'function') {
                                var changeCb = model.event.postChange[name];
                                changeCb.call(model, model.get(name), changes, 'controller');
                            }
                        }
                    } ($els)));

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
                }, mes.getAttribute(api.delay.attr) || cls.delay);
            };
            return mio;
        } ();

        /**
          *dispatch events for dom element
          */
        cls.dispatchEvents = function () {
            var FinalEvents = [];
            if (this.getAttribute(api.on.attr)) {
                var events = (this.getAttribute(api.on.attr) || '').split(','), i = 0, event = "", FinalEvents = {}, parts = "";
                for (i in events) {
                    event = events[i].trim();
                    parts = event.split('->');
                    if (parts.length > 1) {
                        FinalEvents[parts[0]] = parts[1];
                    } else {
                        FinalEvents[parts[0]] = parts[0];
                    }
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
                    name = dom.getName(me);
                    method = events[name][event];
                    var result = true;
                    if (false !== cls.pre_trigger.call(me, e)) {
                        if (typeof cls.interactions[name] !== 'undefined' &&
                            typeof cls.interactions[name][method] !== 'undefined') {
                            result = cls.interactions[name][method].call(me, e, cls, args);
                            if (me.getAttribute(api.omit.attr) === "true") {
                                result = dom.value.call(me);
                            }
                        } else if (typeof cls.interactions[method] !== 'undefined' &&
                            typeof cls.interactions[method][event] !== 'undefined') {
                            result = cls.interactions[method][event].call(me, e, cls, args);
                            if (me.getAttribute(api.omit.attr) === "true") {
                                result = dom.value.call(me);
                            }

                        } else {
                            result = dom.value.call(me);
                        }
                        cls.post_trigger.call(me, e, result);
                    }

                };
            };
            //filter.fields = filter.$el.find('[name],[data-name]'),
            filter.events = filter.$el.querySelectorAll('[' + api.on.attr + ']');

            var InitValue = '';

            function bindevents(el) {
                name = dom.getName(el);

                el = cls.applyMethods(el);

                if (name) {
                    events[name] = cls.dispatchEvents.call(el);
                    for (event in events[name]) {
                        cls.debug('name:' + name + ', event:' + event);

                        if (cls.config.skeleton) {
                            if (typeof skeleton['interactions'][name] === 'undefined')
                                skeleton['interactions'][name] = {};

                            skeleton['interactions'][name][event] = "function(e, self){}";
                        }

                        var f = factory(el, event);
                        el.removeEventListener(event, f);
                        el.addEventListener(event, f);
                        if ($el.getAttribute('data-defaultvalues') !== 'model' && !dom.getParents($el, '[data-defaultvalues="model"]')) {
                            InitValue = dom.value.call(el);
                            model.updateValue.call(el, InitValue);
                        }
                    }

                }
            }

            Array.prototype.forEach.call(filter.events, bindevents);

            bindevents(filter.$el);

            if ($el.getAttribute('data-defaultvalues') === 'model') {
                cls.model2View.call($el);
            }
            return filter;
        };

        cls.applyMethods = function (el) {

            el.getName = function () {
                return dom.getName(this);
            }.bind(el);

            el.getValue = function (from, multiple) {
                if (typeof from === 'undefined')
                    from = 'dom';
                return (from !== 'model') ? dom.getValue(this, multiple) : model.get(dom.getName(this));
            }.bind(el);

            el.setValue = function (primitiveValue) {
                dom.setPrimitiveValue(this, primitiveValue);
            }.bind(el);

            return el;
        };

        cls.init = function () {

            cls.filter = cls.bind(this);

            if (typeof child.init !== "undefined") {
                if (child.init(cls)) {
                    cls.recognizeChange.setup();
                }
            }
        }.bind(this);

        cls.init();

        console.log(JSON.stringify(skeleton));
    };
})(k_structure, k_docapi, k_dom, k_data);
