/**
 * 每个像素的rgba值存储要素的索引id号。前8位存储图层索引号，最多可支持256个图层。接下来16位存储要素索引号，最多可存储65536个要素。alpha通道暂不使用，统一设为1
 */
//Z.AggragatedSurfaceTexture = Z.Class.extend({
Z.HotAreaTexture = Z.AggragatedSurfaceTexture.extend({
    initialize: function(){
        var options = {
            fill: true,
            fillSymbol: new Z.SimpleFillSymbol({color: "#000000"})
        };

        Z.AggragatedSurfaceTexture.prototype.initialize.call(this, options);

        //this._layers = {};
        //this._tileAnchor = new Z.Point(0, 0);
        this._lineBuffer = 1;
        this._layerColors = {};     //(layerId, layerColor)

        this._layerMapping = {};    //(layerColor, layerId)
        //this._layerContentMapping = {};    //(graphicColor, graphicContent)

        this._maxLayerCount = Math.pow(2, 8);
        this._maxGraphicCount = Math.pow(2, 16) - 1;
    },

    addSurfaceLayer: function(layerId, layerType, layerContent, layerIndex, layerOptions){
        if(!layerId){
            return;
        }

        Z.AggragatedSurfaceTexture.prototype.addSurfaceLayer.apply(this, arguments);

        var layerColor = this._getLayerColor();
        this._layerColors[layerId] = layerColor;
        this._layerMapping[(layerColor + "")] = {};
    },

    removeSurfaceLayer: function(layerId){
       if(!layerId){
           return;
       }

        Z.AggragatedSurfaceTexture.prototype.removeSurfaceLayer.apply(this, arguments);

        var layerColor = this._layerColors[layerId];
        delete this._layerColors[layerId];
        delete this._layerMapping[(layerColor + "")];
    },
    //
    //updateLayerIndex: function(layerId, layerIndex){
    //    if(!layerId || isNaN(layerIndex)){
    //        return;
    //    }
    //
    //    if(this._layers[layerId]){
    //        this._layers[layerId].index = layerIndex;
    //
    //        this.needsUpdate = true;
    //    }
    //},

    updateLayerContent: function(layerId, layerContent, layerOptions){
        if(!layerId || (!layerContent && !layerOptions)){
            return;
        }

        if(!this._layers[layerId]){
            return;
        }

        this._updateLayerContent(layerId, layerContent);
        this._updateLayerOptions(layerId, layerOptions);

        this.needsUpdate = true;
    },

    draw: function(){
        var drawContent = [];

        for(var key in this._layers){
            drawContent.push(this._layers[key]);
        }

        //this._texture.draw(drawContent);
        Z.CommonCanvasTexture.prototype.draw.call(this, drawContent);
    },

    getGraphic: function(layerId, latLng){
        var latLngBounds = this._latLngBounds,
            pixelSize = this.getSize();

        var pixelX = Math.ceil(pixelSize.x * (latLng.lng - latLngBounds.getWest()) / (latLngBounds.getEast() - latLngBounds.getWest())),
            pixelY = Math.ceil(pixelSize.y * (latLngBounds.getNorth() - latLng.lat) / (latLngBounds.getNorth() - latLngBounds.getSouth()));

        return this._getGraphicByPixel(layerId, pixelX, pixelY);
    },

    _getLayerColor: function(){
        for(var i = 0; i < this._maxLayerCount; i++){
            var exist = false;

            for(var key in this._layerColors){
                if(this._layerColors[key] === i){
                    exist = true;
                    break;
                }
            }

            if(!exist){
                return i;
            }
        }

        if(i >= this._maxLayerCount){
            console.error("图层数量超过了允许的最大值：" + this._maxLayerCount);
        }
    },

    _updateLayerContent: function(layerId, layerContent){
        if(!layerId || !layerContent){
            return;
        }

        var layerColor = this._layerColors[layerId]<<16,
            mapping = this._layerMapping[(this._layerColors[layerId] + "")],
            layerContentLength = layerContent.length,
            //layerContentCopy = [];
            layerContentCopy = new Array(layerContentLength);

        for(var objIndex = 0; objIndex < layerContentLength; objIndex++){
            var curItem = layerContent[objIndex];
            var layerContentItem = {
                object: curItem.object,
                symbol: curItem.symbol.clone(),
                type: curItem.type,
                graphic: curItem.graphic
            };

            var graphicColor = this._getGraphicColor(layerColor, objIndex);
            this._setGraphicSymbol(layerContentItem, graphicColor);

            if(mapping){
                mapping[graphicColor + ""] = layerContentItem;
            }

            //layerContentCopy.push(layerContentItem);
            layerContentCopy[objIndex] = layerContentItem;
        }

        this._layers[layerId].objects = layerContentCopy;
    },

    _setGraphicSymbol: function(layerContentItem, graphicColor){
        var type = layerContentItem.type,
            symbol = layerContentItem.symbol;

        if(type === "polyline"){
            symbol.width += this._lineBuffer;
            symbol.color = graphicColor;
            symbol.opacity = 1;
        }else if(type === "polygon"){
            //this._drawPolygon(canvasContext, objects[objIndex].object, objects[objIndex].symbol, psRatioX, psRatioY);
            symbol.polylineSymbol.color = graphicColor;
            symbol.polylineSymbol.opacity = 1;
            //symbol.fillSymbol.bgColor = graphicColor;
            //symbol.fillSymbol.opacity = 1;
            symbol.fillSymbol = new Z.SimpleFillSymbol({opacity: 1, color: graphicColor, bgColor: graphicColor});
        }
    },

    _getGraphicColor: function(layerColor, graphicLoopIndex){
        if(graphicLoopIndex + 1 >= this._maxGraphicCount){
            console.error("图层中要素数量超过了允许的最大值：" + this._maxGraphicCount);
        }

        var colorNumber = layerColor + graphicLoopIndex + 1;
        var r = (colorNumber >> 16) & 0x0000ff,
            g = (colorNumber >> 8) & 0x0000ff,
            b = colorNumber & 0x0000ff;

        return "rgba(" + r + "," + g + "," + b + ",1)";
    },

    _updateLayerOptions: function(layerId, layerOptions){
        if(layerOptions){
            this._layers[layerId].options = layerOptions;
            //console.info("updateLayerContent: options.topLeft.y=" + layerOptions.topLeft.y);
        }
    },

    _getGraphicByPixel: function(layerId, pixelX, pixelY){
        //var pixelData = this._getPixelData(layerId, pixelX, pixelY);
        var pixelData = this.getPixelData(pixelX, pixelY);
        //console.info(pixelData[0] + "," + pixelData[1] + "," + pixelData[2] + "," + pixelData[3]);
        if(!pixelData){
            return null;
        }
        //console.info(pixelData[0] + "," + pixelData[1] + "," + pixelData[2] + "," + pixelData[3]);
        //去除边缘的图形过渡像素
        if(pixelData[3] !== 255){
            return null;
        }

        var layerColor = pixelData[0],
            graphicColor = pixelData[1]<<8 + pixelData[2];
        //console.info(pixelData[0] + "," + pixelData[1] + "," + pixelData[2] + "," + pixelData[3]);
        if(layerId && layerColor !== this._layerColors[layerId]){
            return null;
        }

        var layerMapping = this._layerMapping[layerColor];

        if(layerMapping){
            var layerMappingId = "rgba(" + pixelData[0] + "," + pixelData[1] + "," + pixelData[2] + ",1)";

            return layerMapping[layerMappingId] ? layerMapping[layerMappingId].graphic : null;
        }else{
            return null;
        }
    }//,

    //_getPixelData: function(layerId, pixelX, pixelY){
    //    var pixelScope = this.getSize();
    //
    //    if(pixelX >= 0 &&
    //        pixelX < pixelScope.x &&
    //        pixelY >= 0 &&
    //        pixelY < pixelScope.y &&
    //        this._context){
    //        var imgData = this._context.getImageData(pixelX, pixelY, 1, 1);
    //
    //        if(imgData.data.length === 4){
    //            return imgData.data;
    //        }else{
    //            return null;
    //        }
    //    }else{
    //        return null;
    //    }
    //}
});