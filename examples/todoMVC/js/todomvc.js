/**
 * 
 * klaster.js by Alexander Kindziora is a mvma (model-view-model-action) framework for user interfaces
 */

var interface = function() {
    var intfc = this;
    this.interactions = {
        'filterbutton': {
            'click': function(e, ui) {
                var $areaToToggle = $($(this).attr('data-connected'));
                ui.toggle($areaToToggle).slideToggle(200);
            }
        },
        'todo': {
            'keyup': function(e) {
                if (e.which === 13) {
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
        'todos[*].name': {
            'dblclick': function(e) {
                if ($(this).attr('contenteditable') == "true") {
                    $(this).attr('contenteditable', "false");
                }
                else {
                    $(this).attr('contenteditable', "true");
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
        event: {
            'sync': function() { //after model fields have changed
                $('#json-preview').html(JSON.stringify(this.field));
            }
        }

    };
    this.view = {
        views: {
            'todos[*]': function(value, index) {
                return  '<div class="view">' +
                        '<input class="toggle" type="checkbox" name="todosCompleted" data-name="' + index + '.completed" data-multiple="false" data-on="click" ' + ((value.completed) ? 'checked="' + value.completed + '"' : '') + ' />'
                        + '<label data-on="dblclick->todos[*].name" data-name="' + index + '.name">' + value.name + "</label>"
                        + "<button class='destroy' data-name='todo.delete' data-on='click' data-omit='true' data-value='" + value.name + "'></button>"
                        + "</div>"

            },
            length: function(todos, notation, $scope) {
                return todos.filter(function() {
                    return true;
                }).length;
            },
            "foreach->todoliste2": function(todos, index, $field) {
                return "<li class='" + ((todos[index].completed) ? 'completed' : '') + "' data-name=\"todos[" + index + "]\">" + intfc.view.views['todos[*]'](todos[index], 'todos[' + index + ']') + "</li>";
            }
        }
    };
};
$('#todoapp').klaster_(new interface());
