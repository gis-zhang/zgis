/**
 * Created by Administrator on 2015/12/2.
 */
Z.PolygonRender2D = Z.GraphicRender2D.extend({
    initialize: function(graphic){
        Z.GraphicRender2D.prototype.initialize.apply(this, arguments);
    },

    buildGraphicObject: function(baseIndex, layerIndex){
        var options = this._getLeafletOptions(this._graphic.symbol),
            geom = this._getLeafletGeometry(this._graphic.feature.shape),
            coords = [];

        for(var i = 0; i < geom.length; i++){
            coords[i] = [];

            if(geom[i].paths.length <= 0){
                continue;
            }

            coords[i].push(geom[i].paths[0]);

            for(var j = 0; j < geom[i].holes.length; j++){
                coords[i].push(geom[i].holes[j]);
            }
        }

        if(coords.length > 1){
            return L.multiPolygon(coords, options);
        }else{
            return L.polygon(coords[0], options);
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
        var geom = [], paths, notArray2, notArray3, notArray4, coords;

        if(shape){
            paths = shape.rings;
            notArray2 = !(paths instanceof Array) || !(paths[0] instanceof Array);  //判断shape是否为二维数组
            notArray3 = notArray2 || !(paths[0][0] instanceof Array),        //判断shape是否为三维数组
            notArray4 = notArray3 || !(paths[0][0][0] instanceof Array),     //判断shape是否为四维数组
            coords = [];

            if(!notArray4){     //四维数组
                coords = paths;
            }else if(!notArray3){     //三维数组
                coords = [paths];
            }else if(!notArray2){     //二维数组
                coords = [[paths]];
            }

            for(var i = 0; i < coords.length; i++){
                var currentGeom = {paths:[], holes: []};

                for(var j = 0; j < coords[i].length; j++){
                    if(Z.GeometryUtil.isClockWise(coords[i][j])){
                        currentGeom.holes.push(coords[i][j]);
                    }else{
                        currentGeom.paths.push(coords[i][j]);
                    }
                }

                geom.push(currentGeom);
            }
        }

        return geom;
    },

    _getLeafletOptions: function(symbol){
        var options = {
            stroke: symbol.hidePolyline ? false : true,
            color: symbol.polylineSymbol.color || '#0033ff',
            weight: symbol.polylineSymbol.width || 5,
            opacity: symbol.polylineSymbol.opacity || 0.5,
            fill:symbol.hideFill ? false : true,
            fillColor:symbol.fillSymbol.color || '#002244',
            fillOpacity:symbol.fillSymbol.opacity || 0.5,
            //fillRule:'',
            dashArray:(symbol.polylineSymbol.style ===  Z.PolylineStyleType.Solid) ? null : '2,2',
            lineCap: null,
            lineJoin: null,
            clickable: true
        };

        return options;
    }
});