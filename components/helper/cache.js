var cache = new (function() {
  var store = window.localStorage;
  var ns = 'c_';

  this.checkTTL = function(data, key) {
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
    return this.checkTTL(data, ns + key);
  };
  
  this.remove = function(key){
    store.removeItem(ns + key);
  };
  
  this.clear = function(){
    store.clear();
  };

})();