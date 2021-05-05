/**
 * Created by Administrator on 2015/12/2.
 */
Z.Extrude = Z.Geometry.extend({
    initialize: function(crs, paths, height, baseHeight, options){
        options = options || {};
        Z.Geometry.prototype.initialize.call(this, crs, baseHeight, options);
        this.crs = crs || Z.CRS.EPSG4490;   //默认坐标系
        this.paths = paths;        //paths为三维数组，例如：[[[80,120], [80,121], [78, 110]], [[98,101], [79,100], [89,110]]]
        this.height = height;
        //this.baseHeight = baseHeight || 0;
        //this.extrudeUnit = options.extrudeUnit || Z.ExtrudeUnit.Meter;
        this.cw = options.cw || false;
        this.ignoreCw = options.ignoreCw || false;
        this.type = "extrude";
    },

    getBounds: function(){
        if(this.needsUpdate || !this._bounds){
            var pathBounds = Z.GeometryUtil.getPathBounds(this.paths, this.lngStart),
                southWest = pathBounds.getSouthWest(),
                northEast = pathBounds.getNorthEast();

            southWest.alt = this.baseHeight;
            //northEast.alt = this.baseHeight + this.height;
            northEast.alt = this.height;

            this._bounds = Z.LatLngBounds.create(southWest, northEast);
            this.needsUpdate = false;
        }

        return this._bounds;
    },

    clone: function(){
        var paths = Z.Util.arrayClone(this.paths);

        return new Z.Extrude(this.crs, paths, this.height, this.baseHeight, {
            cw: this.cw,
            ignoreCw: this.ignoreCw,
            lngStart: this.lngStart
        });
    }
});