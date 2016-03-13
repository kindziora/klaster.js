var k_polyfill = function(el) {
     var me = {};
   me.el = function() {
        var args = []; 
        for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
        return k_polyfill.fn[arguments[0]].apply(el, args);
    };
      
 
    return me;
};

  k_polyfill.extend = function(out) {
    out = out || {};
  
    for (var i = 1; i < arguments.length; i++) {
      var obj = arguments[i];
  
      if (!obj)
        continue;
  
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === 'object')
            out[key] = k_polyfill.extend(out[key], obj[key]);
          else
            out[key] = obj[key];
        }
      }
    }
  
    return out;
  }; 
  
k_polyfill.fn = {};