/**
 * Created by Administrator on 2015/10/26.
 */
Z.LatLng = function (lat, lng, alt, crs) { // (Number, Number, Number)
    lat = parseFloat(lat);
    lng = parseFloat(lng);

    if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Invalid LatLng object: (' + lat + ', ' + lng + ')');
    }

    this.lat = lat;
    this.lng = lng;

    if (alt !== undefined) {
        this.alt = parseFloat(alt);
    }

    this.crs = crs || null;
    this.type = "latlng";
};

Z.LatLng.create = function (a, b, c) { // (LatLng) or ([Number, Number]) or (Number, Number)
    if (a instanceof Z.LatLng) {
        return a;
    }
    if (Z.Util.isArray(a)) {
        if (typeof a[0] === 'number' || typeof a[0] === 'string') {
            return new Z.LatLng(a[0], a[1], a[2]);
        } else {
            return null;
        }
    }
    if (a === undefined || a === null) {
        return a;
    }
    if (typeof a === 'object' && 'lat' in a) {
        var newLatLng = new Z.LatLng(a.lat, 'lng' in a ? a.lng : a.lon);

        if(!isNaN(a.alt)){
            newLatLng.alt = a.alt;
        }

        return newLatLng;
    }
    if (b === undefined) {
        return null;
    }
    return new Z.LatLng(a, b, c);
};

Z.extend(Z.LatLng, {
    DEG_TO_RAD: Math.PI / 180,
    RAD_TO_DEG: 180 / Math.PI,
    MAX_MARGIN: 1.0E-9 // max margin of error for the "equals" check
});

Z.LatLng.prototype = {
    clone: function () {
        return new Z.LatLng(this.lat, this.lng, this.alt, this.crs);
    },

    equals: function (obj) { // (LatLng) -> Boolean
        if (!obj) { return false; }

        if(obj.crs && this.crs && obj.crs !== this.crs){
            return false;
        }

        obj = Z.LatLng.create(obj);

        var margin = Math.max(
            Math.abs(this.lat - obj.lat),
            Math.abs(this.lng - obj.lng));

        if(!isNaN(this.alt) && !isNaN(obj.alt)){
            margin = Math.max(margin,  Math.abs(this.alt - obj.alt));
        }

        return margin <= Z.LatLng.MAX_MARGIN;
    },

    add: function (point) {
        return this.clone()._add(Z.LatLng.create(point));
    },

    // destructive, used directly for performance in situations where it's safe to modify existing point
    _add: function (point) {
        this.lat += point.lat;
        this.lng += point.lng;
        this.alt += point.alt;

        return this;
    },

    subtract: function (point) {
        return this.clone()._subtract(Z.LatLng.create(point));
    },

    _subtract: function (point) {
        if(point){
            this.lat -= point.lat;
            this.lng -= point.lng;
            this.alt -= point.alt;
        }

        return this;
    },

    toString: function (precision) { // (Number) -> String
        return 'LatLng(' +
            Z.Util.formatNum(this.lat, precision) + ', ' +
            Z.Util.formatNum(this.lng, precision) + ', ' +
            Z.Util.formatNum(this.alt, precision) + ')';
    }//,

    //// Haversine distance formula, see http://en.wikipedia.org/wiki/Haversine_formula
    //// TODO move to projection code, LatLng shouldn't know about Earth
    //distanceTo: function (other) { // (LatLng) -> Number
    //    other = Z.LatLng.create(other);
    //
    //    var R = 6378137, // earth radius in meters
    //        d2r = Z.LatLng.DEG_TO_RAD,
    //        dLat = (other.lat - this.lat) * d2r,
    //        dLon = (other.lng - this.lng) * d2r,
    //        lat1 = this.lat * d2r,
    //        lat2 = other.lat * d2r,
    //        sin1 = Math.sin(dLat / 2),
    //        sin2 = Math.sin(dLon / 2);
    //
    //    var a = sin1 * sin1 + sin2 * sin2 * Math.cos(lat1) * Math.cos(lat2);
    //
    //    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    //},

    //wrap: function (a, b) { // (Number, Number) -> LatLng
    //    var lng = this.lng;
    //
    //    a = a || -180;
    //    b = b ||  180;
    //
    //    lng = (lng + b) % (b - a) + (lng < a || lng === b ? b : a);
    //
    //    return new Z.LatLng(this.lat, lng, this.alt);
    //}
};