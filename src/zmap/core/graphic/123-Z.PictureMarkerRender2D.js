/**
 * Created by Administrator on 2015/12/2.
 */
Z.PictureMarkerRender2D = Z.GraphicRender2D.extend({
    initialize: function(graphic){
        Z.GraphicRender2D.prototype.initialize.apply(this, arguments);
    },

    buildGraphicObject: function(baseIndex, layerIndex){
        var options = this._getLeafletOptions(this._graphic.symbol),
            geom = this._getLeafletGeometry(this._graphic.feature.shape);

        return L.marker(geom, options);
    },

    updateGeometry: function(shape){
        if(this._renderedObject){
            this._renderedObject.setLatLng(this._getLeafletGeometry(shape));
        }
    },

    updateSymbol: function(symbol){
        if(this._renderedObject){
            if(symbol.opacity !== this._renderedObject.options.opacity){
                this._renderedObject.setOpacity(symbol.opacity);
            }

            var iconOptions = this._getIconOptions(symbol);
            this._renderedObject.setIcon(L.icon(iconOptions));
        }
    },

    _getLeafletGeometry: function(shape){
        var geom;

        if(shape instanceof Z.LatLng){
            geom = L.latLng(shape.lat, shape.lng, shape.alt);
        }else if(shape instanceof Array){      //坐标顺序为[经度、维度]，如[120, 30]
            if(shape.length >= 3){
                geom = L.latLng([shape[1], shape[0], shape[2]]);
            }else if(shape.length >= 2){
                geom = L.latLng([shape[1], shape[0]]);
            }
        }

        return geom;
    },

    _getLeafletOptions: function(symbol){
        var iconOptions = this._getIconOptions(symbol);
        var options = {
            opacity: symbol.opacity || 1,
            icon: L.icon(iconOptions),
            clickable: true,
            keyboard: false
        };

        return options;
    },

    _getIconOptions: function(symbol){
        var options = {
            iconUrl: symbol.url
        };

        if((typeof symbol.width === 'number') && (typeof symbol.height === 'number')){
            options.iconSize = L.point(symbol.width, symbol.height);
        }

        if(symbol.offset && options.iconSize){
            options.iconAnchor = L.point(options.iconSize.x / 2 - symbol.offset.x, symbol.offset.y + options.iconSize.y / 2);      //leaflet的iconAnchor是相对于图片左上角的偏移，Z.Map则是相对于图片中心点的偏移
        }

        return options;
    }
});