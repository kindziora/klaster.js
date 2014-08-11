/**
 * 
 * klaster.js by Alexander Kindziora 2014 
 * 
 * is a mva (model-view-action) framework for user interfaces
 * 
 */
var interface = function() {
    var intfc = this;
    this.interactions = {
        'toggle': {
            'click': function(e, ui) {
                $('.selected').removeClass('selected');
                $(this).addClass('selected');
                $('#todo-list').attr('data-filter', $(this).attr('data-value'));
            }
        },
        'todo': {
            'keyup': function(e) {
                if (e.which === 13 && $(this).val() !== '') {
                    intfc.model.field.todos.push({name: $(this).val(), completed: false});
                    $(this).val('');
                }
            }
        },
        'todo.delete': {
            'click': function(e) {
                var todoname = $(this).parent().parent().getName();
                intfc.model._delete(todoname);
            }
        },
        'todo.name': {
            'dblclick': function(e) {
                if ($(this).attr('contenteditable') == "true") {
                    $(this).attr('contenteditable', "false");
                }
                else {
                    $(this).attr('contenteditable', "true");
                }
            }
        },
        'clear-completed': {
            'click': function(e) {
                for (var item in intfc.model.field.todos) {
                    if (intfc.model.field.todos[item].completed)
                        delete intfc.model.field.todos[item];
                }
            }
        },
        'toggle-all': {
            'click': function(e) {
                for (var item in intfc.model.field.todos) {
                    intfc.model.field.todos[item].completed = $(this).is(':checked');
                }
            }
        }
    };

    this.model = {
        'field': {// here we declare model fields, with default values this is not strict default values are only used if we use directive: data-defaultvalues="client" on default we use server side default values because of the first page load
            'todos': [
                {name: 'checkout klaster.js', completed: false}
            ]
        }
    };

    this.filter = {
        activeTodoExist: function(items) {
            return items.filter(function(item) {
                return item.completed;
            }).length > 0;
        }
    };

    this.view = {
        templates_: {},
        templates: function(name) {
            if (typeof this.templates_[name] === 'undefined') {
                alert('template not ready!');
            }
            return this.templates_[name];
        },
        render: function(tplVars, tplName) {
            return twig({
                data: intfc.view.templates(tplName || arguments.callee.caller.name)
            }).render(tplVars);
        },
        views: {
            'todos[*]': function(value, index) {
                return this.render({'item': value, 'index': index});
            },
            length: function(todos, notation, $scope) {
                var length = todos.filter(function(item) {
                    return !item.completed;
                }).length;
                return  length + ' item' + ((length === 1) ? '' : 's') + ' left';
            },
            "clearbutton": function(todos, notation, $scope) {
                return this.render({'item': value, 'index': index});
            },
            "foreach->todoliste2": function(todos, index, $field) {
                var content = intfc.view.views['todos[*]'](todos[index], 'todos[' + index + ']');
                return this.render({'content': content, 'index': index});
            }
        }
    };
};


var mytodos = new interface();

for (var v in mytodos.view.views) {
    $.get('view/twigInterface/' + v + '.html.twig', function(content) {
        if (typeof content !== 'undefined')
            mytodos.view.templates_[v] = content;
    });
}

$('#todoapp').klaster_(mytodos);



