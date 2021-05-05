/**
 * Created by Administrator on 2015/11/19.
 */
Z.Scene3D.RightRotate = Z.Class.extend({
    includes: Z.EventManager,

    initialize: function(scene){
        this._scene = scene;
        this._draggable = null;
        this._enabled = false;
        this._lastPoint = null;
        this._isDraging = false;
    },

    enable: function () {
        if (this._enabled) { return; }

        this._enabled = true;
        this.addHooks();
    },

    disable: function () {
        if (!this._enabled) { return; }

        this._enabled = false;
        this.removeHooks();
    },

    enabled: function () {
        return !!this._enabled;
    },

    addHooks: function () {
        if (!this._draggable) {
            var scene = this._scene;

            this._draggable = new Z.RightDraggable(scene._viewFrame.mapPane.root, scene._container, false);

            this._draggable.on({
                'rightdragstart': this._onDragStart,
                'rightdrag': this._onDrag,
                'rightdragend': this._onDragEnd,
                'norightdrag': this._onNoDrag
            }, this);

            //if (map.options.worldCopyJump) {
            //    this._draggable.on('predrag', this._onPreDrag, this);
            //    map.on('viewreset', this._onViewReset, this);
            //
            //    map.whenReady(this._onViewReset, this);
            //}
        }
        this._draggable.enable();
    },

    removeHooks: function () {
        this._draggable.disable();
    },

    moved: function () {
        return this._draggable && this._draggable._moved;
    },

    isDraging: function(){
        return this._isDraging;
    },

    _onDragStart: function (e) {
        var scene = this._scene;
        this._lastPoint = null;

        //if (map._panAnim) {
        //    map._panAnim.stop();
        //}

        //scene
        //    .fire('movestart', e)
        //    .fire('dragstart', e);
        scene.fire('rotatestart', e);

        //if (map.options.inertia) {
        //    this._positions = [];
        //    this._times = [];
        //}
    },

    _onDrag: function (e) {
        //if (this._map.options.inertia) {
        //    var time = this._lastTime = +new Date(),
        //        pos = this._lastPos = this._draggable._newPos;
        //
        //    this._positions.push(pos);
        //    this._times.push(time);
        //
        //    if (time - this._times[0] > 200) {
        //        this._positions.shift();
        //        this._times.shift();
        //    }
        //}

        this._isDraging = true;
        this._screenEventToContainer(e);
        this._refreshMap(e);

        //this._scene
        //    .fire('move', e)
        //    .fire('drag', e)
        //    .fire('viewreset', e);
        //this._scene
        //    .fire('move', e)
        //    .fire('drag', e);
        this._scene.fire('rotate', e);
    },

    //_onViewReset: function () {
    //    // TODO fix hardcoded Earth values
    //    var pxCenter = this._map.getSize()._divideBy(2),
    //        pxWorldCenter = this._map.latLngToLayerPoint([0, 0]);
    //
    //    this._initialWorldOffset = pxWorldCenter.subtract(pxCenter).x;
    //    this._worldWidth = this._map.project([0, 180]).x;
    //},
    //
    //_onPreDrag: function () {
    //    // TODO refactor to be able to adjust map pane position after zoom
    //    var worldWidth = this._worldWidth,
    //        halfWidth = Math.round(worldWidth / 2),
    //        dx = this._initialWorldOffset,
    //        x = this._draggable._newPos.x,
    //        newX1 = (x - halfWidth + dx) % worldWidth + halfWidth - dx,
    //        newX2 = (x + halfWidth + dx) % worldWidth - halfWidth - dx,
    //        newX = Math.abs(newX1 + dx) < Math.abs(newX2 + dx) ? newX1 : newX2;
    //
    //    this._draggable._newPos.x = newX;
    //},

    _onDragEnd: function (e) {
        var scene = this._scene,
            options = scene.options,
            delay = +new Date() - this._lastTime,
            noInertia = !options.inertia || delay > options.inertiaThreshold || !this._positions[0];

        this._screenEventToContainer(e);
        this._refreshMap(e);
        this._isDraging = false;

        scene.fire('rotateend', e);
//console.info("dragend");
        //if (noInertia) {
//        scene.fire('moveend', e);
////console.info("moveend");
        scene.fire('viewreset', e);

        //if(e.distance <= 1){
        //    this.fire("click", {
        //        containerPoint: e.newPoint,
        //        originalEvent: e
        //    });
        //}
//console.info("viewreset");
        /******************改变空间范围********************/
        //this._refreshMap(e);

        //var //delta = this._latLngBounds.getCenter().subtract(newCenter),
        //    newLatLngBounds = this._latLngBounds.translate(-delta.lat, -delta.lng, -delta.alt);
        //
        //this._updateSceneStatus(newCenter, newLatLngBounds);

        /*************************************************/

        //} else {
        //
        //    var direction = this._lastPos.subtract(this._positions[0]),
        //        duration = (this._lastTime + delay - this._times[0]) / 1000,
        //        ease = options.easeLinearity,
        //
        //        speedVector = direction.multiplyBy(ease / duration),
        //        speed = speedVector.distanceTo([0, 0]),
        //
        //        limitedSpeed = Math.min(options.inertiaMaxSpeed, speed),
        //        limitedSpeedVector = speedVector.multiplyBy(limitedSpeed / speed),
        //
        //        decelerationDuration = limitedSpeed / (options.inertiaDeceleration * ease),
        //        offset = limitedSpeedVector.multiplyBy(-decelerationDuration / 2).round();
        //
        //    if (!offset.x || !offset.y) {
        //        map.fire('moveend');
        //
        //    } else {
        //        offset = map._limitOffset(offset, map.options.maxBounds);
        //
        //        L.Util.requestAnimFrame(function () {
        //            map.panBy(offset, {
        //                duration: decelerationDuration,
        //                easeLinearity: ease,
        //                noMoveStart: true
        //            });
        //        });
        //    }
        //}
    },

    _onNoDrag: function (e) {
        //this._screenEventToContainer(e);
        //
        //this.fire("click", {
        //    containerPoint: e.newPoint,
        //    originalEvent: e.originalUpEvent
        //});
    },

    _refreshMap: function(dragEvent){
        var sceneObj = this._scene;

        if(!this._lastPoint){
            this._lastPoint = dragEvent.startPoint;
        }

        if(!dragEvent.startPoint || !dragEvent.newPoint){
            return;
        }

        //var startPoint = sceneObj.screenPointToScenePoint(this._lastPoint);
        //var newPoint = sceneObj.screenPointToScenePoint(dragEvent.newPoint);
        //
        //if(startPoint && newPoint){
        //    var vec_h1 = new THREE.Vector3(startPoint.x, startPoint.y, 0),
        //        vec_h2 = new THREE.Vector3(newPoint.x, newPoint.y, 0),
        //        vec_v1 = new THREE.Vector3(startPoint.x, startPoint.y, startPoint.z),
        //        vec_v2 = new THREE.Vector3(startPoint.x, startPoint.y, newPoint.z);
        //
        //    var cross_h = vec_h1.clone().cross(vec_h2),
        //        cross_v = vec_v1.clone().cross(vec_v2);
        //
        //    var angle_h = (cross_h.z > 0 ? 1 : -1) * vec_h1.angleTo(vec_h2) * 180 / Math.PI,
        //        angle_v = (cross_v.z > 0 ? 1 : -1) * vec_v1.angleTo(vec_v2) * 180 / Math.PI;
        //
        //    sceneObj.rotateByVH(angle_v, -angle_h);
        //
        //    this._lastPoint = dragEvent.newPoint;
        //}
        var vhRotate = sceneObj.calculateVHRotation(this._lastPoint, dragEvent.newPoint);
        sceneObj.rotateByVH(vhRotate.v, vhRotate.h);

        this._lastPoint = dragEvent.newPoint;
    },

    _screenEventToContainer: function(e){
        var screenTopLeft = this._scene.getTopLeftPos();

        if(e.startPoint){
            e.startPoint = e.startPoint.subtract(screenTopLeft);
        }

        if(e.newPoint){
            e.newPoint = e.newPoint.subtract(screenTopLeft);
        }
    }
});