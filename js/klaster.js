/**
 * klaster is a jquery filter plugin for extended filters by dom rules and javascript based on filter classes
 * @author Alexander Kindziora 2013
 * 
 */

(function($) {
    //"use strict";

    var me = {}, prefix = 'data',
            docapi = {
                'Controller': {
                    'this.actions': {
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
                        'value': 'String value:"client" or "server" that means our app uses the field.values from dom or model/javascript'
                    },
                    'name': {
                        'attr': prefix + '-name',
                        'value': 'String containing name of element, not unique'
                    },
                    'omit': {
                        'attr': prefix + '-omit',
                        'value': 'String/that evaluates to boolean, whether ignoring the area for model representation data or not'
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
                        'value': 'defines which view function callback is executed for rendering output'
                    }
                }

            }, api = docapi['dom-attributes'];


    $.fn.getName = function() {
        return this.attr(api.name.attr) ? this.attr(api.name.attr) : this.attr('name');
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
            var values = [],
                    value = undefined;
            $elements.each(function() {
                value = me.value.call($el);
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

        var cls = $.extend({
            'delay': 0,
            'api': docapi,
            'actions': {
            },
            'model': {
                'field': {},
                'change': {},
                'changed': {}
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
            cls._modelpresize = 0;

            for (var key in cls.model.field) {
                if (cls.has(cls.model.field, key)) {
                    cls._modelprechange[key] = cls.model.field[key].toString();
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
                eval("cls.model.field." + notation + "=" + value + ";");
            } else {
                cls.model.field[notation] = value;
            }
        };

        cls.model._delete = function(notation) {
            if (typeof cls.model.field[notation] === 'undefined' && notation.indexOf('[') !== -1) {
                eval("delete cls.model.field." + notation + ";");
            } else {
                delete cls.model.field[notation];
            }
        };

        me.getFieldView = function(fieldN) {
            var viewMethod;
            if (typeof cls.view.field[fieldN] === 'undefined') {
                if (fieldN.indexOf('[') !== -1) {
                    viewMethod = typeof cls.view.field[fieldN.split('[')[0] + '[*]'] !== 'undefined' ? cls.view.field[fieldN.split('[')[0] + '[*]'] : undefined;
                }
            } else {
                viewMethod = cls.view.field[fieldN];
            }
            return viewMethod;
        };

        /**
         * two way databinding
         * @returns {undefined}
         */
        me.model2view = function() {
            var fieldname, $this = this, decorated = '', calllist = {}, field, changeCb;

            this.parseDom = function(selector) {
                var fieldN = "", viewfield;
                $(selector).each(function() {
                    fieldN = $(this).attr('data-name') || $(this).attr('name');

                    field = cls.model.get(fieldN);

                    viewfield = me.getFieldView(fieldN);

                    changeCb = cls.model.change[$(this).getName()];

                    if ($this[0] === $(this)[0]
                            || (typeof cls._modelprechange !== 'undefined'
                                    && typeof cls._modelprechange[fieldN] !== 'undefined'
                                    && cls._modelprechange[fieldN] == field))
                        return;

                    if (typeof changeCb === 'function') {
                        if (typeof calllist[$(this).getName()] === 'undefined')
                            changeCb.call(cls.model, field, $(this).val() || $(this).html(), $(this), 'controller');
                        calllist[$(this).getName()] = true;
                    }

                    decorated = field;
                    if ($(this).is("input") || $(this).is("select")) {
                        $(this).val(decorated);
                    } else {
                        var viewCb = $(this).attr(api.view.attr);

                        if (viewCb) {
                            if (typeof cls.view.views[viewCb] === 'function') {
                                decorated = cls.view.views[viewCb].call(cls.view, field);
                            }
                        } else if (typeof viewfield === 'function') {
                            decorated = viewfield.call(cls.view, field, fieldN);
                        }

                        if (typeof decorated === 'function') {
                            var cb = function(data) {
                                cls.set.call(this, data);
                            };
                            cb.bind(this);
                            decorated.bind(undefined, cb);
                        } else {
                            cls.set.call(this, decorated);
                        }

                    }

                    $(this).data('value', field);
                });
            };

            for (fieldname in cls.model.field) {

                this.parseDom('[data-name="' + fieldname + '"],[name="' + fieldname + '"]');

                if ($.type(cls.model.field[fieldname]) === 'object' || $.type(cls.model.field[fieldname]) === 'array') {
                    this.parseDom('[data-name^="' + fieldname + '\["],[name^="' + fieldname + '\["]');
                }
            }
        };

        /*
         * gets executed after a change on dom objects
         * "this" is the dom element responsible for the change
         */
        cls.changed = function() {
            if (typeof cls.model.changed !== "undefined") {
                //me.model2view.call($(this));
                cls.model.changed.call(cls.model, this);
                me.model2view.call($(this));
            }

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

        cls.updateValues = function() {
            $(cls.filter.events).each(function() {
                cls.updateValue.call(this, $(this).getValue());
            });
        };

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
                        if (typeof child.actions[name] !== 'undefined' &&
                                typeof child.actions[name][method] !== 'undefined') {
                            result = child.actions[name][method].call(me, e, cls, args);
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


                    if ($el.attr('data-defaultvalues') === 'model') {
                        InitValue = cls.model.field[$(this).getName()];
                        me.model2view.call($(this));
                    } else {
                        InitValue = $(this).getValue();
                    }

                    cls.updateValue.call(this, InitValue);
                }
            });
            return filter;
        };

        cls.filter = cls.bind(this);


        if (typeof child._methods !== "undefined" && child._methods.init !== "undefined") {
            if (child._methods.init(cls)) {
                cls.recognizeChange.setup();
            }
        }

    };
})(jQuery);
