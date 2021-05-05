/**
 * Created by Administrator on 2015/12/2.
 */
Z.TileCanvasTexture = Z.CanvasTexture.extend({
    initialize: function(options){
        Z.CanvasTexture.prototype.initialize.call(this, options);
        this._tileWidth = 256;
        this._tileHeight = 256;

        //init   context
        this._getContext();
    },

    setTextureSize: function(width, height){
        if(typeof width === 'number' && !isNaN(width)){
            this._element.width = width;
        }

        if(typeof height === 'number' && !isNaN(height)){
            this._element.height = height;
        }
    },

    setTileSize: function(width, height){
        if(typeof width === 'number' && !isNaN(width)
            && typeof height === 'number' && !isNaN(height)){
            this._tileWidth = width;
            this._tileHeight = height;
        }
    },

    drawContent: function(context, tiles, options){
        //var bounds = this._getBounds(vertices);
        //this._setCanvasSize(this._element, context, bounds, options.pixelSceneRatio);
        this._fillBackground(this._element, context, this.options);
        //this._setDrawStyle(context, options.polylineSymbol);
        //this._fillPolyline(this._element, context, vertices, bounds);
        this._fillTile(this._element, context, tiles);
    },

    //_getBounds: function(vertices){
    //    var minPoint, maxPoint;
    //
    //    for(var i = 0; i < vertices.length; i++){
    //        if(!minPoint){
    //            minPoint = vertices[i].clone();
    //            maxPoint = vertices[i].clone();
    //        }else{
    //            minPoint.x = Math.min(minPoint.x, vertices[i].x);
    //            minPoint.y = Math.min(minPoint.y, vertices[i].y);
    //            minPoint.z = Math.min(minPoint.z, vertices[i].z);
    //
    //            maxPoint.x = Math.max(maxPoint.x, vertices[i].x);
    //            maxPoint.y = Math.max(maxPoint.y, vertices[i].y);
    //            maxPoint.z = Math.max(maxPoint.z, vertices[i].z);
    //        }
    //    }
    //
    //    return {min: minPoint, max: maxPoint};
    //},
    //
    //_calculateCanvasSize: function(canvas, canvasContext, bounds, pixelSceneRatio){
    //    var width = (bounds.max.x - bounds.min.x) * pixelSceneRatio.x;
    //    var height = (bounds.max.y - bounds.min.y) * pixelSceneRatio.y;
    //
    //    return {width: width, height: height};
    //},
    //
    //_setCanvasSize: function(canvas, canvasContext, bounds, pixelSceneRatio){
    //    if(this.options.autoWidth || this.options.autoHeight){
    //        var size = this._calculateCanvasSize(canvas, canvasContext, bounds, pixelSceneRatio);
    //        canvas.width = this.options.autoWidth ? size.width : this.options.width;
    //        canvas.height = this.options.autoHeight ? size.height : this.options.height;
    //    }else{
    //        canvas.width = this.options.width;
    //        canvas.height = this.options.height;
    //    }
    //},

    _fillBackground: function(canvas, canvasContext, symbol){
        if(!symbol.fillSymbol && !symbol.borderSymbol){
            return;
        }


        if(symbol.fill){
            var oldFillStyle = canvasContext.fillStyle;
            canvasContext.fillStyle = this._getStyle(symbol.fillSymbol.bgColor, symbol.fillSymbol.opacity);
            canvasContext.fillRect(0,0,canvas.width,canvas.height);
            canvasContext.fillStyle = oldFillStyle;
        }

        if(symbol.border){
            var oldStrokeStyle = canvasContext.strokeStyle;
            canvasContext.lineWidth = symbol.borderWidth;
            canvasContext.strokeStyle = this._getStyle(symbol.borderSymbol.color, symbol.borderSymbol.opacity);
            canvasContext.strokeRect(0,0,canvas.width, canvas.height);
            canvasContext.strokeStyle = oldStrokeStyle;
        }
    },

    _fillTile: function(canvas, canvasContext, tiles){
        if(tiles.length < 0){
            return;
        }

        for(var i = 0; i < tiles.length; i++){
            var image = tiles[i].image,
                tilePoint = tiles[i].point;
            canvasContext.drawImage(image, 0, 0, image.width, image.height,
                tilePoint.x * this._tileWidth, tilePoint.y * this._tileHeight, this._tileWidth, this._tileHeight);
            //canvasContext.drawImage(image, 0, 0);
        }

        //canvasContext.stroke();
    }
});