$('.controll-box').klaster({
    info: {
        'name': 'my simple klaster.js implementation',
        'version': '0.9',
        'debug': 0,
        'tag': 'beta',
        'author': 'yep Alexander tester',
        'date': '2013',
        'description' : 'no debug, this is silent'
    },
    actions: {
        'filterbutton': {
            'click': function(e) {
                var $checks = $($(this).attr('data-connected'));
                $checks.toggleOmit().toggle(200);
                return $checks.attr('data-omit');
            }
        }
    },
    'sync': function(el) {
        $('#json-preview').html(JSON.stringify(this.values));
        //prettyPrint();
    }
});