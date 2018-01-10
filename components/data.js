const k_data = (($ => {
    const data = {
        'field' : {}
    };
 
  
    
    const hasOwn = Object.prototype.hasOwnProperty;
    const toStr = Object.prototype.toString;
    
    const isArray = function isArray(arr) {
    	if (typeof Array.isArray === 'function') {
    		return Array.isArray(arr);
    	}
    
    	return toStr.call(arr) === '[object Array]';
    };
    
    const isPlainObject = function isPlainObject(obj) {
    	if (!obj || toStr.call(obj) !== '[object Object]') {
    		return false;
    	}
    
    	const hasOwnConstructor = hasOwn.call(obj, 'constructor');
    	const hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
    	// Not own constructor property must be Object
    	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
    		return false;
    	}
    
    	// Own properties are enumerated firstly, so to speed up,
    	// if last one is own, then all properties are own.
    	let key;
    	for (key in obj) { /**/ }
    
    	return typeof key === 'undefined' || hasOwn.call(obj, key);
    };
    
   data.extend = function() {
       let options;
       let name;
       let src;
       let copy;
       let copyIsArray;
       let clone;
       let target = arguments[0];
       let i = 1;
       const length = arguments.length;
       let deep = false;

       // Handle a deep copy situation
       if (typeof target === 'boolean') {
           deep = target;
           target = arguments[1] || {};
           // skip the boolean and the target
           i = 2;
       } else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
           target = {};
       }

       for (; i < length; ++i) {
           options = arguments[i];
           // Only deal with non-null/undefined values
           if (options != null) {
               // Extend the base object
               for (name in options) {
                   src = target[name];
                   copy = options[name];
   
                   // Prevent never-ending loop
                   if (target !== copy) {
                       // Recurse if we're merging plain objects or arrays
                       if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
                           if (copyIsArray) {
                               copyIsArray = false;
                               clone = src && isArray(src) ? src : [];
                           } else {
                               clone = src && isPlainObject(src) ? src : {};
                           }
   
                           // Never move original objects, clone them
                           target[name] = data.extend(deep, clone, copy);
   
                       // Don't bring in undefined values
                       } else if (typeof copy !== 'undefined') {
                           target[name] = copy;
                       }
                   }
               }
           }
       }

       // Return the modified object
       return target;
   };
     
 
    data.has = (obj, key) => hasOwnProperty.call(obj, key);
    /**
     *
     */
    data._buildModelPreChangeObj = () => {
        data._modelprechange = {};
        data._modelprechangeReal = {};
        data._modelpresize = 0;
        for (const key in data['field']) {
            if (data.has(data['field'], key) && data['field'][key] !== null  && typeof data['field'][key] !== 'undefined') {
                data._modelprechange[key] = data['field'][key]; // data['field'][key].toString()
                let base = {};
                if (Object.prototype.toString.call(data['field'][key]) === "[object Array]") {
                    base = [];
                }

                if (typeof data['field'][key] !== 'string' && typeof data['field'][key] !== 'number') {
                    data._modelprechangeReal[key] = data.extend(true, base, data['field'][key]);
                } else {
                    data._modelprechangeReal[key] = data['field'][key];
                }

                data._modelpresize++;
            }
        }
    };
    
    /**
     * set state of a model field value and represent it in the state object eg.
     * {result: false, msg : "email ist nicht gültig"};
     **/
    data.setState = (notation, value) => {
         
        //check if valid
        
        if(typeof value.result === 'undefined') {
            throw  {
               message : "A state has to contain a field 'result' of type boolean",
               name : "ValidationException"
            };
        }
          
        if (typeof data['state'] === 'undefined' ){
            data.state = JSON.parse(JSON.stringify(data.field));
        }
          
        if (typeof data['state'][notation] === 'undefined' && notation.includes('[')) {
            const parent = data._getParentObject(notation).replace(/\.field\./g, '.state.');
            eval(`if( (typeof ${parent}!== 'undefined')) data.state.${notation}=${JSON.stringify(value)};`);
        } else {
            data['state'][notation] = value;
        }
    }
    
    /**
     * return state for a model field value eg.
     * {result: false, msg : "email ist nicht gültig"}
     **/
    data.getState = notation => {
        try {
            if (typeof data['state'][notation] === 'undefined' && notation.includes('[')) {
                return eval(`(typeof data.state.${notation}!== 'undefined' ) ? data.state.${notation}: undefined;`);
            } else {
                return data['state'][notation];
            }
        } catch (err) {
            return undefined;
        }
    }
    
     /**
     * eval is better for this, js supports no byref arguments
     * @param {type} variable
     * @param {type} level
     * @param {type} index
     * @returns {@exp;data@pro;model@call;getValue}
     */
    data.getOld = notation => {
        try {
            if (typeof data['_modelprechangeReal'][notation] === 'undefined' && (notation.includes('[') ||  notation.includes('.'))) {
                return eval(`(typeof data._modelprechangeReal.${notation}!== 'undefined' ) ? data._modelprechangeReal.${notation}: undefined;`);
            } else {
                return data['_modelprechangeReal'][notation];
            }
        } catch (err) {
            return undefined;
        }
    };
    
    /**
     * eval is better for this, js supports no byref arguments
     * @param {type} variable
     * @param {type} level
     * @param {type} index
     * @returns {@exp;data@pro;model@call;getValue}
     */
    data.get = notation => {
        try {
            if (typeof data['field'][notation] === 'undefined' && notation.includes('[')) {
                return eval(`(typeof data.field.${notation}!== 'undefined' ) ? data.field.${notation}: undefined;`);
            } else {
                return data['field'][notation];
            }
        } catch (err) {
            return undefined;
        }
    };

    data.set = (notation, value) => {
        if (typeof data['field'][notation] === 'undefined' && notation.includes('[')) {
            const parent = data._getParentObject(notation);
            eval(`if( (typeof ${parent}!== 'undefined')) data.field.${notation}=${JSON.stringify(value)};`);
        } else {
            data['field'][notation] = value;
        }
    };

    data._getParentObject = (notation, ns) => {
        if (typeof ns === 'undefined')
            ns = 'data.field.';
        let parent = false;
        if (!notation)
            return parent;
        if (notation.indexOf(']') > notation.indexOf('.')) {
            parent = ns + notation.replace(notation.match(/\[(.*?)\]/gi).pop(), '!').split('!')[0];
        } else {
            const p = notation.split('.');
            p.pop();
            parent = ns + p.join('.');
        }
        return parent;
    };

    data._delete = data.delete = notation => {
        if (typeof data['field'][notation] === 'undefined' && notation.includes('[')) {
            try {
                const parent = data._getParentObject(notation);
                 eval(
                    `if(Object.prototype.toString.call(${parent}) === '[object Array]' ){${parent}.splice(${parent}.indexOf(data['field'].${notation}),1);} else {if(typeof data['field'].${notation}!== 'undefined') delete data['field'].${notation};}`);
                /**
                 * to keep indexes

                eval("if(typeof data['field']." + notation + "!== 'undefined' ){ delete data['field']." + notation + ";" +
                    "if(Object.prototype.toString.call(" + parent + ") === '[object Array]' ) " + parent + ".length--;" +
                    "}");
                 */
            } catch (err) {
                console.log(err);
            }
        } else {
            delete data['field'][notation];
        }
    };



    /**
     *
     * @param {type} value
     * @param {type} old
     */
    data.updateValue = function (value, old) {
        if (typeof value !== 'undefined') { 
            data.set(this.getAttribute('name') || this.getAttribute('data-name'), value);
        } else {
            data._delete(this.getAttribute('name') || this.getAttribute('data-name')); 
        }
    };

    data.changed = field => {

        const compare = fieldName => {
            if (typeof data._modelprechange[fieldName] === 'undefined') {
                return true;
            } else {
                if (data._modelprechange[fieldName] != data['field'][fieldName])
                    return true;
            }
            return false;
        };
        if (typeof field !== 'undefined') {

            return compare(field);
        } else {
            let modelsize = 0;
            for (const key in data['field']) {
                if (data.has(data['field'], key)) {
                    modelsize++;
                    if (compare(key))
                        return true;
                }
            }

            if (data._modelpresize !== modelsize)
                return true;
        }


        return false;
    };

    data.jsonPatchToObjectAccess = diff => {
        let path = `[${diff.path.substr(1).split('/').join("][")}]`;
        let normal = $.normalizeChangeResponse(path);
        diff.op = diff.op == "replace"?"value":diff.op;
        return [path, diff.op, data.getOld(normal), diff.value];
    };

    data.compareJsonPatch = (a, b) => {
        let diff = jsonpatch.compare(a ||{}, b||{});
        let final = [];

        for(let i in diff) {
            final.push(data.jsonPatchToObjectAccess(diff[i]));
        }
        return final;
    };

    /**
     *
     * @returns {Array}
     */
    data.getChangedModelFields = () => 
         data.compareJsonPatch(data._modelprechangeReal, data.field);
    
    return data;
})(k_dom));
