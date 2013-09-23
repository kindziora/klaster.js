var interface = function() {
   
    this.actions = {
        'filterbutton': {
            'click': function(e, interface) {
                var $checks = $($(this).attr('data-connected'));
                $checks.toggleOmit().toggle(200);
                //interface.model.values.words = 'none';
                return $checks.attr('data-omit');
            }
        }
    };

    this.model = {
        'field': {// here we declare model fields, with default values this is not strict default values are only used if we use directive: data-defaultvalues="client" on default we use server side default values because of the first page load
            'search': 'hallo welt'
        },
        'change': {
            'search': function(newVal) {

                this.field.words = newVal.split(' ').length;
            }
        },
        'changed': function() { //after model fields have changed
            $('#json-preview').html(JSON.stringify(this.field));
        }
    };

    this.view = {
        field: {
            search: function(value, $field) { 
                return "<strong>" + value + "</strong>";
            }
        },
        views: {
            suchliste: function(value, $field) {
                var list = [];
                value.split(',').forEach(function(val) {
                    list.push("<li>" + val + "</li>")
                });
                return list.join('');
            }
        }
    };
    
};

$('body').klaster(new interface());