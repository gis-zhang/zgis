/**
 * Created by Administrator on 2015/12/2.
 */
Z.Polyline = Z.Geometry.extend({
    initialize: function(paths, crs, options){      //paths为三维数组，例如：[[[80,120], [80,121], [78, 110]], [[98,101], [79,100], [89,110]]]
        Z.Geometry.prototype.initialize.call(this, crs, null, options);
        this.crs = crs;
        this.paths = paths;
        this.type = "polyline";
    },

    getBounds: function(){
        return Z.GeometryUtil.getPathBounds(this.paths, this.lngStart);
    },

    clone: function(){
        var paths = Z.Util.arrayClone(this.paths);

        return new Z.Polyline(paths, this.crs, {
            baseHeight: this.baseHeight,
            lngStart: this.lngStart
        });
    }
});