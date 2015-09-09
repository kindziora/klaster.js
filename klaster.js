/**
 * klaster is a jquery filter plugin for extended filters by dom rules and javascript based on filter classes
 * @author Alexander Kindziora 2015
 * 
 */

(function ($) {
//"use strict";

    var me = {};

    var api = docapi['dom-attributes'];

    $.fn.klaster_l = function (child) {

        var $globalScope = this;

        var cls = $.extend(structure, child);

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

        cls.updateViewFilter = function () {
            $globalScope.find('[data-filter]').each(function () {
                cls.viewFilter[$(this).getName()] = $(this).attr('data-filter');
            });
        }

        /*
         * gets executed before an event is triggered
         */
        cls.pre_trigger = function (e) {
            cls.updateViewFilter();

            cls.model._buildModelPreChangeObj();

            if (typeof child.pre_trigger !== "undefined")
                return child.pre_trigger.call(this, e);
            return true;
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