/**
 * Created by Administrator on 2015/12/2.
 */
Z.IGraphicRender = Z.Class.extend({
    includes: Z.EventManager,

    initialize: function(){

    },

    onAdd: function(featureLayer){
        throw new Error("方法onAdd未实现");
    },

    onRemove: function(featureLayer){
        throw new Error("方法onRemove未实现");
    },

    updateGeometry: function(geometry){},

    updateSymbol: function(symbol){}
});