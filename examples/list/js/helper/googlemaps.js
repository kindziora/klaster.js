/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var maps = function(model) {
    var self = this;

    this.addMarker = function(lat, lng, style, title) {

        // Define the overlay, derived from google.maps.OverlayView
        function Label(opt_options) {
            // Initialization
            this.setValues(opt_options);

            // Label specific
            var span = this.span_ = document.createElement('span');
            span.style.cssText = 'position: relative; left: 0%; top: -52px; ' +
                    'white-space: nowrap; border: 1px solid black; ' +
                    'padding: 2px; background-color: white;opacity:0.8;box-shadow:0px 1px 3px black;border-radius:3px;display:none;z-index:10000;';

            var div = this.div_ = document.createElement('div');
            div.appendChild(span);
            div.style.cssText = 'position: absolute; display: none';
        }
        ;
        Label.prototype = new google.maps.OverlayView;

// Implement onAdd
        Label.prototype.onAdd = function() {
            var pane = this.getPanes().overlayLayer;
            pane.appendChild(this.div_);

            // Ensures the label is redrawn if the text or position is changed.
            var me = this;
            this.listeners_ = [
                google.maps.event.addListener(this, 'position_changed',
                        function() {
                            me.draw();
                        }),
                google.maps.event.addListener(this, 'text_changed',
                        function() {
                            me.draw();
                        })
            ];
        };

// Implement onRemove
        Label.prototype.onRemove = function() {
            this.div_.parentNode.removeChild(this.div_);

            // Label is removed from the map, stop updating its position/text.
            for (var i = 0, I = this.listeners_.length; i < I; ++i) {
                google.maps.event.removeListener(this.listeners_[i]);
            }
        };

// Implement draw
        Label.prototype.draw = function() {
            var projection = this.getProjection();
            var position = projection.fromLatLngToDivPixel(this.get('position'));

            var div = this.div_;
            div.style.left = position.x + 'px';
            div.style.top = position.y + 'px';
            div.style.display = 'block';

            this.span_.innerHTML = title;
        };

        var marker = new google.maps.Marker({
            icon: "http://maps.google.com/mapfiles/ms/icons/" + style + ".png",
            position: new google.maps.LatLng(lat, lng),
            map: self.map,
            title: title
        });

        var label = new Label({
            map: self.map
        });

        label.bindTo('position', marker, 'position');
        label.bindTo('text', marker, 'position');

        google.maps.event.addListener(marker, 'mouseover', function() {
            $(label.span_).show();
        });
        google.maps.event.addListener(marker, 'mouseout', function() {
            $(label.span_).hide();
        });
       
    };

    this.updateMap = function(payload) {
        self.map = new google.maps.Map(document.getElementById("map_canvas"),
                {
                    center: new google.maps.LatLng(payload.latitude, payload.longitude),
                    zoom: 15,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                });

        //hauptmarker
        self.addMarker(payload.latitude, payload.longitude, 'purple-dot', payload.name);

        //alternative marker
        for (var i in model.field.potentialMatches) {
            var coordinates = model.field.potentialMatches[i].basicInfo.point.coordinates;
            self.addMarker(coordinates[1], coordinates[0], 'green-dot', model.field.potentialMatches[i].basicInfo.name);
        }
    }
};