/**
 * klaster is a jquery filter plugin for extended filters by dom rules and javascript based on filter classes
 * @author Alexander Kindziora 2012
 * 
 */
(function( $ ){
    
    $.fn.getName = function() {
        return this.attr('data-name') ? this.attr('data-name') : this.attr('name');
    };
    
    $.fn.nameAttr = function() {
        return this.attr('data-name') ? 'data-name' : 'name';
    }; 
    
    $.fn.toggleOmit = function() {
        this.attr('data-omit', !(this.attr("data-omit") ? (this.attr("data-omit").toLowerCase() == "true") : false));
        return this;
    }; 
 
    $.fn.getValue = function(multiple) {
        var values = [], value, subselect = "", select = "", omitted = false, exists = false;
            
        if(this.attr('type') === "checkbox" || this.attr('type') === "radio" ){
            subselect= ":checked";
            multiple = true;
        }
        
        if(multiple) {
            select = ['[', this.nameAttr(), '="', this.getName(), '"]', subselect].join('');
            exists = !$('[data-omit="true"] ' + select).get(0);
        }else{
            select = this;    
            exists = !this.parents('[data-omit="true"]').get(0);
        }
        
        if(exists){
            $(select).each(function() {
                /**
                 * @todo rethink rewrite
                 */
                if($(this).attr("data-omit") == "true") {
                    omitted = true;
                } 
                value = $(this).val();   
                if(value !=''){
                    values.push(value);
                    return;
                }
                value = (typeof value == 'undefined') ? $(this).text() : value;
                if(typeof value == 'undefined' && $(this).data('value')){
                        value = $(this).data('value');
                }else if(typeof $(this).data('value') == '' && $(this).attr('data-value') != ""){
                    value = $(this).attr('data-value');
                }
                
                values.push(value);         
            });
        }else{
            omitted = true;
        }
        
        if(omitted)return undefined;
        
        return (values.length == 1) ? values[0] : values;
    }
    
    $.fn.setValue = function(value) {
        this.data('value', value);
    }
    
})( jQuery );

(function( $ ){

    $.fn.klaster = function( child ) {
        var cls = $.extend({}, child);
        
        cls.info = {
            'name' : 'klaster.js',
            'version' : '0.5',
            'tag' : 'alpha',
            'author' : 'Alexander Kindziora',
            'date'  : '2012',
            'copyright' : 'author'
        };
        
        cls.values = {};
        
        /**
         *get class property with default value
         */
        cls.get = function(name, value) {
            return ((typeof cls[name] !== 'undefined') ? cls[name] : value);
        };
        
        /*
             * gets executed before an event is triggered
             */
        cls.pre_trigger = function(e) {
        
            if(typeof child.pre_trigger !== "undefined") 
                return child.pre_trigger.call(this, e);
            return true;
        };
    
        /*
             * gets executed after a change on dom objects
             * "this" is the dom element responsible for the change
             */
        cls.changed = function() {
            //cls.updateValues();
            if(typeof child.sync !== "undefined") 
                return child.sync.call(cls, this);
            return true;
        };
    
        cls.updateValue = function(value) {
            if(typeof value !== 'undefined'){
                $(this).setValue(value);
                cls.values[$(this).getName()] = value;
            }else{
                delete cls.values[$(this).getName()];
            }
        };
        
        cls.updateValues = function() {
            $(cls.filter.events).each(function (){
                cls.updateValue.call(this, $(this).getValue());
            });
        };
        
        /**
             *recognize if filter values have changed and call someone
             *@description one common callback for changed is an ajax call with all values to a REST backend to update data
             * 
             */
        cls.recognizeChange = function(){
            var mio = {};
            
            mio.changed = function(el) {
                cls.changed.call(el);
                delete cls.timeoutID;
            };
            
            mio.cancel = function() {
                if(typeof cls.timeoutID == "number") {
                    window.clearTimeout(cls.timeoutID);
                    delete cls.timeoutID;
                }
            };
            
            mio.setup = function(el) {
                mio.cancel();
                cls.timeoutID = window.setTimeout(function(msg) {
                    mio.changed(msg);
                }, cls.get('delay', 1000), el);
            }
            return mio;
        }();
    
        /*
             * gets executed after an event is triggered
             */
        cls.post_trigger = function(e, result) {
            
            if(result != cls.values[$(this).getName()]){
                cls.recognizeChange.setup($(this));
                cls.updateValue.call(this, result);
            }
            
            $(this).setValue(result);
            
            if(typeof child.post_trigger !== "undefined")
                return child.post_trigger.call(this, e);
        
            return true;
        };
        
        /**
             *dispatch events for dom element
             */
        cls.dispatchEvents = function() {
            var events = $(this).attr('data-on').split(','), i = 0, event = "", FinalEvents = {};
            var method = "", parts = "";
        
            for(i in events) {
                event = $.trim(events[i]);
                parts = event.split('->');
                if(parts.length > 1){
                    method =  parts[1];
                    event = parts[0];
                }else{
                    method =  parts[0];
                    event = parts[0];
                }
                FinalEvents[event] = method;
            }
            return FinalEvents;
        };
    
        /**
             * find all filters and init there configs
             */
        cls.dispatchFilter = function(byElement) {
            return {
                'object' : child,
                '$el' : byElement
            };
        };
    
        /**
             * bind dom to matching methods
             */
        cls.bind = function(element) {
            var events = {}, event = {}, name = "", method ="";
        
            cls.filter = cls.dispatchFilter(element);
            cls.$el = element;
            
            /* variable injection via lambda function factory used in iteration */
            var factory = function (me, event) {
                return function(e){
                    name = $(me).getName();
                    method = events[name][event];
                    var result = true;
                    if(false !== cls.pre_trigger.call(me, e)) {
                        if(typeof child[name] !== 'undefined' &&
                            typeof child[name][method] !== 'undefined'){
                            
                            result = child[name][method].call(me, e, cls);
                            
                            if($(me).attr('data-omit') == "true"){
                                result = $(me).getValue();
                            }
                            
                        }else{
                            result = $(me).getValue();
                        }
                        //console.log(name, method);
                        cls.post_trigger.call(me, e, result);
                        
                    }else{
                        //console.log('event ' + event + ' for element:', $(me));
                       // console.log('Method "' + method + '" was prevented from executing');
                    }
                   
                }
            }; 
     
            //filter.fields = filter.$el.find('[name],[data-name]'),
            cls.filter.events = cls.filter.$el.find('[data-on]');
            
            $(cls.filter.events).each(function (){
                name = $(this).getName();
                events[name] = cls.dispatchEvents.call(this);
                for(event in events[name]) {
                    $(this).on(event, factory(this, event));
                    cls.updateValue.call(this, $(this).getValue());
                    console.log('Bind ', event, $(this));
                }
            });
        };
        
        cls.bind(this);
        
        if(typeof child._methods !== "undefined" && child._methods.init !== "undefined"){
            if(child._methods.init(cls)) {
                cls.recognizeChange.setup();
            }
        }
        
    };
})( jQuery );