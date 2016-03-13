var k_polyfill = function(el) {
    
    var self = this;
    
    this.el = function() {
        var args = []; 
        for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
        return self[arguments[0]].apply(el, args);
    };
    
    this.extend = function(out) {
      out = out || {};
    
      for (var i = 1; i < arguments.length; i++) {
        var obj = arguments[i];
    
        if (!obj)
          continue;
    
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'object')
              out[key] = self.extend(out[key], obj[key]);
            else
              out[key] = obj[key];
          }
        }
      }
    
      return out;
    }; 
    
    return el;
};