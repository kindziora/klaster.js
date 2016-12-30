var express = require('express');
var app = express();
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 


app.use('/', express.static(__dirname + '/../'));
app.use('/build', express.static(__dirname + '/../../../build/'));

app.post('/form', function (req, res) {

    console.log(req.body);

    var value = req.body.user.email;
    var re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    var isValid = !(value == '' || !re.test(value));

    res.json({
        result: isValid,
        msg: "email ist nicht gültig",
        view: "validInfo"
    });
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});