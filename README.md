##Description

javascript UI framework, using mvc pattern, scopes and two way databinding.
It aims on rich frontend experiences and simplicity.

##goals

  1. progressive functionality and complexity
  2. easy to work with
  3. easy debugging
 
##current state

html -> model without any additional markup

interface-model-view

better 2 way data binding

filter in templates

foreach in templates

omit toggle

##Examples

gallery (100%)
list (100%)
spa (50%)
todoMVC (60%)
twig example (100%)

##Work in progress

refactoring code
unit test and integration test for the framework and apps

##klaster.js framework code structure


klaster.js
bundling functionality by using following components

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
If you provide some data to the form the sync function gets called.
So if the state of the form does change you could send the json to a backend.

##klaster.js app start using features  

###html


```HTML
<form id="jobform">
  <h2>list</h2>
  <ul data-name="todos" data-view="foreach->todoliste" data-filter="!item.completed">
  ..loading..
  </ul>
</form>
```
###javascript

```javascript

 $('#jobform').klaster({
     'model' : {
        'field' : {
           todos : [{name: "test 1"}, {name: "test 2"},{name: "test 3"}]
        },
        'event' : {
          'sync' : function() {
              console.log(JSON.stringify(this.field));
        }
     }
   },
   'view': {
      'views' : {
        "foreach->todoliste" : function(item) {
            return '<li>' + item.name + '</li>';
        }
      }
   }
 });

```