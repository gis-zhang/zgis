/**
 * Created by Administrator on 2015/11/19.
 */
Z.Scene3D.Drag = Z.Class.extend({
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

            this._draggable = new Z.Draggable(scene._viewFrame.mapPane.root, scene._container, false);

            this._draggable.on({
                'dragstart': this._onDragStart,
                'drag': this._onDrag,
                'dragend': this._onDragEnd,
                'nodrag': this._onNoDrag
            }, this);
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

        scene
            .fire('movestart', e)
            .fire('dragstart', e);
    },

    _onDrag: function (e) {
        this._isDraging = true;
        this._refreshMap(e);

        this._scene
            .fire('move', e)
            .fire('drag', e);
    },

    _onDragEnd: function (e) {
        var scene = this._scene,
            options = scene.options,
            delay = +new Date() - this._lastTime,
            noInertia = !options.inertia || delay > options.inertiaThreshold || !this._positions[0];

        this._refreshMap(e);
        this._isDraging = false;
        scene.fire('dragend', e);
        scene.fire('moveend', e);
        scene.fire('viewreset', e);

        if(e.distance <= 1){
            this.fire("click", {
                containerPoint: e.newPoint,
                originalEvent: e
            });
        }
    },

    _onNoDrag: function (e) {
        this.fire("click", {
            containerPoint: e.newPoint,
            originalEvent: e.originalUpEvent
        });
    },

    _refreshMap: function(dragEvent){
        var sceneObj = this._scene;

        if(!this._lastPoint){
            this._lastPoint = dragEvent.startPoint;
        }

        if(!dragEvent.startPoint || !dragEvent.newPoint){
            return;
        }

        var startPoint = sceneObj.screenPointToLatLng(this._lastPoint);
        var newPoint = sceneObj.screenPointToLatLng(dragEvent.newPoint);

        if(startPoint && newPoint){
            var delta = startPoint.subtract(newPoint);
            // var delta = newPoint.subtract(startPoint);
            sceneObj._offsetLatLng(delta);

            this._lastPoint = dragEvent.newPoint;
        }
    }
});