
function bool(value) {
   return value ? (value.toLowerCase() == "true") : false;
}

$('.controll-box').klaster( {
    'delay': 10,
    'filterbutton' : {                //$('[data-name="filterbutton"]')
        'click' : function(e) {
            e.preventDefault();
            var $fields = $($(this).attr('data-connected'));
            
            $fields.attr('data-omit', !bool($fields.attr('data-omit')));
            
            $fields.toggle(200);
            return $fields.attr('data-omit');
        }
    },
    'klaster' : function(el){ // executed with a delay after the last filter change
        /**
        * @todo ajax call
        */
        console.log('commiting changes', this.values);
    }
} );

