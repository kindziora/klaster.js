(function ($) {
    var dom = {};

    function addFilter(filter) {
        this.attr(api.filter, filter);
    }

    function getName() {
        return this.attr(this.nameAttr());
    }

    function nameAttr() {
        return this.attr(api.name.attr) ? api.name.attr : 'name';
    }

    function toggleOmit() {
        this.attr(api.omit.attr, !(this.attr(api.omit.attr) ? (this.attr(api.omit.attr).toLowerCase() === "true") : false));
        return this;
    }

    function setValue(value) {
        this.data('value', value);
    }
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

    function getValues(type) {
        if (typeof dom.multipleValues[type] === 'undefined'
                && this.attr(api.multiple.attr)) {
            type = api.multiple.attr;
        }
        return dom.multipleValues[type].call(this);
    }

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
    ;

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

    dom.getView = function ($scope) {
        return $scope.attr(api.view.attr) || dom.getFieldView($scope.getName(), true);
    };

    /**
     * 
     * @param {type} fieldN
     * @param {type} getname
     * @returns {cls.view@arr;views|String|Boolean}
     */
    dom.getFieldView = function (fieldN, getname) {

        if (typeof fieldN === 'undefined') {
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


    dom.model2view = function () {
        var local = {};

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
            return $scope.attr(api.view.attr) || dom.getFieldView($scope.getName(), true);
        };

        local.getDecoratedValuePrimitive = function ($scope, scopeModelField) {
            var fieldN = $scope.getName(),
                    viewRenderFuntionName = cls.getView($scope),
                    DecoratedValuePrimitive = scopeModelField;

            if (viewRenderFuntionName) {
                DecoratedValuePrimitive = cls.view.views[viewRenderFuntionName].call(cls.view, scopeModelField, fieldN, $scope);
            }

            if (!dom.preRenderView($scope, scopeModelField)) {
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

                    if (dom.preRenderView($scope, field[index])) {
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
                if (match !== "" && (dom.getFieldView(match) || (typeof $myPEl !== 'undefined' && $myPEl.attr(api.view.attr)))) {
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
            if (cls.viewFilter[$(this).getName()] !== $(this).attr('data-filter')) { // filter for this view has changed
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
    
    $.fn.addFilter = addFilter;
    $.fn.getValues = getValues;
    $.fn.getValue = getValue;
    $.fn.setValue = setValue;
    $.fn.getName = getName;
    $.fn.nameAttr = nameAttr;
    $.fn.toggleOmit = toggleOmit;
});