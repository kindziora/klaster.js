var bodyController = function() {
    //this.delay = 0;

    this.actions = {
        'filterbutton': {
            'click': function(e, controller) {
                var $checks = $($(this).attr('data-connected'));
                $checks.toggleOmit().toggle(200);

                //controller.model.values.words = 'none';
                return $checks.attr('data-omit');
            }
        }
    };

    this.change = function(el) {
        $('#json-preview').html(JSON.stringify(this.model.fields));
        //two way data binding

    };

    return this;
}.bind({
    model: {// bind model to our controller
        'fields': {// here we declare model fields, with default values this is not strict
            'search': 'hallo welt'
        },
        'onchange': {
            search: function($field, value, old, reference) {
                this.fields.words = this.fields.search.split(' ').length;

            },
            words: function($field, value, old, reference) {
                console.log('words', value, old, reference);
            }
        }
    }
});

$('body').klaster(bodyController());