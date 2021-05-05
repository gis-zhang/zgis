/**
 * Created by Administrator on 2015/10/31.
 */
Z.IGraphicLayerRender = Z.Class.extend({
    includes: Z.EventManager,

    onAdd: function(scene){ },

    onRemove: function(scene){},

    show: function(){},

    hide: function(){},

    setOpacity: function(opacity){},

    getZIndex: function(){},

    setZIndex: function(zIndex){},

    refresh: function(tileOptions){},

    addGraphic: function(graphicLayer, graphic){},

    removeGraphic: function(graphicLayer, graphic){},

    clear: function(){}
});