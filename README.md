##Description

javascript UI framework, using the dom to bind events to elements.
It aims on rich frontend experiences.

##goals

  1. simple structure
  2. easy debugging
  3. easy to work with

##examples

###Basic example

  html
  
      <div id="test">
        <div data-on="click,hover->mouseover" data-name="hello">hello world</div>
      </div>
  javascript
    
    $('#test').klaster({
      hello : {
        'click' : function(e) {},
        'mouseover' : function(e) {}
      }
      
    });
  
This example shows how markup and code are connected.
You see instantly what events are bound to the element, just by a look at the HTML.


###Second example

  html
  
      <div id="test">
        <select name="number" data-on="change">
            <option>no</option>
            <option>yes</option>
        </select>
        <div data-on="click" data-name="hello" data-value="23">hello world 23</div>
        <div data-on="click" data-name="hello" data-value="5">hello world 5</div>
      </div>
  javascript
    
    $('#test').klaster({
      'sync': function(el) {
          $.ajax({
            url: "exampleSaveDataToBackendUrl",
            data: this.values
          });
      }
    });
  
This example shows how to sync data with a backend.
As you cann see by the dom "number" is gets his values by change and "hello" on a click.
The "sync" function gets executed if data has changed, all values are accessible via this.values




