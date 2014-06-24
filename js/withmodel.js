var interface = function() {
    var intfc = this;

    this.actions = {
        'todo': {
            'keyup': function(e) {
                if (e.which === 13) {
                    intfc.model.field.todos.push($(this).val());
                    $(this).val('');
                }
            }
        },
        'todosCompleted': {
            'click': function(e) {
                
                var todos = intfc.model.field.todosCompleted;
                
                var index = todos.indexOf($(this).getValue());
                
                if (index > -1) {
                    todos = todos.splice(index, 1);
                    $(this).closest('.li').addClass('icon-ok');
                }else{
                    todos.push($(this).getValue(false));
                    $(this).closest('.li').removeClass('icon-ok');
                }
                
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
                alert(e);
            }
        }
    };

    this.model = {
        'field': {// here we declare model fields, with default values this is not strict default values are only used if we use directive: data-defaultvalues="client" on default we use server side default values because of the first page load
            'todos': ['todo1', 'tofsdf '],
            'todosCompleted' : ['todo1', 'tofsdf ']
        },
        'change': {
            'todosCompleted' : function(){
                console.log('fertige todos hat sich geändert', arguments);
            }
        },
        'changed': function() { //after model fields have changed
            $('#json-preview').html(JSON.stringify(this.field));
        }
    };

    this.view = {
        field: {
            'todos[*]': function(value, $field, name) {
                return  '<input type="checkbox" data-name="todosCompleted" value="' + value + '" data-on="click" />'
                        + value + " <a data-name='todo.delete' data-on='click' data-value='" + value + "'>delete</a> ";
            }
        },
        views: {
            length: function(todos) {
                return todos.length;
            },
            todoliste: function(todos, $field) {
                var list = [];
                todos.forEach(function(val, index) {
                    list.push("<li data-name=\"todos[" + index + "]\"></li>");
                });
                return list.join('');
            }

        }
    };
};

$('body').klaster_(new interface()); 