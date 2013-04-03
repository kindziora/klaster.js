
var view = function() {
    var self = {}, cache = {}, priv = {};
    
    // Simple JavaScript Templating
    // based on code by John Resig - http://ejohn.org/ - MIT Licensed
    self.render = function render(tpl, params, ready){
        var finished = function(data) {
            cache[tpl] = data;
            
            var fn = new Function("obj",
                "var p=[],print=function(){p.push.apply(p,arguments);};" +
                "with(obj){p.push('" + cache[tpl]
                .replace(/[\r\t\n]/g, " ")
                .split("<%").join("\t")
                .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                .replace(/\t=(.*?)%>/g, "',$1,'")
                .split("\t").join("');")
                .split("%>").join("p.push('")
                .split("\r").join("\\'")
                + "');}return p.join('');");
            if(typeof params === "undefined")params = {};
            
            ready(fn( params ));
        };
        
        if(typeof cache[tpl] === 'undefined') {
            $.get(tpl, finished);
        }else{
            finished(cache[tpl]);
        }

    };
    
    self.htmlEntities = function (str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };
    
    self.formatDate = function (date, fmt) {
        function pad(value) {
            return (value.toString().length < 2) ? '0' + value : value;
        }
        return fmt.replace(/%([a-zA-Z])/g, function (_, fmtCode) {
            switch (fmtCode) {
                case 'Y':
                    return date.getUTCFullYear();
                case 'M':
                    return pad(date.getUTCMonth() + 1);
                case 'd':
                    return pad(date.getUTCDate());
                case 'H':
                    return pad(date.getUTCHours());
                case 'm':
                    return pad(date.getUTCMinutes());
                case 's':
                    return pad(date.getUTCSeconds());
                default:
                    throw new Error('Unsupported format code: ' + fmtCode);
            }
        });
    };
    
    priv.bindModal = function($modal, ok, cancel) {
        $modal.modal()
        .find('.okbtn').click(function() {
            if(typeof ok !== 'undefined')
                ok.call(this);
            $modal.modal('hide');
        })
        .find('.closebtn').click(function() {
            if(typeof cancel !== 'undefined')
                cancel.call(this);
        })
        .on('hidden', function () {
            $(this).remove();
            $('.modal-backdrop').remove();
        });
        return $modal;
    };
    
    self.modal = function(params, ok, cancel, ready) {
        self.render("modal", params, function(data) {
            var $modal = priv.bindModal($(data), ok, cancel);
            if(typeof ready !== 'undefined') ready($modal);
        });
    };
    
    return self;
}();