/**
 * Created by Administrator on 2015/12/2.
 */
//Z.AggragatedSurfaceTexture = Z.Class.extend({
Z.AggragatedSurfaceTexture = Z.CommonCanvasTexture.extend({
    initialize: function(options){
        //this._texture = new Z.CommonCanvasTexture({
        //    padding: 0,
        //    autoWidth: false,
        //    autoHeight: false,
        //    fill: false,
        //    border: false
        //});

        var ops = Z.Util.applyOptions({
                padding: 0,
                autoWidth: false,
                autoHeight: false,
                fill: false,
                border: false
            },
            options,
            false);

        Z.CommonCanvasTexture.prototype.initialize.apply(this, ops);

        this._layers = {};
        //this._tileAnchor = new Z.Point(0, 0);
    },

    addSurfaceLayer: function(layerId, layerType, layerContent, layerIndex, layerOptions){
        if(layerId && layerType){
            layerIndex = (typeof layerIndex === "number") ? (layerIndex || 0) : 0;

            this._layers[layerId] = {
                type: layerType,
                objects: layerContent,
                index: layerIndex,
                options: layerOptions
            };

            this.needsUpdate = true;
        }
    },

    removeSurfaceLayer: function(layerId){
       if(!layerId){
           return;
       }

        if(this._layers[layerId]){
            delete this._layers[layerId];
        }

        this.needsUpdate = true;
    },

    updateLayerIndex: function(layerId, layerIndex){
        if(!layerId || isNaN(layerIndex)){
            return;
        }

        if(this._layers[layerId]){
            this._layers[layerId].index = layerIndex;

            this.needsUpdate = true;
        }
    },

    updateLayerContent: function(layerId, layerContent, layerOptions){
        if(!layerId || (!layerContent && !layerOptions)){
            return;
        }

        if(this._layers[layerId]){
            if(layerContent){
                this._layers[layerId].objects = layerContent;
            }

            if(layerOptions){
                this._layers[layerId].options = layerOptions;
                //console.info("updateLayerContent: options.topLeft.y=" + layerOptions.topLeft.y);
            }

            this.needsUpdate = true;
        }
    },

    draw: function(){
        var drawContent = [];

        for(var key in this._layers){
            drawContent.push(this._layers[key]);
        }

        //this._texture.draw(drawContent);
        Z.CommonCanvasTexture.prototype.draw.call(this, drawContent);
    }
});