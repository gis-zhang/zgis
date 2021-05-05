/**
 * Created by Administrator on 2015/12/2.
 */
Z.CommonCanvasTexture = Z.CanvasTexture.extend({
    initialize: function(options){
        Z.CanvasTexture.prototype.initialize.call(this, options);
        //this._tileWidth = 256;
        //this._tileHeight = 256;

        //init   context
        this._getContext();
        this._tileAnchor = new Z.Point(0, 0);
        this._latLngBounds = null;

        this._widthScale = 1;
        this._heightScale = 1;
        this._textureWidth = 0;
        this._textureHeight = 0;
    },

    setTextureSize: function(width, height){
        if(typeof width === 'number' && !isNaN(width)){
            this._textureWidth = width;
            var twoPowerWidth = this._nearestPowerOfTwo(width);

            if(twoPowerWidth !== width){
                this._widthScale = twoPowerWidth / width;
                width = twoPowerWidth;
            }else{
                this._widthScale = 1;
            }

            this._element.width = width;
            this._element.style.width = width + "px";
        }

        if(typeof height === 'number' && !isNaN(height)){
            this._textureHeight = height;
            var twoPowerHeight = this._nearestPowerOfTwo(height);

            if(twoPowerHeight !== height){
                this._heightScale = twoPowerHeight / height;
                height = twoPowerHeight;
            }else{
                this._heightScale = 1;
            }

            this._element.height = height;
            this._element.style.height = height + "px";
        }

        this.needsUpdate = true;
    },

    //overwrite
    getSize: function(){
        if(this._element){
            return new Z.Point(this._textureWidth, this._textureHeight);
        }else{
            return new Z.Point(0, 0);
        }
    },

    setTileAnchor: function(x, y){
        this._tileAnchor.x = x;
        this._tileAnchor.y = y;

        this.needsUpdate = true;
    },

    setLatLngBounds: function(latLngBounds){
        this._latLngBounds = latLngBounds;

        this.needsUpdate = true;
    },

    //setTileSize: function(width, height){
    //    if(typeof width === 'number' && !isNaN(width)
    //        && typeof height === 'number' && !isNaN(height)){
    //        this._tileWidth = width;
    //        this._tileHeight = height;
    //    }
    //},

    /**
     *
     * @param context
     * @param content: [{
     *      type:polygon,
     *      index: 1,
     *      objects:[],
     *      options: {}
     * },{
     *      type:image,
     *      index: 2,
     *      objects:[],
     *      options: {}
     * }]
     * @param options
     */
    drawContent: function(context, content, options){
        if(!(content instanceof Array)){
            return;
        }

        content.sort(function(a, b){
            if(!a){
                return -1;
            }

            if(!b){
                return 1;
            }

            if((a.index || a.index === 0) && (b.index || b.index === 0)){
                return a.index - b.index;
            }else{
                return -1;
            }
        });

        for(var i = 0; i < content.length; i++){
            this._drawOneItem(context, content[i]);
        }

        ////var bounds = this._getBounds(vertices);
        ////this._setCanvasSize(this._element, context, bounds, options.pixelSceneRatio);
        //this._fillBackground(this._element, context, this.options);
        ////this._setDrawStyle(context, options.polylineSymbol);
        ////this._fillPolyline(this._element, context, vertices, bounds);
        //this._fillTile(this._element, context, tiles);
    },

    getPixelData: function(pixelX, pixelY){
        var pixelScope = this.getSize();

        if(pixelX >= 0 &&
            pixelX < this._textureWidth &&
            pixelY >= 0 &&
            pixelY < this._textureHeight &&
            this._context){
            pixelX *= this._widthScale;
            pixelY *= this._heightScale;
            var imgData = this._context.getImageData(pixelX, pixelY, 1, 1);
            //console.info("width:" + this._textureWidth + ",height:" + this._textureHeight + "|" + imgData.data[0] + "," + imgData.data[1] + "," + imgData.data[2] + "," + imgData.data[3]);
            if(imgData.data.length >= 4){
                return imgData.data;
            }else{
                //console.info("null1 | " + pixelX + "," + pixelY + " | " + imgData.data.length);
                return null;
            }
        }else{
            //console.info("null2 | " + pixelX + "," + pixelY);
            return null;
        }
    },

    _drawOneItem: function(canvasContext, item){
        if(!(item.objects instanceof Array)){
            return;
        }

        if(item.type === "graphic"){
            //this._drawPolylines(canvasContext, item.objects, item.options);
            this._drawGraphics(canvasContext, item.objects, item.options);
        //}else if(item.type === "polygon"){
        //    this._drawPolygons(canvasContext, item.objects, item.options);
        }else if(item.type === "image"){
            this._drawImages(canvasContext, item.objects, item.options);
        }
    },

    _drawGraphics: function(canvasContext, objects, options){
        var min = this._latLngBounds.getSouthWest(),
            max = this._latLngBounds.getNorthEast(),
            psRatioX = this._textureWidth / (max.lng - min.lng),
            psRatioY = this._textureHeight / (max.lat - min.lat);

        var graphics = this._getVisibleGraphics(objects),
            graphicsLength = graphics.length;
        //console.info("drawingCount:" + graphicsLength);

        for(var objIndex = 0; objIndex < graphicsLength; objIndex++){
            var curGraphic =  graphics[objIndex],
                type = curGraphic.type;

            if(type === "polyline"){
                this._drawPolyline(canvasContext, curGraphic.object, curGraphic.symbol, psRatioX, psRatioY);
            }else if(type === "polygon"){
                this._drawPolygon(canvasContext, curGraphic.object, curGraphic.symbol, psRatioX, psRatioY);
            }
        }
    },

    _drawPolyline: function(canvasContext, object, symbol, psRatioX, psRatioY){
        var vertices = this._normalizePolylineVertices(object.paths);

        if(!vertices){
            return;
        }

        var thisObj = this;
        this._setDrawStyle(canvasContext, symbol, null, function(){
            thisObj._doPolylineDrawing(canvasContext, vertices, psRatioX, psRatioY);
        });
        //this._doPolylineDrawing(canvasContext, vertices, psRatioX, psRatioY);
    },

    _normalizePolylineVertices: function(paths){
        var notArray = !(paths instanceof Array),
            notArray2 = notArray || !(paths[0] instanceof Array),   //判断shape是否为二维数组;
            notArray3 = notArray2 || !(paths[0][0] instanceof Array),        //判断shape是否为三维数组;
            vertices;

        if(!notArray3){
            vertices = paths;
        }else if(!notArray2){
            vertices = [paths];
        }

        return vertices;
    },

    _doPolylineDrawing: function(canvasContext, vertices, psRatioX, psRatioY){
        var southWest = this._latLngBounds.getSouthWest(),
            northEast = this._latLngBounds.getNorthEast();

        for(var i = 0; i < vertices.length; i++){
            if(vertices[i].length < 2){
                continue;
            }

            canvasContext.beginPath();

            for(var j = 0; j < vertices[i].length; j++){
                var x = psRatioX * (vertices[i][j][1] - southWest.lng);
                var y = psRatioY * (northEast.lat - vertices[i][j][0]);

                if(j == 0){
                    canvasContext.moveTo(x, y);
                }else{
                    canvasContext.lineTo(x, y);
                }
            }

            canvasContext.stroke();
        }
    },

    _drawPolygon: function(canvasContext, object, symbol, psRatioX, psRatioY) {
        if (symbol.hidePolyline && symbol.hideFill) {
            return;
        }

        var vertices = this._normalizePolygonVertices(object.rings);

        if (!vertices) {
            return;
        }

        var thisObj = this;
        this._setDrawStyle(canvasContext, symbol.polylineSymbol, symbol.fillSymbol, function(){
            //thisObj._doPolylineDrawing(canvasContext, vertices, psRatioX, psRatioY);
            thisObj._doPolygonDrawing(canvasContext, vertices, symbol, psRatioX, psRatioY);
        });
    },

    _normalizePolygonVertices: function(paths){
        var notArray = !(paths instanceof Array),
            notArray2 = notArray || !(paths[0] instanceof Array),   //判断shape是否为二维数组;
            notArray3 = notArray2 || !(paths[0][0] instanceof Array),        //判断shape是否为三维数组;
            notArray4 = notArray3 || !(paths[0][0][0] instanceof Array),     //判断shape是否为四维数组
            vertices;

        if(!notArray4){
            vertices = paths;
        }else if(!notArray3){
            vertices = [paths];
        }else if(!notArray2){
            vertices = [[paths]];
        }

        return vertices;
    },

    _setDrawStyle: function(canvasContext, borderSymbol, fillSymbol, drawHandler){
        if(!borderSymbol && !fillSymbol){
            return;
        }

        var thisObj = this,
            thisArguments = arguments;

        if(borderSymbol){
            canvasContext.strokeStyle = this._getStyle(borderSymbol.color, borderSymbol.opacity);
            canvasContext.lineWidth = borderSymbol.width;
        }

        if(fillSymbol){
            if(fillSymbol.url){
                var image = THREE.Cache.get(fillSymbol.url);

                if(image){
                    image.style.opacity = fillSymbol.opacity;
                    canvasContext.fillStyle = canvasContext.createPattern(image, "repeat");
                }else{
                    image = new Image();

                    image.onload = function(){
                        THREE.Cache.add(fillSymbol.url, image);
                        thisObj._setDrawStyle(thisArguments);
                        thisObj.needsUpdate = true;
                    };

                    image.src = fillSymbol.url;

                    return;
                }
            }else{
                canvasContext.fillStyle = this._getStyle(fillSymbol.color || fillSymbol.bgColor, fillSymbol.opacity);
            }
        }

        if(drawHandler){
            drawHandler.call(thisObj);
        }
    },

    _getStyle: function(color, opacity){
        var result = color;

        if(typeof color === "string"){
            if(color.length >= 7 && color.indexOf("#") >= 0){
                color = color.substring(color.indexOf("#") + 1);
                var r = (this._hex2Int(color.charAt(0))<<4) + this._hex2Int(color.charAt(1)),
                    g = (this._hex2Int(color.charAt(2))<<4) + this._hex2Int(color.charAt(3)),
                    b = (this._hex2Int(color.charAt(4))<<4) + this._hex2Int(color.charAt(5));

                result = "rgba(" + r + "," + g + "," + b + "," + opacity + ")";
            }else if(color.length >= 8 && color.indexOf("0x") >= 0){
                color = color.substring(color.indexOf("0x") + 2);
                var r = (this._hex2Int(color.charAt(0))<<4) + this._hex2Int(color.charAt(1)),
                    g = (this._hex2Int(color.charAt(2))<<4) + this._hex2Int(color.charAt(3)),
                    b = (this._hex2Int(color.charAt(4))<<4) + this._hex2Int(color.charAt(5));

                result = "rgba(" + r + "," + g + "," + b + "," + opacity + ")";
            }
        }else if(typeof color === "number"){
            var r = (color >> 16) & 0x0000ff,
                g = (color >> 8) & 0x0000ff,
                b = color & 0x0000ff;

            result = "rgba(" + r + "," + g + "," + b + "," + opacity + ")";
        }

        return result;
    },

    _doPolygonDrawing: function(canvasContext, vertices, symbol, psRatioX, psRatioY){
        var southWest = this._latLngBounds.getSouthWest(),
            northEast = this._latLngBounds.getNorthEast(),
            verticesLength = vertices.length;

        for(var i = 0; i < verticesLength; i++){
            canvasContext.beginPath();
            var verticesILength = vertices[i].length;

            for(var j = 0; j < verticesILength; j++){
                if(vertices[i][j].length < 3){
                    continue;
                }

                var verticesIJLength = vertices[i][j].length;

                for(var k = 0; k < verticesIJLength; k++){
                    var x = psRatioX * (vertices[i][j][k][1] - southWest.lng);
                    var y = psRatioY * (northEast.lat - vertices[i][j][k][0]);

                    if(k == 0){
                        canvasContext.moveTo(x, y);
                    }else{
                        canvasContext.lineTo(x, y);
                    }
                }
            }

            if(!symbol.hideFill){
                canvasContext.fill();
            }

            if(!symbol.hidePolyline){
                canvasContext.stroke();
            }
        }
    },

    _getVisibleGraphics: function(graphics){
        var southWest = this._latLngBounds.getSouthWest(),
            northEast = this._latLngBounds.getNorthEast(),
            graphicsLength = graphics.length,
            visibleGraphics = [];

        for(var objIndex = 0; objIndex < graphicsLength; objIndex++){
            var curGraphic = graphics[objIndex],
                type = curGraphic.type,
                vertices = [];

            if(type === "polyline"){
                vertices = curGraphic.object.paths;
            }else if(type === "polygon"){
                vertices = curGraphic.object.rings;
            }

            if(vertices.length <= 0){
                continue;
            }

            var visible = this._graphicIsVisible(southWest, northEast, vertices);

            if(visible){
                visibleGraphics.push(curGraphic);
            }
        }

        return visibleGraphics;

        //for(var i = 0; i < verticesLength; i++) {
        //    var bounds = Z.GeometryUtil.getPathBounds(vertices);
        //    var pathSouthWest = bounds.getSouthWest(),
        //        pathNorthEast = bounds.getNorthEast();
        //
        //    if(pathSouthWest.lat >northEast.lat || pathSouthWest.lng > northEast.lng ||
        //        pathNorthEast.lat < southWest.lat || pathNorthEast.lng < southWest.lng){
        //        continue;
        //    }else{
        //        visibleVertices.push(vertices[i]);
        //    }
        //}
        //
        //return visibleVertices;
    },

    _graphicIsVisible: function(canvasSouthWest, canvasNorthEast, vertices){
        var bounds = Z.GeometryUtil.getPathBounds(vertices);
        var pathSouthWest = bounds.getSouthWest(),
            pathNorthEast = bounds.getNorthEast();

        if(pathSouthWest.lat >canvasNorthEast.lat || pathSouthWest.lng > canvasNorthEast.lng ||
            pathNorthEast.lat < canvasSouthWest.lat || pathNorthEast.lng < canvasSouthWest.lng){
            return false;
        }else{
            return true;
        }
    },

    _drawImages: function(canvasContext, objects, options){
        if(objects.length <= 0){
            return;
        }

        options = options ||{};
        var originX = 0,
            originY = 0;

        if(options.topLeft){
            originX = options.topLeft.x - this._tileAnchor.x;
            originY = options.topLeft.y - this._tileAnchor.y;
            //console.info("originX:" + originX + ", originY:" + originY + ", options.topLeft.y:" + options.topLeft.y + ", this._tileAnchor.y:" + this._tileAnchor.y);
        }

        var topLeftTilePoint = null;

        //if(options.tileBounds){
        //    topLeftTilePoint = options.tileBounds.min;
        //}else{
        //    var xValue = null, yValue = null;
        //
        //    for(var i = 0; i < objects.length; i++){
        //        var curPoint = objects[i].point;
        //        xValue = isNaN(xValue) ? curPoint.x : Math.min(curPoint.x, xValue);
        //        yValue = isNaN(yValue) ? curPoint.y : Math.min(curPoint.y, yValue);
        //    }
        //
        //    topLeftTilePoint = new Z.Point(xValue, yValue);
        //}

        var tileBounds = null;

        if(options.tileBounds){
            tileBounds = options.tileBounds;
        }else{
            var tilePoints = [];

            for(var i = 0; i < objects.length; i++){
                tilePoints.push(objects[i].point);
            }

            tileBounds = Z.Util.getPointBounds(tilePoints);
        }

        for(var i = 0; i < objects.length; i++){
            var image = objects[i].image,
                tilePoint = objects[i].point,
                tileWidth = options.width || image.width,
                tileHeight = options.height || image.height;
            //var posX = originX + (tilePoint.x - topLeftTilePoint.x) * tileWidth,
            //    posY = originY + (tilePoint.y - topLeftTilePoint.y) * tileHeight;
            var tileTopLeftPos = this._getTileTopLeftPos(originX, originY, tilePoint, tileBounds, options.pyramidModel);
            //console.info("(1)posX:" + posX + ", posY:" + posY + ", originX:" + originX + ", originY:" + originY + ", tileWidth:" + tileWidth + ", tileHeight:" + tileHeight);
            //console.info("(2)widthScale:" + this._widthScale + ", heightScale:" + this._heightScale +
            //    ", elementWidth:" + this._element.width + ", elementHeight:" + this._element.height +
            //    ", textureWidth:" + this._textureWidth + ", textureHeight:" + this._textureHeight);
            try{
                var drawPosX = tileTopLeftPos.x * this._widthScale,
                    drawPosY = tileTopLeftPos.y * this._heightScale,
                    drawTileWidth = tileWidth * this._widthScale,
                    drawTileHeight = tileHeight * this._heightScale;
                canvasContext.drawImage(image, 0, 0, image.width, image.height,
                    drawPosX, drawPosY, drawTileWidth, drawTileHeight);
                //console.info("(3)drawPosX:" + drawPosX + ", drawPosY:" + drawPosY + ", drawTileWidth:" + drawTileWidth + ", drawTileHeight:" + drawTileHeight);
                ////canvasContext.drawImage(image, 0, 0, image.width, image.height,
                ////    posX, posY, tileWidth, tileHeight);
            }catch(e){console.error(e.message);}
        }
    },

    _getTileTopLeftPos: function(offsetX, offsetY, tilePoint, tileBounds, pyramidModel){
        var posInBounds = pyramidModel.getTopLeftPixelPointInBounds(tilePoint, tileBounds);

        return new Z.Point(posInBounds.x + offsetX, posInBounds.y + offsetY);
    },

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

    _nearestPowerOfTwo: function(num){
        //return Math.pow( 2, Math.round( Math.log( num ) / Math.LN2 ) );
        return num;
    }
});