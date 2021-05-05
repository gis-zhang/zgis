/**
 * Created by Administrator on 2015/12/2.
 */
Z.CircleExtrude = Z.Extrude.extend({
    initialize: function(circle, height){
        //Z.Extrude.prototype.initialize.apply(this);
        //this.crs = crs || Z.CRS.EPSG4490;   //默认坐标系
        //this.paths = paths;        //paths为三维数组，例如：[[[80,120], [80,121], [78, 110]], [[98,101], [79,100], [89,110]]]
        //this.height = height;
        ////this.baseHeight = baseHeight || 0;
        //this.type = "extrude";
        this.crs = circle.crs || Z.CRS.EPSG4490;   //默认坐标系
        this.circle = circle;
        this.height = height;
        this.type = "circleextrude";

        if(this.circle && this.circle.center){
            this.baseHeight = this.circle.center.alt || this.baseHeight;
        }
    },

    getBounds: function(){
        if(this.needsUpdate || !this._bounds){
            var pathBounds = Z.GeometryUtil.getPathBounds(this.paths),
                southWest = pathBounds.getSouthWest(),
                northEast = pathBounds.getNorthEast();

            southWest.alt = this.baseHeight;
            northEast.alt = this.baseHeight + this.height;

            this._bounds = Z.LatLngBounds.create(southWest, northEast);
            this.needsUpdate = false;
        }

        return this._bounds;
    },

    clone: function(){
        var paths = Z.Util.arrayClone(this.paths);

        return new Z.Extrude(this.crs, paths, this.height, this.baseHeight);
    }
});