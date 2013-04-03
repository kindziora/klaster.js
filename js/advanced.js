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
        renderName: function() {
            return '<p>' + values.name + '</p>';
        }
    },
    actions: {
        'filterbutton': {
            'click': function(e) {
                var $checks = $($(this).attr('data-connected'));
                $checks.toggleOmit().toggle(200);
                return $checks.attr('data-omit');
            }
        }
    }
});

$('.controll-box').klaster(person);
 




