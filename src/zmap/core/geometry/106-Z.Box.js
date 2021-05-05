/**
 * Created by Administrator on 2015/12/2.
 */
Z.Box = Z.Geometry.extend({
    initialize: function(crs, center, width, height, depth, options){
        options = options || {};
        Z.Geometry.prototype.initialize.call(this, crs, null, options);
        this.crs = crs || Z.CRS.EPSG4490;   //默认坐标系
        this.center = center;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.type = "box";
    },

    getBounds: function(){
        //var bounds =null;
        //
        //if(this.crs &&  this.center){
        //    bounds = Z.LatLngBounds.create(this.center, this.center);
        //
        //    if(typeof this.radius === "number"){
        //        var radiusLatLngOffset = this.crs.unprojectLatLngOffset(Z.LatLng.create(this.outerRadius, this.outerRadius)),
        //            minLatLng = this.center.subtract(radiusLatLngOffset),
        //            maxLatLng = this.center.add(radiusLatLngOffset);
        //
        //        bounds = Z.LatLngBounds.create(minLatLng, maxLatLng);
        //    }
        //
        //}
        //
        //return null;
        throw new Error("方法getBounds未实现");
    },

    clone: function(){
        var center = this.center ? this.center.clone() : null;

        return new Z.Box(this.crs, center, this.width, this.height, this.depth);
    }
});