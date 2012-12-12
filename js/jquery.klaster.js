/**
 * klaster is a jquery filter plugin for extended filters by dom rules and javascript based on filter classes
 * @author Alexander Kindziora 2012
 * 
 */
(function( $ ){
    $.fn.klaster = function( child ) {
        var self = this;
        
        self.info = {
            'name' : 'klaster.js',
            'version' : '0.3',
            'tag' : 'alpha',
            'author' : 'Alexander Kindziora',
            'date'  : '2012',
            'copyright' : 'author'
        };
        
        self.values = {};
    
        self.get = function(name, value) {
            return ((typeof self[name] !== 'undefined') ? self[name] : value);
        };
    
        /*
     * gets executed before an event is triggered
     */
        self.pre_trigger = function(e) {
        
            if(typeof child.pre_trigger !== "undefined") 
                return child.pre_trigger.call(this, e);
            return true;
        };
    
        /*
     * gets executed after a change on dom objects
     * "this" is the dom element responsible for the change
     */
        self.changed = function() {
        
            if(typeof child.filter_changed !== "undefined") 
                return child.filter_changed.call(this);
            return true;
        };
    
    
        /**
     *recognize if filter values have changed and call someone
     *@description one common callback for changed is an ajax call with all values to a REST backend to update data
     * 
     */
        self.recognizeChange = {
            changed: function(el) {
                self.changed.call(el);
                delete this.timeoutID;
            },
            setup: function(el) {
                this.cancel();
                var me = this;
                this.timeoutID = window.setTimeout(function(msg) {
                    me.changed(msg);
                }, self.get('delay', 1000), el);
            },
            cancel: function() {
                if(typeof this.timeoutID == "number") {
                    window.clearTimeout(this.timeoutID);
                    delete this.timeoutID;
                }
            }
        };
    
        /*
     * gets executed after an event is triggered
     */
        self.post_trigger = function(e, result) {
            var seen = [];
            $(this).attr('data-value', JSON.stringify(result, function(key, val) {
                if (typeof val == "object") {
                    if (seen.indexOf(val) >= 0)
                        return undefined
                    seen.push(val)
                }
                return val
            }));
        
            if(result != self.values[$(this).attr('data-name')]){
                self.recognizeChange.setup($(this));
                self.values[$(this).attr('data-name')] = result;
            }
        
            if(typeof child.post_trigger !== "undefined") 
                return child.post_trigger.call(this, e);
        
            return true;
        };
        
        /**
         *dispatch events for dom element
         */
        self.dispatchEvents = function() {
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
        self.dispatchFilter = function(byElement) {
        
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
        self.bind = function(element) {
            var events = {}, event = {}, name = "", method ="", fi = "", filterObj = {};
        
            child = child(self);
        
            self.filter = self.dispatchFilter(element);
        
            /* variable injection via lambda function factory used in iteration */
            var factory = function (me, event) {
                return function(e){
                    name = $(me).attr('data-name');
                    method = events[name][event];
                    var result = true;
                    if(false !== self.pre_trigger.call(me, e)) {
                        if(typeof child[name][method] !== 'undefined'){
                            result = child[name][method].call(me, e);
                            console.log(name, method);
                        }
                        self.post_trigger.call(me, e, result);
                    }else{
                        console.log('event ' + event + ' for element:', $(me));
                        console.log('Method "' + method + '" was prevented from executing');
                    }
                }
            };
        
            for(fi in self.filter){
                var filter = self.filter[fi];
            
                filter.fields = filter.$el.find('[data-name]'),
                filter.events = filter.$el.find('[data-on]');
        
                $(filter.events).each(function (ke, el){
                    name = $(this).attr('data-name');
                    events[name] = self.dispatchEvents.call(this);
                    for(event in events[name]) {
                        $(this).on(event, factory(this, event));
                    }
                });
            }
            
        };
        
        self.bind(this);
    };
})( jQuery );