const k_dom =((api => {
    api = api['dom-attributes'];
    const dom = {
        
        /**
         * document.querySelector("#main ul:first-child") instead of jquery or even zepto
         * /
        
        /**
         * add filter expression
         * @returns {dom}
         */
        'addFilter'(filter) {
            this.setAttribute(api.filter, filter);
        },
        /**
         * get element name
         * @returns {dom}
         */
        'getName'($el) {
            if($el.nodeType !== 3)
                return $el.getAttribute(dom.nameAttr($el));
        },
        /**
         * get name attribute
         * @returns {dom}
         */
        'nameAttr'($el) {
            return $el.getAttribute(api.name.attr) ? api.name.attr : 'name';
        },
        /**
         * toggle element from dom and model
         * @returns {dom}
         */
        'toggleOmit'($el) {
            $el.setAttribute(api.omit.attr, !($el.getAttribute(api.omit.attr) ? ($el.getAttribute(api.omit.attr).toLowerCase() === "true") : false));
            return $el;
        }, 
        /**
         * get xpath of dom element, hopfully unique
         * @returns {*}
         */
        'getXPath'($el) {
            const el = $el;
            if (typeof el === "string") return document.evaluate(el, document, null, 0, null)
            if (!el || el.nodeType != 1) return ''
            if (el.id) return `//*[@id='${el.id}']`
            const sames = [].filter.call(el.parentNode.children, x => x.tagName == el.tagName);
            return `${dom.getXPath.call(el.parentNode)}/${el.tagName.toLowerCase()}${sames.length > 1 ? '[' + ([].indexOf.call(sames, el) + 1) + ']' : ''}`
        }
    };

    /**
     * get value(s) from dom element
     * @param {type} multiple
     * @return {type} value
     */
    function getValue($el, multiple) {
        /**
         * return undefined if this element will be omitted
         */
        if (dom.getParents($el, `[${api.omit.attr}="true"]`) || $el.getAttribute(api.omit.attr) === "true") {
            return undefined;
        }

        if (typeof dom.multipleValues[$el.getAttribute('type')] !== 'function'
            || $el.getAttribute(api.multiple.attr) === "false") {
            return value.call($el);
        } 
        
        if(multiple || $el.getAttribute(api.multiple.attr) === "true"
        || typeof dom.multipleValues[$el.getAttribute('type')] === 'function'){
            /* if multiple is active return values */
            return getValues.call($el, $el.getAttribute('type'));
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
        return this.getAttribute(api.value.attr) || this.value || this.innerHTML;
    }
    
    dom.value = value;
    
    /**
     *
     * @type {{checked: Function, checkbox: Function, radio: Function, data-multiple: Function}}
     */
    dom.multipleValues = {
        "checked"($el, $elements, single) {
            if ($el.getAttribute(api.multiple.attr) === 'false' || single || document.querySelectorAll(`[${dom.nameAttr($el)}="${dom.getName($el)}"]`).length === 1)
                return $el.checked;

            const values = [];
            let val = undefined;

            Array.prototype.forEach.call($elements, (el, i) => {
                val = value.call(el);
                if (typeof val !== 'undefined') {
                    values.push(val);
                }
            });

            return values;
        },
        "checkbox"() {
            return dom.multipleValues.checked(this, document.querySelectorAll(`[${dom.nameAttr(this)}="${dom.getName(this)}"]:checked`));
        },
        "radio"() {
            return dom.multipleValues.checked(this, document.querySelectorAll(`[${dom.nameAttr(this)}="${dom.getName(this)}"]:checked`), true);
        },
        "data-multiple"() {
            return dom.multipleValues.checked(this, document.querySelectorAll(`[${dom.nameAttr(this)}="${dom.getName(this)}"][data-checked="true"]`));
        }
    };

    dom.hasMultipleChoices = $scope => {

        const multiTypes = ["radio", "checkbox"];

        console.log(multiTypes, $scope.getAttribute('type'), multiTypes.indexOf($scope.getAttribute('type')));

        return multiTypes.includes($scope.getAttribute('type')) || $scope.getAttribute('data-multiple') === "true";
    };

    dom.selectMultiple = ($scope, values) => {
        if (typeof values !== 'undefined' && values !== null) {
            const instances = document.querySelectorAll(`[${dom.nameAttr($scope)}="${dom.getName($scope)}"]`);

            if( Object.prototype.toString.call( values ) !== '[object Array]' ) {
                values = [values];
            } 

            Array.prototype.forEach.call(instances, el => {
                el.checked = values[0];
            });
        }
    };
    
    dom.getHtml = $scope => $scope.innerHTML;
    
    /**
     * setting the HTML
     */
    dom.setHtml = ($scope, content) => {
        $scope.innerHTML = content;
    };
     

    dom.getParents = ($scope, selector) => {
         let foundElem;
          while ($scope && $scope.parentNode ) {
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
    dom.getView = $scope => $scope.getAttribute(api.view.attr) || dom.getFieldView(dom.getName($scope), true);

    /**
     * return view render method
     * @param {type} fieldN
     * @param {type} getname
     * @returns {cls.view@arr;views|String|Boolean}
     */
    dom.getFieldView = (fieldN, getname) => {
        if (typeof fieldN === 'undefined') {
            return false;
        }

        let viewMethod = false;
        let name = false;
        if (typeof dom.child.view.views[fieldN] === 'undefined') {
            if (fieldN.includes('[')) {
                let finestMatch = fieldN.match(/([a-z].*?\[\w.*\])/gi);
                if (typeof finestMatch !== 'undefined' && finestMatch)
                    finestMatch = finestMatch.pop();
                name = typeof dom.child.view.views[`${fieldN.split('[')[0]}[*]`] !== 'undefined' ? `${finestMatch.split('[').pop()}[*]` : fieldN;
                viewMethod = typeof dom.child.view.views[`${fieldN.split('[')[0]}[*]`] !== 'undefined' ? dom.child.view.views[`${finestMatch.split('[').pop()}[*]`] : undefined;
            }
        } else {
            viewMethod = dom.child.view.views[fieldN];
            name = fieldN;
        }
        const result = (getname) ? name : viewMethod;

        return typeof dom.child.view.views[name] !== 'undefined' ? result : false;
    };


    /**
     * replace brackets [] with points
     * @param {type} change
     * @returns {undefined}
     */
   dom.normalizeChangeResponse = change => {

        if (change.substr(0, 1) !== '[')
            return change;

        if (!change)
            return;
        let match = (/\[(.*?)\]/).exec(change);
        let fieldnamei = change;
        if (match) {
            fieldnamei = change.replace(match[0], match[1]);
            while ((match = /\[([a-z].*?)\]/ig.exec(fieldnamei)) != null) {
                fieldnamei = fieldnamei.replace(match[0], `.${match[1]}`);
            }
        }

        return fieldnamei;//.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
    }
    
     /**
     * replace brackets [] with ['']
     * @param {type} change
     * @returns {undefined}
     */
   dom.normalizeChangeResponseBrackets = change => {

        if (change.substr(0, 1) !== '[')
            return change;

        if (!change)
            return;
        let match = (/\[(.*?)\]/).exec(change);
        let fieldnamei = change;
        if (match) {
            fieldnamei = change.replace(match[0], match[1]);
            while ((match = /\[([a-z].*?)\]/ig.exec(fieldnamei)) != null) {
                fieldnamei = fieldnamei.replace(match[0], `['${match[1]}']`);
            }
        }

        return fieldnamei;//.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
    }
    
    dom.is = ($scope, type) => $scope.tagName.toLowerCase() === type.toLowerCase()

    /**
     * no html decorated content
     * @param {type} $scope
     * @returns {unresolved}
     */
    dom.isPrimitiveValue = $scope => dom.is($scope, "input") || dom.is($scope, "select") || dom.is($scope, "textarea");

    /**
     * no html decorated content
     * @param {type} $scope
     * @param {type} decorated
     * @returns {undefined}
     */
    dom.setPrimitiveValue = ($scope, decorated) => {
        if($scope.getAttribute(api.value.attr) !== null) {
            $scope.setAttribute(api.value.attr, decorated);
        }else{
            
            if($scope.type ==="textarea"){
                $scope.innerHTML = decorated;
            }else{
                $scope.value = decorated;
            }
            
        } 
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
        
        this.innerHTML = decorated;
        
    };

    /**
     * element has view render function
     * @param $scope
     * @returns {*}
     */
    dom.hasView = $scope => $scope.getAttribute(api.view.attr) || dom.getFieldView(dom.getName($scope), true);
    
     /**
     * get jquery selector for element name
     * @param name
     * @param escapeit
     * @returns {string}
     */
    dom.getSelector = (name, escapeit) => {
        if (escapeit)
            name = name.replace(/\[/g, '\[').replace(/\]/g, '\]');
             
        return `[data-name="${name}"],[name="${name}"]`;
    };
    
    /**
     * get jquery selector for element name
     * @param name
     * @param escapeit
     * @returns {string}
     */
    dom.getValidatorSelector = (name, viewname) => { 
            name = name.replace(/\[/g, '\[').replace(/\]/g, '\]');
            viewname = viewname.replace(/\[/g, '\[').replace(/\]/g, '\]');
        return `[data-name="${name}"][data-view="${viewname}"], [name="${name}"][data-view="${viewname}"]`;
    };
    
    /**
     * detect if element represents a list
     * @param $scope
     * @returns {*|boolean}
     */
    dom.isHtmlList = $scope => $scope.getAttribute(api.view.attr) && $scope.getAttribute(api.view.attr).includes(api.view.value.definition.iterate);
    /**
     * create dom el from string
     **/
    dom.parseHTML = html => {
        const t = document.createElement('template');
        t.innerHTML = html;
        return t.content.cloneNode(true).childNodes[0];
    }
 
    dom.getValues = getValues;
    dom.getValue = getValue;
    
    return dom;
})(k_docapi));
