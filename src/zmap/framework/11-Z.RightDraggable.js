/**
 * Created by Administrator on 2015/11/19.
 */
Z.RightDraggable = Z.Class.extend({
    includes: Z.EventManager,

    statics: {
        START: Z.Browser.touch ? ['touchstart', 'mousedown'] : ['mousedown'],
        END: {
            mousedown: 'mouseup',
            touchstart: 'touchend',
            pointerdown: 'touchend',
            MSPointerDown: 'touchend'
        },
        MOVE: {
            mousedown: 'mousemove',
            touchstart: 'touchmove',
            pointerdown: 'touchmove',
            MSPointerDown: 'touchmove'
        }
    },

    initialize: function (element, dragStartTarget, moveElement) {
        this._element = element;
        this._dragStartTarget = dragStartTarget || element;
        this._moveElement = moveElement === undefined ? true : moveElement;
    },

    enable: function () {
        if (this._enabled) { return; }

        for (var i = Z.RightDraggable.START.length - 1; i >= 0; i--) {
            Z.DomEvent.on(this._dragStartTarget, Z.RightDraggable.START[i], this._onDown, this);
        }

        this._enabled = true;
    },

    disable: function () {
        if (!this._enabled) { return; }

        for (var i = Z.RightDraggable.START.length - 1; i >= 0; i--) {
            Z.DomEvent.off(this._dragStartTarget, Z.RightDraggable.START[i], this._onDown, this);
        }

        this._enabled = false;
        this._moved = false;
    },

    _onDown: function (e) {
        this._moved = false;
//console.info("e.type=" + e.type + "; e.which=" + e.which + "; e.button=" + e.button);
        //if (e.shiftKey || ((e.which !== 2) && (e.button !== 2) && !e.touches)) { return; }
        if (e.shiftKey || ((e.which !== 2) && (e.button !== 2))) { return; }

        Z.DomEvent.stopPropagation(e);

        //if (Z.RightDraggable._disabled) { return; }
        if (!this._enabled) { return; }

        Z.DomUtil.disableImageDrag();
        Z.DomUtil.disableTextSelection();

        if (this._moving) { return; }

        //var first = e.touches ? e.touches[0] : e;
        var first = e;

        this._startPoint = new Z.Point(first.clientX, first.clientY);
        this._startPos = this._newPos = this._getElementPosition(this._element);//Z.DomUtil.getPosition(this._element);

        Z.DomEvent
            .on(document, Z.RightDraggable.MOVE[e.type], this._onMove, this)
            .on(document, Z.RightDraggable.END[e.type], this._onUp, this);
    },

    _onMove: function (e) {
        //if (e.touches && e.touches.length > 1) {
        //    this._moved = true;
        //    return;
        //}
        //console.info("e.type=" + e.type + "; e.which=" + e.which + "; e.button=" + e.button);
        var //first = (e.touches && e.touches.length === 1 ? e.touches[0] : e),
            first = e,
            newPoint = new Z.Point(first.clientX, first.clientY),
            offset = newPoint.subtract(this._startPoint);

        if (!offset.x && !offset.y) { return; }
        //if (Z.Browser.touch && Math.abs(offset.x) + Math.abs(offset.y) < 3) { return; }

        Z.DomEvent.preventDefault(e);

        if (!this._moved) {
            this.fire('rightdragstart', {startPoint: newPoint.clone()});

            this._moved = true;
            this._startPos = this._getElementPosition(this._element).subtract(offset);//Z.DomUtil.getPosition(this._element).subtract(offset);

            //Z.DomUtil.addClass(document.body, 'zmap-dragging');
            this._lastTarget = e.target || e.srcElement;
            //Z.DomUtil.addClass(this._lastTarget, 'leaflet-drag-target');
        }

        //this._newPos = this._startPos.add(offset);
        this._newPoint = newPoint;
        this._moving = true;

        //Z.Util.cancelAnimFrame(this._animRequest);
        //this._animRequest = Z.Util.requestAnimFrame(this._updatePosition, this, true, this._dragStartTarget);

        this.fire('rightdrag', {startPoint: this._startPoint.subtract(this._startPos), newPoint: this._newPoint.subtract(this._startPos)});
    },

    //_updatePosition: function () {
    //    this.fire('prerotate');
    //
    //    if(this._moveElement){
    //        Z.DomUtil.setPosition(this._element, this._newPos);
    //    }
    //
    //    this.fire('rotate', {startPoint: this._startPoint.subtract(this._startPos), newPoint: this._newPoint.subtract(this._startPos)});
    //},

    _onUp: function (event) {
        //Z.DomUtil.removeClass(document.body, 'zmap-dragging');
        //console.info("e.type=" + event.type + "; e.which=" + event.which + "; e.button=" + event.button);
        if (this._lastTarget) {
            //Z.DomUtil.removeClass(this._lastTarget, 'leaflet-drag-target');
            this._lastTarget = null;
        }

        for (var i in Z.RightDraggable.MOVE) {
            Z.DomEvent
                .off(document, Z.RightDraggable.MOVE[i], this._onMove)
                .off(document, Z.RightDraggable.END[i], this._onUp);
        }

        Z.DomUtil.enableImageDrag();
        Z.DomUtil.enableTextSelection();

        if (this._moved && this._moving) {
            // ensure drag is not fired after dragend
            Z.Util.cancelAnimFrame(this._animRequest);

            try{
                this.fire('rightdragend', {
                    offset: this._newPoint.subtract(this._startPoint),
                    startPoint: this._startPoint.subtract(this._startPos),
                    newPoint: this._newPoint.subtract(this._startPos)
                });
            }catch(e){
                var con = console || {};
                con.log = con.log || opera.postError;
                if(con.log){
                    con.log(e.message);
                }
            }
        }else if(this._startPoint){
            var eventPoint = this._startPoint.subtract(this._startPos);

            this.fire('norightdrag', {
                offset: new Z.Point(0, 0, 0),
                startPoint: eventPoint,
                newPoint: eventPoint,
                originalUpEvent: event
            });
        }

        this._moving = false;
    },

    _getElementPosition: function(element){
        var position = Z.DomUtil.getPosition(element);

        if(!position || position.x === NaN || position.y === NaN){
            //var left = element.style.left;
            //var top = element.style.top;
            //left = parseInt(left.length > 0 ? left.substring(0,left.length - 2) : 0);
            //top = parseInt(top.length > 0 ? top.substring(0, top.length - 2) : 0);
            var left = element.offsetLeft;
            var top = element.offsetTop;
            position = new Z.Point(left, top);
        }

        return position;
    }
});