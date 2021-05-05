/**
 * Created by Administrator on 2015/12/2.
 */
Z.Polygon = Z.Geometry.extend({
    initialize: function(rings, crs, options){      //rings为三维数组，例如：[[[80,120], [80,121], [78, 110]], [[98,101], [79,100], [89,110]]]
        options = options || {};
        Z.Geometry.prototype.initialize.call(this, crs, null, options);
        this.crs = crs;
        this.rings = rings;
        this.cw = options.cw || false;
        this.ignoreCw = options.ignoreCw || false;
        this.type = "polygon";
    },

    getBounds: function(){
        return Z.GeometryUtil.getPathBounds(this.rings, this.lngStart);
    },

    clone: function(){
        var rings = this.rings ? Z.Util.arrayClone(this.rings) : null;

        return new Z.Polygon(rings, this.crs, {
            cw: this.cw,
            ignoreCw: this.ignoreCw,
            lngStart: this.lngStart
        });
    }
});