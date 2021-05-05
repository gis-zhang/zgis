/**
 * Created by Administrator on 2015/10/31.
 */
Z.GraphicLayerRender2D = Z.IGraphicLayerRender.extend({
    initialize: function(options){
        this._leafletLayer = this._getGraphicLayer(options);
        this._scene = null;
        this._containerPane = null;
    },

    onAdd: function(graphicLayer, scene, index, containerPane, groupPane){
        this._scene = scene
        this._containerPane = containerPane;
        scene._leafletMap.addLayer(this._leafletLayer);
        this._applyEvents('on');
    },

    onRemove: function(scene){
        this._scene = null;
        this._containerPane = null;
        scene._leafletMap.removeLayer(this._leafletLayer);
        this._applyEvents('off');
    },

    show: function(){
        throw new Error("show方法尚未实现");
    },

    hide: function(){
        throw new Error("hide方法尚未实现");
    },

    setOpacity: function(opacity){
        throw new Error("setOpacity方法尚未实现");
    },

    getZIndex: function(){
        //throw new Error("getZIndex方法尚未实现");
        return 0;
    },

    setZIndex: function(zIndex){
        //throw new Error("setZIndex方法尚未实现");
    },

    refresh: function(options){
        throw new Error("refresh方法尚未实现");
    },

    addGraphic: function(graphicLayer, graphic){
        if(graphic instanceof Z.Graphic || graphic instanceof Z.MultiGraphic) {
            graphic.onAdd(graphicLayer, this._leafletLayer, this._scene);

            //添加事件
        }
    },

    removeGraphic: function(graphicLayer, graphic){
        if(graphic instanceof Z.Graphic || graphic instanceof Z.MultiGraphic) {
            graphic.onRemove(graphicLayer, this._leafletLayer, this._scene);

            //移除事件
        }
    },

    addGraphics: function(graphicLayer, graphics){
        graphics = graphics || [];

        if(graphics.length <= 0){
            return;
        }

        for(var i = 0; i < graphics.length; i++) {
            var graphic = graphics[i];

            if (graphic instanceof Z.Graphic || graphic instanceof Z.MultiGraphic) {
                graphic.onAdd(graphicLayer, this._leafletLayer, this._scene);

                //添加事件
            }
        }
    },

    removeGraphics: function(graphicLayer, graphics){
        graphics = graphics || [];

        if(graphics.length <= 0){
            return;
        }

        for(var i = 0; i < graphics.length; i++) {
            var graphic = graphics[i];

            if (graphic instanceof Z.Graphic || graphic instanceof Z.MultiGraphic) {
                graphic.onRemove(graphicLayer, this._leafletLayer, this._scene);

                //移除事件
            }
        }
    },

    clear: function(){
        if(this._leafletLayer){
            this._leafletLayer.clearLayers();
        }
    },

    on: function(event, func, scope){
        if(this._leafletLayer){
            this._leafletLayer.on(event, func, scope);
        }
    },

    off: function(event, func, scope){
        if(this._leafletLayer){
            this._leafletLayer.off(event, func, scope);
        }
    },

    _getGraphicLayer: function(options){
        return new L.FeatureGroup();
    },

    _applyEvents: function(onOff){
        var onOff = onOff || 'on';

        this._applyLayerEvents(onOff);
    },

    _applyLayerEvents: function(onOff){
        var thisObj = this,
            domEvents = ['dblclick', 'click', 'mousedown', 'mouseup', 'mouseover',
                'mouseout', 'mousemove', 'contextmenu'];

        for (var i = 0, len = domEvents.length; i < len; i++) {
            this._leafletLayer[onOff](domEvents[i], thisObj._onLayerEvent, thisObj);
        }
    },

    _onLayerEvent: function(leafletEvent){
        this.fire(leafletEvent.type, {
            latlng: Z.LeafletUtil.latLngFromLeaflet(leafletEvent.latlng),
            scenePoint: Z.LeafletUtil.pointFromLeaflet(leafletEvent.layerPoint),
            containerPoint: Z.LeafletUtil.pointFromLeaflet(leafletEvent.containerPoint),
            originalEvent: leafletEvent.originalEvent,
            objects: []
        });
    }
});