var cache = function() {
  var store = window.localStorage;
  var ns = 'c_';
  
      window.setInterval(function() {
        for (var i = 0; i < localStorage.length; i++){
            if(localStorage.key(i).indexOf('ns') !== -1) {
                var k = localStorage.key(i);
                this.checkTTL(localStorage.getItem(k), k);
            }
        }
      }, 60000);
      
      function checkTTL(data, key) {
        var entry = JSON.parse(data); 
        var now = new Date().getTime();
        if( now > entry.ttl ){
          this.remove(key);
        }else{
            return entry;
        }
      }
      
      this.set =  function(key, value, ttl){
        var time = new Date(); 
        time.setTime(time.getTime() + ttl); 
        
        try{
             store.setItem(ns + key, JSON.stringify({
              ttl: time.getTime(),
              content: value
            }));
        }catch(e){
            this.remove(localStorage.key(0));
            this.set.call(this, key, value, ttl);
        }
        
      };
      
      this.get = function(key){
        var data = store.getItem(ns + key);
        if (!data){
          return null;
        }
        return checkTTL(data, ns + key);
      };
      
      this.remove = function(key){
        store.removeItem(ns + key);
      };
      
      this.clear = function(){
        store.clear();
      };

};