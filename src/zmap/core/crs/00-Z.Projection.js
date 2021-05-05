/**
 * Created by Administrator on 2015/12/3.
 */
//处理空间坐标值与平面距离(米)的变化
//Z.Projection = function(){
//    this.DEG_TO_RAD = Math.PI / 180;
//    this.RAD_TO_DEG = 180 / Math.PI;
//};

Z.Projection = {
    DEG_TO_RAD : Math.PI / 180,
    RAD_TO_DEG : 180 / Math.PI
};

//简单投影，不做任何转换。适用于图片浏览等应用
Z.Projection.Simple = Z.extend({}, Z.Projection, {
    project: function (latlng) {
        return new Z.Point(latlng.lng, latlng.lat);
    },

    unproject: function (point) {
        return new Z.LatLng(point.y, point.x);
    }

    ////将平面偏移转换为空间坐标的偏移量
    //planeOffsetToLatLng: function(planeOffset){
    //    return new Z.LatLng(planeOffset.y, planeOffset.x);
    //},
    //
    ////将空间坐标的偏移量转换为平面偏移
    //latLngOffsetToPlane: function(latLngOffset){
    //    return new Z.Point(latLngOffset.lng, latLngOffset.lat);
    //}
});

//等经纬网投影
Z.Projection.LatLng = Z.extend({}, Z.Projection, {
    Circumference: Math.PI * 6378137,    //半周长

    project: function (latlng) {
        var x = Math.cos(latlng.lat * Math.PI / 180) * Z.Projection.LatLng.Circumference * latlng.lng / 180,
            y = Z.Projection.LatLng.Circumference * latlng.lat / 180;

        return new Z.Point(x, y);
        //return new Z.Point(latlng.lng, latlng.lat);
    },

    unproject: function (point) {
        var lat = 180 * point.y / Z.Projection.LatLng.Circumference;
        var lng = 180  * point.x / (Z.Projection.LatLng.Circumference *  Math.cos(Math.PI * lat / 180));

        return new Z.LatLng(lat, lng);
        //return new Z.LatLng(point.y, point.x);
    }

    ////将平面偏移转换为空间坐标的偏移量
    //planeOffsetToLatLng: function(planeOffset){
    //    return new Z.LatLng(planeOffset.y, planeOffset.x);
    //},
    //
    ////将空间坐标的偏移量转换为平面偏移
    //latLngOffsetToPlane: function(latLngOffset){
    //    return new Z.Point(latLngOffset.lng, latLngOffset.lat);
    //}
});

//web墨卡托投影。将地球作为正球体
Z.Projection.SphericalMercator = Z.extend({}, Z.Projection, {
    MAX_LATITUDE: 85.0511287798,
    EarthRadius:6378137,
    Circumference: Math.PI * 6378137,    //半周长

    project: function (latlng) { // (LatLng) -> Point
        var d = Z.Projection.DEG_TO_RAD, //L.LatLng.DEG_TO_RAD,
            max = Z.Projection.SphericalMercator.MAX_LATITUDE,
            lat = Math.max(Math.min(max, latlng.lat), -max),
            x = latlng.lng * d,
            y = lat * d;

        y = Math.log(Math.tan((Math.PI / 4) + (y / 2)));

        return new Z.Point(x, y).multiplyBy(Z.Projection.SphericalMercator.EarthRadius);
    },

    unproject: function (point) { // (Point, Boolean) -> LatLng
        var d = Z.Projection.RAD_TO_DEG, //L.LatLng.RAD_TO_DEG,
            newPoint = point.divideBy(Z.Projection.SphericalMercator.EarthRadius),
            lng = newPoint.x * d,
            lat = (2 * Math.atan(Math.exp(newPoint.y)) - (Math.PI / 2)) * d;

        return new Z.LatLng(lat, lng);
    }

    //planeOffsetToLatLng: function(planeOffset){
    //    var latLngOffset = new Z.LatLng(0, 0, 0);
    //    latLngOffset.lng = 180 * planeOffset.x / this.Circumference;
    //    latLngOffset.lat = 180 * planeOffset.y / this.Circumference;
    //    latLngOffset.alt = 180 * planeOffset.z / this.Circumference;
    //
    //    return latLngOffset;
    //},
    //
    //latLngOffsetToPlane: function(latLngOffset){
    //    var planeOffset = new Z.Point(0, 0, 0);
    //    planeOffset.x = this.Circumference * latLngOffset.lng / 180;
    //    planeOffset.y = this.Circumference * latLngOffset.lat / 180;
    //    planeOffset.z = this.Circumference * latLngOffset.alt / 180;
    //
    //    return planeOffset;
    //}
});

//墨卡托投影，将地球作为椭球体（wgs84椭球体）
Z.Projection.Mercator = Z.extend({}, Z.Projection, {
    MAX_LATITUDE: 85.0840591556,

    R_MINOR: 6356752.314245179,
    R_MAJOR: 6378137,
    Circumference: Math.PI * 6378137,

    project: function (latlng) { // (LatLng) -> Point
        var d = Z.Projection.DEG_TO_RAD, //L.LatLng.DEG_TO_RAD,
            max = Z.Projection.Mercator.MAX_LATITUDE,
            lat = Math.max(Math.min(max, latlng.lat), -max),
            r = Z.Projection.Mercator.R_MAJOR,
            r2 = Z.Projection.Mercator.R_MINOR,
            x = latlng.lng * d * r,
            y = lat * d,
            tmp = r2 / r,
            eccent = Math.sqrt(1.0 - tmp * tmp),
            con = eccent * Math.sin(y);

        con = Math.pow((1 - con) / (1 + con), eccent * 0.5);

        var ts = Math.tan(0.5 * ((Math.PI * 0.5) - y)) / con;
        y = -r * Math.log(ts);

        return new Z.Point(x, y);
    },

    unproject: function (point) { // (Point, Boolean) -> LatLng
        var d = Z.Projection.RAD_TO_DEG,//L.LatLng.RAD_TO_DEG,
            r = Z.Projection.Mercator.R_MAJOR,
            r2 = Z.Projection.Mercator.R_MINOR,
            lng = point.x * d / r,
            tmp = r2 / r,
            eccent = Math.sqrt(1 - (tmp * tmp)),
            ts = Math.exp(- point.y / r),
            phi = (Math.PI / 2) - 2 * Math.atan(ts),
            numIter = 15,
            tol = 1e-7,
            i = numIter,
            dphi = 0.1,
            con;

        while ((Math.abs(dphi) > tol) && (--i > 0)) {
            con = eccent * Math.sin(phi);
            dphi = (Math.PI / 2) - 2 * Math.atan(ts *
                    Math.pow((1.0 - con) / (1.0 + con), 0.5 * eccent)) - phi;
            phi += dphi;
        }

        return new Z.LatLng(phi * d, lng);
    }

    ////椭球表面两点间距离需要通过微积分处理，为简化计算，此处当做地球是正球体进行近似计算。
    //planeOffsetToLatLng: function(planeOffset){
    //    var latLngOffset = new Z.LatLng(0, 0, 0);
    //    latLngOffset.lng = 180 * planeOffset.x / this.Circumference;
    //    latLngOffset.lat = 180 * planeOffset.y / this.Circumference;
    //
    //    return latLngOffset;
    //},
    //
    ////椭球表面两点间距离需要通过微积分处理，为简化计算，此处当做地球是正球体进行近似计算。
    //latLngOffsetToPlane: function(latLngOffset){
    //    var planeOffset = new Z.Point(0, 0, 0);
    //    planeOffset.x = this.Circumference * latLngOffset.x / 180;
    //    planeOffset.y = this.Circumference * latLngOffset.y / 180;
    //
    //    return planeOffset;
    //}
});