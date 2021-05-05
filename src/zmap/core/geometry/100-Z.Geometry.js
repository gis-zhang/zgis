/**
 * Created by Administrator on 2015/12/2.
 */
Z.Geometry = Z.Class.extend({
    initialize: function(crs, baseHeight, options){
        this.crs = crs || null;
        this.baseHeight = baseHeight || 0;
        this.type = "geometry";
        this.needsUpdate = true;
        this._bounds = null;

        options = options || {};
        this.lngStart = options.lngStart || false;
    },

    getBounds: function(){
        throw new error("getBounds方法尚未实现");
    },

    clone: function(){
        throw new error("clone方法尚未实现");
    }
});