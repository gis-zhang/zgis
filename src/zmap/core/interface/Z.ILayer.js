/**
 * Created by Administrator on 2015/10/25.
 */

Z.ILayer = Z.Class.extend({
    includes: Z.EventManager,

    onAdd: function(scene){},

    onRemove: function(scene){},

    show: function(){},

    hide: function(){},

    setOpacity: function(opacity){},

    setZIndex: function(zIndex){},

    setZoomRange: function(minZoom, maxZoom){},

    getContainerPane: function(){},

    refresh: function(){}
});
