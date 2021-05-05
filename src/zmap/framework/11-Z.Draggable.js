/**
 * Created by Administrator on 2015/11/19.
 */
Z.Draggable = Z.Class.extend({
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

        for (var i = Z.Draggable.START.length - 1; i >= 0; i--) {
            Z.DomEvent.on(this._dragStartTarget, Z.Draggable.START[i], this._onDown, this);
        }

        this._enabled = true;
    },

    disable: function () {
        if (!this._enabled) { return; }

        for (var i = Z.Draggable.START.length - 1; i >= 0; i--) {
            Z.DomEvent.off(this._dragStartTarget, Z.Draggable.START[i], this._onDown, this);
        }

        this._enabled = false;
        this._moved = false;
    },

    _onDown: function (e) {
        this._moved = false;

        if (e.shiftKey || ((e.which !== 1) && (e.button !== 1) && !e.touches)) { return; }

        Z.DomEvent.stopPropagation(e);

        if (Z.Draggable._disabled) { return; }

        Z.DomUtil.disableImageDrag();
        Z.DomUtil.disableTextSelection();

        if (this._moving) { return; }

        var first = e.touches ? e.touches[0] : e;

        this._startPoint = new Z.Point(first.clientX, first.clientY);
        this._startPos = this._newPos = this._getElementPosition(this._element);//Z.DomUtil.getPosition(this._element);

        Z.DomEvent
            .on(document, Z.Draggable.MOVE[e.type], this._onMove, this)
            .on(document, Z.Draggable.END[e.type], this._onUp, this);
    },

    _onMove: function (e) {
        if (e.touches && e.touches.length > 1) {
            this._moved = true;
            return;
        }

        var first = (e.touches && e.touches.length === 1 ? e.touches[0] : e),
            newPoint = new Z.Point(first.clientX, first.clientY),
            offset = newPoint.subtract(this._startPoint);

        if (!offset.x && !offset.y) { return; }
        if (Z.Browser.touch && Math.abs(offset.x) + Math.abs(offset.y) < 3) { return; }

        Z.DomEvent.preventDefault(e);

        if (!this._moved) {
            this.fire('dragstart', {startPoint: newPoint.clone()});

            this._moved = true;
            this._startPos = this._getElementPosition(this._element).subtract(offset);//Z.DomUtil.getPosition(this._element).subtract(offset);

            Z.DomUtil.addClass(document.body, 'zmap-dragging');
            this._lastTarget = e.target || e.srcElement;
            //Z.DomUtil.addClass(this._lastTarget, 'leaflet-drag-target');
        }

        this._newPos = this._startPos.add(offset);
        this._newPoint = newPoint;
        this._moving = true;

        Z.Util.cancelAnimFrame(this._animRequest);
        this._animRequest = Z.Util.requestAnimFrame(this._updatePosition, this, true, this._dragStartTarget);
    },

    _updatePosition: function () {
        this.fire('predrag');

        if(this._moveElement){
            Z.DomUtil.setPosition(this._element, this._newPos);
        }

        this.fire('drag', {startPoint: this._startPoint.subtract(this._startPos), newPoint: this._newPoint.subtract(this._startPos)});
    },

    _onUp: function (event) {
        Z.DomUtil.removeClass(document.body, 'zmap-dragging');

        if (this._lastTarget) {
            //Z.DomUtil.removeClass(this._lastTarget, 'leaflet-drag-target');
            this._lastTarget = null;
        }

        for (var i in Z.Draggable.MOVE) {
            Z.DomEvent
                .off(document, Z.Draggable.MOVE[i], this._onMove)
                .off(document, Z.Draggable.END[i], this._onUp);
        }

        Z.DomUtil.enableImageDrag();
        Z.DomUtil.enableTextSelection();

        if (this._moved && this._moving) {
            // ensure drag is not fired after dragend
            Z.Util.cancelAnimFrame(this._animRequest);

            try{
                this.fire('dragend', {
                    distance: this._newPos.distanceTo(this._startPos),
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

            this.fire('nodrag', {
                distance: 0,
                startPoint: eventPoint,
                newPoint: eventPoint,
                originalUpEvent: event
            });
        }

        this._moving = false;
    },

    _getElementPosition: function(element){
        var rect = element.getBoundingClientRect();

        return new Z.Point(
            rect.left + element.clientLeft,
            rect.top + element.clientTop);
    }
});