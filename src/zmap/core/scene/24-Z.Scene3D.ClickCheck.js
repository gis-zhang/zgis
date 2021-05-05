/**
 * Created by Administrator on 2015/11/19.
 */
Z.Scene3D.ClickCheck = Z.Class.extend({
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
                //'dragstart': this._onDragStart,
                //'drag': this._onDrag,
                'dragend': this._onDragEnd
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

    //_onDragStart: function (e) {
    //    var scene = this._scene;
    //    this._lastPoint = null;
    //
    //    //if (map._panAnim) {
    //    //    map._panAnim.stop();
    //    //}
    //
    //    scene
    //        .fire('movestart', e)
    //        .fire('dragstart', e);
    //
    //    //if (map.options.inertia) {
    //    //    this._positions = [];
    //    //    this._times = [];
    //    //}
    //},
    //
    //_onDrag: function (e) {
    //    //if (this._map.options.inertia) {
    //    //    var time = this._lastTime = +new Date(),
    //    //        pos = this._lastPos = this._draggable._newPos;
    //    //
    //    //    this._positions.push(pos);
    //    //    this._times.push(time);
    //    //
    //    //    if (time - this._times[0] > 200) {
    //    //        this._positions.shift();
    //    //        this._times.shift();
    //    //    }
    //    //}
    //
    //    this._isDraging = true;
    //    this._screenEventToContainer(e);
    //    this._refreshMap(e);
    //
    //    //this._scene
    //    //    .fire('move', e)
    //    //    .fire('drag', e)
    //    //    .fire('viewreset', e);
    //    this._scene
    //        .fire('move', e)
    //        .fire('drag', e);
    //},

    _onDragEnd: function (e) {
        var scene = this._scene,
            options = scene.options,
            delay = +new Date() - this._lastTime,
            noInertia = !options.inertia || delay > options.inertiaThreshold || !this._positions[0];

        this._screenEventToContainer(e);
        //this._refreshMap(e);
        this._isDraging = false;

        scene.fire('dragend', e);
//console.info("dragend");
        //if (noInertia) {
        scene.fire('moveend', e);
//console.info("moveend");
        scene.fire('viewreset', e);
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