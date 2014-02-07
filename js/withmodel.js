var interface = function() {
    var intfc = this;

    this.actions = {
        'todo': {
            'keyup': function(e) {
                if (e.which === 13)
                    intfc.model.field.todos.push($(this).val());
            }
        },
        'todo.delete': {
            'click': function(e) {
                var todos = intfc.model.field.todos;
                var index = todos.indexOf($(this).attr('data-value'));
                if (index > -1) {
                    todos = todos.splice(index, 1);
                    $(this).closest('.li').remove();
                }
            }
        },
        'todos[2]': {
            'click': function(e) {

                $(this).closest('.li').remove();

            }
        }
    };

    this.model = {
        'field': {// here we declare model fields, with default values this is not strict default values are only used if we use directive: data-defaultvalues="client" on default we use server side default values because of the first page load
            'todos': ['todo1', 'tofsdf ']
        },
        'change': {},
        'changed': function() { //after model fields have changed
            $('#json-preview').html(JSON.stringify(this.field));
        }
    };

    this.view = {
        field: {
            todo: function(value, $field) {
                return "<strong>" + value + "</strong>";
            },
            'todos[*]' :  function(value, $field) {
                "<a data-name='todo.delete' data-on='click' data-value='" + val + "'>delete</a>"
            }
        },
        views: {
            length: function(todos) {
                return todos.length;
            },
            todoliste: function(todos, $field) {
                var list = [], $delete, $editto;
                todos.forEach(function(val, index) {
                    list.push("<li data-omit='true' data-name='todos[" + index + "]'>" + val + " </li>");
                });
                return list.join('');
            }
        }
    };
};

$('body').klaster_(new interface()); 