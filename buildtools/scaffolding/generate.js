var program = require('commander');

var Nightmare = require('nightmare');

const nightmare = Nightmare({ show: true });


program
.version('0.0.1')
.description("scaffolding")
.option('-h, --js2html <path>', 'specify path to js interface')
.option('-j, --html2js <path>',  'specify path to html interface')
.parse(process.argv);



if(program.js2html) {
    
}

if(program.html2js) {

    nightmare
    .goto(program.html2js)
    .inject('js', "./../../build/klaster.dev.js")
    .evaluate(() => { 
        var ifc = $k('body')({
            model : {
              event : {
                 sync : () =>
                 c.log(JSON.stringify(this))
              } 
            },
            init : (e)=> {
                e.view2Model(document.querySelector('body')); 
                
            }
          }); 
        return ifc;
    })
    .then((d) => {
        console.log("d", d.model);
    })
    .catch((error) => {
        console.error('failed:', error);
    })
   
    ;

}