/**
 * Created by Administrator on 2015/12/2.
 */
Z.Sphere = Z.Geometry.extend({
    //所有的角度均用度表示而不是弧度
    initialize: function(crs, center, radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength){
        Z.Geometry.prototype.initialize.call(this, crs);
        this.crs = crs || Z.CRS.EPSG4490;   //默认坐标系
        this.center = center;                    //Z.LatLng
        this.radius = radius;                    //number(meter)
        this.widthSegments = widthSegments || 360;
        this.heightSegments = heightSegments || 180;
        this.phiStart = phiStart || 0;
        this.phiLength = phiLength || 360;
        this.thetaStart = thetaStart || 0;
        this.thetaLength = thetaLength || 180;
        this.type = "sphere";

        this.baseHeight = this.center ? this.center.alt : this.baseHeight;
    },

    getBounds: function(projModel){
        //return Z.GeometryUtil.getPathBounds(this.rings);
        var bounds =null;

        if(this.crs &&  this.center){
            bounds = Z.LatLngBounds.create(this.center, this.center);

            if(typeof this.radius === "number"){
                //var radiusLatLngOffset = this.crs.unprojectLatLngOffset(Z.Point.create(this.radius, this.radius, this.radius)),
                var radiusLatLngOffset = projModel.unproject(Z.Point.create(this.radius, this.radius, this.radius)),
                    minLatLng = this.center.subtract(radiusLatLngOffset),
                    maxLatLng = this.center.add(radiusLatLngOffset);

                bounds = Z.LatLngBounds.create(minLatLng, maxLatLng);
            }

        }

        return bounds;
    },

    clone: function(){
        var center = this.center ? this.center.clone() : null;

        return new Z.Sphere(this.crs,
            center,
            this.radius,
            this.widthSegments,
            this.heightSegments,
            this.phiStart,
            this.phiLength,
            this.thetaStart,
            this.thetaLength);
    }
});