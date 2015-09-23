/**
 * 
 * klaster.js by Alexander Kindziora 2014 
 * is a mva (model-view-action) framework for user interfaces
 */

var uiError;

var twigInterface = function (model, cachedViews, isdev) {
    var intfc = this;

    model.results = JSON.parse($('.jsonResult').val() != '' ? $('.jsonResult').val() : '[]');

    this.interactions = {
        bg: {
            click: function (e, self) {
                e.preventDefault();
                $('.lightbox').hide();
            }
        },
        zoom: {
            click: function (e, self) {
                e.preventDefault();
                var $box = $($(this).attr('href'));
                var $img = $box.find('.bigImg');
                $img.attr('src', $img.attr('data-src'));
                $box.show();
            }
        },
        'mark': {
            click: function (e, self) {
                e.preventDefault();
                var $p = $('[data-name="items[' + $(this).attr('data-index') + ']"]');
                $p.toggleClass('marked');

                intfc.model.field.results[parseInt($(this).attr('data-index'))] = !$p.hasClass('marked');

            }
        }
    };

    this.model = {
        'field': model,
        event: {
            'postChange': {
            },
            sync: function () {
                var result = [];
                for (var i in this.field.items) {
                    result.push({
                        'id': this.field.items[i]['job_id'],
                        'result': this.field.results[i].result
                    });
                }
                if (isdev) {
                    console.log(JSON.stringify(intfc.view.templates_));
                } else {
                    $('.jsonResult').val(JSON.stringify(result));
                }

                $('.jsonResult').val(JSON.stringify(result));
                console.log(JSON.stringify(result));
            }
        }
    };

    this.view = {
        templates_: isdev ? {} : cachedViews,
        templates: isdev,
        viewpath: 'view/twigInterface/',
        fileextension: 'html.twig',
        render: function (tplVars, tplName) {
            if (twig) {
                var res = twig({
                    data: intfc.view.templates_[tplName || arguments.callee.caller]
                });
                if (res) {
                    return res.render(tplVars);
                } else {
                    console.log('error TEMPLATE NICHT IN CACHED.json gefunden', arguments.callee.caller);
                    return '<div></div>';
                }
            }
        },
       views: {
            "foreach->job_similar_tags": function (item, index) {

                return intfc.view.render({'tag': item, 'id': index}, "foreach->job_similar_tags");
            },
            "foreach->job_image_positive_samples": function (item, index) {
                return intfc.view.render({'img': item, 'id': index});
            },
            "foreach->job_image_negative_samples": function (item, index) {

                return intfc.view.render({'img': item, 'id': index});
            },
          "foreach->items": function (item, index) {
                return intfc.view.render({'index': index, 'item': item, 
                    markedMatchOK : typeof intfc.model.field.results[index]._feedback !== 'undefined' && intfc.model.field.results[index]._feedback.rating ? [intfc.model.field.results[index]._feedback.rating] : [],
                    'match': typeof intfc.model.field.results[index]._feedback !== 'undefined' && !intfc.model.field.results[index]._feedback.rating ? [intfc.model.field.results[index]._feedback.rating] : [], marked: typeof intfc.model.field.results[index] !== 'undefined' ? !intfc.model.field.results[index].result : false, 'matches': [].join(', ')}, "foreach->items");
            },
            "job_description": function (item, index) {
                return item.replace(/\n/g, "<br />");
            },
            "job_tag_breadcrumb": function (item, index) {
                return item;
            },
            "paymentCent": function (item, index) {
                return (item['alignPaymentCent'] > 0) ? 'Wert: ' + (item['alignPaymentCent'] / 100) + ' €' : '';
            }
        },
        event: {
            postRender: {
                "job_description": function () {
                    window.clearTimeout(uiError);
                }
            }
        },
        init: function () {
            Twig.extendFilter('encodeURIComponent', function (str) {
                return encodeURIComponent(str);
            });

            Twig.extendFunction('match', function (str) {
                return URLS['match'];
            });


            Twig.extendFunction('failed', function (str) {
                return URLS['failed'];
            });

            Twig.extendFilter('bigImg', function (str) {
                var parts = str.split('-');
                parts[parts.length - 2] = 500;
                return parts.join('-');
            });

        }()
    };

};

var cb = function (cachedViews) {
    uiError = window.setTimeout(function () {
        cb(cachedViews);
    }, 8000);
    model.tag_name = model.items[0].tag_name;
    model.results = [];
    var mytodos = new twigInterface(model, cachedViews, isdev);

    $('#todoapp').klaster(mytodos);
    mytodos.model.event.sync.call(mytodos.model);

};



$.get(cachedUrl).done(cb);