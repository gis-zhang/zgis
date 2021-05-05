/**
 * Created by Administrator on 2015/11/2.
 */
/**
 * Created by Administrator on 2015/10/31.
 */
Z.TDTVectorAnnoTileRender2D = Z.TileRender2D.extend({
    initialize: function(urls, options){
        Z.TileRender2D.prototype.initialize.apply(this, arguments);
    },

    getTileLayer: function(urls, options){
        return new L.TileLayer.TDT.VectorAnno();
    }
});