/**
 * Created by Administrator on 2015/11/2.
 */
Z.TemplateTileLayer = Z.TileLayer.extend({
    //initialize: function(urls, options){
    //    Z.TileLayer.prototype.initialize.apply(this, arguments);    //调用超类的构造函数
    //},

    getTileRender2D: function(urls, options){
        //return new Z.WMTSTileRender2D(urls, options);
        throw error("不支持的方法");
    },

    getTileRender3D: function(urls, options){
        return new Z.TemplateTileRender3D(urls, options);
    }
});