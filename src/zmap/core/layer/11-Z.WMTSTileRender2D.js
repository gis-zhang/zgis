/**
 * Created by Administrator on 2015/11/2.
 */
Z.WMTSTileRender2D = Z.TileRender2D.extend({
    initialize: function(urls, options){
        Z.TileRender2D.prototype.initialize.apply(this, arguments);
    },

    getTileLayer: function(urls, options){
        //return new L.TileLayer.TDT.Vector();//L.tileLayer();
        var layerOptions = this._getLeafletOptions(options);
        return new L.TileLayer.WMTS(urls, layerOptions);
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
            attribution:(options.attribution !== undefined)? options.attribution : undefined,
            layer: (options.params.layer !== undefined)? options.params.layer : '0',
            style: (options.params.style !== undefined)? options.params.style : 'default',
            tilematrixSet: (options.params.tilematrixSet !== undefined)? options.params.tilematrixSet : '',
            format: (options.tileInfo.format !== undefined)? options.tileInfo.format :'image/jpeg'
        };
    }
});