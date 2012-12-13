/**
 * klaster is a jquery filter plugin for extended filters by dom rules and javascript based on filter classes
 * @author Alexander Kindziora 2012
 * 
 */
(function( $ ){
    $.fn.klaster = function( child ) {
        var self = this, cls = {};
        
        cls.info = {
            'name' : 'klaster.js',
            'version' : '0.3',
            'tag' : 'alpha',
            'author' : 'Alexander Kindziora',
            'date'  : '2012',
            'copyright' : 'author'
        };
        
        cls.values = {};
    
        cls.get = function(name, value) {
            return ((typeof cls[name] !== 'undefined') ? cls[name] : value);
        };
        
        $.fn.getName = function() { 
            if(this.attr('data-name')){
                return this.attr('data-name');
            }else if(this.attr('name')){
                return this.attr('name');
            }
            return 'no name defined';
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
        
            if(typeof child.filter_changed !== "undefined") 
                return child.filter_changed.call(this);
            return true;
        };
    
    
        /**
     *recognize if filter values have changed and call someone
     *@description one common callback for changed is an ajax call with all values to a REST backend to update data
     * 
     */
        cls.recognizeChange = function(){
            var mio = this;
            
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
            var seen = [];
            $(this).attr('data-value', JSON.stringify(result, function(key, val) {
                if (typeof val == "object") {
                    if (seen.indexOf(val) >= 0)
                        return undefined
                    seen.push(val)
                }
                return val
            }));
        
            if(result != cls.values[$(this).getName()]){
                cls.recognizeChange.setup($(this));
                cls.values[$(this).getName()] = result;
            }
        
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
        
            if(typeof byElement === 'undefined')
                byElement = $('[data-filter]');
        
            var filtersFinal = {};
        
            byElement.each(function(){
                var name = $(this).attr('data-filter');
                filtersFinal[name] = {
                    'object' : child,
                    '$el' : $(this)
                };
            });
        
            return filtersFinal;
        };
    
        /**
     * bind dom to matching methods
     */
        cls.bind = function(element) {
            var events = {}, event = {}, name = "", method ="", fi = "", filterObj = {};
        
            child = child(cls);
        
            cls.filter = cls.dispatchFilter(element);
        
            /* variable injection via lambda function factory used in iteration */
            var factory = function (me, event) {
                return function(e){
                    name = $(me).getName();
                    method = events[name][event];
                    var result = true;
                    if(false !== cls.pre_trigger.call(me, e)) {
                        if(typeof child[name][method] !== 'undefined'){
                            result = child[name][method].call(me, e);
                            console.log(name, method);
                        }
                        cls.post_trigger.call(me, e, result);
                    }else{
                        console.log('event ' + event + ' for element:', $(me));
                        console.log('Method "' + method + '" was prevented from executing');
                    }
                }
            };
        
            for(fi in cls.filter){
                var filter = cls.filter[fi];
            
                //filter.fields = filter.$el.find('[name],[data-name]'),
                filter.events = filter.$el.find('[data-on]');
                
                $(filter.events).each(function (ke, el){
                    name = $(this).getName();
                    events[name] = cls.dispatchEvents.call(this);
                    for(event in events[name]) {
                        $(this).on(event, factory(this, event));
                    }
                });
            }
            
        };
        
        cls.bind(this);
    };
})( jQuery );