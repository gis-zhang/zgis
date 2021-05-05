/**
 * Created by Administrator on 2015/11/2.
 */
Z.WMTSTileLayer = Z.TileLayer.extend({
    //initialize: function(urls, options){
    //    Z.TileLayer.prototype.initialize.apply(this, arguments);    //调用超类的构造函数
    //},

    getTileRender2D: function(urls, options){
        return new Z.WMTSTileRender2D(urls, options);
    },

    getTileRender3D: function(urls, options){
        return new Z.WMTSTileRender3D(urls, options);
    }
});