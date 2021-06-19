/**
 * Created by Administrator on 2015/11/2.
 */
Z.AbstractTDTLayer = Z.WMTSTileLayer.extend({
    initialize: function(urls, options){
        options = options || {};
        //var _urlArray = [];

        var params = {
            layer: '',
            style: 'default',
            format: 'tiles',
            tilematrixSet: ''//,
            //attribution: '天地图'
        };

        Z.Util.applyOptions(params, options, true);
        options.params = params;
        options.pyramidId = "TDT";

        Z.WMTSTileLayer.prototype.initialize.call(this, urls, options);
    },

    getTileRender2D: function(urls, options){
        //return new Z.WMTSTileRender2D(urls, options);
        throw Error("不支持的操作");
    },

    getTileRender3D: function(urls, options){
        return new Z.TDTTileRender3D(urls, options);
    }
});