/**
 * Created by Administrator on 2015/12/2.
 */
Z.Cylinder = Z.Geometry.extend({
    initialize: function(crs, bottomCenter, radiusTop, radiusBottom, height, radiusSegments, thetaStart, thetaLength, openEnded){
        Z.Geometry.prototype.initialize.call(this, crs);
        this.crs = crs || Z.CRS.EPSG4490;   //默认坐标系
        this.bottomCenter = bottomCenter;
        this.radiusTop = radiusTop;
        this.radiusBottom = radiusBottom;
        this.height = height;
        this.radiusSegments = radiusSegments;
        this.thetaStart = thetaStart;
        this.thetaLength = thetaLength;
        this.openEnded = openEnded;
        this.type = "cylinder";
    },

    getBounds: function(){
        throw new Error("方法getBounds未实现");
    },

    clone: function(){
        var center = this.bottomCenter ? this.bottomCenter.clone() : null;

        return new Z.Cylinder(this.crs,
            center,
            this.radiusTop,
            this.radiusBottom,
            this.height,
            this.radiusSegments,
            this.thetaStart,
            this.thetaLength,
            this.openEnded);
    }
});