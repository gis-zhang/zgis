/**
 * Created by Administrator on 2015/10/25.
 */
Z.Point = function(x, y, z, round){
    this.x = (typeof x === 'number' && !isNaN(x)) ? (round ? Math.round(x) : x) : 0;
    this.y = (typeof y === 'number' && !isNaN(y)) ? (round ? Math.round(y) : y) : 0;
    this.z = (typeof z === 'number' && !isNaN(z)) ? (round ? Math.round(z) : z) : 0;
    this.type = "point";
    this.tolerance = 0.00000001;
}

Z.Point.create = function(x, y, z, round){
    if (x instanceof Z.Point) {
        return x;
    }
    if (Z.Util.isArray(x)) {
        return (x.length) < 2 ? null : new Z.Point(x[0], x[1], x[2]);
    }
    if (x === undefined || x === null) {
        return x;
    }
    if (typeof x === 'object' && 'x' in x && 'y' in x) {
        var newX = isNaN(parseFloat(x.x)) ? 0 : parseFloat(x.x),
            newY = isNaN(parseFloat(x.y)) ? 0 : parseFloat(x.y);

        return new Z.Point(newX, newY, x.z, round);
    }
    return new Z.Point(x, y, z, round);
}

Z.Point.prototype = {

    clone: function () {
        return new Z.Point(this.x, this.y, this.z);
    },

    // non-destructive, returns a new point
    add: function (point) {
        return this.clone()._add(Z.Point.create(point));
    },

    // destructive, used directly for performance in situations where it's safe to modify existing point
    _add: function (point) {
        this.x += point.x;
        this.y += point.y;
        this.z += point.z;

        return this;
    },

    subtract: function (point) {
        return this.clone()._subtract(Z.Point.create(point));
    },

    _subtract: function (point) {
        this.x -= point.x;
        this.y -= point.y;
        this.z -= point.z;

        return this;
    },

    divideBy: function (num) {
        return this.clone()._divideBy(num);
    },

    _divideBy: function (num) {
        this.x /= num;
        this.y /= num;
        this.z /= num;

        return this;
    },

    multiplyBy: function (num) {
        return this.clone()._multiplyBy(num);
    },

    _multiplyBy: function (num) {
        this.x *= num;
        this.y *= num;
        this.z *= num;

        return this;
    },

    round: function () {
        return this.clone()._round();
    },

    _round: function () {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        this.z = Math.round(this.z);

        return this;
    },

    floor: function () {
        return this.clone()._floor();
    },

    _floor: function () {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        this.z = Math.floor(this.z);

        return this;
    },

    distanceTo: function (point) {
        point = Z.Point.create(point);

        var x = point.x - this.x,
            y = point.y - this.y;
            z = point.z - this.z;

         return Math.sqrt(x * x + y * y + z * z);
    },

    equals: function (point, tolerance) {
        point = Z.Point.create(point),
        tolerance = tolerance || this.tolerance;

        return point &&
            (point.x - this.x) < tolerance &&
            (point.y - this.y) < tolerance &&
            (point.z - this.z) < tolerance;
    },

    contains: function (point) {
        point = Z.Point.create(point);

        return Math.abs(point.x) <= Math.abs(this.x) &&
            Math.abs(point.y) <= Math.abs(this.y) &&
            Math.abs(point.z) <= Math.abs(this.z);
    },

    toString: function () {
        return 'Point(' +
            Z.Util.formatNum(this.x) + ', ' +
            Z.Util.formatNum(this.y) + ', ' +
            Z.Util.formatNum(this.z) + ')';
    }
};
