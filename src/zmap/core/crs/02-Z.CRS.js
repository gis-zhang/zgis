/**
 * Created by Administrator on 2015/12/3.
 */
Z.CRS = {
    projection: null,   //采用的地图投影,地理坐标系无地图投影，此项为null
    gcs: null,           //对应的地理坐标系
    code:'',

    ////spatialToMeterPoint: function(latlng){   // (LatLng) -> Point
    //latLngToMeterPoint: function(latlng){   // (LatLng) -> Point
    //    return new Z.Point(latlng.lng, latlng.lat);
    //},
    //
    ////meterToSpatialPoint: function(point){     // (Point) -> LatLng
    //meterToLatLngPoint: function(point){     // (Point) -> LatLng
    //    return new Z.LatLng(point.y, point.x);
    //},

    project: function(latlng){    // (LatLng) -> Point
        if(this.projection){
            return this.projection.project(latlng);
        }else{
            return new Z.Point(latlng.lng, latlng.lat);
        }
    },

    unproject: function(point){      // (Point) -> LatLng
        if(this.projection) {
            return this.projection.unproject(point);
        }else{
            return new Z.LatLng(point.y, point.x);
        }
    }//,

    //latLngToMeterPoint: function (latlng) { // (LatLng) -> Point
    //    return this.projection.project(latlng);
    //},
    //
    //meterPointToLatLng: function (point) { // (Point) -> LatLng
    //    return this.projection.unproject(point);
    //},
    //
    //projectLatLngOffset: function (latLngOffset) { // (LatLng) -> Point
    //    return this.projection.latLngOffsetToPlane(latLngOffset);
    //},
    //
    //unprojectLatLngOffset: function (distance) { // (Point) -> LatLng
    //    return this.projection.planeOffsetToLatLng(distance);
    //}
};

Z.CRS.Simple = Z.extend({}, Z.CRS, {
    code:'Simple',
    projection: Z.Projection.Simple
});

Z.CRS.Geometry = Z.extend({}, Z.CRS, {                 //地理坐标系，将地球作为正圆进行计算
    code: 'Geometry',
    projection: Z.Projection.LatLng,
    //DEG_TO_RAD : Math.PI / 180,
    //RAD_TO_DEG : 180 / Math.PI,
    EarthRadius:6378137,
    Circumference: Math.PI * 6378137,    //半周长

    ////spatialToMeterPoint: function(latlng){   // (LatLng) -> Point
    //latLngToMeterPoint: function(latlng){   // (LatLng) -> Point
    //    var x = Math.cos(latlng.lat * Math.PI / 180) * Z.CRS.Geometry.Circumference * latlng.lng / 180,
    //        y = Z.CRS.Geometry.Circumference * latlng.lat / 180;
    //
    //    return new Z.Point(x, y);
    //},
    //
    ////meterToSpatialPoint: function(point){     // (Point) -> LatLng
    //meterToLatLngPoint: function(point){     // (Point) -> LatLng
    //    var lat = 180 * point.y / Z.CRS.Geometry.Circumference;
    //    var lng = 180  * point.x / (Z.CRS.Geometry.Circumference *  Math.cos(Math.PI * lat / 180));
    //
    //    return new Z.LatLng(lat, lng);
    //}
});

//Z.CRS.EPSG3857 = Z.extend({}, Z.CRS, {                 //投影坐标系
//    code: 'EPSG:3857',
//    projection: Z.Projection.SphericalMercator
//});
//
//Z.CRS.EPSG900913 = Z.extend({}, Z.CRS, {           //投影坐标系
//    code: 'EPSG:900913',
//    projection: Z.Projection.SphericalMercator
//});
//
//Z.CRS.EPSG4490 = Z.extend({}, Z.CRS, {
//    code: 'EPSG:4490',
//    projection: Z.Projection.SphericalMercator
//});
//
////Z.CRS.CGS2000 = Z.extend({}, Z.CRS.EPSG4490);
//
//Z.CRS.EPSG4326 = Z.extend({}, Z.CRS, {
//    code: 'EPSG:4326',
//    projection: Z.Projection.Mercator
//});


Z.CRS.EPSG4490 = Z.extend({}, Z.CRS.Geometry, {
    code: 'EPSG4490'
});

//Z.CRS.CGS2000 = Z.extend({}, Z.CRS.EPSG4490);

Z.CRS.EPSG4326 = Z.extend({}, Z.CRS.Geometry, {
    code: 'EPSG4326'
});

Z.CRS.EPSG3857 = Z.extend({}, Z.CRS, {                 //投影坐标系
    code: 'EPSG3857',
    projection: Z.Projection.SphericalMercator,
    gcs: Z.CRS.EPSG4326
});

Z.CRS.EPSG900913 = Z.extend({}, Z.CRS, {           //投影坐标系
    code: 'EPSG900913',
    projection: Z.Projection.SphericalMercator,
    gcs: Z.CRS.EPSG4326
});