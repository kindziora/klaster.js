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
            'keyup': function(e, me) {
                if (e.which === 13 && $(this).val() !== '') {
                    me.model.field.todos.push({name: $(this).val(), completed: false});
                    $(this).val('');
                }
            }
        },
        'delete': {
            'click': function(e, m) {
                m.model._delete(this.getName());
            }
        },
        'completed': {
            'click': function(e, m) {
                return !this.getValue('model');
            }
        },
        'todo.name': {
            'dblclick': function(e, m) {
                if ($(this).attr('contenteditable') == "true") {
                    $(this).attr('contenteditable', "false");
                }
                else {
                    $(this).attr('contenteditable', "true");
                }
            }
        },
        'clear-completed': {
            'click': function(e, m) {
                for (var item in m.model.field.todos) {
                    if (m.model.field.todos[item].completed)
                        delete m.model.field.todos[item];
                }
            }
        },
        'toggle-all': {
            'click': function(e, m) {
                for (var item in m.model.field.todos) {
                    m.model.field.todos[item].completed = $(this).is(':checked');
                }
            }
        }
    };

    this.model = {
        'field': {// here we declare model fields, with default values this is not strict default values are only used if we use directive: data-defaultvalues="client" on default we use server side default values because of the first page load
            'todos': [
                {name: 'checkout klaster.js', completed: false}
            ]
        },
        event : {
            sync : (e,s)=>console.log(s.model.field)
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
            length: function(todos, notation, $scope) {
                var length = todos.filter(function(item) {
                    return !item.completed;
                }).length;
                return length + ' item' + ((length === 1) ? '' : 's') + ' left';
            },
            "clearbutton": function(todos, notation, $scope) {
                return intfc.view.render({'item': todos, 'index': notation});
            },
            "foreach->todoliste2": function(todo, index, $field) {
                return intfc.view.render({'index': index, 'todo': todo});
            }
        }
    };
};


var mytodos = new twigInterface();

var length = Object.keys(mytodos.view.views).length, cnt = 1;

for (var v in mytodos.view.views) {
    $.get('view/twigInterface/' + v + '.html.twig').always(function(v) { // preloading alle templates, then init klaster interface
        return function(content) {
            mytodos.view.templates_[mytodos.view.views[v]] = content;
            if (length <= cnt) {
                $k('#todoapp')(mytodos);
            }
            cnt++;
        };
    }(v));
}