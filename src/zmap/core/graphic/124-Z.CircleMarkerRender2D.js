/**
 * Created by Administrator on 2015/12/2.
 */
Z.CircleMarkerRender2D = Z.GraphicRender2D.extend({
    initialize: function(graphic){
        Z.GraphicRender2D.prototype.initialize.apply(this, arguments);
    },

    buildGraphicObject: function(baseIndex, layerIndex){
        var options = this._getLeafletOptions(this._graphic.symbol),
            radius = this._getRadius(this._graphic.feature.shape),
            geom = this._getLeafletGeometry(this._graphic.feature.shape),
            radiusType = this._graphic.feature.shape.radiusType;

        if(radiusType === 'meter'){
            return L.circle(geom, radius, options);
        }else{
            options.radius = radius;
            return L.circleMarker(geom, options);
        }
    },

    updateGeometry: function(shape){
        if(this._renderedObject){
            this._renderedObject.setLatLng(this._getLeafletGeometry(shape));
        }
    },

    //updateSymbol: function(symbol){
    //    if(this._renderedObject){
    //        if(symbol.opacity !== this._renderedObject.options.opacity){
    //            this._renderedObject.setOpacity(symbol.opacity);
    //        }
    //
    //        var iconOptions = this._getIconOptions(symbol);
    //        this._renderedObject.setIcon(L.icon(iconOptions));
    //    }
    //},

    _getLeafletGeometry: function(shape){
        var geom, center = shape.center;

        if(center instanceof Z.LatLng){
            geom = L.latLng(center.lat, center.lng, center.alt);
        }else if(center instanceof Array){      //坐标顺序为[经度、维度]，如[120, 30]
            if(center.length >= 3){
                geom = L.latLng([center[1], center[0], center[2]]);
            }else if(center.length >= 2){
                geom = L.latLng([center[1], center[0]]);
            }
        }

        return geom;
    },

    _getRadius: function(shape){
        return shape.radius || 100;
    },

    _getLeafletOptions: function(symbol){
        var options = {
            stroke: symbol.hidePolyline ? false : true,
            color: symbol.borderSymbol.color || '#0033ff',
            weight: symbol.borderSymbol.width || 5,
            opacity: symbol.borderSymbol.opacity || 0.5,
            fill:symbol.hideFill ? false : true,
            fillColor:symbol.fillSymbol.color || '#002244',
            fillOpacity:symbol.fillSymbol.opacity || 0.5,
            //fillRule:'',
            dashArray:(symbol.borderSymbol.style ===  Z.PolylineStyleType.Solid) ? null : '2,2',
            lineCap: null,
            lineJoin: null,
            clickable: true
        };

        return options;
    }
});