/**
 * Created by Administrator on 2015/10/31.
 */
Z.TileRender2D = Z.ITileRender.extend({
    initialize: function(urls, options){
        this._leafletLayer = this.getTileLayer(urls, options);
        this._scene = null;
    },

    getTileLayer: function(urls, options){
        var layerOptions = this._getLeafletOptions(options);
        return new L.TileLayer(urls[0], layerOptions);
    },

    onAdd: function(scene, index, containerPane, groupPane){
        this._scene = scene;
        scene._leafletMap.addLayer(this._leafletLayer);
    },

    onRemove: function(scene){
        this._scene = undefined;
        scene._leafletMap.removeLayer(this._leafletLayer);
    },

    show: function(){
        this._leafletLayer.getContainer().style.display = "block";
    },

    hide: function(){
        this._leafletLayer.getContainer().style.display = "none";
    },

    setOpacity: function(opacity){
        this._leafletLayer.setOpacity(opacity);
    },

    setZIndex: function(zIndex){
        this._leafletLayer.setZIndex(zIndex);
    },

    refresh: function(tileOptions){
        var leafTileOptions = this._getLeafletOptions(tileOptions);

        for(var opt in leafTileOptions){
            if(leafTileOptions[opt] !== undefined){
                this._leafletLayer[opt] = leafTileOptions[opt];
            }
        }
    },

    /*将options转换成leaflet图层的options参数*/
    _getLeafletOptions: function(options){
        return {
            minZoom:(options.minZoom !== undefined)? options.minZoom : 1,
            maxZoom:(options.maxZoom !== undefined)? options.maxZoom : 20,
            zoomOffset:(options.zoomOffset !== undefined)? options.zoomOffset : undefined,
            tileSize:(options.tileSize !== undefined)? options.tileSize : undefined,
            opacity:(options.opacity !== undefined)? options.opacity : undefined,
            zIndex:(options.zIndex !== undefined)? options.zIndex : undefined,
            bounds:(options.extent !== undefined)?Z.LeafletUtil.latLngBoundsToLeaflet(options.extent) : undefined,
            errorTileUrl:(options.errorTileUrl !== undefined)? options.errorTileUrl : undefined,
            attribution:(options.attribution !== undefined)? options.attribution : undefined
        };
    }
});