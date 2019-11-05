/*! klaster.js Version: 0.9.8 05-11-2019 10:40:24 */
/*! (C) WebReflection Mit Style License */
var CircularJSON=function(JSON,RegExp){var specialChar="~",safeSpecialChar="\\x"+("0"+specialChar.charCodeAt(0).toString(16)).slice(-2),escapedSafeSpecialChar="\\"+safeSpecialChar,specialCharRG=new RegExp(safeSpecialChar,"g"),safeSpecialCharRG=new RegExp(escapedSafeSpecialChar,"g"),safeStartWithSpecialCharRG=new RegExp("(?:^|([^\\\\]))"+escapedSafeSpecialChar),indexOf=[].indexOf||function(v){for(var i=this.length;i--&&this[i]!==v;);return i},$String=String;function generateReplacer(value,replacer,resolve){var doNotIgnore=false,inspect=!!replacer,path=[],all=[value],seen=[value],mapp=[resolve?specialChar:"[Circular]"],last=value,lvl=1,i,fn;if(inspect){fn=typeof replacer==="object"?function(key,value){return key!==""&&replacer.indexOf(key)<0?void 0:value}:replacer}return function(key,value){if(inspect)value=fn.call(this,key,value);if(doNotIgnore){if(last!==this){i=lvl-indexOf.call(all,this)-1;lvl-=i;all.splice(lvl,all.length);path.splice(lvl-1,path.length);last=this}if(typeof value==="object"&&value){if(indexOf.call(all,value)<0){all.push(last=value)}lvl=all.length;i=indexOf.call(seen,value);if(i<0){i=seen.push(value)-1;if(resolve){path.push((""+key).replace(specialCharRG,safeSpecialChar));mapp[i]=specialChar+path.join(specialChar)}else{mapp[i]=mapp[0]}}else{value=mapp[i]}}else{if(typeof value==="string"&&resolve){value=value.replace(safeSpecialChar,escapedSafeSpecialChar).replace(specialChar,safeSpecialChar)}}}else{doNotIgnore=true}return value}}function retrieveFromPath(current,keys){for(var i=0,length=keys.length;i<length;current=current[keys[i++].replace(safeSpecialCharRG,specialChar)]);return current}function generateReviver(reviver){return function(key,value){var isString=typeof value==="string";if(isString&&value.charAt(0)===specialChar){return new $String(value.slice(1))}if(key==="")value=regenerate(value,value,{});if(isString)value=value.replace(safeStartWithSpecialCharRG,"$1"+specialChar).replace(escapedSafeSpecialChar,safeSpecialChar);return reviver?reviver.call(this,key,value):value}}function regenerateArray(root,current,retrieve){for(var i=0,length=current.length;i<length;i++){current[i]=regenerate(root,current[i],retrieve)}return current}function regenerateObject(root,current,retrieve){for(var key in current){if(current.hasOwnProperty(key)){current[key]=regenerate(root,current[key],retrieve)}}return current}function regenerate(root,current,retrieve){return current instanceof Array?regenerateArray(root,current,retrieve):current instanceof $String?current.length?retrieve.hasOwnProperty(current)?retrieve[current]:retrieve[current]=retrieveFromPath(root,current.split(specialChar)):root:current instanceof Object?regenerateObject(root,current,retrieve):current}var CircularJSON={stringify:function stringify(value,replacer,space,doNotResolve){return CircularJSON.parser.stringify(value,generateReplacer(value,replacer,!doNotResolve),space)},parse:function parse(text,reviver){return CircularJSON.parser.parse(text,generateReviver(reviver))},parser:JSON};return CircularJSON}(JSON,RegExp);
;var prefix = 'data';
var _nsKlaster = {};
_nsKlaster.k_docapi = { 
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
        'scope': {
            'attr': prefix + '-scope',
            'value': 'String containing id of the scope, not unique'
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

_nsKlaster.k_structure = {
    'delay': 10,
    'api': _nsKlaster.k_docapi,
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
};;function domKlaster(api) {
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

            if ($el.getAttribute(api.multiple.attr) === 'false' || single || document.querySelectorAll('[' + dom.nameAttr($el) + '="' + dom.getName($el) + '"]').length === 1)
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
        $scope.innerHTML = content.trim();
    };
     

    dom.getParents = function($scope, selector) {
         var foundElem;
          while ($scope && $scope.parentNode && $scope != dom.$globalScope) {
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
        if (!change)
            return;
    
        if (change.substr(0, 1) !== '[')
            return change;

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

    if (!change)
    return;
    
    if (change.substr(0, 1) !== '[')
            return change;

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
            $scope.value = decorated; 
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
        
        this.innerHTML = decorated.toString().trim();
        
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
        t.innerHTML = html.trim();
        return t.content.cloneNode(true).childNodes[0];
    }
 
    dom.getValues = getValues;
    dom.getValue = getValue;
    
    return dom;
};

_nsKlaster.k_dom = domKlaster(_nsKlaster.k_docapi);
;/*! fast-json-patch, version: 2.0.6 */
var jsonpatch =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var CircularJSON = __webpack_require__(4);
var _hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwnProperty(obj, key) {
    return _hasOwnProperty.call(obj, key);
}
exports.hasOwnProperty = hasOwnProperty;
function _objectKeys(obj) {
    if (Array.isArray(obj)) {
        var keys = new Array(obj.length);
        for (var k = 0; k < keys.length; k++) {
            keys[k] = "" + k;
        }
        return keys;
    }
    if (Object.keys) {
        return Object.keys(obj);
    }
    var keys = [];
    for (var i in obj) {
        if (hasOwnProperty(obj, i)) {
            keys.push(i);
        }
    }
    return keys;
}
exports._objectKeys = _objectKeys;
;
/**
* Deeply clone the object.
* https://jsperf.com/deep-copy-vs-json-stringify-json-parse/25 (recursiveDeepCopy)
* @param  {any} obj value to clone
* @return {any} cloned obj
*/
function _deepClone(obj) {
    switch (typeof obj) {
        case "object":
            return JSON.parse(CircularJSON.stringify(obj)); //Faster than ES5 clone - http://jsperf.com/deep-cloning-of-objects/5
        case "undefined":
            return null; //this is how JSON.stringify behaves for array items
        default:
            return obj; //no need to clone primitives
    }
}
exports._deepClone = _deepClone;
//3x faster than cached /^\d+$/.test(str)
function isInteger(str) {
    var i = 0;
    var len = str.length;
    var charCode;
    while (i < len) {
        charCode = str.charCodeAt(i);
        if (charCode >= 48 && charCode <= 57) {
            i++;
            continue;
        }
        return false;
    }
    return true;
}
exports.isInteger = isInteger;
/**
* Escapes a json pointer path
* @param path The raw pointer
* @return the Escaped path
*/
function escapePathComponent(path) {
    if (path.indexOf('/') === -1 && path.indexOf('~') === -1)
        return path;
    return path.replace(/~/g, '~0').replace(/\//g, '~1');
}
exports.escapePathComponent = escapePathComponent;
/**
 * Unescapes a json pointer path
 * @param path The escaped pointer
 * @return The unescaped path
 */
function unescapePathComponent(path) {
    return path.replace(/~1/g, '/').replace(/~0/g, '~');
}
exports.unescapePathComponent = unescapePathComponent;
function _getPathRecursive(root, obj) {
    var found;
    for (var key in root) {
        if (hasOwnProperty(root, key)) {
            if (root[key] === obj) {
                return escapePathComponent(key) + '/';
            }
            else if (typeof root[key] === 'object') {
                found = _getPathRecursive(root[key], obj);
                if (found != '') {
                    return escapePathComponent(key) + '/' + found;
                }
            }
        }
    }
    return '';
}
exports._getPathRecursive = _getPathRecursive;
function getPath(root, obj) {
    if (root === obj) {
        return '/';
    }
    var path = _getPathRecursive(root, obj);
    if (path === '') {
        throw new Error("Object not found in root");
    }
    return '/' + path;
}
exports.getPath = getPath;
/**
* Recursively checks whether an object has any undefined values inside.
*/
function hasUndefined(obj) {
    if (obj === undefined) {
        return true;
    }
    if (obj) {
        if (Array.isArray(obj)) {
            for (var i = 0, len = obj.length; i < len; i++) {
                if (hasUndefined(obj[i])) {
                    return true;
                }
            }
        }
        else if (typeof obj === "object") {
            var objKeys = _objectKeys(obj);
            var objKeysLength = objKeys.length;
            for (var i = 0; i < objKeysLength; i++) {
                if (hasUndefined(obj[objKeys[i]])) {
                    return true;
                }
            }
        }
    }
    return false;
}
exports.hasUndefined = hasUndefined;
var PatchError = /** @class */ (function (_super) {
    __extends(PatchError, _super);
    function PatchError(message, name, index, operation, tree) {
        var _this = _super.call(this, message) || this;
        _this.message = message;
        _this.name = name;
        _this.index = index;
        _this.operation = operation;
        _this.tree = tree;
        return _this;
    }
    return PatchError;
}(Error));
exports.PatchError = PatchError;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var equalsOptions = { strict: true };
var _equals = __webpack_require__(2);
var areEquals = function (a, b) {
    return _equals(a, b, equalsOptions);
};
var helpers_1 = __webpack_require__(0);
exports.JsonPatchError = helpers_1.PatchError;
exports.deepClone = helpers_1._deepClone;
/* We use a Javascript hash to store each
 function. Each hash entry (property) uses
 the operation identifiers specified in rfc6902.
 In this way, we can map each patch operation
 to its dedicated function in efficient way.
 */
/* The operations applicable to an object */
var objOps = {
    add: function (obj, key, document) {
        obj[key] = this.value;
        return { newDocument: document };
    },
    remove: function (obj, key, document) {
        var removed = obj[key];
        delete obj[key];
        return { newDocument: document, removed: removed };
    },
    replace: function (obj, key, document) {
        var removed = obj[key];
        obj[key] = this.value;
        return { newDocument: document, removed: removed };
    },
    move: function (obj, key, document) {
        /* in case move target overwrites an existing value,
        return the removed value, this can be taxing performance-wise,
        and is potentially unneeded */
        var removed = getValueByPointer(document, this.path);
        if (removed) {
            removed = helpers_1._deepClone(removed);
        }
        var originalValue = applyOperation(document, { op: "remove", path: this.from }).removed;
        applyOperation(document, { op: "add", path: this.path, value: originalValue });
        return { newDocument: document, removed: removed };
    },
    copy: function (obj, key, document) {
        var valueToCopy = getValueByPointer(document, this.from);
        // enforce copy by value so further operations don't affect source (see issue #177)
        applyOperation(document, { op: "add", path: this.path, value: helpers_1._deepClone(valueToCopy) });
        return { newDocument: document };
    },
    test: function (obj, key, document) {
        return { newDocument: document, test: areEquals(obj[key], this.value) };
    },
    _get: function (obj, key, document) {
        this.value = obj[key];
        return { newDocument: document };
    }
};
/* The operations applicable to an array. Many are the same as for the object */
var arrOps = {
    add: function (arr, i, document) {
        if (helpers_1.isInteger(i)) {
            arr.splice(i, 0, this.value);
        }
        else {
            arr[i] = this.value;
        }
        // this may be needed when using '-' in an array
        return { newDocument: document, index: i };
    },
    remove: function (arr, i, document) {
        var removedList = arr.splice(i, 1);
        return { newDocument: document, removed: removedList[0] };
    },
    replace: function (arr, i, document) {
        var removed = arr[i];
        arr[i] = this.value;
        return { newDocument: document, removed: removed };
    },
    move: objOps.move,
    copy: objOps.copy,
    test: objOps.test,
    _get: objOps._get
};
/**
 * Retrieves a value from a JSON document by a JSON pointer.
 * Returns the value.
 *
 * @param document The document to get the value from
 * @param pointer an escaped JSON pointer
 * @return The retrieved value
 */
function getValueByPointer(document, pointer) {
    if (pointer == '') {
        return document;
    }
    var getOriginalDestination = { op: "_get", path: pointer };
    applyOperation(document, getOriginalDestination);
    return getOriginalDestination.value;
}
exports.getValueByPointer = getValueByPointer;
/**
 * Apply a single JSON Patch Operation on a JSON document.
 * Returns the {newDocument, result} of the operation.
 * It modifies the `document` and `operation` objects - it gets the values by reference.
 * If you would like to avoid touching your values, clone them:
 * `jsonpatch.applyOperation(document, jsonpatch._deepClone(operation))`.
 *
 * @param document The document to patch
 * @param operation The operation to apply
 * @param validateOperation `false` is without validation, `true` to use default jsonpatch's validation, or you can pass a `validateOperation` callback to be used for validation.
 * @param mutateDocument Whether to mutate the original document or clone it before applying
 * @return `{newDocument, result}` after the operation
 */
function applyOperation(document, operation, validateOperation, mutateDocument) {
    if (validateOperation === void 0) { validateOperation = false; }
    if (mutateDocument === void 0) { mutateDocument = true; }
    if (validateOperation) {
        if (typeof validateOperation == 'function') {
            validateOperation(operation, 0, document, operation.path);
        }
        else {
            validator(operation, 0);
        }
    }
    /* ROOT OPERATIONS */
    if (operation.path === "") {
        var returnValue = { newDocument: document };
        if (operation.op === 'add') {
            returnValue.newDocument = operation.value;
            return returnValue;
        }
        else if (operation.op === 'replace') {
            returnValue.newDocument = operation.value;
            returnValue.removed = document; //document we removed
            return returnValue;
        }
        else if (operation.op === 'move' || operation.op === 'copy') {
            returnValue.newDocument = getValueByPointer(document, operation.from); // get the value by json-pointer in `from` field
            if (operation.op === 'move') {
                returnValue.removed = document;
            }
            return returnValue;
        }
        else if (operation.op === 'test') {
            returnValue.test = areEquals(document, operation.value);
            if (returnValue.test === false) {
                throw new exports.JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', 0, operation, document);
            }
            returnValue.newDocument = document;
            return returnValue;
        }
        else if (operation.op === 'remove') {
            returnValue.removed = document;
            returnValue.newDocument = null;
            return returnValue;
        }
        else if (operation.op === '_get') {
            operation.value = document;
            return returnValue;
        }
        else {
            if (validateOperation) {
                throw new exports.JsonPatchError('Operation `op` property is not one of operations defined in RFC-6902', 'OPERATION_OP_INVALID', 0, operation, document);
            }
            else {
                return returnValue;
            }
        }
    } /* END ROOT OPERATIONS */
    else {
        if (!mutateDocument) {
            document = helpers_1._deepClone(document);
        }
        var path = operation.path || "";
        var keys = path.split('/');
        var obj = document;
        var t = 1; //skip empty element - http://jsperf.com/to-shift-or-not-to-shift
        var len = keys.length;
        var existingPathFragment = undefined;
        var key = void 0;
        var validateFunction = void 0;
        if (typeof validateOperation == 'function') {
            validateFunction = validateOperation;
        }
        else {
            validateFunction = validator;
        }
        while (true) {
            key = keys[t];
            if (validateOperation) {
                if (existingPathFragment === undefined) {
                    if (obj[key] === undefined) {
                        existingPathFragment = keys.slice(0, t).join('/');
                    }
                    else if (t == len - 1) {
                        existingPathFragment = operation.path;
                    }
                    if (existingPathFragment !== undefined) {
                        validateFunction(operation, 0, document, existingPathFragment);
                    }
                }
            }
            t++;
            if (Array.isArray(obj)) {
                if (key === '-') {
                    key = obj.length;
                }
                else {
                    if (validateOperation && !helpers_1.isInteger(key)) {
                        throw new exports.JsonPatchError("Expected an unsigned base-10 integer value, making the new referenced value the array element with the zero-based index", "OPERATION_PATH_ILLEGAL_ARRAY_INDEX", 0, operation.path, operation);
                    } // only parse key when it's an integer for `arr.prop` to work
                    else if (helpers_1.isInteger(key)) {
                        key = ~~key;
                    }
                }
                if (t >= len) {
                    if (validateOperation && operation.op === "add" && key > obj.length) {
                        throw new exports.JsonPatchError("The specified index MUST NOT be greater than the number of elements in the array", "OPERATION_VALUE_OUT_OF_BOUNDS", 0, operation.path, operation);
                    }
                    var returnValue = arrOps[operation.op].call(operation, obj, key, document); // Apply patch
                    if (returnValue.test === false) {
                        throw new exports.JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', 0, operation, document);
                    }
                    return returnValue;
                }
            }
            else {
                if (key && key.indexOf('~') != -1) {
                    key = helpers_1.unescapePathComponent(key);
                }
                if (t >= len) {
                    var returnValue = objOps[operation.op].call(operation, obj, key, document); // Apply patch
                    if (returnValue.test === false) {
                        throw new exports.JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', 0, operation, document);
                    }
                    return returnValue;
                }
            }
            obj = obj[key];
        }
    }
}
exports.applyOperation = applyOperation;
/**
 * Apply a full JSON Patch array on a JSON document.
 * Returns the {newDocument, result} of the patch.
 * It modifies the `document` object and `patch` - it gets the values by reference.
 * If you would like to avoid touching your values, clone them:
 * `jsonpatch.applyPatch(document, jsonpatch._deepClone(patch))`.
 *
 * @param document The document to patch
 * @param patch The patch to apply
 * @param validateOperation `false` is without validation, `true` to use default jsonpatch's validation, or you can pass a `validateOperation` callback to be used for validation.
 * @param mutateDocument Whether to mutate the original document or clone it before applying
 * @return An array of `{newDocument, result}` after the patch
 */
function applyPatch(document, patch, validateOperation, mutateDocument) {
    if (mutateDocument === void 0) { mutateDocument = true; }
    if (validateOperation) {
        if (!Array.isArray(patch)) {
            throw new exports.JsonPatchError('Patch sequence must be an array', 'SEQUENCE_NOT_AN_ARRAY');
        }
    }
    if (!mutateDocument) {
        document = helpers_1._deepClone(document);
    }
    var results = new Array(patch.length);
    for (var i = 0, length_1 = patch.length; i < length_1; i++) {
        results[i] = applyOperation(document, patch[i], validateOperation);
        document = results[i].newDocument; // in case root was replaced
    }
    results.newDocument = document;
    return results;
}
exports.applyPatch = applyPatch;
/**
 * Apply a single JSON Patch Operation on a JSON document.
 * Returns the updated document.
 * Suitable as a reducer.
 *
 * @param document The document to patch
 * @param operation The operation to apply
 * @return The updated document
 */
function applyReducer(document, operation) {
    var operationResult = applyOperation(document, operation);
    if (operationResult.test === false) {
        throw new exports.JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', 0, operation, document);
    }
    return operationResult.newDocument;
}
exports.applyReducer = applyReducer;
/**
 * Validates a single operation. Called from `jsonpatch.validate`. Throws `JsonPatchError` in case of an error.
 * @param {object} operation - operation object (patch)
 * @param {number} index - index of operation in the sequence
 * @param {object} [document] - object where the operation is supposed to be applied
 * @param {string} [existingPathFragment] - comes along with `document`
 */
function validator(operation, index, document, existingPathFragment) {
    if (typeof operation !== 'object' || operation === null || Array.isArray(operation)) {
        throw new exports.JsonPatchError('Operation is not an object', 'OPERATION_NOT_AN_OBJECT', index, operation, document);
    }
    else if (!objOps[operation.op]) {
        throw new exports.JsonPatchError('Operation `op` property is not one of operations defined in RFC-6902', 'OPERATION_OP_INVALID', index, operation, document);
    }
    else if (typeof operation.path !== 'string') {
        throw new exports.JsonPatchError('Operation `path` property is not a string', 'OPERATION_PATH_INVALID', index, operation, document);
    }
    else if (operation.path.indexOf('/') !== 0 && operation.path.length > 0) {
        // paths that aren't empty string should start with "/"
        throw new exports.JsonPatchError('Operation `path` property must start with "/"', 'OPERATION_PATH_INVALID', index, operation, document);
    }
    else if ((operation.op === 'move' || operation.op === 'copy') && typeof operation.from !== 'string') {
        throw new exports.JsonPatchError('Operation `from` property is not present (applicable in `move` and `copy` operations)', 'OPERATION_FROM_REQUIRED', index, operation, document);
    }
    else if ((operation.op === 'add' || operation.op === 'replace' || operation.op === 'test') && operation.value === undefined) {
        throw new exports.JsonPatchError('Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)', 'OPERATION_VALUE_REQUIRED', index, operation, document);
    }
    else if ((operation.op === 'add' || operation.op === 'replace' || operation.op === 'test') && helpers_1.hasUndefined(operation.value)) {
        throw new exports.JsonPatchError('Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)', 'OPERATION_VALUE_CANNOT_CONTAIN_UNDEFINED', index, operation, document);
    }
    else if (document) {
        if (operation.op == "add") {
            var pathLen = operation.path.split("/").length;
            var existingPathLen = existingPathFragment.split("/").length;
            if (pathLen !== existingPathLen + 1 && pathLen !== existingPathLen) {
                throw new exports.JsonPatchError('Cannot perform an `add` operation at the desired path', 'OPERATION_PATH_CANNOT_ADD', index, operation, document);
            }
        }
        else if (operation.op === 'replace' || operation.op === 'remove' || operation.op === '_get') {
            if (operation.path !== existingPathFragment) {
                throw new exports.JsonPatchError('Cannot perform the operation at a path that does not exist', 'OPERATION_PATH_UNRESOLVABLE', index, operation, document);
            }
        }
        else if (operation.op === 'move' || operation.op === 'copy') {
            var existingValue = { op: "_get", path: operation.from, value: undefined };
            var error = validate([existingValue], document);
            if (error && error.name === 'OPERATION_PATH_UNRESOLVABLE') {
                throw new exports.JsonPatchError('Cannot perform the operation from a path that does not exist', 'OPERATION_FROM_UNRESOLVABLE', index, operation, document);
            }
        }
    }
}
exports.validator = validator;
/**
 * Validates a sequence of operations. If `document` parameter is provided, the sequence is additionally validated against the object document.
 * If error is encountered, returns a JsonPatchError object
 * @param sequence
 * @param document
 * @returns {JsonPatchError|undefined}
 */
function validate(sequence, document, externalValidator) {
    try {
        if (!Array.isArray(sequence)) {
            throw new exports.JsonPatchError('Patch sequence must be an array', 'SEQUENCE_NOT_AN_ARRAY');
        }
        if (document) {
            //clone document and sequence so that we can safely try applying operations
            applyPatch(helpers_1._deepClone(document), helpers_1._deepClone(sequence), externalValidator || true);
        }
        else {
            externalValidator = externalValidator || validator;
            for (var i = 0; i < sequence.length; i++) {
                externalValidator(sequence[i], i, document, undefined);
            }
        }
    }
    catch (e) {
        if (e instanceof exports.JsonPatchError) {
            return e;
        }
        else {
            throw e;
        }
    }
}
exports.validate = validate;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var pSlice = Array.prototype.slice;
var objectKeys = __webpack_require__(6);
var isArguments = __webpack_require__(5);

var deepEqual = module.exports = function (actual, expected, opts) {
  if (!opts) opts = {};
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!actual || !expected || typeof actual != 'object' && typeof expected != 'object') {
    return opts.strict ? actual === expected : actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected, opts);
  }
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isBuffer (x) {
  if (!x || typeof x !== 'object' || typeof x.length !== 'number') return false;
  if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
    return false;
  }
  if (x.length > 0 && typeof x[0] !== 'number') return false;
  return true;
}

function objEquiv(a, b, opts) {
  var i, key;
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return deepEqual(a, b, opts);
  }
  if (isBuffer(a)) {
    if (!isBuffer(b)) {
      return false;
    }
    if (a.length !== b.length) return false;
    for (i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b);
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], opts)) return false;
  }
  return typeof a === typeof b;
}


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

Object.defineProperty(exports, "__esModule", { value: true });
var equalsOptions = { strict: true };
var _equals = __webpack_require__(2);
var areEquals = function (a, b) {
    return _equals(a, b, equalsOptions);
};
var helpers_1 = __webpack_require__(0);
var core_1 = __webpack_require__(1);
/* export all core functions */
var core_2 = __webpack_require__(1);
exports.applyOperation = core_2.applyOperation;
exports.applyPatch = core_2.applyPatch;
exports.applyReducer = core_2.applyReducer;
exports.getValueByPointer = core_2.getValueByPointer;
exports.validate = core_2.validate;
exports.validator = core_2.validator;
/* export some helpers */
var helpers_2 = __webpack_require__(0);
exports.JsonPatchError = helpers_2.PatchError;
exports.deepClone = helpers_2._deepClone;
exports.escapePathComponent = helpers_2.escapePathComponent;
exports.unescapePathComponent = helpers_2.unescapePathComponent;
var beforeDict = [];
var Mirror = /** @class */ (function () {
    function Mirror(obj) {
        this.observers = [];
        this.obj = obj;
    }
    return Mirror;
}());
var ObserverInfo = /** @class */ (function () {
    function ObserverInfo(callback, observer) {
        this.callback = callback;
        this.observer = observer;
    }
    return ObserverInfo;
}());
function getMirror(obj) {
    for (var i = 0, length = beforeDict.length; i < length; i++) {
        if (beforeDict[i].obj === obj) {
            return beforeDict[i];
        }
    }
}
function getObserverFromMirror(mirror, callback) {
    for (var j = 0, length = mirror.observers.length; j < length; j++) {
        if (mirror.observers[j].callback === callback) {
            return mirror.observers[j].observer;
        }
    }
}
function removeObserverFromMirror(mirror, observer) {
    for (var j = 0, length = mirror.observers.length; j < length; j++) {
        if (mirror.observers[j].observer === observer) {
            mirror.observers.splice(j, 1);
            return;
        }
    }
}
/**
 * Detach an observer from an object
 */
function unobserve(root, observer) {
    observer.unobserve();
}
exports.unobserve = unobserve;
/**
 * Observes changes made to an object, which can then be retrieved using generate
 */
function observe(obj, callback) {
    var patches = [];
    var root = obj;
    var observer;
    var mirror = getMirror(obj);
    if (!mirror) {
        mirror = new Mirror(obj);
        beforeDict.push(mirror);
    }
    else {
        observer = getObserverFromMirror(mirror, callback);
    }
    if (observer) {
        return observer;
    }
    observer = {};
    mirror.value = helpers_1._deepClone(obj);
    if (callback) {
        observer.callback = callback;
        observer.next = null;
        var dirtyCheck = function () {
            generate(observer);
        };
        var fastCheck = function () {
            clearTimeout(observer.next);
            observer.next = setTimeout(dirtyCheck);
        };
        if (typeof window !== 'undefined') {
            if (window.addEventListener) {
                window.addEventListener('mouseup', fastCheck);
                window.addEventListener('keyup', fastCheck);
                window.addEventListener('mousedown', fastCheck);
                window.addEventListener('keydown', fastCheck);
                window.addEventListener('change', fastCheck);
            }
            else {
                document.documentElement.attachEvent('onmouseup', fastCheck);
                document.documentElement.attachEvent('onkeyup', fastCheck);
                document.documentElement.attachEvent('onmousedown', fastCheck);
                document.documentElement.attachEvent('onkeydown', fastCheck);
                document.documentElement.attachEvent('onchange', fastCheck);
            }
        }
    }
    observer.patches = patches;
    observer.object = obj;
    observer.unobserve = function () {
        generate(observer);
        clearTimeout(observer.next);
        removeObserverFromMirror(mirror, observer);
        if (typeof window !== 'undefined') {
            if (window.removeEventListener) {
                window.removeEventListener('mouseup', fastCheck);
                window.removeEventListener('keyup', fastCheck);
                window.removeEventListener('mousedown', fastCheck);
                window.removeEventListener('keydown', fastCheck);
            }
            else {
                document.documentElement.detachEvent('onmouseup', fastCheck);
                document.documentElement.detachEvent('onkeyup', fastCheck);
                document.documentElement.detachEvent('onmousedown', fastCheck);
                document.documentElement.detachEvent('onkeydown', fastCheck);
            }
        }
    };
    mirror.observers.push(new ObserverInfo(callback, observer));
    return observer;
}
exports.observe = observe;
/**
 * Generate an array of patches from an observer
 */
function generate(observer) {
    var mirror;
    for (var i = 0, length = beforeDict.length; i < length; i++) {
        if (beforeDict[i].obj === observer.object) {
            mirror = beforeDict[i];
            break;
        }
    }
    _generate(mirror.value, observer.object, observer.patches, "");
    if (observer.patches.length) {
        core_1.applyPatch(mirror.value, observer.patches);
    }
    var temp = observer.patches;
    if (temp.length > 0) {
        observer.patches = [];
        if (observer.callback) {
            observer.callback(temp);
        }
    }
    return temp;
}
exports.generate = generate;
// Dirty check if obj is different from mirror, generate patches and update mirror
function _generate(mirror, obj, patches, path) {
    if (obj === mirror) {
        return;
    }
    if (typeof obj.toJSON === "function") {
        obj = obj.toJSON();
    }
    var newKeys = helpers_1._objectKeys(obj);
    var oldKeys = helpers_1._objectKeys(mirror);
    var changed = false;
    var deleted = false;
    //if ever "move" operation is implemented here, make sure this test runs OK: "should not generate the same patch twice (move)"
    for (var t = oldKeys.length - 1; t >= 0; t--) {
        var key = oldKeys[t];
        var oldVal = mirror[key];
        if (helpers_1.hasOwnProperty(obj, key) && !(obj[key] === undefined && oldVal !== undefined && Array.isArray(obj) === false)) {
            var newVal = obj[key];
            if (typeof oldVal == "object" && oldVal != null && typeof newVal == "object" && newVal != null) {
                _generate(oldVal, newVal, patches, path + "/" + helpers_1.escapePathComponent(key));
            }
            else {
                if (oldVal !== newVal) {
                    changed = true;
                    patches.push({ op: "replace", path: path + "/" + helpers_1.escapePathComponent(key), value: helpers_1._deepClone(newVal) });
                }
            }
        }
        else {
            patches.push({ op: "remove", path: path + "/" + helpers_1.escapePathComponent(key) });
            deleted = true; // property has been deleted
        }
    }
    if (!deleted && newKeys.length == oldKeys.length) {
        return;
    }
    for (var t = 0; t < newKeys.length; t++) {
        var key = newKeys[t];
        if (!helpers_1.hasOwnProperty(mirror, key) && obj[key] !== undefined) {
            patches.push({ op: "add", path: path + "/" + helpers_1.escapePathComponent(key), value: helpers_1._deepClone(obj[key]) });
        }
    }
}
/**
 * Create an array of patches from the differences in two objects
 */
function compare(tree1, tree2) {
    var patches = [];
    _generate(tree1, tree2, patches, '');
    return patches;
}
exports.compare = compare;


/***/ }),
/* 4 */
/***/ (function(module, exports) {

/*!
Copyright (C) 2013-2017 by Andrea Giammarchi - @WebReflection

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
var
  // should be a not so common char
  // possibly one JSON does not encode
  // possibly one encodeURIComponent does not encode
  // right now this char is '~' but this might change in the future
  specialChar = '~',
  safeSpecialChar = '\\x' + (
    '0' + specialChar.charCodeAt(0).toString(16)
  ).slice(-2),
  escapedSafeSpecialChar = '\\' + safeSpecialChar,
  specialCharRG = new RegExp(safeSpecialChar, 'g'),
  safeSpecialCharRG = new RegExp(escapedSafeSpecialChar, 'g'),

  safeStartWithSpecialCharRG = new RegExp('(?:^|([^\\\\]))' + escapedSafeSpecialChar),

  indexOf = [].indexOf || function(v){
    for(var i=this.length;i--&&this[i]!==v;);
    return i;
  },
  $String = String  // there's no way to drop warnings in JSHint
                    // about new String ... well, I need that here!
                    // faked, and happy linter!
;

function generateReplacer(value, replacer, resolve) {
  var
    inspect = !!replacer,
    path = [],
    all  = [value],
    seen = [value],
    mapp = [resolve ? specialChar : '[Circular]'],
    last = value,
    lvl  = 1,
    i, fn
  ;
  if (inspect) {
    fn = typeof replacer === 'object' ?
      function (key, value) {
        return key !== '' && replacer.indexOf(key) < 0 ? void 0 : value;
      } :
      replacer;
  }
  return function(key, value) {
    // the replacer has rights to decide
    // if a new object should be returned
    // or if there's some key to drop
    // let's call it here rather than "too late"
    if (inspect) value = fn.call(this, key, value);

    // did you know ? Safari passes keys as integers for arrays
    // which means if (key) when key === 0 won't pass the check
    if (key !== '') {
      if (last !== this) {
        i = lvl - indexOf.call(all, this) - 1;
        lvl -= i;
        all.splice(lvl, all.length);
        path.splice(lvl - 1, path.length);
        last = this;
      }
      // console.log(lvl, key, path);
      if (typeof value === 'object' && value) {
    	// if object isn't referring to parent object, add to the
        // object path stack. Otherwise it is already there.
        if (indexOf.call(all, value) < 0) {
          all.push(last = value);
        }
        lvl = all.length;
        i = indexOf.call(seen, value);
        if (i < 0) {
          i = seen.push(value) - 1;
          if (resolve) {
            // key cannot contain specialChar but could be not a string
            path.push(('' + key).replace(specialCharRG, safeSpecialChar));
            mapp[i] = specialChar + path.join(specialChar);
          } else {
            mapp[i] = mapp[0];
          }
        } else {
          value = mapp[i];
        }
      } else {
        if (typeof value === 'string' && resolve) {
          // ensure no special char involved on deserialization
          // in this case only first char is important
          // no need to replace all value (better performance)
          value = value .replace(safeSpecialChar, escapedSafeSpecialChar)
                        .replace(specialChar, safeSpecialChar);
        }
      }
    }
    return value;
  };
}

function retrieveFromPath(current, keys) {
  for(var i = 0, length = keys.length; i < length; current = current[
    // keys should be normalized back here
    keys[i++].replace(safeSpecialCharRG, specialChar)
  ]);
  return current;
}

function generateReviver(reviver) {
  return function(key, value) {
    var isString = typeof value === 'string';
    if (isString && value.charAt(0) === specialChar) {
      return new $String(value.slice(1));
    }
    if (key === '') value = regenerate(value, value, {});
    // again, only one needed, do not use the RegExp for this replacement
    // only keys need the RegExp
    if (isString) value = value .replace(safeStartWithSpecialCharRG, '$1' + specialChar)
                                .replace(escapedSafeSpecialChar, safeSpecialChar);
    return reviver ? reviver.call(this, key, value) : value;
  };
}

function regenerateArray(root, current, retrieve) {
  for (var i = 0, length = current.length; i < length; i++) {
    current[i] = regenerate(root, current[i], retrieve);
  }
  return current;
}

function regenerateObject(root, current, retrieve) {
  for (var key in current) {
    if (current.hasOwnProperty(key)) {
      current[key] = regenerate(root, current[key], retrieve);
    }
  }
  return current;
}

function regenerate(root, current, retrieve) {
  return current instanceof Array ?
    // fast Array reconstruction
    regenerateArray(root, current, retrieve) :
    (
      current instanceof $String ?
        (
          // root is an empty string
          current.length ?
            (
              retrieve.hasOwnProperty(current) ?
                retrieve[current] :
                retrieve[current] = retrieveFromPath(
                  root, current.split(specialChar)
                )
            ) :
            root
        ) :
        (
          current instanceof Object ?
            // dedicated Object parser
            regenerateObject(root, current, retrieve) :
            // value as it is
            current
        )
    )
  ;
}

var CircularJSON = {
  stringify: function stringify(value, replacer, space, doNotResolve) {
    return CircularJSON.parser.stringify(
      value,
      generateReplacer(value, replacer, !doNotResolve),
      space
    );
  },
  parse: function parse(text, reviver) {
    return CircularJSON.parser.parse(
      text,
      generateReviver(reviver)
    );
  },
  // A parser should be an API 1:1 compatible with JSON
  // it should expose stringify and parse methods.
  // The default parser is the native JSON.
  parser: JSON
};

module.exports = CircularJSON;


/***/ }),
/* 5 */
/***/ (function(module, exports) {

var supportsArgumentsClass = (function(){
  return Object.prototype.toString.call(arguments)
})() == '[object Arguments]';

exports = module.exports = supportsArgumentsClass ? supported : unsupported;

exports.supported = supported;
function supported(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
};

exports.unsupported = unsupported;
function unsupported(object){
  return object &&
    typeof object == 'object' &&
    typeof object.length == 'number' &&
    Object.prototype.hasOwnProperty.call(object, 'callee') &&
    !Object.prototype.propertyIsEnumerable.call(object, 'callee') ||
    false;
};


/***/ }),
/* 6 */
/***/ (function(module, exports) {

exports = module.exports = typeof Object.keys === 'function'
  ? Object.keys : shim;

exports.shim = shim;
function shim (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}


/***/ })
/******/ ]);;function dataKlaster($) {
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

                if (typeof data['field'][key] !== 'string' && typeof data['field'][key] !== 'number' && typeof data['field'][key] !== 'boolean') {
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
            data.state = JSON.parse(CircularJSON.stringify(data.field));
        }
          
        if (typeof data['state'][notation] === 'undefined' && notation.indexOf('[') !== -1) {
            var parent = data._getParentObject(notation).replace(/\.field\./g, '.state.');
            eval("if( (typeof " + parent + "!== 'undefined')) data.state." + notation + "=" + CircularJSON.stringify(value) + ";");
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
            if (typeof data['_modelprechangeReal'][notation] === 'undefined' && (notation.indexOf('[') !== -1 ||  notation.indexOf('.') !== -1)) {
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
            var parent = $.normalizeChangeResponse(data._getParentObject(notation));
            window.eval.call(window,"((value, data) =>  (typeof " + parent + "!== 'undefined')? data.field." + notation + "=value:null)")(value, data);
        } else {
            data['field'][notation] = value;
        } 
    };

    data._getParentObject = function (notation, ns) {
        if (typeof ns === 'undefined')
            ns = 'data.field.';
        var parent = "";
        if (!notation)
            return parent;

        let replaced = notation.replace(/'/g, ''), r = false;

        if(replaced.length < notation.length){
            notation = replaced;
            r = true;
        }

        let e = notation.match(/[\W]?(\w+)]?/gi); 
        e.pop(); 
        if(e.join("").trim() !=="")
            parent = ns + e.join("");
       
        if(r) {
            parent = parent.replace(/\[([a-z]\w+)\]/ig, "['$1']");
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

    data.jsonPatchToObjectAccess = function(diff){
        let path = "[" + diff.path.substr(1).split('/').join("][") + "]";
        let normal = $.normalizeChangeResponse(path);
        diff.op = diff.op == "replace"?"value":diff.op;
        return [path, diff.op, data.getOld(normal), diff.value];
    };

    data.compareJsonPatch = function(a, b){
        let diff = jsonpatch.compare(a ||{}, b||{});
        let final = [];

        for(let i in diff) {
            final.push(data.jsonPatchToObjectAccess(diff[i]));
        }
        return final;
    };

    /**
     *
     * @returns {Array}
     */
    data.getChangedModelFields = () => 
         data.compareJsonPatch(data._modelprechangeReal, data.field);
    
    return data;
};
_nsKlaster.k_data = dataKlaster(_nsKlaster.k_dom);;/**
 * @author Alexander Kindziora 2017
 *
 */

(function (structure, docapi) {
    //"use strict";

    var me = {};
    var api = docapi['dom-attributes'];
    kui = {};
    let uicnt = 0;
    if(typeof window ==="undefined")window = global;

    window.$k = function (selector) {
        let el = document.querySelector(selector);
        el.uselector = selector + (++uicnt);
        return klaster.bind(el);
    };

    function klaster(child) {
        
        var skeleton = {};
        if (structure.config.skeleton) {
            skeleton = JSON.parse(JSON.stringify(structure));
            skeleton.api = null;
        }

        let dom = new domKlaster(docapi);
        let model = new dataKlaster(dom);

        let cls = kui[this.uselector] = model.extend(JSON.parse(JSON.stringify(structure)), child);

        dom.child = cls;
        
        model.klaster = cls;

        var $globalScope = dom.$globalScope = this;

        cls.model = model = model.extend(model, child.model);

        cls.ObjIndex = 0;

        /**
         * log debug messages
         */
        cls.debug = function () {
            if (true) { //cls.config.debug
                if (typeof arguments !== 'undefined') {
                    for (var msg in arguments) {
                        console.log(arguments[msg]);
                    }
                }
            }
        };

        cls.diffNodeLists = function(original, updated) {

            // Create arrays from our two node lists.
            var originalList = [].slice.call(original, 0),
                updatedList = [].slice.call(updated, 0),
        
                // Collection for our updated nodes
                updatedNodes = [],
        
                // Count to keep track of where we are looking at in the original DOM Tree
                count = 0,
        
                // Loop Counter
                i;
        
            // Go through all the nodes in our updated DOM Tree
            for (i = 0; i < updatedList.length; i++) {
        
                // Check for a mismatch in values
                if (updatedList[i] !== originalList[count]) {
        
                    // Check if the value ever exists in our updated list
                    if (updatedList.indexOf(originalList[count]) !== -1) {
                        updatedNodes.push(updatedList[i]);
                    } else {
                        updatedNodes.push(originalList[count]);
                        count++;
                        i--;
                    }
        
                } else {
                    // The value was found! Time to check the next ones.
                    count++;           
                }
            }
        
            return updatedNodes;
        };

        cls._querySelectorAll = function($el, selectors) {
            let evadeString = [], allString = [];
            for(let i in selectors){
                evadeString.push( ':scope widget ' + selectors[i] + ', :scope [data-omit="true"] ' + selectors[i]);
                allString.push(':scope ' + selectors[i]);
            }

           let evade = $el.querySelectorAll(evadeString.join(',')); 
           let all =   $el.querySelectorAll(allString.join(',')); 
           return (evade.length === 0) ? all : cls.diffNodeLists(all, evade);
        };

        /**
         * restriction of content by filter criteria eg. data-filter="this.a !== 0"
         */
        cls.updateViewFilter = function () {
            Array.prototype.forEach.call(cls._querySelectorAll($globalScope, ['[data-filter]']), function (el, i) {
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

        cls.set = function (notation, value) {
            var $field = $globalScope.querySelector(dom.getSelector(notation));
            if($field){
                cls.pre_trigger.call($field, undefined);
                cls.post_trigger.call($field, undefined, value);
            }else{
                model.set(notation, value);
            }
        };
  
        /*
         * gets executed after an event is triggered
         * check if model has changed
         */
        cls.post_trigger = function (e, result) {
            var name = dom.getName(this);
            var modelState = model.get(name);

            if ((CircularJSON.stringify(result) != CircularJSON.stringify(modelState)) || model.changed(name)) {

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

            function validate(validateResult) {
                validateResult.value = value;
                model.setState(name, validateResult);

                if (typeof value.getName === "function")
                    cls.model2View.call(value);
                return validateResult.result ? value : undefined;
            }

            if (typeof child.validator !== "undefined" && typeof child.validator[type] === "function") {
                var validateResult = child.validator[type].call(model, value, name);
                return validate(validateResult);
            } else {

                if (typeof type.result !== 'undefined') {
                    return validate(type);
                } else {
                    throw {
                        message: "Validator of type " + type + "does not exist.",
                        name: "ValidationException"
                    };
                }

            }
        }

        /*
         * gets executed after a change on dom objects
         * "this" is the dom element responsible for the change
         */
        cls.changed = function () {
            if (typeof model.event !== "undefined" && typeof model.event.sync === "function") {
                model.event.sync.call(model, this, cls);
            }
            if (typeof child.sync !== "undefined" && typeof child.sync === "function") {
                child.sync.call(model, this, cls);
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
                        if($child)
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

                        if (!model.get(Elname) ||
                            typeof field[name] === 'undefined' ||
                            !cls.preRenderView($scope, field[name])) {

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

                if (change[1] === 'add' || change[1] === 'undefined') {
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

                if (change[1] === 'remove') {
                    killListElement();
                }

                if (change[1] === 'value') { // value of subelement has changed
                    var _notation = change[0],
                        scopedField = field,
                        myChangedField = model.get(_notation); //get field that has changed

                    var index = /\[(.*?)\]/gi.exec(_notation);
                    index = index !== null && typeof index.length !== 'undefined' ? index[1] : false;
                    
                    if (index && typeof field.indexOf !== 'undefined') { // array
                        scopedField = typeof field[index] !== 'undefined' ?
                            index :
                            field.indexOf(change[3]); //get index of item that has chnaged
                    } else { //object

                    }

                    $child = $scope.querySelector(dom.getSelector(_notation, true)); //find listItem that has changed

                    if (typeof myChangedField !== 'undefined' && cls.preRenderView($scope, scopedField)) {
                        $html = dom.parseHTML(cls.view.views[viewName].call(cls.view, scopedField, index, $scope)); // render subitem

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
            Array.prototype.forEach.call(cls.filter.events, function (el, i) {
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
                    var $scope = el,
                        fieldN = dom.getName(el);
                    var v = $scope.getAttribute(api.view.attr);
                    var scopeModelField = model.get(fieldN);
                    var decoratedFieldValue;



                    if (v === '__static') {
                        dom.setPrimitiveValue($scope, scopeModelField);
                        return;
                    }

                    if ($triggerSrc === $scope && dom.isPrimitiveValue($scope)) {
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

                    let parentName = model._getParentObject(fieldN);
                    let norm = dom.normalizeChangeResponse(parentName);

                    if(norm) {
                        norm = norm.replace('data.field.', '');
                        let parentVariable = model.get(norm);

                        if(change[1] === "remove" && Array.isArray( parentVariable )){

                            if(el.parentNode && el.parentNode.getAttribute('data-name') === norm){
                                $scope = el.parentNode;
                                scopeModelField = parentVariable;
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

                          /*  if (dom.getName($scope).indexOf('[') === -1) { // address no array element
                                change[1] = 'view-filter'; // why view filter?
                                change[2] = 2;
                                change[3] = 1;
                            }*/
                            cls.updateHtmlList($scope, scopeModelField, change); // why trigger update list?

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
            dom.findUntilParentExists = function (notation, matches) {
                if (notation === '')
                    return matches;

                if (!matches)
                    matches = [];

                var fieldNotation = dom.normalizeChangeResponse(notation);

                var fieldNotationBrackets = dom.normalizeChangeResponseBrackets(notation);

                var selector = dom.getSelector(fieldNotation, true);
                var brSelector = dom.getSelector(fieldNotationBrackets, true); 

                var match = []
                .concat
                .apply(matches, cls._querySelectorAll($globalScope, [selector, brSelector]) );

                var cnt = match.length;
                if (cnt === 0) {
                    if (model._getParentObject(notation, '') === "")
                        return match;

                    return dom.findUntilParentExists(model._getParentObject(notation, ''));
                } else {
                    return dom.findUntilParentExists(model._getParentObject(notation, ''), match);
                }
            };

            /**
             * render all view areas that need to be rendered
             * @param changes
             */
            dom.updateAllViews = function (changes) {

                var addrN;

                Array.prototype.forEach.call(cls._querySelectorAll($globalScope, ['[data-filter]']), function (el) {
                    if (cls.viewFilter[dom.getXPath(el)] !== el.getAttribute('data-filter')) { // filter for this view has changed
                        changes.push([dom.getName(el), 'view-filter', cls.viewFilter[dom.getXPath(el)], el.getAttribute('data-filter')]);
                    }
                });

                var cacheEls = {};
                var name = undefined;

                for (addrN = 0; addrN < changes.length; addrN++) { //only this fields need to be refreshed
                    var $els = (() => {
                        let domAppearance = dom.findUntilParentExists(changes[addrN][0]);
                        let filtered = [];
                        for(let i in domAppearance){
                            let kick = false;
                            for(let e = 0; e < i; e++){
                                if(domAppearance[i].contains(domAppearance[e]) ){ 
                                    kick = true;
                                    break;
                                }
                            }
                            if(!kick){ 
                                filtered.push(domAppearance[i]);
                            }
                        }
                       
                       return filtered;
                    })();

                    if (!$els || $els.length === 0){

                        if(Object.prototype.toString.call(changes[addrN][3]) === '[object Object]'){
                            let deep = model.compareJsonPatch({}, changes[addrN][3]);

                            for (let ee in deep) {
                                deep[ee][0] = changes[addrN][0] + deep[ee][0];
                            }
                            changes.push.apply(changes, deep);
                        }
                        continue;
                    }


                    name = dom.getName($els[0]);
                    changes[addrN][0] = name;

                    cacheEls[name] = [$els, changes[addrN]];
                }

                for (var el in cacheEls) {
                    var $els = cacheEls[el][0],
                        changes = cacheEls[el][1];

                    var cnt = $els.length;

                    Array.prototype.forEach.call($els, local.eachViewRepresentation(cnt, changes, true, function ($els) {
                        var name = dom.getName($els[0]);
                        return function (el) {
                            if (typeof model.event !== "undefined" && typeof model.event.postChange !== 'undefined' && typeof model.event.postChange[name] === 'function') {
                                var changeCb = model.event.postChange[name];
                                changeCb.call(model, model.get(name), changes, 'controller');
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
                }, mes.getAttribute(api.delay.attr) || cls.delay);
            };
            return mio;
        }();

        /**
         *dispatch events for dom element
         */
        cls.dispatchEvents = function () {
            var FinalEvents = [];
            if (this.getAttribute(api.on.attr)) {
                var events = (this.getAttribute(api.on.attr) || '').split(','),
                    i = 0,
                    event = "",
                    FinalEvents = {},
                    parts = "";
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
                'object': cls,
                '$el': byElement
            };
        };
        cls._cached_methods = {};
        /**
         * @todo rethink is this the best way to bind the methods?
         * bind dom to matching methods
         */
        cls.bind = function (element) {

            let events = {},
                event = {},
                name = "",
                method = "";
            let filter, $el;
            filter = cls.dispatchFilter(element);
            $el = element;

            /* variable injection via lambda function factory used in iteration */
            let factory = function (me, event, cls) {
                name = dom.getName(me);
                method = events[name][event];
                let key = name + "_" + method + "_" + me.getAttribute("data-id");
                if(typeof cls._cached_methods[key] !== 'undefined') 
                    return cls._cached_methods[key];

                cls._cached_methods[key] = function (e, args) {
                    let me = this;
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
                        } else if(typeof cls.interactions[method] !== 'undefined' && typeof cls.interactions[method][event] !== 'undefined') {
                            result = cls.interactions[method][event].call(me, e, cls, args);
                            
                            if (me.getAttribute(api.omit.attr) === "true") {
                                result = dom.value.call(me);
                            }
                        } else {
                            result = me.getValue();
                        }
                        cls.post_trigger.call(me, e, result);
                    }

                };

                return cls._cached_methods[key];
            };
            //filter.fields = filter.$el.find('[name],[data-name]'),
            filter.events = cls._querySelectorAll(filter.$el, ['[' + api.on.attr + ']']);
            
            function bindevents(el) {
                name = dom.getName(el) || dom.getXPath(el);

                el = cls.applyMethods(el);

                if(el.getAttribute("data-id") === "")
                    el.setAttribute("data-id", name + "_" + (++cls.ObjIndex));

                events[name] = cls.dispatchEvents.call(el);
                for (event in events[name]) {
                    cls.debug('name:' + name + ', event:' + event);

                    if (cls.config.skeleton) {
                        if (typeof skeleton['interactions'][name] === 'undefined')
                            skeleton['interactions'][name] = {};

                        skeleton['interactions'][name][event] = "function(e, self){}";
                    }

                    let fc = factory(el, event, cls);
                    el.removeEventListener(event, fc);
                    el.addEventListener(event, fc);
                 //  console.log(fc, el, event, cls);
                    let modelValue = model.get(el.getName());
                    if ($el.getAttribute('data-defaultvalues') === 'form' || (!modelValue && dom.isPrimitiveValue(el))){
                        let InitValue = dom.value.call(el);
                        model.updateValue.call(el, InitValue);
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
            cls.recognizeChange.setup.call(cls.filter.$el);
            if (typeof child.init !== "undefined") {
                if (child.init(cls)) {
                    console.log("init success");
                }
            } else {
                window.setTimeout(function() {
                    if (typeof cls.mounted !== "undefined") 
                        cls.mounted();
                },100);
              
                console.log("no init method found");
            }
        }.bind(this);

        cls.ajax = function (method, url) {
            var _xhr = new XMLHttpRequest();
            _xhr.open(method, url);
            _xhr.setup = function (cb) { // hacky? maybe
                cb(_xhr);
                return _xhr;
            };
            _xhr.done = function (cb) { // hacky? maybe
                _xhr.onreadystatechange = function () {
                    if (_xhr.readyState === 4) {
                        cb(_xhr.responseText);
                    }
                };
                return _xhr;
            };
            return _xhr;
        };

        //INITIALIZATION/////IF WE ARE INSIDE A DEV ENV LOAD TEMPLATES BY AJAX/////////
        if (cls.view.viewpath && !cls.view.templates_) {
            // preloading alle templates, then init klaster interface
            var length = Object.keys(cls.view.views).length,
                cnt = 1;
            for (var v in cls.view.views) {
                cls.ajax("get", (cls.view.viewpath) + v + '.' + cls.view.fileextension + '?v=' + ((cls.config.debug) ? Math.random() : '1'))
                    .done(function (v) {
                        return function (content) {
                            cls.view.templates_[cls.view.views[v]] = content;
                            cls.view.templates_[v] = content;
                            if (length <= cnt) {
                                child.view.templates_ = cls.view.templates_;
                                cls.init();
                            }
                            cnt++;
                        };
                    }(v)).send();
            }
        } else {
            cls.init();
        }

        return cls;
    };
    if(typeof module !=="undefined")
        module.exports = {klaster: klaster, components : _nsKlaster};
})(_nsKlaster.k_structure, _nsKlaster.k_docapi);

