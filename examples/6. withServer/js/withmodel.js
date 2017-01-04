/**
 * 
 * klaster.js by Alexander Kindziora is a mvma (model-view-model-action) framework for user interfaces
 */

var simplerXHR = function (method, url) {
    var _xhr = new XMLHttpRequest();
    _xhr.open(method, url);
    _xhr.setup = function (cb) { // hacky? maybe
        cb(_xhr);
        return _xhr;
    };
    _xhr.done = function (cb) { // hacky? maybe
        _xhr.onreadystatechange = function () {
            if (_xhr.readyState === 4) {
                cb(_xhr.responseText);
            }
        };
        return _xhr;
    };
    return _xhr;
};



var interface = function () {
    var intfc = this;
    //try it, to commit x milliseconds after last change
    intfc.delay = 0;
 
    this.model = {
        'field': {// here we declare model fields, with default values this is not strict default values are only used if we use directive: data-defaultvalues="client" on default we use server side default values because of the first page load
            'search': 'go for it...',
            user: {
                'name': "sdsd0",
                'age': 23567567,
                'email': "sdffsdf@sd.de"
            }
        },
        'event': {
            'sync': function ($el, cls) { //after model fields have changed
               var model = this;
            
                simplerXHR("post", "/form")
                .done(function (data) {
                    cls.validate("user['email']", $el, JSON.parse(data));
                })
                .setup(function (r) {
                    r.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                })
                .send(JSON.stringify(model.field));

            }
        }
    };

    this.view = {
        views: {
            'validInfo': function (data, notation, $scope) {
                var validationResult = this.model.getState(notation);
                if (validationResult.result) {
                    return '<div class="alert alert-dismissible alert-success"><strong>Oh yeah!</strong> valid</div>';
                } else {
                    return '<div class="alert alert-dismissible alert-danger"><strong>Oh snap!</strong> ' + validationResult.msg + ' . </div>';
                }
            },
            email: function (emails, notation, $scope) {

                var mails = emails.split(',');
                var html = "";
                for (var i in mails) {
                    html += '<p>' + mails[i] + '</p>'
                }
                return html;

            }
        }
    };
    return this;
};

$k('body')(new interface());

