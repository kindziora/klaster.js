$('.controll-box').klaster( {
    'filterbutton' : {
        'click' : function(e) {
            var $checks = $($(this).attr('data-connected'));
            $checks.toggleOmit().toggle(200);
            return $checks.attr('data-omit');
        }
    }, 
    'klaster' : function(el){
        $('#json-preview').html(JSON.stringify(this.values));
       //prettyPrint();
    }
});

