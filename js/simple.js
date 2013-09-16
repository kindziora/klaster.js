var bodyController = function() {
    //this.delay = 0;
    
    this.actions = {
        'filterbutton': {
            'click': function(e, controller) {
                var $checks = $($(this).attr('data-connected'));
                $checks.toggleOmit().toggle(200);
                console.log(controller);
                controller.model.values.words = 'none';
                return $checks.attr('data-omit');
            }
        }
    };

    this.change = function(el) {
        $('#json-preview').html(JSON.stringify(this.model.values));
        //two way data binding
        this.model.values.words = this.model.values.search.split(' ').length;
    };

};


$('body').klaster(new bodyController());