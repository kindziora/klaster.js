$('.controll-box').klaster(function (self){
    return {
        'filterbutton' : {
            'click' : function(e) {
                var fields = $($(this).attr('data-connected'));
                fields.toggle();
                return "toggled";
            },
            'hoover' : function(e) {
                
                return 'ok';
            }
        },
        'number' : {
            'change': function(e){
                return $(this).val();
            }
        },
        'filter_changed' : function(el){
            /**
             * @todo ajax call
             */
            console.log('commiting changes', self.values);
        }
    }
});

