describe("test", function() {

  var data = require('../../build/klaster.dev.js');
 


  it("get parent element from array or dotnotation", function() {
     
    let expectations = {
      "[fields][4][2][plainmoves][2]" :  "[fields][4][2][plainmoves]",
      "fields[4][2][plainmoves][2]" : "fields[4][2][plainmoves]",
      "fields[4][2].plainmoves[2]" : "fields[4][2].plainmoves",
      "[fields][4]" :  "[fields]",
      "fields[4]" :  "fields"
    };
    
    for(let i in expectations) { 
      expect(data._getParentObject(i, "")).toEqual(expectations[i]);
    }
  
  });
 
});
