/**
 * klaster is a jquery filter plugin for extended filters by dom rules and javascript based on filter classes
 * @author Alexander Kindziora 2015
 * 
 */

(function ($) {
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

            },
    api = docapi['dom-attributes'];
    $.fn.getName = function () {
        return this.attr(this.nameAttr());
    };
    $.fn.nameAttr = function () {
        return this.attr(api.name.attr) ? api.name.attr : 'name';
    };
    $.fn.toggleOmit = function () {
        this.attr(api.omit.attr, !(this.attr(api.omit.attr) ? (this.attr(api.omit.attr).toLowerCase() === "true") : false));
        return this;
    };
    me.value = function () {
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
        "checked": function ($el, $elements) {

            if ($el.attr(api.multiple.attr) === 'false' || $('[' + $el.nameAttr() + '="' + $el.getName() + '"]').length === 1)
                return $el.is(':checked');
            var values = [],
                    value = undefined;
            $elements.each(function () {
                value = me.value.call($(this));
                if (typeof value !== 'undefined') {
                    values.push(value);
                }
            });
            return values;
        },
        "checkbox": function () {
            return me.multipleValues.checked(this, $('[' + this.nameAttr() + '="' + this.getName() + '"]:checked'));
        },
        "radio": function () {
            return me.multipleValues.checkbox;
        },
        "data-multiple": function () {
            return me.multipleValues.checked(this, $('[' + this.nameAttr() + '="' + this.getName() + '"][data-checked="true"]'));
        }
    };
    $.fn.getValues = function (type) {
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
    $.fn.getValue = function (multiple) {
        /**
         * return undefined if this element will be omitted
         */
        if (this.parents('[' + api.omit.attr + '="true"]').get(0) || this.attr(api.omit.attr) === "true") {
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
    $.fn.setValue = function (value) {
        this.data('value', value);
    };
    $.fn.klaster_l = function (child) {

        var $globalScope = this;

        var cls = $.extend({
            'delay': 0,
            'api': docapi,
            'interactions': {
            },
            'model': {
                field: {},
                event: {
                    'postChange': function () {
                    },
                    'sync': function () {
                    }
                }
            },
            'view': {
                'viewpath': 'view/',
                'fileextension': 'html.twig',
                'templates': false,
                templates_: {},
                render: function (tplVars, tplName) {
                },
                views: {
                }
            },
            'filter': {
            },
            'config': {
                debug: true
            }
        }, child);

        /**
         *get class property with default value
         */
        cls.get = function (name, value) {
            return ((typeof cls[name] !== 'undefined') ? cls[name] : value);
        };

        cls.addFilter = function ($el, filter) {
            $el.attr(api.filter, filter);

        };

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

        cls.viewFilter = {};

        cls.updateViewFilter = function () {
            $globalScope.find('[data-filter]').each(function () {
                cls.viewFilter[$(this).attr('id')] = $(this).attr('data-filter');
            });
        }

        /*
         * gets executed before an event is triggered
         */
        cls.pre_trigger = function (e) {
            cls._modelprechange = {};
            cls._modelprechangeReal = {};
            cls._modelpresize = 0;

            cls.updateViewFilter();

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

        cls.getView = function ($scope) {
            return $scope.attr(api.view.attr) || me.getFieldView($scope.getName(), true);
        };

        me.getFieldView = function (fieldN, getname) {
            
            if(typeof fieldN === 'undefined'){
                return false;
            }
            
            var viewMethod = false, name = false;
            if (typeof cls.view.views[fieldN] === 'undefined') {
                if (fieldN.indexOf('[') !== -1) {
                    var finestMatch = fieldN.match(/([a-z].*?\[\w.*\])/gi);
                    if (typeof finestMatch !== 'undefined' && finestMatch)
                        finestMatch = finestMatch.pop();
                    name = typeof cls.view.views[fieldN.split('[')[0] + '[*]'] !== 'undefined' ? finestMatch.split('[').pop() + '[*]' : fieldN;
                    viewMethod = typeof cls.view.views[fieldN.split('[')[0] + '[*]'] !== 'undefined' ? cls.view.views[finestMatch.split('[').pop() + '[*]'] : undefined;
                }
            } else {
                viewMethod = cls.view.views[fieldN];
                name = fieldN;
            }
            var result = (getname) ? name : viewMethod;

            return typeof cls.view.views[name] !== 'undefined' ? result : false;
        };

        me.preRenderView = function ($field, item) {
            if (typeof cls.model.get($field.getName()) === 'undefined')
                return false;
            if (!$field.attr('data-filter'))
                return true;

            return eval("(" + $field.attr('data-filter').replace(new RegExp("this", "gi"), 'child.filter') + ")");

        };

        /**
         * 
         * @param {type} change
         * @returns {undefined}
         */
        function normalizeChangeResponse(change) {

            if (change.substr(0, 1) !== '[')
                return change;

            if (!change)
                return;
            var match = (/\[(.*?)\]/).exec(change);
            var fieldnamei = change;
            if (match) {
                fieldnamei = change.replace(match[0], match[1]);
                while ((match = /\[([a-z].*?)\]/ig.exec(fieldnamei)) != null)
                {
                    fieldnamei = fieldnamei.replace(match[0], '.' + match[1]);
                }
            }

            return fieldnamei;//.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
        }

        me.model2view = function () {
            var local = {};
            var $this = this;

            /**
             * 
             * @param {type} $scope
             * @returns {unresolved}
             */
            local.isPrimitiveValue = function ($scope) {
                return $scope.is("input") || $scope.is("select") || $scope.is("textarea");
            };

            /**
             * 
             * @param {type} $scope
             * @param {type} decorated
             * @returns {undefined}
             */
            local.setPrimitiveValue = function ($scope, decorated) {
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
            local.setHtmlValue = function ($scope, decorated) {
                cls.set.call($scope, decorated);
            };

            local.hasView = function ($scope) {
                return $scope.attr(api.view.attr) || me.getFieldView($scope.getName(), true);
            };

            local.getDecoratedValuePrimitive = function ($scope, scopeModelField) {
                var fieldN = $scope.getName(),
                        viewRenderFuntionName = cls.getView($scope),
                        DecoratedValuePrimitive = scopeModelField;


                if (viewRenderFuntionName) {
                    DecoratedValuePrimitive = cls.view.views[viewRenderFuntionName].call(cls.view, scopeModelField, fieldN, $scope);
                }

                if (!me.preRenderView($scope, scopeModelField)) {
                    return undefined;
                }

                return DecoratedValuePrimitive;
            };


            local.getSelector = function (name, escapeit) {
                if (escapeit)
                    name = name.replace(/\[/g, '\[').replace(/\]/g, '\]')
                return '[data-name="' + name + '"],[name="' + name + '"]';
            };


            local.updateHtmlList = function ($scope, field, change) {
                var $child, index, $html;
                var viewRenderFuntionName = cls.getView($scope);

                function addE() {

                    var m_index = 0;
                    for (index in field) {

                        $child = $scope.find('[data-name="' + $scope.getName() + '\[' + index + '\]"]');

                        if (me.preRenderView($scope, field[index])) {
                            $html = $(cls.view.views[viewRenderFuntionName].call(cls.view, field[index], index, $scope));

                            var $close = $scope.find('[data-name="' + $scope.getName() + '\[' + m_index + '\]"]');

                            if ($child.get(0)) {
                                $child.replaceWith($html);
                            } else if ($close.get(0)) {
                                $html.insertAfter($close);
                            } else {
                                $scope.append($html);
                            }

                            $html.data('value', field[index]);
                            cls.bind($html);
                            cls.postRender($html);

                        } else {
                            $child.remove();
                        }


                        m_index = index;
                    }
                }

                function killE() {
                    $scope.children().each(function () {
                        var Elname = $(this).getName();
                        var name = /\[(.*?)\]/gi.exec(Elname)[1];

                        if (!cls.model.get($(this).getName())
                                || typeof field[name] === 'undefined'
                                || !me.preRenderView($scope, field[name])) {

                            $(this).remove();
                        }

                    });
                }

                if (change[1] === 'view-filter') {
                    killE();
                    addE();
                }

                if (change[1] === 'undefined') {
                    addE();
                }

                if (change[1] === 'length') {
                    if (change[2] < change[3]) { //increased
                        addE();
                    }

                    if (change[2] > change[3]) { //decreased
                        killE();
                    }
                }

                if (change[1] === 'value') { // value of subelement has changed
                    var _notation = change[0],
                            myChangedField = cls.model.get(_notation),
                            index = /\[(.*?)\]/gi.exec(_notation)[1];

                    $child = $scope.find(local.getSelector(_notation, true));

                    if (typeof myChangedField !== 'undefined' && me.preRenderView($scope, field[index])) {
                        $html = $(cls.view.views[viewRenderFuntionName].call(cls.view, field[index], index, $scope));

                        if ($child.get(0)) {
                            $child.replaceWith($html);
                        }

                        $html.data('value', field[index]);
                        cls.bind($html);
                        cls.postRender($html);

                        if (!$child.get(0)) {
                            $scope.append($html);
                        }
                    } else {
                        $child.remove();
                    }

                }

            };

            local.isHtmlList = function ($scope) {
                return $scope.attr(api.view.attr) && $scope.attr(api.view.attr).indexOf(api.view.value.definition.iterate) !== -1;
            };

            local.iteratedAllViewEl = function ($scope, change, ready) {
                // and no view to display the change so try to display change with parent node
                var field_notation = normalizeChangeResponse(change[0]);
                var match = field_notation;
                while (match !== '')
                {
                    match = cls.model._getParentObject(match, '');

                    var findNotation = local.getSelector(match, true);

                    var $myPEl = $globalScope.find(findNotation);
                    if (match !== "" && (me.getFieldView(match) || (typeof $myPEl !== 'undefined' && $myPEl.attr(api.view.attr)))) {
                        ready();
                        $myPEl.each(local.eachViewRepresentation($myPEl.length, change, true, ready));
                        break;
                    }
                }
            };


            //each element set value or render view
            local.eachViewRepresentation = function (cnt, change, foundRepresentation, ready) {

                return function () {
                    // check how to treat this field
                    var $scope = $(this), fieldN = $scope.getName();
                    var scopeModelField = cls.model.get(fieldN);
                    var decoratedFieldValue;

                    function iteration(decoratedFieldValue) {
                        $scope.data('value', decoratedFieldValue);
                        cnt--;
                        if (cnt <= 0) {
                            if (!foundRepresentation) {
                                local.iteratedAllViewEl($scope, change, ready);
                            } else {
                                ready();
                            }
                        }
                    }

                    if (!local.hasView($scope)) {
                        foundRepresentation = false;
                        iteration(scopeModelField);
                        return;
                    }

                    var cced = $scope.data('cvalue');

                    if (local.isPrimitiveValue($scope)) {
                        decoratedFieldValue = local.getDecoratedValuePrimitive($scope, scopeModelField);
                        local.setPrimitiveValue($scope, decoratedFieldValue);
                    } else {

                        if (local.isHtmlList($scope)) {
                            //render partial list of html elements

                            if ($scope.getName().indexOf('[') === -1) {
                                change[1] = 'view-filter';
                                change[2] = 2;
                                change[3] = 1;
                            }


                            local.updateHtmlList($scope, scopeModelField, change);
                        } else {

                            if (cced !== scopeModelField) {
                                decoratedFieldValue = local.getDecoratedValuePrimitive($scope, scopeModelField);
                                local.setHtmlValue($scope, decoratedFieldValue);
                                $scope.data('cvalue', scopeModelField);
                            }

                        }

                    }

                    iteration(decoratedFieldValue);

                }
            };

            /**
             * 
             * @param {type} notation
             * @returns {Boolean}
             */
            cls.findUntilParentExists = function (notation) {
                if (notation === '')
                    return false;
                var fieldNotation = normalizeChangeResponse(notation);
                var selector = local.getSelector(fieldNotation, true);
                var match = $globalScope.find(selector);
                var cnt = match.length;
                if (cnt === 0) {
                    if (cls.model._getParentObject(notation, '') === "")
                        return false;
                    return cls.findUntilParentExists(cls.model._getParentObject(notation, ''));
                } else {
                    return match;
                }
            };


            var addrN, changes;
            //get changed fields
            changes = cls.getChangedModelFields() || [];

            $globalScope.find('[data-filter]').each(function () {
                if (cls.viewFilter[$(this).attr('id')] !== $(this).attr('data-filter')) { // filter for this view has changed
                    changes.push([$(this).getName(), 'view-filter', cls.viewFilter[$(this).getName()], $(this).attr('data-filter')]);
                }
            });

            var cacheEls = {};

            for (addrN in changes) { //only this fields need to be refreshed

                var $els = cls.findUntilParentExists(changes[addrN][0]);
                if (!$els)
                    continue;
                changes[addrN][0] = $els.getName();

                cacheEls[$els.getName()] = [$els, changes[addrN]];
            }

            for (var el in cacheEls) {
                var $els = cacheEls[el][0], changes = cacheEls[el][1];

                var cnt = $els.length;
                $els.each(local.eachViewRepresentation(cnt, changes, true, function () {
                    if (typeof cls.model.event !== "undefined" && typeof cls.model.event.postChange !== 'undefined' && typeof cls.model.event.postChange[$els.getName()] === 'function') {
                        var changeCb = cls.model.event.postChange[$els.getName()];
                        changeCb.call(cls.model, cls.model.get($els.getName()), changes, 'controller');
                    }
                }));
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
        //from view to model
        cls.updateViewToModel = function ($where) {
            ($where.find(cls.filter.events) || $(cls.filter.events)).each(function () {
                cls.updateValue.call(this, $(this).getValue());
            });
        };

        cls.toggle = function ($scope) {
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
        cls.has = function (obj, key) {
            return hasOwnProperty.call(obj, key);
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

                    }
                    else {
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

        /*
         * gets executed after an event is triggered
         */
        cls.postProcess = function (e, result) {
            if ((result != cls.model.field[$(this).getName()]) || cls.modelchanged($(this).getName())) {
                cls.debug('changed', result, cls.model.field[$(this).getName()], $(this).getName());
                cls.recognizeChange.setup.call(this);
                cls.updateValue.call(this, result, cls.model.field[$(this).getName()]);
            }

            if (typeof child.postProcess !== "undefined")
                return child.postProcess.call(this, e, child);
            return true;
        };
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

        cls.postRender = function ($field) {
            var funcName = cls.getView($field);

            if (typeof cls.view.event !== "undefined" && typeof cls.view.event.postRender !== 'undefined' && typeof cls.view.event.postRender[funcName] === 'function') {
                cls.view.event.postRender[funcName].call(cls.model, $field, cls.model.get($field.getName()));
            }

        };

        /**
         * this updates a partial area
         * @param {type} $html
         */
        cls.set = function ($html) {
            if (typeof $html === 'undefined')
                $html = '';
            $(this).html($html);
            cls.bind($(this));
            cls.postRender($(this));
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
                        cls.postProcess.call(me, e, result);
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
                        cls.updateValue.call(this, InitValue);
                    }
                }
            });
            if ($el.attr('data-defaultvalues') === 'model') {
                me.model2view.call($el);
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
})(jQuery);