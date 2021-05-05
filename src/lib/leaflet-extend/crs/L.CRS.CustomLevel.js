/**
 * 坐标系扩展，允许自定义级别、切图原点
 */

L.CRS.CustomLevel = L.extend({}, L.CRS, {
    code: 'EPSG:0',
    levelDefine: [
                        { "level": 0, "resolution": 1.40782880508533, "scale": 591658710.9 },
                        { "level": 1, "resolution": 0.70312500000011879, "scale": 295497593.05879998 },
                        { "level": 2, "resolution": 0.3515625000000594, "scale": 147748796.52939999 },
                        { "level": 3, "resolution": 0.1757812500000297, "scale": 73874398.264699996 },
                        { "level": 4, "resolution": 0.087890625000014849, "scale": 36937199.132349998 },
                        { "level": 5, "resolution": 0.043945312500007425, "scale": 18468599.566174999 },
                        { "level": 6, "resolution": 0.021972656250003712, "scale": 9234299.7830874994 },
                        { "level": 7, "resolution": 0.010986328125001856, "scale": 4617149.8915437497 },
                        { "level": 8, "resolution": 0.0054931640625009281, "scale": 2308574.9457718749 },
                        { "level": 9, "resolution": 0.002746582031250464, "scale": 1154287.4728859374 },
                        { "level": 10, "resolution": 0.001373291015625232, "scale": 577143.73644296871 },
                        { "level": 11, "resolution": 0.00068664550781261601, "scale": 288571.86822148436 },
                        { "level": 12, "resolution": 0.000343322753906308, "scale": 144285.934110742183 },
                        { "level": 13, "resolution": 0.000171661376953154, "scale": 72142.967055371089 },
                        { "level": 14, "resolution": 8.5830688476577001e-005, "scale": 36071.483527685545 },
                        { "level": 15, "resolution": 4.2915344238288501e-005, "scale": 18035.741763842772 },
                        { "level": 16, "resolution": 2.145767211914425e-005, "scale": 9017.8708819213862 },
                        { "level": 17, "resolution": 1.0728836059572125e-005, "scale": 4508.9354409606931 },
                        { "level": 18, "resolution": 5.3644180297860626e-006, "scale": 2254.4677204803465 },
                        { "level": 19, "resolution": 2.6822090148930313e-006, "scale": 1127.2338602401733 },
                        { "level": 20, "resolution": 1.3411045074465156e-006, "scale": 563.61693012008664 }
                    ],
    origin: new L.LatLng(90, -180),

    latLngToPoint: function (latlng, zoom) { // (LatLng, Number) -> Point
        var levelDefine = this.levelDefine;
        var origin = this.origin;

        for (var i = 0; i < levelDefine.length; i++) {
            if (levelDefine[i].level == zoom) {
                var y = (origin.lat - latlng.lat) / levelDefine[i].resolution;
                var x = (latlng.lng - origin.lng) / levelDefine[i].resolution;

                return new L.Point(Math.floor(x), Math.floor(y));
            }
        }

        if (zoom < levelDefine[0].level) {
            var y = (origin.lat - latlng.lat) / levelDefine[0].resolution;
            var x = (latlng.lng - origin.lng) / levelDefine[0].resolution;

            return new L.Point(Math.floor(x), Math.floor(y));
        } else if (zoom > levelDefine[levelDefine.length - 1].level) {
            var y = (origin.lat - latlng.lat) / levelDefine[levelDefine.length - 1].resolution;
            var x = (latlng.lng - origin.lng) / levelDefine[levelDefine.length - 1].resolution;

            return new L.Point(Math.floor(x), Math.floor(y));
        }

        return;
    },

    pointToLatLng: function (point, zoom) { // (Point, Number[, Boolean]) -> LatLng
        var levelDefine = this.levelDefine;
        var origin = this.origin;

        for (var i = 0; i < levelDefine.length; i++) {
            if (levelDefine[i].level == zoom) {
                var lat = origin.lat - point.y * levelDefine[i].resolution;
                var lng = point.x * levelDefine[i].resolution + origin.lng;

                return new L.LatLng(lat, lng);
            }
        }

        return;
    },

    project: function (latlng) {
        //return latlng;
        return new L.Point(latlng.lng, latlng.lat);
    },

    scale: function (zoom) {
        var levelDefine = this.levelDefine;
        var origin = this.origin;
        var s;
        var maxOriginValue = Math.max(Math.abs(origin.lat), Math.abs(origin.lng));

        for (var i = 0; i < levelDefine.length; i++) {
            if (levelDefine[i].level == zoom) {
                s = maxOriginValue * 2 / levelDefine[i].resolution;
                break;
            }
        }

        return s;
    },

    _scaleByOrigin: function (zoom, originValue) {
        var s;
        var levelDefine = this.levelDefine;

        for (var i = 0; i < levelDefine.length; i++) {
            if (levelDefine[i].level == zoom) {
                s = Math.abs(originValue) * 2 / levelDefine[i].resolution;
            }
        }

        return s;
    },

    getSize: function (zoom) {
        var origin = this.origin;
        var latScale = this._scaleByOrigin(zoom, origin.lat);
        var lngScale = this._scaleByOrigin(zoom, origin.lng);

        return L.point(lngScale, latScale);
    },

    clone: function () {
        var cloneObj = Util.cloneObject(this);
//        cloneObj.code = "EPSG:0";
//        cloneObj.origin = new L.LatLng(90, -180);
//        cloneObj.levelDefine = new L.LatLng(90, -180);

        return cloneObj;
    }
});

L.CRS.Perspective = L.extend({}, L.CRS.CustomLevel, {
    xFactor: 1,
    yFactor: 1,
    latLngToPoint: function (latlng, zoom) {
        var pixelPoint = L.CRS.CustomLevel.latLngToPoint.call(this, latlng, zoom);

        if (pixelPoint) {
            pixelPoint.x *= this.xFactor;
            pixelPoint.y *= this.yFactor;
        }

        return pixelPoint;
    },

    pointToLatLng: function (point, zoom) { // (Point, Number[, Boolean]) -> LatLng
        if (point) {
            point.x /= this.xFactor;
            point.y /= this.yFactor;
        }

        var latlngPoint = L.CRS.CustomLevel.pointToLatLng.call(this, point, zoom);

        return latlngPoint;
    },

    getSize: function (zoom) {
        var size = L.CRS.CustomLevel.getSize.call(this, zoom);

        if (size) {
            size.x *= this.xFactor;
            size.y *= this.yFactor;
        }

        return size;
    },

    clone: function () {
        var cloneObj = Util.cloneObject(this);
        //        cloneObj.code = "EPSG:0";
        //        cloneObj.origin = new L.LatLng(90, -180);
        //        cloneObj.xFactor = 1;
        //        cloneObj.yFactor = 1;

        return cloneObj;
    }
});