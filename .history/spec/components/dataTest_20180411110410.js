describe("test klaster.js", function() {

  var compiled = require('../../build/klaster.dev.js');
 

let [api, structure, dom, data] = compiled.components;
let klaster = compiled.klaster;

  it("get parent element from array or dotnotation", function() {
     
    let expectations = {
      "[fields][4][2][plainmoves][2]" :  "[fields][4][2][plainmoves]",
      "fields[4][2][plainmoves][2]" : "fields[4][2][plainmoves]",
      "fields[4][2].plainmoves[2]" : "fields[4][2].plainmoves",
      "[fields][4]" :  "[fields]",
      "fields[4]" :  "fields",
      "[fields]" : ""
    };
    
    for(let i in expectations) { 
      expect(data._getParentObject(i, "")).toEqual(expectations[i]);
    }

  });


  it("points to brackets in array notation", function() {
    
    let expectations = {
      "fields.plainmoves" :  "fields[plainmoves]"
    };
    
    for(let i in expectations) {  
      expect(dom.normalizeChangeResponse(i)).toEqual(expectations[i]);
    }

  });

  it("brackets to escaped brackets in array notation", function() {
    let expectations = {
      "fields[plainmoves]" :  "fields['plainmoves']"
    };
    
    for(let i in expectations) {
      expect(dom.normalizeChangeResponseBrackets(i)).toEqual(expectations[i]);
    }
   
  });
  

  
});
