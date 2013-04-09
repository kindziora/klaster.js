/**
 * klaster is a jquery filter plugin for extended filters by dom rules and javascript based on filter classes
 * @author Alexander Kindziora 2013
 * 
 */
(function($) {
    var me = {};

    $.fn.getName = function() {
        return this.attr('data-name') ? this.attr('data-name') : this.attr('name');
    };

    $.fn.nameAttr = function() {
        return this.attr('data-name') ? 'data-name' : 'name';
    };

    $.fn.toggleOmit = function() {
        this.attr('data-omit', !(this.attr("data-omit") ? (this.attr("data-omit").toLowerCase() === "true") : false));
        return this;
    };

    me.value = function() {
        if (this.attr("data-omit") === "true") {
            return undefined;
        }
        var value = $(this).val() | $(this).text() | $(this).html();

        if (typeof value === 'undefined' && $(this).data('value')) {
            value = $(this).data('value');
        } else if (typeof $(this).data('value') === '' && $(this).attr('data-value') !== "") {
            value = $(this).attr('data-value');
        }
        return value;
    };

    me.multipleValues = {
        "checked": function($el, $elements) {
            var values = [],
                    value = undefined;
            $elements.each(function() {
                value = me.value.call(this);
                if (value === 'undefined') {
                    values.push(value);
                }
            });
            return values;
        },
        "checkbox": function() {
            return me.multipleValues.checked(this, $('[' + this.nameAttr() + '="' + this.getName() + '"]:checked'));
        },
        "radio": this.checkbox,
        "data-multiple": function() {
            return me.multipleValues.checked(this, $('[' + this.nameAttr() + '="' + this.getName() + '"][data-checked="true"]'));
        }
    };

    $.fn.getValues = function(type) {
        if (typeof me.multipleValues[type] === 'undefined'
                && this.attr('data-multiple')) {
            type = 'data-multiple';
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
        if (this.parents('[data-omit="true"]').get(0)) {
            return undefined;
        }

        if (!multiple
                && typeof me.multipleValues[this.attr('type')] !== 'function'
                && !this.attr('data-multiple')) {
            return me.value.call(this);
        } else {
            /* if multiple is active return values */
            return this.getValues(this.attr('type'));
        }

    };

    $.fn.setValue = function(value) {
        this.data('value', value);
    };

})(jQuery);

(function($) {

    $.fn.klaster = function(child) {
        var cls = $.extend({}, child);

        cls.info = {
            'name': 'klaster.js',
            'version': '0.9',
            'debug': 1,
            'tag': 'beta',
            'author': 'Alexander Kindziora',
            'date': '2013',
            'copyright': 'author',
            'license': 'none, feel free'
        };

        cls.values = {};

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
            if (cls.info.debug === 1) {
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
            if (typeof child.pre_trigger !== "undefined")
                return child.pre_trigger.call(this, e);
            return true;
        };

        /*
         * gets executed after a change on dom objects
         * "this" is the dom element responsible for the change
         */
        cls.changed = function() {
            if (typeof child.sync !== "undefined")
                return child.sync.call(cls, this);
            return true;
        };

        cls.updateValue = function(value) {
            if (typeof value !== 'undefined') {
                $(this).setValue(value);
                cls.values[$(this).getName()] = value;
            } else {
                delete cls.values[$(this).getName()];
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
                mio.cancel();
                cls.timeoutID = window.setTimeout(function(msg) {
                    mio.changed(msg);
                }, this.attr('data-delay') | cls.get('delay', 1000));
            };

            return mio;
        }();

        /*
         * gets executed after an event is triggered
         */
        cls.post_trigger = function(e, result) {

            if (result !== cls.values[$(this).getName()]) {
                cls.recognizeChange.setup.call($(this));
                cls.updateValue.call(this, result);
            }

            $(this).setValue(result);

            if (typeof child.post_trigger !== "undefined")
                return child.post_trigger.call(this, e);

            return true;
        };

        /**
         *dispatch events for dom element
         */
        cls.dispatchEvents = function() {
            var events = $(this).attr('data-on').split(','), i = 0, event = "", FinalEvents = {};
            var method = "", parts = "";

            for (i in events) {
                event = $.trim(events[i]);
                parts = event.split('->');
                if (parts.length > 1) {
                    method = parts[1];
                    event = parts[0];
                } else {
                    method = parts[0];
                    event = parts[0];
                }
                FinalEvents[event] = method;
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
         * @todo rethink is this the best way to bind the methods?
         * bind dom to matching methods
         */
        cls.bind = function(element) {
            var events = {}, event = {}, name = "", method = "";

            cls.filter = cls.dispatchFilter(element);
            cls.$el = element;

            /* variable injection via lambda function factory used in iteration */
            var factory = function(me, event) {
                return function(e) {
                    name = $(me).getName();
                    method = events[name][event];
                    var result = true;

                    if (false !== cls.pre_trigger.call(me, e)) {
                        if (typeof child.actions[name] !== 'undefined' &&
                                typeof child.actions[name][method] !== 'undefined') {
                            result = child.actions[name][method].call(me, e, cls);
                            if ($(me).attr('data-omit') === "true") {
                                result = $(me).getValue();
                            }
                        } else {
                            result = $(me).getValue();
                        }
                        cls.post_trigger.call(me, e, result);
                    }

                }
            };

            //filter.fields = filter.$el.find('[name],[data-name]'),
            cls.filter.events = cls.filter.$el.find('[data-on]');

            $(cls.filter.events).each(function() {
                name = $(this).getName();
                events[name] = cls.dispatchEvents.call(this);
                for (event in events[name]) {
                    cls.debug('name:' + name + ', event:' + event);
                    $(this).off(event);
                    $(this).on(event, factory(this, event));
                    cls.updateValue.call(this, $(this).getValue());
                }
            });
        };

        cls.bind(this);

        if (typeof child._methods !== "undefined" && child._methods.init !== "undefined") {
            if (child._methods.init(cls)) {
                cls.recognizeChange.setup();
            }
        }

    };
})(jQuery);