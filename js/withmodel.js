var controller = function() {

    this.actions = {
        'filterbutton': {
            'click': function(e, controller) {
                var $checks = $($(this).attr('data-connected'));
                $checks.toggleOmit().toggle(200);
                //controller.model.values.words = 'none';
                return $checks.attr('data-omit');
            }
        }
    };

    this.model = {
        'field': {// here we declare model fields, with default values this is not strict default values are only used if we use directive: data-defaultvalues="client" on default we use server side default values because of the first page load
            'search': 'hallo welt',
            'searchAdvanced': function() {
                this.value = "hallo welt";
                this.onchange = function() {
                    this.fields.words = this.fields.search.split(' ').length;
                }
            }
        }
    };
    
    this.view = {
        field: {
            search: function(value, $field) {
//here we render our field, working like a decorator

                /**
                 * this is how a asynchronus value would be applied
                 successResponse = function(data, $field) {
                 $field.html(data);
                 };
                 $.ajax({
                 data: {},
                 success: successResponse
                 });
                 return successResponse;
                 */

                return "<strong>" + value + "</strong>";
            }
        }
    };
};
$('body').klaster(new controller());