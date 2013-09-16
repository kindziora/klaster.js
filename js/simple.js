$('body').klaster({
    delay: 0,
    actions: {
        'filterbutton': {
            'click': function(e, self) {
                var $checks = $($(this).attr('data-connected'));
                $checks.toggleOmit().toggle(200);
                console.log(self);
                self.values.words = 'none';
                return $checks.attr('data-omit');
            }
        }
    },
    'sync': function(el) {
        $('#json-preview').html(JSON.stringify(this.values));
        //two way data binding
        this.values.words = this.values.search.split(' ').length;
    }
});