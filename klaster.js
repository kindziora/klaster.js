/**
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
        
        var $globalScope = this;
        
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
                
                cls.updateValue.call(this, result, model.field[$(this).getName()]);
                
                dom.model2View.call($(this));
                
            }

            if (typeof child.post_trigger !== "undefined")
                return child.post_trigger.call(this, e, child);
            return true;
        };
        
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
            if (typeof $html === 'undefined')
                $html = '';
            $(this).html($html);
            cls.bind($(this));
            cls.postRenderView($(this));
        }

        /**
         * execute render view function for primitive values (no html)
         * @param $scope
         * @param scopeModelField
         * @returns {*}
         */
        cls.getDecoratedValuePrimitive = function ($scope, scopeModelField) {
            var fieldN = $scope.getName(),
                viewRenderFuntionName = dom.getView($scope),
                DecoratedValuePrimitive = scopeModelField;

            if (viewRenderFuntionName) {
                DecoratedValuePrimitive = cls.view.views[viewRenderFuntionName].call(cls.view, scopeModelField, fieldN, $scope);
            }

            if (!cls.preRenderView($scope, scopeModelField)) {
                return undefined;
            }

            return DecoratedValuePrimitive;
        };
        
        /**
         * update list of elements hopefully partial update
         * @param $scope
         * @param field
         * @param change
         */
        cls.updateHtmlList = function ($scope, field, change) {
            var $child, index, $html;
            var viewRenderFuntionName = dom.getView($scope);

            /**
             * add element
             */
            function addE() {

                var m_index = 0;
                for (index in field) {

                    $child = $scope.find('[data-name="' + $scope.getName() + '\[' + index + '\]"]');

                    if (cls.preRenderView($scope, field[index])) {
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
                        cls.postRenderView($html);

                    } else {
                        $child.remove();
                    }


                    m_index = index;
                }
            }

            /**
             * remove element
             */
            function killE() {
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
                    myChangedField = model.get(_notation),
                    index = /\[(.*?)\]/gi.exec(_notation)[1];

                $child = $scope.find(dom.getSelector(_notation, true));

                if (typeof myChangedField !== 'undefined' && cls.preRenderView($scope, field[index])) {
                    $html = $(cls.view.views[viewRenderFuntionName].call(cls.view, field[index], index, $scope));

                    if ($child.get(0)) {
                        $child.replaceWith($html);
                    }

                    $html.data('value', field[index]);
                    cls.bind($html);
                    cls.postRenderView($html);

                    if (!$child.get(0)) {
                        $scope.append($html);
                    }
                } else {
                    $child.remove();
                }

            }

        };

        //from view to model
        cls.view2Model = function ($where) {
            ($where.find(cls.filter.events) || $(cls.filter.events)).each(function () {
                cls.updateValue.call(this, $(this).getValue());
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
            local.iteratedAllViewEl = function ($scope, change, ready) {
                // and no view to display the change so try to display change with parent node
                var field_notation = dom.normalizeChangeResponse(change[0]);
                var match = field_notation;
                while (match !== '') {
                    match = model._getParentObject(match, '');
    
                    var findNotation = local.getSelector(match, true);
    
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
                        decoratedFieldValue = cls.getDecoratedValuePrimitive($scope, scopeModelField);
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
                                decoratedFieldValue = cls.getDecoratedValuePrimitive($scope, scopeModelField);
                                local.setHtmlValue($scope, decoratedFieldValue);
                                $scope.data('cvalue', scopeModelField);
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
                var selector = local.getSelector(fieldNotation, true);
                var match = $globalScope.find(selector);
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
                    $els.each(local.eachViewRepresentation(cnt, changes, true, function () {
                        if (typeof model.event !== "undefined" && typeof model.event.postChange !== 'undefined' && typeof model.event.postChange[$els.getName()] === 'function') {
                            var changeCb = model.event.postChange[$els.getName()];
                            changeCb.call(model, model.get($els.getName()), changes, 'controller');
                        }
                    }));
                }
            };
    
            dom.updateAllViews(cls.getChangedModelFields() || []);
    
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

        cls.has = function (obj, key) {
            return hasOwnProperty.call(obj, key);
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
                        cls.updateValue.call(this, InitValue);
                    }
                }
            });
            if ($el.attr('data-defaultvalues') === 'model') {
                me.model2View.call($el);
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
})(jQuery, k_structure, k_docapi, dom, model);