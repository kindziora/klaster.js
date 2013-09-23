var interface = function() {

    this.actions = {
        'toggleall': {
            'change': function(e, interface) {
                var checkBoxes = $('#todo-list input[name="toggle"]');
                checkBoxes.attr("checked", !checkBoxes.attr("checked"));
            }
        }
    };

    this.model = {
        'field': {// here we declare model fields, with default values this is not strict default values are only used if we use directive: data-defaultvalues="client" on default we use server side default values because of the first page load
            'todo.status': ''
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