/**
 * Created by Administrator on 2015/12/3.
 */
Z.ProjModel = Z.Class.extend({
    //initialize: function(crs, projection){
    initialize: function(fromCRS, toCRS){
        //this._crs = crs || Z.CRS.EPSG4326;                          //采用的全局坐标系
        //this._projObj = projection || Z.Projection.LatLng;          //采用的平面地图投影

        this.fromCRS = fromCRS || Z.CRS.EPSG4326;
        this.toCRS = toCRS || Z.CRS.EPSG4326;
    },

    project: function(latLng){    // (LatLng) -> Point
        //return this._projObj.project(latlng);
        //var projObj = null;

        if(this._isSameCRS()){
            //return new Z.Point(latlng.lng, latlng.lat);
            return this.fromCRS.project(latLng);
        }

        var fromGcs = this.fromCRS.gcs,
            toGcs = this.toCRS.gcs;

        if(!fromGcs && !toGcs) {    //都是地理坐标系
            if (this.fromCRS.code !== this.toCRS.code) {
                latLng = this._transformGCS(latLng, this.fromCRS, this.toCRS);
            }

            return this.toCRS.project(latLng);
        }else if(fromGcs && !toGcs){     //投影坐标系到地理坐标系
            if (fromGcs.code !== this.toCRS.code) {
                var fromLatLng = this.fromCRS.unproject(new Z.Point(latLng.lng, latLng.lat));
                latLng = this._transformGCS(fromLatLng, fromGcs, this.toCRS);

                return this.toCRS.project(latLng);
            }else{
                return new Z.Point(latLng.lng, latLng.lat);
            }
        }else if(!fromGcs && toGcs){     //地理坐标系到投影坐标系
            if (this.fromCRS.code !== toGcs.code) {
                latLng = this._transformGCS(fromLatLng, this.fromCRS, toGcs);
            }

            return this.toCRS.project(latLng);
        }else{                         //投影坐标系到投影坐标系
            var fromLatLng = this.fromCRS.unproject(new Z.Point(latLng.lng, latLng.lat)),
                toLatLng = fromLatLng;

            if(fromGcs.code !== toGcs.code){
                toLatLng = this._transformGCS(fromLatLng, fromGcs, toGcs);
            }

            return this.toCRS.project(toLatLng);
        }
    },

    unproject: function(point){      // (Point) -> LatLng
        //return this._projObj.unproject(point);

        if(this._isSameCRS()){
            //return new Z.Point(latlng.lng, latlng.lat);
            return this.fromCRS.unproject(point);
        }

        var fromGcs = this.fromCRS.gcs,
            toGcs = this.toCRS.gcs;

        if(!fromGcs && !toGcs) {    //都是地理坐标系
            var latLng = this.toCRS.unproject(point);

            if (this.fromCRS.code !== this.toCRS.code) {
                latLng = this._transformGCS(latLng, this.toCRS, this.fromCRS);
            }

            return latLng;
        }else if(fromGcs && !toGcs){     //投影坐标系到地理坐标系
            if (fromGcs.code !== this.toCRS.code) {
                var toLatLng = this.toCRS.unproject(point);
                var fromLatLng = this._transformGCS(toLatLng, this.toCRS, fromGcs);

                var projPoint = this.fromCRS.project(fromLatLng);

                return new Z.LatLng(projPoint.y, projPoint.x);
            }else{
                return new Z.LatLng(point.y, point.x);
            }
        }else if(!fromGcs && toGcs){     //地理坐标系到投影坐标系
            var latLng = this.toCRS.unproject(point);

            if (this.fromCRS.code !== toGcs.code) {
                latLng = this._transformGCS(fromLatLng, toGcs, this.fromCRS);
            }

            return latLng;
        }else{                         //投影坐标系到投影坐标系
            var toLatLng = this.toCRS.unproject(new Z.Point(latlng.lng, latlng.lat)),
                fromLatLng = toLatLng;

            if(fromGcs.code !== toGcs.code){
                fromLatLng = this._transformGCS(toLatLng, toGcs, fromGcs);
            }

            var projPoint = this.fromCRS.project(fromLatLng);

            return new Z.LatLng(projPoint.y, projPoint.x);
        }
    },

    //正向变换
    forwardTransform: function(latLng){
        if(this._isSameCRS()){
            return latLng;
        }else if(this.toCRS.gcs && (this.toCRS.gcs.code === this.fromCRS.code)){
            var projPoint = this.toCRS.project(latLng);

            return new Z.LatLng(projPoint.y, projPoint.x);
        }else{
            //未考虑更多情况，待完善
            return latLng;
        }
    },

    //逆向变换
    reverseTransform: function(latLng){
        if(this._isSameCRS()){
            return latLng;
        }else if(this.toCRS.gcs && (this.toCRS.gcs.code === this.fromCRS.code)){
            var unprojLatLng = this.toCRS.unproject(new Z.Point(latLng.lng, latLng.lat));

            return unprojLatLng;
        }else{
            //未考虑更多情况，待完善
            return latLng;
        }
    },

    _isSameCRS: function(){
        return this.fromCRS && this.toCRS && (this.fromCRS.code === this.toCRS.code);
    },

    //在地理坐标系之间转换
    _transformGCS: function(latLng, fromGCS, toGCS){
        return latLng;
    }
});

//Z.CRS.Simple = Z.extend({}, Z.CRS, {
//    code:'simple',
//    projection: Z.Projection.Simple
//});
//
//Z.CRS.Geometry = Z.extend({}, Z.CRS, {                 //地理坐标系，将地球作为正圆进行计算
//    code: 'Geometry',
//    //DEG_TO_RAD : Math.PI / 180,
//    //RAD_TO_DEG : 180 / Math.PI,
//    EarthRadius:6378137,
//    Circumference: Math.PI * 6378137,    //半周长
//
//    //spatialToMeterPoint: function(latlng){   // (LatLng) -> Point
//    latLngToMeterPoint: function(latlng){   // (LatLng) -> Point
//        var x = Math.cos(latlng.lat * Math.PI / 180) * Z.CRS.Geometry.Circumference * latlng.lng / 180,
//            y = Z.CRS.Geometry.Circumference * latlng.lat / 180;
//
//        return new Z.Point(x, y);
//    },
//
//    //meterToSpatialPoint: function(point){     // (Point) -> LatLng
//    meterToLatLngPoint: function(point){     // (Point) -> LatLng
//        var lat = 180 * point.y / Z.CRS.Geometry.Circumference;
//        var lng = 180  * point.x / (Z.CRS.Geometry.Circumference *  Math.cos(Math.PI * lat / 180));
//
//        return new Z.LatLng(lat, lng);
//    }
//});
//
////Z.CRS.EPSG3857 = Z.extend({}, Z.CRS, {                 //投影坐标系
////    code: 'EPSG:3857',
////    projection: Z.Projection.SphericalMercator
////});
////
////Z.CRS.EPSG900913 = Z.extend({}, Z.CRS, {           //投影坐标系
////    code: 'EPSG:900913',
////    projection: Z.Projection.SphericalMercator
////});
////
////Z.CRS.EPSG4490 = Z.extend({}, Z.CRS, {
////    code: 'EPSG:4490',
////    projection: Z.Projection.SphericalMercator
////});
////
//////Z.CRS.CGS2000 = Z.extend({}, Z.CRS.EPSG4490);
////
////Z.CRS.EPSG4326 = Z.extend({}, Z.CRS, {
////    code: 'EPSG:4326',
////    projection: Z.Projection.Mercator
////});
//
//
//Z.CRS.EPSG4490 = Z.extend({}, Z.CRS.Geometry, {
//    code: 'EPSG4490'
//});
//
////Z.CRS.CGS2000 = Z.extend({}, Z.CRS.EPSG4490);
//
//Z.CRS.EPSG4326 = Z.extend({}, Z.CRS.Geometry, {
//    code: 'EPSG4326'
//});
//
//Z.CRS.EPSG3857 = Z.extend({}, Z.CRS, {                 //投影坐标系
//    code: 'EPSG3857',
//    projection: Z.Projection.SphericalMercator,
//    gcs: Z.CRS.EPSG4326
//});
//
//Z.CRS.EPSG900913 = Z.extend({}, Z.CRS, {           //投影坐标系
//    code: 'EPSG900913',
//    projection: Z.Projection.SphericalMercator,
//    gcs: Z.CRS.EPSG4326
//});