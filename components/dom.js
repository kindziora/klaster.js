(function ($) {

    var dom = {
        /**
         * add filter expression
         * @returns {dom}
         */
        'addFilter': function (filter) {
            this.attr(api.filter, filter);
        },
        /**
         * get element name
         * @returns {dom}
         */
        'getName': function () {
            return this.attr(this.nameAttr());
        },
        /**
         * get name attribute
         * @returns {dom}
         */
        'nameAttr': function () {
            return this.attr(api.name.attr) ? api.name.attr : 'name';
        },
        /**
         * toggle element from dom and model
         * @returns {dom}
         */
        'toggleOmit': function () {
            this.attr(api.omit.attr, !(this.attr(api.omit.attr) ? (this.attr(api.omit.attr).toLowerCase() === "true") : false));
            return this;
        },
        /**
         * set value of dom element
         * @param value
         */
        'setValue': function (value) {
            this.data('value', value);
        },
        /**
         * get xpath of dom element, hopfully unique
         * @returns {*}
         */
        'getXPath': function () {
            var el = $(this).get(0);
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
    function getValue(multiple) {
        /**
         * return undefined if this element will be omitted
         */
        if (this.parents('[' + api.omit.attr + '="true"]').get(0) || this.attr(api.omit.attr) === "true") {
            return undefined;
        }

        if (typeof multiple === 'undefined' || !multiple
            && typeof dom.multipleValues[this.attr('type')] !== 'function'
            && !this.attr(api.multiple.attr)) {
            return dom.value.call(this);
        } else {
            /* if multiple is active return values */
            return this.getValues(this.attr('type'));
        }

    }

    /**
     * if multiple values exist
     * @param type
     * @returns {*}
     */
    function getValues(type) {
        if (typeof dom.multipleValues[type] === 'undefined'
            && this.attr(api.multiple.attr)) {
            type = api.multiple.attr;
        }
        return dom.multipleValues[type].call(this);
    }

    /**
     * decide which value to return
     * @returns {*}
     */
    function value() {
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
    }

    /**
     *
     * @type {{checked: Function, checkbox: Function, radio: Function, data-multiple: Function}}
     */
    dom.multipleValues = {
        "checked": function ($el, $elements) {

            if ($el.attr(api.multiple.attr) === 'false' || $('[' + $el.nameAttr() + '="' + $el.getName() + '"]').length === 1)
                return $el.is(':checked');
            var values = [],
                value = undefined;
            $elements.each(function () {
                value = dom.value.call($(this));
                if (typeof value !== 'undefined') {
                    values.push(value);
                }
            });
            return values;
        },
        "checkbox": function () {
            return dom.multipleValues.checked(this, $('[' + this.nameAttr() + '="' + this.getName() + '"]:checked'));
        },
        "radio": function () {
            return dom.multipleValues.checkbox;
        },
        "data-multiple": function () {
            return dom.multipleValues.checked(this, $('[' + this.nameAttr() + '="' + this.getName() + '"][data-checked="true"]'));
        }
    };

    /**
     * getAttr that holds view name
     * @param $scope
     * @returns {*}
     */
    dom.getView = function ($scope) {
        return $scope.attr(api.view.attr) || dom.getFieldView($scope.getName(), true);
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
        if (typeof dom.view.views[fieldN] === 'undefined') {
            if (fieldN.indexOf('[') !== -1) {
                var finestMatch = fieldN.match(/([a-z].*?\[\w.*\])/gi);
                if (typeof finestMatch !== 'undefined' && finestMatch)
                    finestMatch = finestMatch.pop();
                name = typeof dom.view.views[fieldN.split('[')[0] + '[*]'] !== 'undefined' ? finestMatch.split('[').pop() + '[*]' : fieldN;
                viewMethod = typeof dom.view.views[fieldN.split('[')[0] + '[*]'] !== 'undefined' ? dom.view.views[finestMatch.split('[').pop() + '[*]'] : undefined;
            }
        } else {
            viewMethod = dom.view.views[fieldN];
            name = fieldN;
        }
        var result = (getname) ? name : viewMethod;

        return typeof dom.view.views[name] !== 'undefined' ? result : false;
    };


    dom.model2view = function () {
        var local = {};

        /**
         * replace brackets [] with points
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
                while ((match = /\[([a-z].*?)\]/ig.exec(fieldnamei)) != null) {
                    fieldnamei = fieldnamei.replace(match[0], '.' + match[1]);
                }
            }

            return fieldnamei;//.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
        }

        /**
         * no html decorated content
         * @param {type} $scope
         * @returns {unresolved}
         */
        local.isPrimitiveValue = function ($scope) {
            return $scope.is("input") || $scope.is("select") || $scope.is("textarea");
        };

        /**
         * no html decorated content
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
         * set html decorated content and bind methods
         * this updates a partial area
         * @param {type} $html
         */
        function _set($html) {
            if (typeof $html === 'undefined')
                $html = '';
            $(this).html($html);
            dom.bind($(this));
            dom.postRender($(this));
        }

        /**
         *
         * @param {type} $scope
         * @param {type} decorated
         * @returns {undefined}
         */
        local.setHtmlValue = function ($scope, decorated) {
            _set.call($scope, decorated);
        };

        /**
         * element has view render function
         * @param $scope
         * @returns {*}
         */
        local.hasView = function ($scope) {
            return dom.getFieldView($scope.getName(), true);
        };

        /**
         * execute render view function for primitive values (no html)
         * @param $scope
         * @param scopeModelField
         * @returns {*}
         */
        local.getDecoratedValuePrimitive = function ($scope, scopeModelField) {
            var fieldN = $scope.getName(),
                viewRenderFuntionName = dom.getView($scope),
                DecoratedValuePrimitive = scopeModelField;

            if (viewRenderFuntionName) {
                DecoratedValuePrimitive = dom.view.views[viewRenderFuntionName].call(dom.view, scopeModelField, fieldN, $scope);
            }

            if (!dom.preRenderView($scope, scopeModelField)) {
                return undefined;
            }

            return DecoratedValuePrimitive;
        };

        /**
         * get jquery selector for element name
         * @param name
         * @param escapeit
         * @returns {string}
         */
        local.getSelector = function (name, escapeit) {
            if (escapeit)
                name = name.replace(/\[/g, '\[').replace(/\]/g, '\]')
            return '[data-name="' + name + '"],[name="' + name + '"]';
        };

        /**
         * update list of elements hopefully partial update
         * @param $scope
         * @param field
         * @param change
         */
        local.updateHtmlList = function ($scope, field, change) {
            var $child, index, $html;
            var viewRenderFuntionName = dom.getView($scope);

            /**
             * add element
             */
            function addE() {

                var m_index = 0;
                for (index in field) {

                    $child = $scope.find('[data-name="' + $scope.getName() + '\[' + index + '\]"]');

                    if (dom.preRenderView($scope, field[index])) {
                        $html = $(dom.view.views[viewRenderFuntionName].call(dom.view, field[index], index, $scope));

                        var $close = $scope.find('[data-name="' + $scope.getName() + '\[' + m_index + '\]"]');

                        if ($child.get(0)) {
                            $child.replaceWith($html);
                        } else if ($close.get(0)) {
                            $html.insertAfter($close);
                        } else {
                            $scope.append($html);
                        }

                        $html.data('value', field[index]);
                        dom.bind($html);
                        dom.postRender($html);

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

                    if (!cls.model.get($(this).getName())
                        || typeof field[name] === 'undefined'
                        || !dom.preRenderView($scope, field[name])) {

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

                if (typeof myChangedField !== 'undefined' && dom.preRenderView($scope, field[index])) {
                    $html = $(dom.view.views[viewRenderFuntionName].call(dom.view, field[index], index, $scope));

                    if ($child.get(0)) {
                        $child.replaceWith($html);
                    }

                    $html.data('value', field[index]);
                    dom.bind($html);
                    dom.postRender($html);

                    if (!$child.get(0)) {
                        $scope.append($html);
                    }
                } else {
                    $child.remove();
                }

            }

        };
        /**
         * detect if element represents a list
         * @param $scope
         * @returns {*|boolean}
         */
        local.isHtmlList = function ($scope) {
            return $scope.attr(api.view.attr) && $scope.attr(api.view.attr).indexOf(api.view.value.definition.iterate) !== -1;
        };

        /**
         * executed after processing all name element dom representations
         * @param $scope
         * @param change
         * @param ready
         */
        local.iteratedAllViewEl = function ($scope, change, ready) {
            // and no view to display the change so try to display change with parent node
            var field_notation = normalizeChangeResponse(change[0]);
            var match = field_notation;
            while (match !== '') {
                match = cls.model._getParentObject(match, '');

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
            var fieldNotation = normalizeChangeResponse(notation);
            var selector = local.getSelector(fieldNotation, true);
            var match = $globalScope.find(selector);
            var cnt = match.length;
            if (cnt === 0) {
                if (cls.model._getParentObject(notation, '') === "")
                    return false;
                return dom.findUntilParentExists(cls.model._getParentObject(notation, ''));
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
                if (dom.viewFilter[$(this).getName()] !== $(this).attr('data-filter')) { // filter for this view has changed
                    changes.push([$(this).getName(), 'view-filter', dom.viewFilter[$(this).getName()], $(this).attr('data-filter')]);
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
                    if (typeof cls.model.event !== "undefined" && typeof cls.model.event.postChange !== 'undefined' && typeof cls.model.event.postChange[$els.getName()] === 'function') {
                        var changeCb = cls.model.event.postChange[$els.getName()];
                        changeCb.call(cls.model, cls.model.get($els.getName()), changes, 'controller');
                    }
                }));
            }
        };

        dom.updateAllViews(cls.getChangedModelFields() || []);

    };

    $.fn.addFilter = dom.addFilter;
    $.fn.getValues = dom.getValues;
    $.fn.getValue = dom.getValue;
    $.fn.setValue = dom.setValue;
    $.fn.getName = dom.getName;
    $.fn.nameAttr = dom.nameAttr;
    $.fn.toggleOmit = dom.toggleOmit;
    $.fn.getXPath = dom.getXPath;

    return dom;
}(jQuery));