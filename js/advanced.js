var element = {
    views: {
        renderName: function() {
            return '<p>' + values.name + '</p>';
        }
    },
    sync: function(el) {
        $('#json-preview').html(JSON.stringify(this.values));
    }
};

var person = $.extend(true, element, {
    views: {
        renderName: function(name) {
            return view.render('templates/exampleTemplatefile.html', {'name' : name});
            // OR
            return '<p>' + name + '</p>';
        }
    },
    actions: {
        'filterbutton': {
            'click': function(e, self) {
                var $checks = $($(this).attr('data-connected'));
                $checks.toggleOmit().toggle(200);
                
                $('h1').html( person.views.renderName('testi') );
                
                return $checks.attr('data-omit');
            }
        }
    }
});

$('.controll-box').klaster(person);





