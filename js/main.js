


//variante a
var jobfilter = function (self){
    return {
        'delay': 1000,                    //1000 ms is default
        'filterbutton' : {                //$('[data-name="filterbutton"]')
            'click' : function(e) {
                var fields = $($(this).attr('data-connected'));
                fields.toggle();
                return "toggled";
            },
            'hoover' : function(e) {
                
                return 'ok';
            }
        },
        'number' : {                     //$('[data-name="number"]')
            'change': function(e){
                return $(this).val();
            }
        },
        'filter_changed' : function(el){ // executed with a delay after the last filter change
            /**
             * @todo ajax call
             */
            console.log('commiting changes', self.values);
        }
    }
};

//variante b
var jobfilter = function (self){
    this.delay = 1000;
    
    this.filterbutton = {                //$('[data-name="filterbutton"]')
        'click' : function(e) {
            var fields = $($(this).attr('data-connected'));
            fields.toggle();
            return "toggled";
        },
        'hoover' : function(e) {
                
            return 'ok';
        }
    };
    
    this.number = {                     //$('[data-name="number"]')
        'change': function(e){
            return $(this).val();
        }
    };
    
    this.filter_changed = function(el){ // executed with a delay after the last filter change
        /**
             * @todo ajax call
             */
        console.log('commiting changes', self.values);
    };
    
    return this;
};


$('.controll-box').klaster( jobfilter );

