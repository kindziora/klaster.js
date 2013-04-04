var element = {
    html: {
        renderName: function() {
            return '<p>' + values.name + '</p>';
        }
    },
    sync: function(el) {
        $('#json-preview').html(JSON.stringify(this.values));
    }
};

var person = $.extend(true, element, {
    html: {
        renderName: function(name) {
            return view.render('views/exampleTemplatefile.html', {'name' : name});
            // OR
            return '<p>' + name + '</p>';
        }
    },
    actions: {
        'filterbutton': {
            'click': function(e, self) {
                var $checks = $($(this).attr('data-connected'));
                $checks.toggleOmit().toggle(200);
                
                $('h1').html( person.html.renderName('testi') );
                
                return $checks.attr('data-omit');
            }
        }
    }
});

$('.controll-box').klaster(person);





