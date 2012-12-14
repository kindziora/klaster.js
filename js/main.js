
$('.controll-box').klaster( {
    'filterbutton' : {                //$('[data-name="filterbutton"]')
        'click' : function(e) {
            e.preventDefault();
            $($(this).attr('data-connected')).toggle(200);
        }
    },
    'art': {
        'click' : function(e) {
            var checked = [];
            $('[name="' + $(this).getName() + '"]:checked').each(function() {
                checked.push($(this).val());
            });
            return checked;
        }
    },
    'klaster' : function(el){ // executed with a delay after the last filter change
        /**
        * @todo ajax call
        */
       
       
        console.log('commiting changes', this.values);
    }
} );

