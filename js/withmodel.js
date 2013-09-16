var bodyController = function() {
    //this.delay = 0;

    this.actions = {
        'filterbutton': {
            'click': function(e, controller) {
                var $checks = $($(this).attr('data-connected'));
                $checks.toggleOmit().toggle(200);
                console.log(controller);
                //controller.model.values.words = 'none';
                return $checks.attr('data-omit');
            }
        }
    };

    this.change = function(el) {
        $('#json-preview').html(JSON.stringify(this.model.values));
        //two way data binding

    };

    return this;
}.bind({
    model: {// bind model to our controller
        'onchange': {
            search: function($field, value, old, reference) {
                this.values.words = this.values.search.split(' ').length;
                console.log('search', value, old, reference);
            },
            words: function($field, value, old, reference) {
                console.log('words', value, old, reference);

                //console.log($field.getValue(), reference);
            }

        },
        'values': {// here we could declare model default values
            'search': 'hallo welt'
        }
    }
});

$('body').klaster(bodyController());