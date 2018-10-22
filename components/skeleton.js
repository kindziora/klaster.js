var prefix = 'data';
var _nsKlaster = {};
_nsKlaster.k_docapi = { 
    'Controller': {
        'this.interactions': {
            'dom-attribute name': {
                'on-name': 'event callback handler, params(e, controller) context(this) is jQuery dom element'
            }
        },
        'this.delay': 'integer delay in milliseconds used for changes on model call to sync function timeout',
        'change': 'callback that executes after change of model data(this.model.values) with a delay of milliseconds declared with this.delay default 0'

    },
    'dom-attributes': {
        'defaultvalues': {
            'attr': prefix + '-defaultvalues',
            'value': 'String value:"client" or "server" that means our app uses the field.values frtom dom or model/javascript'
        },
        'name': {
            'attr': prefix + '-name',
            'value': 'String containing name of element, not unique'
        },
        'omit': {
            'attr': prefix + '-omit',
            'value': 'String/that evaluates to boolean, whether ignoring the area for model representation data or not'
        },
        'filter': {
            'attr': prefix + '-filter',
            'value': 'filter expression javascript is valid'
        },
        'value': {
            'attr': prefix + '-value',
            'value': 'String, containing the value of an element, can be plain or json'
        },
        'multiple': {
            'attr': prefix + '-multiple',
            'value': 'String/that evaluates to boolean, whether this element is part of multiple elements like checkbox',
            'children': {
                'checked': {
                    'attr': prefix + '-checked',
                    'value': 'String/that evaluates to boolean, whether this element is will apear inside a list of multiple elements with similar data-name, like checkbox'
                }
            }
        },
        'delay': {
            'attr': prefix + '-delay',
            'value': 'number of miliseconds until sync'
        },
        'on': {
            'attr': prefix + '-on',
            'value': 'event that triggers matching action method, also alias is possible. eg. hover->klasterhover'
        },
        'view': {
            'attr': prefix + '-view',
            'value': {
                'desc': 'defines which view function callback is executed for rendering output',
                'params': {
                    '[viewname]': 'name of view render function (calls it) and uses return string to fill html of this element',
                    'for->[viewname]': 'name of view render function and calls it for every array item and uses return string to fill html of this elements'
                },
                definition: {
                    'iterate': 'foreach->'
                }
            }
        }
    }
};

_nsKlaster.k_structure = {
    'delay': 10,
    'api': _nsKlaster.k_docapi,
    'interactions': {
        'test': {
            'click': function (e) {

            }
        }
    },
    'model': {
        'field': {},
        'event': {
            'postChange': { 'fieldabc' : "function () {}"},
            'sync': "function () {}"
        },
        'state' : {
           /* 'forename' :{result : false, msg : "not valid", value : "45345"} */
        }
    },
    'viewFilter' : {},
    'view': {
        'viewpath': 'view/', //if loading templates in realtime
        'fileextension': 'html.twig', //if loading templates in realtime
        'templates_': {}, // array of templates by name => html or other markup
        'render': function (tplVars, tplName) { // template render function ... here you can add template engine support for twig, etc.
        },
        'views': {
            'test': function () {

            }
        }
    },
    'filter': {
    },
    'config': {
        'debug': true
    }
};