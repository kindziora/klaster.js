/**
 * 
 * klaster.js by Alexander Kindziora is a mvma (model-view-model-action) framework for user interfaces
 */

var interface = function() {
    var intfc = this;
    //this.delay = 1000; //try it, to commit x milliseconds after last change
    intfc.delay= 1000;
    this.interactions = {
        'todo': {
            'keyup': function(e) {
                if (e.which === 13) {
                    intfc.model.field.todos.push({name: $(this).val(), completed: false});
                    $(this).val('');
                }
            }
        },
    };
    
    this.model = {
        'field': {// here we declare model fields, with default values this is not strict default values are only used if we use directive: data-defaultvalues="client" on default we use server side default values because of the first page load
            'search': 'go for it...',
            user: {
                'name': "sdsd0",
                'age': 23567567,
                'email': "sdffsdf@sd.de"
            }
        },
        'event': {
            'sync': function() { //after model fields have changed
                console.log(JSON.stringify(this.field));
            }
        }

    };
    
    this.view = {
        views: {
            length: function(todos, notation, $scope) {
                
                return todos.filter(function() {
                    return true;
                }).length;
                
            },
            email: function(emails, notation, $scope) {
                var mails = emails.split(',');
                var html = "";
                for(var i in mails) {
                    html += '<p>' + mails[i] + '</p>'
                } 
                return html;
            }
        }
    };
    
    
};

$('body').klaster(new interface());