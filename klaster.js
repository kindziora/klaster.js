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

                cls.debug('changed', result, model.getOld($(this).getName()), $(this).getName());

                cls.recognizeChange.setup.call(this);

                model.updateValue.call(this, result, model.field[$(this).getName()]);

                if (typeof child.post_trigger !== "undefined")
                    child.post_trigger.call(this, e, child);

                cls.model2View.call($(this));

            }
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
        
        /**
         * update html element if changed || validation error view
         **/
        cls.updateHtmlElement = function($scope, scopeModelField, changed){
            
            var error = model.getState($scope.getName());
            var cced = model.getOld($scope.getName());
            if((typeof error === 'undefined' || error.result) || (typeof error !== 'undefined' && dom.getView($scope) !== error.view)){ // kein fehler aufgetreten
                if (cced !== scopeModelField) { // cached value of field != model.field value
                   var decoratedFieldValue = cls.getDecoValPrimitive($scope, scopeModelField);
                    _set.call($scope, decoratedFieldValue); // bind html 
                }
            }else{ // field view was defined i a validator is it gets rendered also if value is not in model and by that equal to undefined
                var template = cls.view.views[error.view].call(cls, scopeModelField, $scope.getName());
               
                $field = $($globalScope.find(dom.getValidatorSelector($scope.getName(), error.view)));
                _set.call($field, template); 
            }
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
            var $triggerSrc = $(this);
            
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
                    
                    var viewName = $myPEl.attr(api.view.attr);
                    var viewMethod = cls.view.views[viewName];
                    
                    /**
                     * improve performance here!!!
                     **/
                    if (match !== "" && (dom.getFieldView(match) || (typeof $myPEl !== 'undefined' && typeof viewMethod !== 'undefined'))) {
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
                    
                    if($triggerSrc.get(0) === $scope.get(0)){
                        return;
                    } 
                    
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
                    
                   /* if ($scope.attr('type') === "radio") {
                        foundRepresentation = false;
                        iteration(scopeModelField);
                        return;
                    }*/
    
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
                        if (typeof cls.interactions[name] !== 'undefined' &&
                            typeof cls.interactions[name][method] !== 'undefined') {
                            result = cls.interactions[name][method].call(me, e, cls, args);
                            if ($(me).attr(api.omit.attr) === "true") {
                                result = $(me).getValue();
                            }
                        } else if (typeof cls.interactions[method] !== 'undefined' &&
                            typeof cls.interactions[method][event] !== 'undefined') {
                            result = cls.interactions[method][event].call(me, e, cls, args);
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
