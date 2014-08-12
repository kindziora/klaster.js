/**
 * 
 * klaster.js by Alexander Kindziora 2014 
 * 
 * is a mva (model-view-action) framework for user interfaces
 * 
 */
var twigInterface = function() {
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
        render: function(tplVars, tplName) {
            return twig({
                data: intfc.view.templates_[tplName || arguments.callee.caller]
            }).render(tplVars);
        },
        views: {
            'todos[*]': function(value, index) {
                return intfc.view.render({'value': value, 'index': index});
            },
            length: function(todos, notation, $scope) {
                var length = todos.filter(function(item) {
                    return !item.completed;
                }).length;
                return length + ' item' + ((length === 1) ? '' : 's') + ' left';
            },
            "clearbutton": function(todos, notation, $scope) {
                return intfc.view.render({'item': todos, 'index': notation});
            },
            "foreach->todoliste2": function(todos, index, $field) {
                var content = intfc.view.views['todos[*]'](todos[index], 'todos[' + index + ']');
                return intfc.view.render({'content': content, 'index': index, 'todos': todos});
            }
        }
    };
};


var mytodos = new twigInterface();

var length = Object.keys(mytodos.view.views).length, cnt = 1;

for (var v in mytodos.view.views) {
    $.get('view/twigInterface/' + v + '.html.twig').always(function(v) {
        return function(content) {
            mytodos.view.templates_[mytodos.view.views[v]] = content;
            if (length <= cnt) {
                $('#todoapp').klaster_(mytodos);
            }
            cnt++;
        };
    }(v));
}