var interface = function() {
    var interface = this;
    this.actions = {
        'filterbutton': {
            'click': function(e, interface) {
                var $checks = $($(this).attr('data-connected'));
                $checks.toggleOmit().toggle(200);
                //interface.model.values.words = 'none';
                return $checks.attr('data-omit');
            }
        },
        'todo': {
            'keyup': function(e) {
                if (e.which === 13) {
                    interface.model.field.todos.push($(this).val());
                }
            }
        }
    };

    this.model = {
        'field': {// here we declare model fields, with default values this is not strict default values are only used if we use directive: data-defaultvalues="client" on default we use server side default values because of the first page load
            'search': 'hallo welt',
            'todos': []
        },
        'change': {
            'todos': function(value) {
                console.log('todos:' + value);
            },
        },
        'changed': function() { //after model fields have changed
            $('#json-preview').html(JSON.stringify(this.field));
        }
    };

    this.view = {
        field: {
            todo: function(value, $field) {
                return "<strong>" + value + "</strong>";
            }
        },
        views: {
            length: function(todos) {
                return todos.length;
            },
            todoliste: function(todos, $field) {
                var list = [];
                todos.forEach(function(val, index) {
                    list.push("<li data-name='todos[" + index + "]'>" + val + "</li>")
                });
                return list.join('');
            }
        }
    };

};

$('body').klaster(new interface());