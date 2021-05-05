/**
 * Created by Administrator on 2015/10/25.
 *
 * 正方向为向右向下向外
 */
Z.Bounds = function (a, b) { //(Point, Point) or Point[]
    if (!a) { return; }

    var points = b ? [a, b] : a;

    for (var i = 0, len = points.length; i < len; i++) {
        this.extend(points[i]);
    }

    this.type = "bounds";
    this.tolerance = 0.00000001;
};

Z.Bounds.create = function (a, b) { //(Point, Point) or Point[]
    if (!a || a instanceof Z.Bounds) {
        return a;
    }
    return new Z.Bounds(a, b);
};

Z.Bounds.prototype = {
    clone: function(){
        var min = this.min ? this.min.clone() : null,
            max = this.max ? this.max.clone() : null;

        return new Z.Bounds(min, max);
    },

    // extend the bounds to contain the given point
    extend: function (point) { // (Point)
        point = Z.Point.create(point);

        if (!this.min && !this.max) {
            this.min = point.clone();
            this.max = point.clone();
        } else {
            this.min.x = Math.min(point.x, this.min.x);
            this.max.x = Math.max(point.x, this.max.x);
            this.min.y = Math.min(point.y, this.min.y);
            this.max.y = Math.max(point.y, this.max.y);
            this.min.z = Math.min(point.z, this.min.z);
            this.max.z = Math.max(point.z, this.max.z);
        }
        return this;
    },

    getCenter: function (round) { // (Boolean) -> Point
        return new Z.Point(
            (this.min.x + this.max.x) / 2,
            (this.min.y + this.max.y) / 2,
            (this.min.z + this.max.z) / 2, round);
    },

    getBottomLeft: function () { // -> Point
        return new Z.Point(this.min.x, this.max.y, this.min.z);
    },

    getTopRight: function () { // -> Point
        return new Z.Point(this.max.x, this.min.y, this.max.z);
    },

    getSize: function () {
        return this.max.subtract(this.min);
    },

    contains: function (obj) { // (Bounds) or (Point) -> Boolean
        var min, max;

        if (typeof obj[0] === 'number' || obj instanceof Z.Point) {
            obj = Z.Point.create(obj);
        } else {
            obj = Z.Bounds.create(obj);
        }

        if (obj instanceof Z.Bounds) {
            min = obj.min;
            max = obj.max;
        } else {
            min = max = obj;
        }

        return (min.x >= this.min.x) &&
            (max.x <= this.max.x) &&
            (min.y >= this.min.y) &&
            (max.y <= this.max.y) &&
            (min.z >= this.min.z) &&
            (max.z <= this.max.z) ;
    },

    intersects: function (bounds) { // (Bounds) -> Boolean
        bounds = Z.Bounds.create(bounds);

        var min = this.min,
            max = this.max,
            min2 = bounds.min,
            max2 = bounds.max,
            xIntersects = (max2.x >= min.x) && (min2.x <= max.x),
            yIntersects = (max2.y >= min.y) && (min2.y <= max.y),
            zIntersects = (max2.z >= min.z) && (min2.z <= max.z);

        return xIntersects && yIntersects && zIntersects;
    },

    isValid: function () {
        return !!(this.min && this.max);
    },

    equals: function (bounds, tolerance) {
        if(!(bounds instanceof Z.Bounds)){
            return false;
        }

        var result = false,
            thisBottomLeft = this.getBottomLeft(),
            thisTopRight = this.getTopRight(),
            inputBottomLeft = bounds.getBottomLeft(),
            inputTopRight = bounds.getTopRight();

        if(thisBottomLeft.equals(inputBottomLeft, tolerance) &&
            thisTopRight.equals(inputTopRight, tolerance)){
            result = true;
        }

        return result;
    }
};