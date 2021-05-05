/**
 * Created by Administrator on 2017/7/2.
 */

Z.Scene3D.TouchZoom = Z.Class.extend({
    includes: Z.EventManager,

    initialize: function(scene, container){
        this._scene = scene;
        this._container = container;
        //this._draggable = null;
        this._enabled = false;
        //this._lastPoint = null;
        //this._isDraging = false;
        this._startCenter = null;
        this._startDist = null;
        this._moved = false;
        this._zooming = false;
    },

    enable: function () {
        Z.DomEvent.on(this._container, 'touchstart', this._onTouchStart, this);
    },

    disable: function () {
        Z.DomEvent.off(this._container, 'touchstart', this._onTouchStart, this);
    },

    _onTouchStart: function (e) {
        //var map = this._map;
        //
        //if (!e.touches || e.touches.length !== 2 || map._animatingZoom || this._zooming) { return; }
        //
        //var p1 = map.mouseEventToLayerPoint(e.touches[0]),
        //    p2 = map.mouseEventToLayerPoint(e.touches[1]),
        //    viewCenter = map._getCenterLayerPoint();
        //
        //this._startCenter = p1.add(p2)._divideBy(2);
        //this._startDist = p1.distanceTo(p2);
        //
        //this._moved = false;
        //this._zooming = true;
        //
        //this._centerOffset = viewCenter.subtract(this._startCenter);
        //
        //if (map._panAnim) {
        //    map._panAnim.stop();
        //}
        //
        //L.DomEvent
        //    .on(document, 'touchmove', this._onTouchMove, this)
        //    .on(document, 'touchend', this._onTouchEnd, this);
        //
        //L.DomEvent.preventDefault(e);

        if (!e.touches || e.touches.length !== 2 || this._zooming) { return; }

        var p1 = Z.DomEvent.getMousePosition(e.touches[0], this._container),//map.mouseEventToLayerPoint(e.touches[0]),
            p2 = Z.DomEvent.getMousePosition(e.touches[1], this._container);//map.mouseEventToLayerPoint(e.touches[1]),
        //viewCenter = map._getCenterLayerPoint();

        this._startCenter = p1.add(p2).divideBy(2);
        this._startDist = p1.distanceTo(p2);
        this._startZoom = this._scene.getZoom();
        //this._lastDist = this._startDist;

        this._moved = false;
        this._zooming = true;

        Z.DomEvent
            .on(document, 'touchmove', this._onTouchMove, this)
            .on(document, 'touchend', this._onTouchEnd, this);

        Z.DomEvent.preventDefault(e);
    },

    _onTouchMove: function (e) {
        //var map = this._map;

        if (!e.touches || e.touches.length !== 2 || !this._zooming) { return; }

        //var p1 = map.mouseEventToLayerPoint(e.touches[0]),
        //    p2 = map.mouseEventToLayerPoint(e.touches[1]);
        var p1 = Z.DomEvent.getMousePosition(e.touches[0], this._container),
            p2 = Z.DomEvent.getMousePosition(e.touches[1], this._container);

        //this._scale = p1.distanceTo(p2) / this._startDist;
        this._scale = this._startDist / p1.distanceTo(p2);
        this._delta = p1.add(p2).divideBy(2).subtract(this._startCenter);

        if (this._scale === 1) { return; }

        //if (!map.options.bounceAtZoomLimits) {
        //    if ((map.getZoom() === map.getMinZoom() && this._scale < 1) ||
        //        (map.getZoom() === map.getMaxZoom() && this._scale > 1)) { return; }
        //}

        if (!this._moved) {
            //L.DomUtil.addClass(map._mapPane, 'leaflet-touching');

            this._scene
                .fire('movestart')
                .fire('zoomstart');

            this._moved = true;
        }

        //L.Util.cancelAnimFrame(this._animRequest);
        //this._animRequest = L.Util.requestAnimFrame(
        //    this._updateOnMove, this, true, this._map._container);

        this._scene.zoomByScaling(this._scale, this._startZoom);
        //this._lastDist = p1.distanceTo(p2);
        Z.DomEvent.preventDefault(e);
    },

    //_updateOnMove: function () {
    //    var map = this._map,
    //        origin = this._getScaleOrigin(),
    //        center = map.layerPointToLatLng(origin),
    //        zoom = map.getScaleZoom(this._scale);
    //
    //    map._animateZoom(center, zoom, this._startCenter, this._scale, this._delta, false, true);
    //},

    _onTouchEnd: function () {
        if (!this._moved || !this._zooming) {
            this._zooming = false;
            return;
        }

        //var map = this._map;

        this._zooming = false;
        //L.DomUtil.removeClass(map._mapPane, 'leaflet-touching');
        //L.Util.cancelAnimFrame(this._animRequest);

        Z.DomEvent
            .off(document, 'touchmove', this._onTouchMove)
            .off(document, 'touchend', this._onTouchEnd);

        //var origin = this._getScaleOrigin(),
        //    center = map.layerPointToLatLng(origin),
        //
        //    oldZoom = map.getZoom(),
        //    floatZoomDelta = map.getScaleZoom(this._scale) - oldZoom,
        //    roundZoomDelta = (floatZoomDelta > 0 ?
        //        Math.ceil(floatZoomDelta) : Math.floor(floatZoomDelta)),
        //
        //    zoom = map._limitZoom(oldZoom + roundZoomDelta),
        //    scale = map.getZoomScale(zoom) / this._scale;
        //
        //map._animateZoom(center, zoom, origin, scale);
        //this._scene.zoomByScaling(this._scale);
    }//,

    //_getScaleOrigin: function () {
    //    var centerOffset = this._centerOffset.subtract(this._delta).divideBy(this._scale);
    //    return this._startCenter.add(centerOffset);
    //}
});