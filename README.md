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

##klaster.js app todo example 
using:
-filter
-data model
-views

###html

```HTML
<form id="jobform" data-defaultvalues="model">
  <h2>list</h2>
   <input type="checkbox" name="onlycompleted" data-on="change" /> only completed todos
  <ul data-name="todos" data-view="foreach->todo" data-filter="this.completed">
  ..loading..
  </ul>
</form>
```
###javascript

```javascript

 $('#jobform').klaster({
     'interactions': {
        'onlycompleted' : {
            'change' : function(e){
            
              $('[data-view="foreach->todo"]').attr('data-filter',
                    $(this)[0].checked ? "!this.completed" : "this.completed"
              ); 
              
            }
        }
     },
     'model' : {
        'field' : {
           todos :[{
                    "name": "test 1",
                    "completed": false
                  },
                  {
                    "name": "test 2",
                    "completed": false
                  },
                  {
                    "name": "test 3",
                    "completed": true
                  }]
        },
        'event' : {
          'sync' : function() {
              console.log(JSON.stringify(this.field));
        }
     }
   },
   'view': {
      'views' : {
        "foreach->todo" : function(item) {
            return '<li>' + item.name + '</li>';
        }
      }
   }
 });

```
