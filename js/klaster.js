/**
 * klaster is a filter class for extended filters by dom rules and javascript based on filter classes
 * @author Alexander Kindziora 2012
 * 
 */
var klaster = function(child) {
    var self = $.extend(true, {}, child); // clone child object
    
    self.values = {};
    
    /*
     * gets executed before an event is triggered
     */
    self.pre_trigger = function(e) {
        
        if(typeof child.pre_trigger !== "undefined") 
            return child.pre_trigger.call(this, e);
        return true;
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
        self.values[$(this).attr('data-name')] = result;
        
        if(typeof child.post_trigger !== "undefined") 
            return child.post_trigger.call(this, e);
        
        return true;
    };
    
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
     * bind dom to matching methods
     */
    self.bind = function() {
        var events = {}, event = {}, name = "", method ="";
        self.fields = $(self.area).find('[data-name]'),
        self.events = $(self.area).find('[data-on]');
        
        /* variable injection via lambda function factory used in iteration */
        var factory = function (me, event) {
            return function(e){
                name = $(me).attr('data-name');
                method = events[name][event];
                var result = true;
                if(false !== self.pre_trigger.call(me, e)) {
                    if(typeof self.names[name][method] !== 'undefined'){
                        result = self.names[name][method].call(me, e);
                        console.log(name, method);
                    }
                    self.post_trigger.call(me, e, result);
                }else{
                    console.log('event ' + event + ' for element:', $(me));
                    console.log('Method "' + method + '" was prevented from executing');
                }
            }
        };
        
        $(self.events).each(function (ke, el){
            name = $(this).attr('data-name');
            events[name] = self.dispatchEvents.call(this);
            for(event in events[name]) {
                $(this).on(event, factory(this, event));
            }
        });
        
    };
    
    return function() {
        if(typeof self.area === 'undefined'){
            self.area = $('body');
        }
        self.bind();
        
        console.log(child, self);
        
        return self;
    }();
};
 

