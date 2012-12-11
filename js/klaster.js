/**
 * klaster is a filter class for extended filters by dom rules and javascript based on filter classes
 * @author Alexander Kindziora 2012
 * 
 */
var klaster = function(parent) {
    var self = parent;
    
    /*
     * gets executed before an event is triggered
     */
    self.pre_trigger = function(e) {
        
        if(typeof parent.pre_trigger !== "undefined") 
            return parent.pre_trigger.call(this, e);
        return true;
    };
    
    /*
     * gets executed after an event is triggered
     */
    self.post_trigger = function(e) {
        self.values[$(this).attr('data-name')] = $(this).attr('data-value');
        
        if(typeof parent.post_trigger !== "undefined") 
            return parent.post_trigger.call(this, e);
        
        return true;
    };
    
    self.bind = function() {
        var event = "";
        self.fields = $(self.area).find('[data-name]'),
        self.events = $(self.area).find('[data-event]');
        
        $(self.events).each(function (ke, el){
            $(this).on($(this).attr('data-event'), function (e) {
                
                if(false !== self.pre_trigger.call(this, e)) {
                    self[$(this).attr('data-event')].call(this, e);
                    self.post_trigger.call(this, e);
                }else{
                    console.log('event ' + $(this).attr('data-event') + ' for element:', $(this));
                    console.log('was stopped by ');
                }
                
            });
        });
        
    };
    
    
    return function() {
        if(typeof parent.area === 'undefined'){
            parent.area = $('body');
        }
        
        
        
        return self;
    }();
};
 

