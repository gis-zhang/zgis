/**
 * Created by Administrator on 2015/12/2.
 */
Z.Circle = Z.Geometry.extend({
    /**
     * 几何对象：圆。在三维场景中位于xy平面上，法线方向为左手坐标系的z轴负方向
     * @param center  中心点（空间坐标）
     * @param radius  半径（单位：米）
     * @param crs     坐标系
     */
    initialize: function(crs, center, radius, radiusType){
        Z.Geometry.prototype.initialize.call(this, crs);
        this.crs = crs || Z.CRS.EPSG4490;
        this.center = center;
        this.radius = radius;
        this.radiusType = (radiusType === 'meter') ? 'meter' : 'pixel';   //pixel:半径单位为像素；meter：半径单位为米
        this.type = "circle";

        this.baseHeight = this.center ? this.center.alt : this.baseHeight;
    },

    getBounds: function(projModel){
        //return Z.GeometryUtil.getPathBounds(this.rings);
        var bounds =null;

        if(this.crs &&  this.center){
            bounds = Z.LatLngBounds.create(this.center, this.center);

            if(typeof this.radius === "number"){
                //var radiusLatLngOffset = this.crs.unprojectLatLngOffset(Z.Point.create(this.radius, this.radius)),
                var radiusLatLngOffset = projModel.unproject(Z.Point.create(this.radius, this.radius)),
                    minLatLng = this.center.subtract(radiusLatLngOffset),
                    maxLatLng = this.center.add(radiusLatLngOffset);

                bounds = Z.LatLngBounds.create(minLatLng, maxLatLng);
            }

        }

        return bounds;
    },

    clone: function(){
        var center = this.center ? this.center.clone() : null;

        return new Z.Circle(this.crs, center, this.radius, this.radiusType);
    }
});