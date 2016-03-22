/**
 * klaster is a jquery filter plugin for extended filters by dom rules and javascript based on filter classes
 * @author Alexander Kindziora 2015
 *
 */

(function (structure, docapi, dom, model) {
    //"use strict";

    var me = {};
    var api = docapi['dom-attributes'];
    
    window.$k = function(selector) { 
        return klaster.bind(document.querySelector(selector));
    };
    
    function klaster(child) {
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
            Array.prototype.forEach.call($globalScope.querySelectorAll('[data-filter]'), function(el, i){
             cls.viewFilter[dom.getXPath(el)] = el.getAttribute('data-filter');
            });
        };
 
        /**
         * before a view gets rendered
         * return true means render element, false remove it if existent in dom
         **/
        cls.preRenderView = function ($field, item) {
            if (typeof model.get(dom.getName($field)) === 'undefined' ||
                $field.getAttribute(api.view) === "__static" )
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
            var modelState =  model.get(name);
     
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
        cls.validate = function(name, value, type) {
            if (typeof child.validator !== "undefined" && typeof child.validator[type] === "function") { 
                var validateResult = child.validator[type].call(model, value, name);
                
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
            if(typeof $html !== 'undefined' && $html.nodeType !== 3)
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
                
                Array.prototype.forEach.call($scope.childNodes, function(el, i){
                    var Elname = dom.getName(el);
                    if(typeof Elname === 'undefined') {
                         el.parentNode.removeChild(el);
                    }else{
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
        cls.updateHtmlElement = function($scope, scopeModelField, changed){
            
            var name = dom.getName($scope);
            var error = model.getState(name);
            var cced = model.getOld(name);
            if((typeof error === 'undefined' || error.result) || (typeof error !== 'undefined' && dom.getView($scope) !== error.view)){ // kein fehler aufgetreten
                if (cced !== scopeModelField) { // cached value of field != model.field value
                   var decoratedFieldValue = cls.getDecoValPrimitive($scope, scopeModelField);
                    _set.call($scope, decoratedFieldValue); // bind html 
                }
            }else{ // field view was defined i a validator is it gets rendered also if value is not in model and by that equal to undefined
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
            Array.prototype.forEach.call( ($where.querySelectorAll(cls.filter.events) || $globalScope.querySelectorAll(cls.filter.events)), function(el, i){
                model.updateValue.call(el, this.value);
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
                    
                     
                    
                    if( v === '__static'){
                        dom.setPrimitiveValue($scope, scopeModelField);
                        return;
                    }
                    
                    if($triggerSrc === $scope){ 
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
                        dom.setPrimitiveValue($scope, decoratedFieldValue);
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
                        return function(el){
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
            if(this.getAttribute(api.on.attr)) {
                 var events = (this.getAttribute(api.on.attr) ||'').split(','), i = 0, event = "", FinalEvents = {}, parts = "";
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
                                result = me.value;
                            }
                        } else if (typeof cls.interactions[method] !== 'undefined' &&
                            typeof cls.interactions[method][event] !== 'undefined') {
                            result = cls.interactions[method][event].call(me, e, cls, args);
                            if (me.getAttribute(api.omit.attr) === "true") {
                                result = me.value;
                            }

                        } else {
                            result = me.value;
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
                
                if(name){
                    events[name] = cls.dispatchEvents.call(el);
                    for (event in events[name]) {
                        cls.debug('name:' + name + ', event:' + event);
                        var f = factory(el, event);
                        el.removeEventListener(event, f);
                        el.addEventListener(event, f);
                        if ($el.getAttribute('data-defaultvalues') !== 'model' && !dom.getParents($el, '[data-defaultvalues="model"]')) {
                            InitValue = el.value;
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
        
        cls.applyMethods = function(el){
        
            el.getName = function(){ 
                return dom.getName(this);
            }.bind(el);
            
            el.getValue = function(from , multiple){
                if(typeof from === 'undefined')
                    from = 'dom'; 
                return (from !== 'model') ? dom.getValue(this, multiple) : model.get(dom.getName(this));
            }.bind(el); 
            
            el.setValue = function(primitiveValue){
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

    };
})(k_structure, k_docapi, k_dom, k_data);
