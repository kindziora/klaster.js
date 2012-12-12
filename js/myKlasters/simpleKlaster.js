var simpleKlaster = function(self) {
    self.names = {
        'filterbutton' : {
            'click' : function(e) {
                var fields = $($(this).attr('data-connected-fields'));
                
                return fields.toggle();
            },
            'hoover' : function(e) {
                
                return 'ok';
            }
        }
    };
    
    return self;
};

