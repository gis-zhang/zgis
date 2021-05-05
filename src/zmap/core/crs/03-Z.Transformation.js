/**
 * Created by Administrator on 2015/12/3.
 */
//处理不同三维坐标系之间的转换
Z.Transformation = function(){
    this.matrix = new THREE.Matrix4();
};

Z.Transformation.prototype.doTranslation = function(x, y, z){
    var newMatrix = new THREE.Matrix4();
    newMatrix.makeTranslation(x, y, z);
    //this.matrix.multiply(newMatrix);
    this.matrix = newMatrix.multiply(this.matrix);
};

Z.Transformation.prototype.doRotation = function(x, y, z){
    var m1 = new THREE.Matrix4(),
        m2 = new THREE.Matrix4(),
        m3 = new THREE.Matrix4();

    m1.makeRotationX(x);
    m2.makeRotationY(y);
    m3.makeRotationZ(z);

    //this.matrix.multiply(m1);
    //this.matrix.multiply(m2);
    //this.matrix.multiply(m3);
    m1.multiply(m2);
    m1.multiply(m3);
    this.matrix = m1.multiply(this.matrix);
};

Z.Transformation.prototype.doScale = function(x, y, z){
    //this.matrix.makeScale(x, y, z);
    var newMatrix = new THREE.Matrix4();
    newMatrix.makeScale(x, y, z);
    //this.matrix.multiply(newMatrix);
    this.matrix = newMatrix.multiply(this.matrix);
};

Z.Transformation.prototype.transform = function(x, y, z){
    var vector = new THREE.Vector3(x, y, z);
    vector.applyMatrix4(this.matrix);

    return new Z.Point(vector.x, vector.y, vector.z);
};

Z.Transformation.prototype.multiply = function(transformation){
    if(!transformation || !(transformation instanceof Z.Transformation)){
        return this;
    }

    this.matrix.multiply(transformation.matrix);

    return this;
};

Z.Transformation.prototype.getMatrix = function(){
    return this.matrix;
};

Z.Transformation.prototype.decompose = function(){
    var position = new THREE.Vector3(),
        scale = new THREE.Vector3(),
        quaternion = new THREE.Quaternion();
    this.matrix.decompose(position, quaternion, scale);

    return {
        position: position,
        quaternion: quaternion,
        scale: scale
    }
};

Z.Transformation.prototype.clone = function(){
    var newInstance = new Z.Transformation();
    newInstance.matrix = this.matrix.clone();

    return newInstance;
};

////简单投影，不做任何转换。适用于图片浏览等应用
//Z.Transformation.Simple = Z.extend({}, Z.Transformation, {
//    project: function (latlng) {
//        return new Z.Point(latlng.lng, latlng.lat);
//    },
//
//    unproject: function (point) {
//        return new Z.LatLng(point.y, point.x);
//    },
//
//    //将平面偏移转换为空间坐标的偏移量
//    planeOffsetToLatLng: function(planeOffset){
//        return new Z.LatLng(planeOffset.y, planeOffset.x);
//    },
//
//    //将空间坐标的偏移量转换为平面偏移
//    latLngOffsetToPlane: function(latLngOffset){
//        return new Z.Point(latlng.lng, latlng.lat);
//    }
//});
//
////web墨卡托投影。将地球作为正球体
//Z.Projection.SphericalMercator = Z.extend({}, Z.Projection, {
//    MAX_LATITUDE: 85.0511287798,
//    EarthRadius:6378137,
//    Circumference: Math.PI * 6378137,    //半周长
//
//    project: function (latlng) { // (LatLng) -> Point
//        var d = this.DEG_TO_RAD, //L.LatLng.DEG_TO_RAD,
//            max = this.MAX_LATITUDE,
//            lat = Math.max(Math.min(max, latlng.lat), -max),
//            x = latlng.lng * d,
//            y = lat * d;
//
//        y = Math.log(Math.tan((Math.PI / 4) + (y / 2)));
//
//        return new Z.Point(x, y).multiplyBy(this.EarthRadius);
//    },
//
//    unproject: function (point) { // (Point, Boolean) -> LatLng
//        var d = this.RAD_TO_DEG, //L.LatLng.RAD_TO_DEG,
//            newPoint = point.divideBy(this.EarthRadius);
//            lng = newPoint.x * d,
//            lat = (2 * Math.atan(Math.exp(newPoint.y)) - (Math.PI / 2)) * d;
//
//        return new Z.LatLng(lat, lng);
//    },
//
//    planeOffsetToLatLng: function(planeOffset){
//        var latLngOffset = new Z.LatLng(0, 0, 0);
//        latLngOffset.lng = 180 * planeOffset.x / this.Circumference;
//        latLngOffset.lat = 180 * planeOffset.y / this.Circumference;
//        latLngOffset.alt = 180 * planeOffset.z / this.Circumference;
//
//        return latLngOffset;
//    },
//
//    latLngOffsetToPlane: function(latLngOffset){
//        var planeOffset = new Z.Point(0, 0, 0);
//        planeOffset.x = this.Circumference * latLngOffset.lng / 180;
//        planeOffset.y = this.Circumference * latLngOffset.lat / 180;
//        planeOffset.z = this.Circumference * latLngOffset.alt / 180;
//
//        return planeOffset;
//    }
//});
//
////墨卡托投影，将地球作为椭球体（wgs84椭球体）
//Z.Projection.Mercator = Z.extend({}, Z.Projection, {
//    MAX_LATITUDE: 85.0840591556,
//
//    R_MINOR: 6356752.314245179,
//    R_MAJOR: 6378137,
//    Circumference: Math.PI * 6378137,
//
//    project: function (latlng) { // (LatLng) -> Point
//        var d = this.DEG_TO_RAD, //L.LatLng.DEG_TO_RAD,
//            max = this.MAX_LATITUDE,
//            lat = Math.max(Math.min(max, latlng.lat), -max),
//            r = this.R_MAJOR,
//            r2 = this.R_MINOR,
//            x = latlng.lng * d * r,
//            y = lat * d,
//            tmp = r2 / r,
//            eccent = Math.sqrt(1.0 - tmp * tmp),
//            con = eccent * Math.sin(y);
//
//        con = Math.pow((1 - con) / (1 + con), eccent * 0.5);
//
//        var ts = Math.tan(0.5 * ((Math.PI * 0.5) - y)) / con;
//        y = -r * Math.log(ts);
//
//        return new Z.Point(x, y);
//    },
//
//    unproject: function (point) { // (Point, Boolean) -> LatLng
//        var d = this.RAD_TO_DEG,//L.LatLng.RAD_TO_DEG,
//            r = this.R_MAJOR,
//            r2 = this.R_MINOR,
//            lng = point.x * d / r,
//            tmp = r2 / r,
//            eccent = Math.sqrt(1 - (tmp * tmp)),
//            ts = Math.exp(- point.y / r),
//            phi = (Math.PI / 2) - 2 * Math.atan(ts),
//            numIter = 15,
//            tol = 1e-7,
//            i = numIter,
//            dphi = 0.1,
//            con;
//
//        while ((Math.abs(dphi) > tol) && (--i > 0)) {
//            con = eccent * Math.sin(phi);
//            dphi = (Math.PI / 2) - 2 * Math.atan(ts *
//                    Math.pow((1.0 - con) / (1.0 + con), 0.5 * eccent)) - phi;
//            phi += dphi;
//        }
//
//        return new Z.LatLng(phi * d, lng);
//    },
//
//    //椭球表面两点间距离需要通过微积分处理，为简化计算，此处当做地球是正球体进行近似计算。
//    planeOffsetToLatLng: function(planeOffset){
//        var latLngOffset = new Z.LatLng(0, 0, 0);
//        latLngOffset.lng = 180 * planeOffset.x / this.Circumference;
//        latLngOffset.lat = 180 * planeOffset.y / this.Circumference;
//
//        return latLngOffset;
//    },
//
//    //椭球表面两点间距离需要通过微积分处理，为简化计算，此处当做地球是正球体进行近似计算。
//    latLngOffsetToPlane: function(latLngOffset){
//        var planeOffset = new Z.Point(0, 0, 0);
//        planeOffset.x = this.Circumference * latLngOffset.x / 180;
//        planeOffset.y = this.Circumference * latLngOffset.y / 180;
//
//        return planeOffset;
//    }
//});