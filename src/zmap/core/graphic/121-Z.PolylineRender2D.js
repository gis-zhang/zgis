/**
 * Created by Administrator on 2015/12/2.
 */
Z.PolylineRender2D = Z.GraphicRender2D.extend({
    initialize: function(graphic){
        Z.GraphicRender2D.prototype.initialize.apply(this, arguments);
    },

    buildGraphicObject: function(baseIndex, layerIndex){
        var options = this._getLeafletOptions(this._graphic.symbol),
            geom = this._getLeafletGeometry(this._graphic.feature.shape);

        if(geom.length > 1){
            return L.multiPolyline(geom, options);
        }else{
            return L.polyline(geom, options);
        }
    },

    updateGeometry: function(shape){
        if(this._renderedObject){
            this._renderedObject.setLatLngs(this._getLeafletGeometry(shape));
        }
    },

    updateSymbol: function(symbol){
        if(this._renderedObject){
            this._renderedObject.setStyle(this._getLeafletOptions(symbol));
        }
    },

    _getLeafletGeometry: function(shape){
        var geom = [], paths, notArray2, notArray3;

        if(shape){
            paths = shape.paths;
            notArray2 = !(paths instanceof Array) || !(paths[0] instanceof Array);  //判断shape是否为二维数组
            notArray3 = notArray2 || !(paths[0][0] instanceof Array);     //判断shape是否为三维数组

            if(!notArray3){     //三维数组
                geom = paths;
            }else if(!notArray2){     //二维数组
                geom = [paths];
            }
        }

        return geom;
    },

    _getLeafletOptions: function(symbol){
        var options = {
            stroke: true,
            color: symbol.color || '#03f',
            weight: symbol.width || 5,
            opacity: symbol.opacity || 0.5,
            fill:false,
            //fillColor:'',
            //fillOpacity:'',
            //fillRule:'',
            dashArray:(symbol.style ===  Z.PolylineStyleType.Solid) ? null : '2,2',
            lineCap: null,
            lineJoin: null,
            clickable: true
        };

        return options;
    }
});