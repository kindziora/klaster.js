##Description

javascript UI framework, using mvc pattern, scopes and two way databinding.
It aims on rich frontend experiences and simplicity.

##goals

  1. progressive functionality and complexity
  2. fast & easy to work with
  3. easy debugging

##coming features

server to client 2 way databinding via nodejs

##Examples

see repo

##Work in progress

refactoring code
unit test and integration test for the framework and apps

##klaster.js framework code structure

klaster.js --bundling functionality by using components

dom --dom related methods and code

data --model and data related handling

structure --contains class scheme

##klaster.js minimal app 

###html


```html 

 
 <form id="jobform">
   <input name="username" />
   <input name="age" />
   <input type="checkbox"  name="job" value="freelancer" /> freelancer
   <input type="checkbox"  name="job" value="boss" /> boss
 </form>
 
 

```
###javascript

```javascript

 $('#jobform').klaster({
     'model' : {
        'event' : {
          'sync' : function() {
              console.log(JSON.stringify(this.field));
        }
     }
   }
 });

```

So what does this code?
The form will be bond to a data model.
So if the state of the form does change you could send the json to a backend.

##klaster.js validation 
using:

-validators

-data model

-views

###javascript

```javascript

var interface = function() {
    var intfc = this;
    intfc.delay= 100; //try it, to commit x milliseconds after last change
    
    this.interactions = {
        "user['email']": {
           'keyup' : function(e, cls) { 
               return cls.validate($(this).getName(), $(this).val(), 'email');
            }
        }
    };
    
    this.validator = {
        /** validate email string **/
        'email' : function(value) {
            var re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
            var isValid = !(value == '' || !re.test(value));
            return {
                result: isValid,
                msg : "email ist nicht gültig",
                view : "validInfo"
            };
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
```


```html
<form class="form-horizontal">
  
<fieldset>
  <legend>example</legend>

   <div class="form-group">
    <label for="inputSearch" class="col-lg-2 control-label">Suche</label>
    <div class="col-lg-10">
      <input type="text" class="form-control" id="inputSearch" name="search" placeholder="feed me ..." data-on="keyup" />
    </div>
  </div>
       
  <div class="form-group">
    <label for="inputEmail" class="col-lg-2 control-label">Emails</label>
    <div class="col-lg-10">
      <input type="text" class="form-control" id="inputEmail" data-name="user['email']" placeholder="dfsd@sd.de,dsds@dfd.de" data-on="keyup" />
     
     <div data-name="user['email']" data-view="validInfo">
     </div>
      
    </div>
  </div>
  
  <div class="form-group">
    <label for="inputPassword" class="col-lg-2 control-label">Password</label>
    <div class="col-lg-10">
      <input type="password" class="form-control" id="inputPassword" placeholder="Password" data-name="user['password']" data-on="keyup" />
      <div class="checkbox">
        <label>
          <input type="checkbox" data-name="agb" data-on="change"> agb 
        </label>
      </div>
    </div>
  </div>
  
  <hr/>     
  <div class="panel panel-danger">
    <div class="panel-heading">
      <h3 class="panel-title">Suche</h3>
    </div>
    <div class="panel-body" data-name="search"></div>
  </div>
  
  <div class="panel panel-danger">
    <div class="panel-heading">
      <h3 class="panel-title">E-Mails</h3>
    </div>
    <div class="panel-body" data-name="user['email']" data-view="email"></div>
  </div>

</fieldset>

</form>
```
