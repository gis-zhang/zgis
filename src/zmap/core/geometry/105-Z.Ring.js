/**
 * Created by Administrator on 2015/12/2.
 */
Z.Ring = Z.Geometry.extend({
    /**
     * 几何对象：圆环。在三维场景中位于xy平面上，法线方向为左手坐标系的z轴负方向
     * 所有的角度均用度表示而不是弧度
     * @param crs   坐标系
     * @param center   中心点
     * @param innerRadius   内环半径
     * @param outerRadius   外环半径
     * @param thetaSegments   沿圆周方向被切分的分数
     * @param thetaStart    起始角
     * @param thetaLength   角度跨度
     */
    initialize: function(crs, center, innerRadius, outerRadius){
        Z.Geometry.prototype.initialize.call(this, crs);
        this.crs = crs || Z.CRS.EPSG4490;   //默认坐标系
        this.center = center;
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.type = "ring";

        this.baseHeight = this.center ? this.center.alt : this.baseHeight;
    },

    getBounds: function(projModel){
        //return Z.GeometryUtil.getPathBounds(this.rings);
        var bounds =null;

        if(this.crs &&  this.center){
            bounds = Z.LatLngBounds.create(this.center, this.center);

            if(typeof this.radius === "number"){
                //var radiusLatLngOffset = this.crs.unprojectLatLngOffset(Z.LatLng.create(this.outerRadius, this.outerRadius)),
                var radiusLatLngOffset = projModel.unproject(Z.LatLng.create(this.outerRadius, this.outerRadius)),
                    minLatLng = this.center.subtract(radiusLatLngOffset),
                    maxLatLng = this.center.add(radiusLatLngOffset);

                bounds = Z.LatLngBounds.create(minLatLng, maxLatLng);
            }

        }

        return null;
    },

    clone: function(){
        var center = this.center ? this.center.clone() : null;

        return new Z.Ring(this.crs, center, this.innerRadius, this.outerRadius);
    }
});