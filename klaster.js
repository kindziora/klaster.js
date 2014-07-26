/**
 * klaster is a jquery filter plugin for extended filters by dom rules and javascript based on filter classes
 * @author Alexander Kindziora 2014
 * 
 */

(function($) {
//"use strict";

    var me = {}, prefix = 'data',
            docapi = {
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
                        'value': 'String/that evaluates to boolean, whether this element is will apear inside a list of multiple elements with similar data-name, like checkbox',
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

    },
    api = docapi['dom-attributes'];
    $.fn.getName = function() {
        return this.attr(this.nameAttr());
    };
    $.fn.nameAttr = function() {
        return this.attr(api.name.attr) ? api.name.attr : 'name';
    };
    $.fn.toggleOmit = function() {
        this.attr(api.omit.attr, !(this.attr(api.omit.attr) ? (this.attr(api.omit.attr).toLowerCase() === "true") : false));
        return this;
    };
    me.value = function() {
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
    };
    me.multipleValues = {
        "checked": function($el, $elements) {

            if ($el.attr(api.multiple.attr) === 'false' || $('[' + $el.nameAttr() + '="' + $el.getName() + '"]').length === 1)
                return $el.is(':checked');
            var values = [],
                    value = undefined;
            $elements.each(function() {
                value = me.value.call($(this));
                if (typeof value !== 'undefined') {
                    values.push(value);
                }
            });
            return values;
        },
        "checkbox": function() {
            return me.multipleValues.checked(this, $('[' + this.nameAttr() + '="' + this.getName() + '"]:checked'));
        },
        "radio": function() {
            return me.multipleValues.checkbox;
        },
        "data-multiple": function() {
            return me.multipleValues.checked(this, $('[' + this.nameAttr() + '="' + this.getName() + '"][data-checked="true"]'));
        }
    };
    $.fn.getValues = function(type) {
        if (typeof me.multipleValues[type] === 'undefined'
                && this.attr(api.multiple.attr)) {
            type = api.multiple.attr;
        }
        return me.multipleValues[type].call(this);
    };
    /**
     * get value(s) from dom element
     * @param {type} multiple
     * @return {type} value
     */
    $.fn.getValue = function(multiple) {
        /**
         * return undefined if this element will be omitted
         */
        if (this.parents('[' + api.omit.attr + '="true"]').get(0)) {
            return undefined;
        }

        if (multiple === false || !multiple
                && typeof me.multipleValues[this.attr('type')] !== 'function'
                && !this.attr(api.multiple.attr)) {
            return me.value.call(this);
        } else {
            /* if multiple is active return values */
            return this.getValues(this.attr('type'));
        }

    };
    $.fn.setValue = function(value) {
        this.data('value', value);
    };
    $.fn.klaster_ = function(child) {
        var $globalScope = this;
        var cls = $.extend({
            'delay': 0,
            'api': docapi,
            'interactions': {
            },
            'model': {
                field: {},
                event: {
                    'onChange': {},
                    'sync': function() {
                    }
                }
            },
            'view': {
                field: {
                },
                list: {
                },
                template: {
                }
            }, 'config': {
                debug: 1
            }
        }, child);
        /**
         *get class property with default value
         */
        cls.get = function(name, value) {
            return ((typeof cls[name] !== 'undefined') ? cls[name] : value);
        };
        /**
         * log debug messages
         */
        cls.debug = function() {
            if (cls.config.debug === 1) {
                if (typeof arguments !== 'undefined') {
                    for (var msg in arguments) {
                        console.log(arguments[msg]);
                    }
                }
            }
        };
        /*
         * gets executed before an event is triggered
         */
        cls.pre_trigger = function(e) {
            cls._modelprechange = {};
            cls._modelprechangeReal = {};
            cls._modelpresize = 0;
            for (var key in cls.model.field) {
                if (cls.has(cls.model.field, key)) {
                    cls._modelprechange[key] = cls.model.field[key].toString();
                    var base = [];
                    if (Object.prototype.toString.call(cls.model.field[key]) === "[object Object]") {
                        base = {};
                    }

                    if (typeof cls.model.field[key] !== 'string') {
                        cls._modelprechangeReal[key] = $.extend(base, cls.model.field[key]);
                    } else {
                        cls._modelprechangeReal[key] = cls.model.field[key];
                    }


                    cls._modelpresize++;
                }
            }

            if (typeof child.pre_trigger !== "undefined")
                return child.pre_trigger.call(this, e);
            return true;
        };
        /**
         * eval is better for this, js supports no byref arguments
         * @param {type} variable
         * @param {type} level
         * @param {type} index
         * @returns {@exp;cls@pro;model@call;getValue}
         */
        cls.model.get = function(notation) {
            if (typeof cls.model.field[notation] === 'undefined' && notation.indexOf('[') !== -1) {
                return eval("(typeof cls.model.field." + notation + "!== 'undefined' ) ? cls.model.field." + notation + ": undefined;");
            } else {
                return cls.model.field[notation];
            }
        };
        cls.model.set = function(notation, value) {
            if (typeof cls.model.field[notation] === 'undefined' && notation.indexOf('[') !== -1) {
                var parent = cls.model._getParentObject(notation);
                
                eval("if( (typeof " + parent + "!== 'undefined') && typeof cls.model.field." + notation + "!== 'undefined' ) cls.model.field." + notation + "=" + JSON.stringify(value) + ";");
            } else {
                cls.model.field[notation] = value;
            }
        };
        cls.model._getParentObject = function(notation) {
            var parent;
            if (notation.indexOf(']') > notation.indexOf('.')) {
                parent = 'cls.model.field.' + notation.replace(notation.match(/\[(.*?)\]/gi).pop(), '');
            } else {
                var p = notation.split('.');
                p.pop();
                parent = 'cls.model.field.' + p.join('.');
            }
            return parent;
        };

        cls.model._delete = function(notation) {
            if (typeof cls.model.field[notation] === 'undefined' && notation.indexOf('[') !== -1) {

                var parent = cls.model._getParentObject(notation);

                eval("if(typeof cls.model.field." + notation + "!== 'undefined' ) delete cls.model.field." + notation + ";");
                //CLEANUP EMPTY ARRAY ELEMENTS//////////////////////////////////
                /*  
                 //shadow model
                 
                 cls.__shadowmodel = $.extend(true, {}, cls.model.field); //Function.apply(null, ['cls', 'return $.extend({}, ' + parent + ');'])(cls);
                 
                 var v1 = 'if (Object.prototype.toString.call(' + parent + ') === "[object Array]")'
                 + 'cls.__shadowmodel.' + parent.replace('cls.model.field.', '') + ' = ' + parent + ';';
                 eval(v1);
                 eval('if (Object.prototype.toString.call(' + parent + ') === "[object Array]")'
                 + parent + ' = ' + parent + '.filter(function() {return true;});');
                 ////////////////////////////////////////////////////////////////
                 */
            } else {
                delete cls.model.field[notation];
            }
        };
        me.getFieldView = function(fieldN) {

            var viewMethod;
            if (typeof cls.view.views[fieldN] === 'undefined') {
                if (fieldN.indexOf('[') !== -1) {
                    viewMethod = typeof cls.view.views[fieldN.split('[')[0] + '[*]'] !== 'undefined' ? cls.view.views[fieldN.split('[')[0] + '[*]'] : undefined;
                }
            } else {
                viewMethod = cls.view.views[fieldN];
            }
            return viewMethod;
        };
        me.preRenderView = function($field, item) {
            if (typeof cls.model.get($field.getName()) === 'undefined')
                return false;
            if (!$field.attr('data-filter'))
                return true;
            return eval("(" + $field.attr('data-filter').replace('this', 'cls') + ")");
        };
        /**
         * two way databinding
         * @returns {undefined}
         */
        me.model2view = function(refreshAll) {
            var fieldname, $this = this, decorated = '', calllist = {}, field, changeCb;
            var addrN, fieldname, fieldnameRaw, changes;
            this.parseDom = function(selector, changeIndex) {
                var fieldN = "", viewfield;
                $globalScope.find(selector).each(function() {
                    var $scope = $(this);
                    if ($scope.parents('[' + api.omit.attr + '="true"]').get(0)) {
                        return;
                    }

                    var UpdateAllHTML = true;
                    fieldN = $scope.attr('data-name') || $scope.attr('name');
                    field = cls.model.get(fieldN);
                    viewfield = me.getFieldView(fieldN);
                    changeCb = cls.model.event.onChange[$scope.getName()];
                    if (!refreshAll) {
                        if ($this[0] === $scope[0]
                                || (typeof cls._modelprechange !== 'undefined'
                                && typeof cls._modelprechange[fieldN] !== 'undefined'
                                && cls._modelprechange[fieldN] == field))
                            return;
                    }

                    if (typeof changeCb === 'function') {
                        if (typeof calllist[$scope.getName()] === 'undefined')
                            changeCb.call(cls.model, field, $scope.val() || $scope.html(), $scope, 'controller');
                        calllist[$scope.getName()] = true;
                    }

                    decorated = field;
                    if ($scope.is("input") || $scope.is("select")) {
                        $scope.val(decorated);
                    } else if ($scope.is("textarea")) {
                        $scope.text(decorated);
                    } else {
                        var viewCb = $scope.attr(api.view.attr);
                        if (viewCb) {

                            if (viewCb.indexOf(api.view.value.definition.iterate) !== -1) {

                                // iterate function for native partial lists
                                if (refreshAll) {
                                    changeIndex = 0;
                                    changes = [["[todos]", "length", 2, 3]];
                                }
                                UpdateAllHTML = false;
                                if (typeof cls.view.views[viewCb] === 'function') {
                                    var $child, index, $html, m_index = 0;
                                    if (changes[changeIndex][1] === "length" || typeof changes[changeIndex][3] === 'undefined') {

                                        if (typeof changes[changeIndex][3] !== 'undefined' && changes[changeIndex][2] < changes[changeIndex][3]) { // array increased
                                            for (index in field) {
                                                $child = $scope.find('[data-name="' + fieldN + '\[' + index + '\]"]');
                                                if (!$child.get(0)) {

                                                    if (me.preRenderView($scope, field[index])) {
                                                        $html = $(cls.view.views[viewCb].call(cls.view, field, index, $scope));
                                                        $html.data('value', field[index]);
                                                        cls.bind($html);
                                                        var $close = $scope.find('[data-name="' + fieldN + '\[' + m_index + '\]"]');
                                                        if ($close.get(0)) {
                                                            $html.insertAfter($close);
                                                        } else {
                                                            $scope.append($html);
                                                        }
                                                    }

                                                }
                                                m_index = index;
                                            }
                                        } else { // array decreased
                                            $scope.children().each(function() {
                                                var name = $(this).getName().split('[')[1].split(']')[0];
                                                if (Object.prototype.toString.call(field) === "[object Object]") {
                                                    if (typeof field[name] === 'undefined') {
                                                        $(this).remove();
                                                    }
                                                } else {
                                                    if (eval('(typeof cls.model.field.' + $(this).getName() + ' === "undefined")')) {
                                                        $(this).remove();
                                                    }
                                                }

                                            });
                                        }
                                    }

                                }


                            } else {
                                if (typeof cls.view.views[viewCb] === 'function') {
                                    if (me.preRenderView($scope, field)) {
                                        decorated = cls.view.views[viewCb].call(cls.view, field, $scope);
                                    }
                                }
                            }

                        } else if (typeof viewfield === 'function') {

                            if (typeof field === 'undefined') {
                                //stop here and kill field in view
                                $globalScope.find(selector).remove();
                            } else {
                                decorated = viewfield.call(cls.view, field, fieldN);
                            }
                        }

                        if (typeof decorated === 'function') {
                            var cb = function(data) {
                                cls.set.call(this, data);
                            };
                            cb.bind(this);
                            decorated.bind(undefined, cb);
                        } else {
                            if (UpdateAllHTML) {
                                cls.set.call(this, decorated);
                            }
                        }

                    }

                    $scope.data('value', field);
                });
            };
            if (!refreshAll) {
                changes = cls.getChangedModelFields();
                for (addrN in changes) {
                    fieldnameRaw = changes[addrN][0];
                    function findExistingElement(fieldnameRaw_) {
                        var fieldnamei = fieldnameRaw_.replace(fieldnameRaw_.split(']')[0] + ']', fieldnameRaw_.split(']')[0].split('[')[1]);
                        fieldnamei = fieldnamei.replace('[', '\\[').replace(']', '\\]');
                        if (fieldnamei !== '') {
                            var selector = '[data-name="' + fieldnamei + '"],[name="' + fieldnamei + '"]';
                            if ($globalScope.find(selector).get(0)) {
                                $this.parseDom(selector, addrN);
                            } else { // get parent

                                var parentMatch = fieldnameRaw_
                                        .match(/\[(.*?)\]/gi);
                                parentMatch.pop();
                                return findExistingElement(parentMatch.join(''));
                            }
                        }
                    }
                    ;
                    findExistingElement(fieldnameRaw);
                    /* if ($.type(cls.model.field[fieldname]) === 'object' || $.type(cls.model.field[fieldname]) === 'array') {
                     this.parseDom('[data-name^="' + fieldname + '\["],[name^="' + fieldname + '\["]');
                     }*/
                }
            } else {
                var selector = '[data-name],[name]';
                $this.parseDom($globalScope.find(selector), addrN);
            }

        };
        /*
         * gets executed after a change on dom objects
         * "this" is the dom element responsible for the change
         */
        cls.changed = function() {
            if (typeof cls.model.event.sync === "function") {
                cls.model.event.sync.call(cls.model, this);
            }

            if (typeof cls.sync === "function") {
                cls.sync.call(cls, this);
            }

            me.model2view.call($(this));
            return true;
        };
        cls.updateValue = function(value, old) {
            if (typeof value !== 'undefined') {
                //$(this).setValue(value);
                //cls.model.field[$(this).getName()] = value;
                cls.model.set($(this).getName(), value);
            } else {
                cls.model._delete($(this).getName());
                //delete cls.model.field[$(this).getName()];
            }
        };
        //from view to model
        cls.updateViewToModel = function($where) {
            ($where.find(cls.filter.events) || $(cls.filter.events)).each(function() {
                cls.updateValue.call(this, $(this).getValue());
            });
        };
        cls.toggle = function($scope) {
            if (typeof child.toggle === "function") {
                return child.toggle.call(this, $scope);
            } else {
                $scope.toggleOmit();
                cls.updateViewToModel($scope);
            }
            return $scope;
        }.bind(cls);
        /**
         *recognize if filter values have changed and call someone
         *@description one common callback for changed is an ajax call with all values to a REST backend to update data
         * 
         */
        cls.recognizeChange = function() {
            var mio = {};
            mio.changed = function(el) {
                cls.changed.call(el);
                delete cls.timeoutID;
            };
            mio.cancel = function() {
                if (typeof cls.timeoutID === "number") {
                    window.clearTimeout(cls.timeoutID);
                    delete cls.timeoutID;
                }
            };
            mio.setup = function() {
                var mes = this;
                mio.cancel();
                cls.timeoutID = window.setTimeout(function(msg) {
                    mio.changed(mes);
                }, $(mes).attr(api.delay.attr) || cls.delay);
            };
            return mio;
        }();
        cls.has = function(obj, key) {
            return hasOwnProperty.call(obj, key);
        };
        cls.modelchanged = function(field) {

            var compare = function(fieldName) {
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
        cls.diffObjects = function(o1, o2) {

            if ((o1 == null)) {
                o1 = [];
            }
            if ((o2 == null)) {
                o2 = [];
            }

            // choose a map() impl.
            // you may use $.map from jQuery if you wish
            var map = Array.prototype.map ?
                    function(a) {
                        return Array.prototype.map.apply(a, Array.prototype.slice.call(arguments, 1));
                    } :
                    function(a, f) {
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

            // compare types
            /* if ((o1.constructor != o2.constructor) ||
             (typeof o1 != typeof o2)) {
             return [["", "type", Object.prototype.toString.call(o1), Object.prototype.toString.call(o2)]]; // different type
             
             }*/

            // compare arrays
            if (Object.prototype.toString.call(o1) == "[object Array]") {
                if (o1.length != o2.length) {
                    return [["", "length", o1.length, o2.length]]; // different length
                }
                var diff = [];
                for (var i = 0; i < o1.length; i++) {
                    // per element nested diff
                    var innerDiff = cls.diffObjects(o1[i], o2[i]);
                    if (innerDiff) { // o1[i] != o2[i]
                        // merge diff array into parent's while including parent object name ([i])
                        push.apply(diff, map(innerDiff, function(o, j) {
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

                    }
                    else {
                        // per element nested diff
                        var innerDiff = cls.diffObjects(o1[prop], o2[prop]);
                        if (innerDiff) { // o1[prop] != o2[prop]
                            // merge diff array into parent's while including parent object name ([prop])
                            push.apply(diff, map(innerDiff, function(o, j) {
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
        cls.getChangedModelFields = function() {

            return cls.diffObjects(cls._modelprechangeReal, cls.model.field);
        };
        /*
         * gets executed after an event is triggered
         */
        cls.post_trigger = function(e, result) {
            if ((result != cls.model.field[$(this).getName()]) || cls.modelchanged($(this).getName())) {

                console.log('changed', result, cls.model.field[$(this).getName()], $(this).getName());
                cls.recognizeChange.setup.call(this);
                cls.updateValue.call(this, result, cls.model.field[$(this).getName()]);
            }

            // $(this).setValue(result);

            if (typeof child.post_trigger !== "undefined")
                return child.post_trigger.call(this, e);
            return true;
        };
        /**
         *dispatch events for dom element
         */
        cls.dispatchEvents = function() {
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
        cls.dispatchFilter = function(byElement) {
            return {
                'object': child,
                '$el': byElement
            };
        };
        /**
         * this updates a partial area
         * @param {type} $html
         */
        cls.set = function($html) {
            $(this).html($html);
            cls.bind($(this));
        };
        /**
         * @todo rethink is this the best way to bind the methods?
         * bind dom to matching methods
         */
        cls.bind = function(element) {
            var events = {}, event = {}, name = "", method = "";
            var filter, $el;
            filter = cls.dispatchFilter(element);
            $el = element;
            /* variable injection via lambda function factory used in iteration */
            var factory = function(me, event) {
                return function(e, args) {
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
            $(filter.events).each(function() {
                name = $(this).getName();
                events[name] = cls.dispatchEvents.call(this);
                for (event in events[name]) {
                    cls.debug('name:' + name + ', event:' + event);
                    $(this).off(event);
                    $(this).on(event, factory(this, event));
                    if ($el.attr('data-defaultvalues') !== 'model' && !$el.parents('[data-defaultvalues="model"]').get(0)) {
                        InitValue = $(this).getValue();
                        cls.updateValue.call(this, InitValue);
                    }
                }
            });

            if ($el.attr('data-defaultvalues') === 'model') {
                me.model2view.call($el, true);
            }


            return filter;
        };

        cls.filter = cls.bind(this);

        if (typeof child.init !== "undefined") {
            if (child.init(cls)) {
                cls.recognizeChange.setup();
            }
        }

    };
})(jQuery);
