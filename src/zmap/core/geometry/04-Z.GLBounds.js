/**
 * Created by Administrator on 2015/11/12.
 */
Z.GLBounds = function(a, b){
    if (!a) { return; }

    var points = b ? [a, b] : a;

    for (var i = 0, len = points.length; i < len; i++) {
        this.extend(points[i]);
    }

    this.type = "glbounds";
};

Z.GLBounds.prototype = Object.create(Z.Bounds.prototype );
Z.GLBounds.prototype.constructor = Z.Bounds;

Z.GLBounds.prototype.getBottomLeft = function(){
    return new Z.Point(this.min.x, this.min.y, this.min.z);
};

Z.GLBounds.prototype.getTopRight = function () {
    return new Z.Point(this.max.x, this.max.y, this.max.z);
};

Z.GLBounds.prototype.getWidth = function () {
    return this.max.x - this.min.x;
};

Z.GLBounds.prototype.getHeight = function () {
    return this.max.y - this.min.y;
};

Z.GLBounds.prototype.getCenter = function () { // -> LatLng
    return new Z.Point(
        (this.max.x + this.min.x) / 2,
        (this.max.y + this.min.y) / 2,
        (this.max.z + this.min.z) / 2);
};

Z.GLBounds.prototype.getThickness = function () {
    return this.max.z - this.min.z;
};

Z.GLBounds.prototype.clone = function () {
    var min = this.min ? this.min.clone() : null,
        max = this.max ? this.max.clone() : null;

    return new Z.GLBounds(min, max);
};

Z.GLBounds.create = function (a, b) { //(Point, Point) or Point[]
    if (!a || a instanceof Z.GLBounds) {
        return a;
    }
    return new Z.GLBounds(a, b);
};