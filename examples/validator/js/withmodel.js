/**
 * 
 * klaster.js by Alexander Kindziora is a mvma (model-view-model-action) framework for user interfaces
 */

var interface = function() {
    var intfc = this;
    //try it, to commit x milliseconds after last change
    intfc.delay= 100;
    
    this.interactions = {
        "user['email']": {
           'keyup' : function(e, cls) { 
               return cls.validate($(this).getName(), $(this).val(), 'email');
            }
        }
    };
    
    this.validator = {
        /**
         * validate email string
         **/
        'email' : function(value) {
            var re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
            
            return {result: !(value == '' || !re.test(value)), msg : "email ist nicht gültig", view : "validInfo"};
        }
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
            'validInfo': function(data, notation, $scope) {
                var validationResult = this.model.getState(notation);
                if(validationResult.result){
                    return '<div class="alert alert-dismissible alert-success"><strong>Oh yeah!</strong> valid</div>';
                }else{
                    return '<div class="alert alert-dismissible alert-danger"><strong>Oh snap!</strong> ' + validationResult.msg + ' . </div>';
                } 
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