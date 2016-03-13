var k_dom =(function ($, api) {
    api = api['dom-attributes'];
    var dom = {
        
        /**
         * document.querySelector("#main ul:first-child") instead of jquery or even zepto
         * /
        
        /**
         * add filter expression
         * @returns {dom}
         */
        'addFilter': function (filter) {
            this.setAttribute(api.filter, filter);
        },
        /**
         * get element name
         * @returns {dom}
         */
        'getName': function () {
            return this.getAttribute(this.nameAttr());
        },
        /**
         * get name attribute
         * @returns {dom}
         */
        'nameAttr': function () {
            return this.getAttribute(api.name.attr) ? api.name.attr : 'name';
        },
        /**
         * toggle element from dom and model
         * @returns {dom}
         */
        'toggleOmit': function () {
            this.setAttribute(api.omit.attr, !(this.getAttribute(api.omit.attr) ? (this.getAttribute(api.omit.attr).toLowerCase() === "true") : false));
            return this;
        }, 
        /**
         * get xpath of dom element, hopfully unique
         * @returns {*}
         */
        'getXPath': function () {
            var el = this;
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
        if (dom.getParents(this, '[' + api.omit.attr + '="true"]') || this.getAttribute(api.omit.attr) === "true") {
            return undefined;
        }

        if (typeof dom.multipleValues[this.getAttribute('type')] !== 'function'
            || this.getAttribute(api.multiple.attr) === "false") {
            return value.call(this);
        } 
        
        if(multiple || this.getAttribute(api.multiple.attr) === "true"
        || typeof dom.multipleValues[this.getAttribute('type')] === 'function'){
            /* if multiple is active return values */
            return getValues.call(this, this.getAttribute('type'));
        }

    }

    /**
     * if multiple values exist
     * @param type
     * @returns {*}
     */
    function getValues(type) {
        if (typeof dom.multipleValues[type] === 'undefined'
            && this.getAttribute(api.multiple.attr)) {
            type = api.multiple.attr;
        }
        return dom.multipleValues[type].call(this);
    }

    /**
     * decide which value to return
     * @returns {*}
     */
    function value() {
        if (this.getAttribute(api.omit.attr) === "true") {
            return undefined;
        }
        var value = $(this).val() || $(this).text() || $(this).html();
        /**
         * @todo replace by native value functions 
         */
        
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
        "checked": function ($el, $elements, single) {

            if ($el.attr(api.multiple.attr) === 'false'|| single || document.querySelector('[' + $el.nameAttr() + '="' + $el.getName() + '"]').length === 1)
                return $el.is(':checked');
            var values = [],
                val = undefined;
            $elements.each(function () {
                val = value.call($(this));
                if (typeof val !== 'undefined') {
                    values.push(val);
                }
            });
            return values;
        },
        "checkbox": function () {
            return dom.multipleValues.checked(this, document.querySelector('[' + this.nameAttr() + '="' + this.getName() + '"]:checked'));
        },
        "radio": function () {
            return dom.multipleValues.checked(this, document.querySelector('[' + this.nameAttr() + '="' + this.getName() + '"]:checked'), true);
        },
        "data-multiple": function () {
            return dom.multipleValues.checked(this, document.querySelector('[' + this.nameAttr() + '="' + this.getName() + '"][data-checked="true"]'));
        }
    };

    dom.getHtml = function($scope) {
        return $scope.innerHTML;
    };
    
    /**
     * setting the HTML
     */
    dom.setHtml = function($scope, content) {
        $scope.innerHTML = content;
    };
     

    dom.getParents = function($scope, selector) {
         var foundElem;
          while ($scope && $scope !== document) {
            foundElem = $scope.parentNode.querySelector(selector);
            if(foundElem) {
              return foundElem;
            } 
            $scope = $scope.parentNode;
          }
          return null;
    }

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
        if (typeof dom.child.view.views[fieldN] === 'undefined') {
            if (fieldN.indexOf('[') !== -1) {
                var finestMatch = fieldN.match(/([a-z].*?\[\w.*\])/gi);
                if (typeof finestMatch !== 'undefined' && finestMatch)
                    finestMatch = finestMatch.pop();
                name = typeof dom.child.view.views[fieldN.split('[')[0] + '[*]'] !== 'undefined' ? finestMatch.split('[').pop() + '[*]' : fieldN;
                viewMethod = typeof dom.child.view.views[fieldN.split('[')[0] + '[*]'] !== 'undefined' ? dom.child.view.views[finestMatch.split('[').pop() + '[*]'] : undefined;
            }
        } else {
            viewMethod = dom.child.view.views[fieldN];
            name = fieldN;
        }
        var result = (getname) ? name : viewMethod;

        return typeof dom.child.view.views[name] !== 'undefined' ? result : false;
    };


    /**
     * replace brackets [] with points
     * @param {type} change
     * @returns {undefined}
     */
   dom.normalizeChangeResponse = function (change) {

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
     * replace brackets [] with ['']
     * @param {type} change
     * @returns {undefined}
     */
   dom.normalizeChangeResponseBrackets = function (change) {

        if (change.substr(0, 1) !== '[')
            return change;

        if (!change)
            return;
        var match = (/\[(.*?)\]/).exec(change);
        var fieldnamei = change;
        if (match) {
            fieldnamei = change.replace(match[0], match[1]);
            while ((match = /\[([a-z].*?)\]/ig.exec(fieldnamei)) != null) {
                fieldnamei = fieldnamei.replace(match[0], "['" + match[1] + "']");
            }
        }

        return fieldnamei;//.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
    }
    
    dom.is = function($scope, type) {
        return $scope.tagName === type;
    }

    /**
     * no html decorated content
     * @param {type} $scope
     * @returns {unresolved}
     */
    dom.isPrimitiveValue = function ($scope) {
        return dom.is($scope, "input") || dom.is($scope, "select") || dom.is($scope, "textarea");
    };

    /**
     * no html decorated content
     * @param {type} $scope
     * @param {type} decorated
     * @returns {undefined}
     */
    dom.setPrimitiveValue = function ($scope, decorated) {
        $scope.value = decorated;
    };
     
    /**
     *
     * @param {type} $scope
     * @param {type} decorated
     * @returns {undefined}
     */
    dom.setHtmlValue = function (decorated) {

      if (typeof decorated === 'undefined')
        decorated = '';
        
        $(this).html(decorated);
        
    };

    /**
     * element has view render function
     * @param $scope
     * @returns {*}
     */
    dom.hasView = function ($scope) {
        return $scope.attr(api.view.attr) || dom.getFieldView($scope.getName(), true);
    };
    
     /**
     * get jquery selector for element name
     * @param name
     * @param escapeit
     * @returns {string}
     */
    dom.getSelector = function (name, escapeit) {
        if (escapeit)
            name = name.replace(/\[/g, '\[').replace(/\]/g, '\]');
             
        return '[data-name="' + name + '"],[name="' + name + '"]';
    };
    
    /**
     * get jquery selector for element name
     * @param name
     * @param escapeit
     * @returns {string}
     */
    dom.getValidatorSelector = function (name, viewname) { 
            name = name.replace(/\[/g, '\[').replace(/\]/g, '\]');
            viewname = viewname.replace(/\[/g, '\[').replace(/\]/g, '\]');
        return '[data-name="' + name + '"][data-view="' + viewname + '"], [name="' + name + '"][data-view="' + viewname + '"]';
    };
    
    /**
     * detect if element represents a list
     * @param $scope
     * @returns {*|boolean}
     */
    dom.isHtmlList = function ($scope) {
        return $scope.attr(api.view.attr) && $scope.attr(api.view.attr).indexOf(api.view.value.definition.iterate) !== -1;
    };
    

    $.fn.addFilter = dom.addFilter;
    $.fn.getValues = getValues;
    $.fn.getValue = getValue;
    $.fn.setValue = dom.setValue;
    $.fn.getName = dom.getName;
    $.fn.nameAttr = dom.nameAttr;
    $.fn.toggleOmit = dom.toggleOmit;
    $.fn.getXPath = dom.getXPath;

    return dom;
}(jQuery, k_docapi));
