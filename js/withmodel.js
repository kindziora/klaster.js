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
                if (e.which === 13)
                    interface.model.field.todos.push($(this).val());

            }
        },
        'todo.delete': {
            'click': function(e) {
                var todos = interface.model.field.todos;
                var index = todos.indexOf($(this).attr('data-value'));
                if (index > -1) {
                    todos = todos.splice(index, 1);
                    $(this).closest('.li').remove();
                }
            }

        }
    };

    this.model = {
        'field': {// here we declare model fields, with default values this is not strict default values are only used if we use directive: data-defaultvalues="client" on default we use server side default values because of the first page load
            'search': 'hier eingeben',
            'todos': []
        },
        'change': {
            'todos': function(value) {
                console.log('todos:' + value);
            }
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
                    list.push("<li data-omit='true' data-name='todos[" + index + "]'>" + val + " <a data-name='todo.delete' data-on='click' data-value='" + val + "'>delete</a></li>")
                });
                return list.join('');
            }
        }
    };

};

$('body').klaster(new interface());