/**
 * Created by Administrator on 2015/10/26.
 */
Z.IScene = Z.Class.extend({
    includes: Z.EventManager,

    getBounds: function(){ return null;},

    getPixelSceneRatio: function(){return null},

    setZoom: function(zoomLevel){},

    getZoom: function(){},

    getScale: function(zoom){},

    getSize: function(){},

    panTo: function(center, zoomLevel){},

    //getContentSize: function(){return null;},

    latLngToScreenPoint: function(latLng){return null; },

    screenPointToLatLng: function(point){},

    addLayer: function(layer){},

    removeLayer: function(layer){},

    openPopup: function(popup){},

    closePopup: function(popup){},

    addControl: function(control){},

    removeControl: function(control){ },

    refresh: function(){},

    setSunLight: function(angle){},

    setAmbientLight: function(color){},

    rotateByEuler: function(rotate){},

    resetRotate: function(){},

    getRotateByRad: function(){},

    getContentBounds: function(){}

    //on: function(event, func){},
    //
    //off: function(event, func){}
});