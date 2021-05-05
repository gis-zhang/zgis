/**
 * Created by Administrator on 2015/10/26.
 */
Z.LatLngBounds = function (southWestLower, northEastUpper) { // (LatLng, LatLng) or (LatLng[])
    if (!southWestLower) { return; }

    var latlngs = northEastUpper ? [southWestLower, northEastUpper] : southWestLower;

    for (var i = 0, len = latlngs.length; i < len; i++) {
        this.extend(latlngs[i]);
    }

    this.type = "latlngbounds";
};

Z.LatLngBounds.create = function (a, b) { // (LatLngBounds) or (LatLng, LatLng)
    if (!a || a instanceof Z.LatLngBounds) {
        return a;
    }

    if (Z.Util.isArray(a) && a.length > 1 && !b) {
        return new Z.LatLngBounds(a[0], a[1]);
    }

    return new Z.LatLngBounds(a, b);
};

Z.LatLngBounds.prototype = {
    clone: function () {
        return new Z.LatLngBounds(this._southWestLower, this._northEastUpper);
    },
    // extend the bounds to contain the given point or bounds
    extend: function (obj) { // (LatLng) or (LatLngBounds)
        if (!obj) { return this; }

        var latLng = Z.LatLng.create(obj);
        if (latLng !== null) {
            obj = latLng;
        } else {
            obj = Z.LatLngBounds.create(obj);
        }

        if (obj instanceof Z.LatLng) {
            if (!this._southWestLower && !this._northEastUpper) {
                this._southWestLower = new Z.LatLng(obj.lat, obj.lng, obj.alt);
                this._northEastUpper = new Z.LatLng(obj.lat, obj.lng, obj.alt);
            } else {
                this._southWestLower.lat = Math.min(obj.lat, this._southWestLower.lat);
                this._southWestLower.lng = Math.min(obj.lng, this._southWestLower.lng);

                this._northEastUpper.lat = Math.max(obj.lat, this._northEastUpper.lat);
                this._northEastUpper.lng = Math.max(obj.lng, this._northEastUpper.lng);

                if(!isNaN(obj.alt)){
                    this._southWestLower.alt = isNaN(this._southWestLower.alt) ?
                        obj.alt : Math.min(obj.alt, this._southWestLower.alt);
                    this._northEastUpper.alt = isNaN(this._northEastUpper.alt) ?
                        obj.alt : Math.max(obj.alt, this._northEastUpper.alt);
                }
            }
        } else if (obj instanceof Z.LatLngBounds) {
            this.extend(obj._southWestLower);
            this.extend(obj._northEastUpper);
        }
        //else if (obj instanceof Array && obj.length > 1) {
        //    this.extend(Z.LatLng.create(obj));
        //}

        return this;
    },

    // extend the bounds by a percentage
    pad: function (bufferRatio) { // (Number) -> LatLngBounds
        var sw = this._southWestLower,
            ne = this._northEastUpper,
            latBuffer = Math.abs(sw.lat - ne.lat) * bufferRatio,
            lngBuffer = Math.abs(sw.lng - ne.lng) * bufferRatio,
            heightBuffer = this.hasAltValue() ?
                Math.abs(sw.alt - ne.alt) * bufferRatio : NaN;

        return new Z.LatLngBounds(
            new Z.LatLng(sw.lat - latBuffer, sw.lng - lngBuffer, isNaN(heightBuffer) ? NaN : (sw.alt - heightBuffer)),
            new Z.LatLng(ne.lat + latBuffer, ne.lng + lngBuffer, isNaN(heightBuffer) ? NaN : (ne.alt + heightBuffer)));
    },

    translate: function (lat, lng, alt) { //平移
        var sw = this._southWestLower,
            ne = this._northEastUpper,
            delta = new Z.LatLng(lat, lng, alt);

        return new Z.LatLngBounds(
            sw.add(delta),
            ne.add(delta));
    },

    getCenter: function () { // -> LatLng
        return new Z.LatLng(
            (this._southWestLower.lat + this._northEastUpper.lat) / 2,
            (this._southWestLower.lng + this._northEastUpper.lng) / 2,
            this.hasAltValue() ? ((this._southWestLower.alt + this._northEastUpper.alt) / 2) : NaN);
    },

    getSouthWest: function () {
        return this._southWestLower;
    },

    getNorthEast: function () {
        return this._northEastUpper;
    },

    getNorthWest: function () {
        return new Z.LatLng(this.getNorth(), this.getWest());
    },

    getSouthEast: function () {
        return new Z.LatLng(this.getSouth(), this.getEast());
    },

    getWest: function () {
        return this._southWestLower.lng;
    },

    getSouth: function () {
        return this._southWestLower.lat;
    },

    getEast: function () {
        return this._northEastUpper.lng;
    },

    getNorth: function () {
        return this._northEastUpper.lat;
    },

    getTop: function () {
        return this._northEastUpper.alt;
    },

    getBottom: function () {
        return this._southWestLower.alt;
    },

    contains: function (obj) { // (LatLngBounds) or (LatLng) -> Boolean
        if (typeof obj[0] === 'number' || obj instanceof Z.LatLng) {
            obj = Z.LatLng.create(obj);
        } else {
            obj = Z.LatLngBounds.create(obj);
        }

        var sw = this._southWestLower,
            ne = this._northEastUpper,
            sw2, ne2;

        if (obj instanceof Z.LatLngBounds) {
            sw2 = obj.getSouthWest();
            ne2 = obj.getNorthEast();
        } else {
            sw2 = ne2 = obj;
        }

        var result = (sw2.lat >= sw.lat) && (ne2.lat <= ne.lat) &&
            (sw2.lng >= sw.lng) && (ne2.lng <= ne.lng);

        if(result && obj.hasAltValue() && this.hasAltValue()){
            result = result && (sw2.alt >= sw.alt) && (ne2.alt <= ne.alt);
        }

        return result;
    },

    intersects: function (bounds) { // (LatLngBounds)
        //bounds = Z.LatLngBounds.create(bounds);
        if (typeof bounds[0] === 'number' || bounds instanceof Z.LatLng) {
            var latLng = Z.LatLng.create(bounds);
            bounds = Z.LatLngBounds.create(latLng, latLng);
        } else {
            bounds = Z.LatLngBounds.create(bounds);
        }

        var sw = this._southWestLower,
            ne = this._northEastUpper,
            sw2 = bounds.getSouthWest(),
            ne2 = bounds.getNorthEast(),

            latIntersects = (ne2.lat >= sw.lat) && (sw2.lat <= ne.lat),
            lngIntersects = (ne2.lng >= sw.lng) && (sw2.lng <= ne.lng),
            altIntersects = true;

        if(bounds.hasAltValue() && this.hasAltValue()){
            altIntersects = (ne2.alt >= sw.alt) && (sw2.alt <= ne.alt);
        }

        return latIntersects && lngIntersects && altIntersects;
    },

    toBBoxString: function () {
        var bboxArray = [this.getWest(), this.getSouth(), this.getEast(), this.getNorth()];

        if(this.hasAltValue()){
            bboxArray.push(this._southWestLower.alt);
            bboxArray.push(this._northEastUpper.alt);
        }

        return bboxArray.join(',');
    },

    equals: function (bounds) { // (LatLngBounds)
        if (!bounds) { return false; }

        bounds = Z.LatLngBounds.create(bounds);

        return this._southWestLower.equals(bounds.getSouthWest()) &&
            this._northEastUpper.equals(bounds.getNorthEast());
    },

    isValid: function () {
        return !!(this._southWestLower && this._northEastUpper);
    },

    hasAltValue: function(){
        return !isNaN(this._southWestLower.alt) && !isNaN(this._northEastUpper.alt);
    }
};