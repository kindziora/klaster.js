/**
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
            var originalList = original.length> updated.length ?[].slice.call(updated, 0): [].slice.call(original, 0),
                updatedList = original.length> updated.length ?[].slice.call(updated, 0):  [].slice.call(original, 0),
        
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

