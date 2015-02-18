/**
 * 
 * klaster.js by Alexander Kindziora 2014 
 * is a mva (model-view-action) framework for user interfaces
 */
var twigInterface = function (model) {
    var intfc = this;
    localStorage['model'] = JSON.stringify(model);

    function result() {
        var state = JSON.parse(localStorage['model']);
        var valid = true, wrongItems = [];
        for (var item in state) {
            if (state[item].payload.match.action === 'match' && state[item].payload.match.id !== state[item].payload.correct ||
                    state[item].payload.correct === '' && state[item].payload.match.action === 'match') {
                valid = false;
                wrongItems.push(state[item]);
            }
        }
        return {'result': valid, 'items': wrongItems};
    }

    this.interactions = {
        'dot': {
            'click': function (e) {
                e.preventDefault();
                intfc.model.position = parseInt($(this).attr('data-value'));
                intfc.model.field = model[intfc.model.position];
                intfc.model.event.postChange.payload.call(intfc.model, intfc.model.field.payload);
            }
        },
        'match': {
            'click': function (e) {
                e.preventDefault();
                var val = $(this).attr('data-value').split(':');
                var action = val[1], id = val[0], mymatch;

                if (typeof model[intfc.model.position] !== 'undefined') {

                    mymatch = {
                        "$oid": intfc.model.field.queueItem.id,
                        action: {
                            "method": action
                        }
                    };

                    if (action === 'match') {
                        mymatch.action.data = id;
                    }

                    //add match
                    model[intfc.model.position].payload.match = mymatch;
                    //nächstes object 
                    intfc.model.event.postChange.payload.call(intfc.model, intfc.model.field.payload);

                    localStorage['model'] = JSON.stringify(model);

                    if (typeof model[intfc.model.position + 1] !== 'undefined') {
                        intfc.model.position++;
                        intfc.model.highestposition = (intfc.model.position > intfc.model.highestposition) ? intfc.model.position : intfc.model.highestposition;
                        intfc.model.field = model[intfc.model.position];
                        intfc.model.event.postChange.payload.call(intfc.model, intfc.model.field.payload);
                    } else {

                        localStorage['model'] = null;
                    }
                }
            }
        }
    };

    this.model = {
        'position': 0,
        'highestposition': 0,
        'field': model[0],
        event: {
            'postChange': {
                'payload': function (data) {
                    return new maps(this).updateMap(data);
                }
            }
        }
    };

    this.view = {
        templates_: {},
        templates: true,
        viewpath: 'view/twigInterface/',
        fileextension: 'html.twig',
        render: function (tplVars, tplName) {
            return twig({
                data: intfc.view.templates_[tplName || arguments.callee.caller]
            }).render(tplVars);
        },
        views: {
            "foreach->potentialMatches": function (potentialMatch, index) {
                return intfc.view.render({'index': index, 'potentialMatch': potentialMatch, 'payload': intfc.model.field.payload});
            },
            "payload": function (payload) {
                return intfc.view.render({'payload': payload}, "payload");
            },
            "buttons": function (payload) {
                return intfc.view.render({'payload': payload}, 'buttons');
            },
            length: function (potentialMatch) {
                return intfc.view.render({'items': model.length, 'imodel': intfc.model, 'model': model}, 'length');
            }
        },
        event: {
            postRender: {
                length: function ($scope) {
                    $scope.find('[data-toggle="popover"]').popover({
                        trigger: 'hover'
                    });
                }
            }
        },
        init: function () {


            Twig.extendFilter('encodeURIComponent', function (str) {
                return encodeURIComponent(str);
            });

            Twig.extendFilter('highlight', function (str, main) {

                var mainParts = main[0].split(' ');
                str = str.split(' ');
                str.forEach(function (item, i, arr) {
                    if (mainParts.indexOf(arr[i]) !== -1) {
                        arr[i] = '<strong class="alert-success">' + arr[i] + '</strong>';
                    }
                });
                return str.join(' ');
            });
        }()
    };

};

$.get('example.json').done(function (model) {
    var mytodos = new twigInterface(model);
    $('#todoapp').klaster_(mytodos);
});
 