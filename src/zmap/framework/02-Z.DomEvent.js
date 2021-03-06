/**
 * Created by Administrator on 2015/10/23.
 */
//Z.DomEvent = Z.extend({},L.DomEvent);

Z.DomEvent = {
    /* inspired by John Resig, Dean Edwards and YUI addEvent implementations */
    addListener: function (obj, type, fn, context) { // (HTMLElement, String, Function[, Object])

        var id = Z.stamp(fn),
            key = '_leaflet_' + type + id,
            handler, originalHandler, newType;

        if (obj[key]) { return this; }

        handler = function (e) {
            return fn.call(context || obj, e || Z.DomEvent._getEvent());
        };

        if (Z.Browser.pointer && type.indexOf('touch') === 0) {
            return this.addPointerListener(obj, type, handler, id);
        }
        if (Z.Browser.touch && (type === 'dblclick') && this.addDoubleTapListener) {
            this.addDoubleTapListener(obj, handler, id);
        }

        if ('addEventListener' in obj) {

            if (type === 'mousewheel') {
                obj.addEventListener('DOMMouseScroll', handler, false);
                obj.addEventListener(type, handler, false);

            } else if ((type === 'mouseenter') || (type === 'mouseleave')) {

                originalHandler = handler;
                newType = (type === 'mouseenter' ? 'mouseover' : 'mouseout');

                handler = function (e) {
                    if (!Z.DomEvent._checkMouse(obj, e)) { return; }
                    return originalHandler(e);
                };

                obj.addEventListener(newType, handler, false);

            } else if (type === 'click' && Z.Browser.android) {
                originalHandler = handler;
                handler = function (e) {
                    return Z.DomEvent._filterClick(e, originalHandler);
                };

                obj.addEventListener(type, handler, false);
            } else {
                obj.addEventListener(type, handler, false);
            }

        } else if ('attachEvent' in obj) {
            obj.attachEvent('on' + type, handler);
        }

        obj[key] = handler;

        return this;
    },

    removeListener: function (obj, type, fn) {  // (HTMLElement, String, Function)

        var id = Z.stamp(fn),
            key = '_leaflet_' + type + id,
            handler = obj[key];

        if (!handler) { return this; }

        if (Z.Browser.pointer && type.indexOf('touch') === 0) {
            this.removePointerListener(obj, type, id);
        } else if (Z.Browser.touch && (type === 'dblclick') && this.removeDoubleTapListener) {
            this.removeDoubleTapListener(obj, id);

        } else if ('removeEventListener' in obj) {

            if (type === 'mousewheel') {
                obj.removeEventListener('DOMMouseScroll', handler, false);
                obj.removeEventListener(type, handler, false);

            } else if ((type === 'mouseenter') || (type === 'mouseleave')) {
                obj.removeEventListener((type === 'mouseenter' ? 'mouseover' : 'mouseout'), handler, false);
            } else {
                obj.removeEventListener(type, handler, false);
            }
        } else if ('detachEvent' in obj) {
            obj.detachEvent('on' + type, handler);
        }

        obj[key] = null;

        return this;
    },

    stopPropagation: function (e) {

        if (e.stopPropagation) {
            e.stopPropagation();
        } else {
            e.cancelBubble = true;
        }
        Z.DomEvent._skipped(e);

        return this;
    },

    disableScrollPropagation: function (el) {
        var stop = Z.DomEvent.stopPropagation;

        return Z.DomEvent
            .on(el, 'mousewheel', stop)
            .on(el, 'MozMousePixelScroll', stop);
    },

    disableClickPropagation: function (el) {
        var stop = Z.DomEvent.stopPropagation;

        for (var i = Z.Draggable.START.length - 1; i >= 0; i--) {
            Z.DomEvent.on(el, Z.Draggable.START[i], stop);
        }

        return Z.DomEvent
            .on(el, 'click', Z.DomEvent._fakeStop)
            .on(el, 'dblclick', stop);
    },

    preventDefault: function (e) {

        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
        return this;
    },

    stop: function (e) {
        return Z.DomEvent
            .preventDefault(e)
            .stopPropagation(e);
    },

    getMousePosition: function (e, container) {
        if (!container) {
            return new Z.Point(e.clientX, e.clientY);
        }

        var rect = container.getBoundingClientRect();

        return new Z.Point(
            e.clientX - rect.left - container.clientLeft,
            e.clientY - rect.top - container.clientTop);
    },

    getWheelDelta: function (e) {

        var delta = 0;

        if (e.wheelDelta) {
            delta = e.wheelDelta / 120;
        }
        if (e.detail) {
            delta = -e.detail / 3;
        }
        return delta;
    },

    _skipEvents: {},

    _fakeStop: function (e) {
        // fakes stopPropagation by setting a special event flag, checked/reset with L.DomEvent._skipped(e)
        Z.DomEvent._skipEvents[e.type] = true;
    },

    _skipped: function (e) {
        var skipped = this._skipEvents[e.type];
        // reset when checking, as it's only used in map container and propagates outside of the map
        this._skipEvents[e.type] = false;
        return skipped;
    },

    // check if element really left/entered the event target (for mouseenter/mouseleave)
    _checkMouse: function (el, e) {

        var related = e.relatedTarget;

        if (!related) { return true; }

        try {
            while (related && (related !== el)) {
                related = related.parentNode;
            }
        } catch (err) {
            return false;
        }
        return (related !== el);
    },

    _getEvent: function () { // evil magic for IE
        /*jshint noarg:false */
        var e = window.event;
        if (!e) {
            var caller = arguments.callee.caller;
            while (caller) {
                e = caller['arguments'][0];
                if (e && window.Event === e.constructor) {
                    break;
                }
                caller = caller.caller;
            }
        }
        return e;
    },

    // this is a horrible workaround for a bug in Android where a single touch triggers two click events
    _filterClick: function (e, handler) {
        var timeStamp = (e.timeStamp || e.originalEvent.timeStamp),
            elapsed = Z.DomEvent._lastClick && (timeStamp - Z.DomEvent._lastClick);

        // are they closer together than 500ms yet more than 100ms?
        // Android typically triggers them ~300ms apart while multiple listeners
        // on the same event should be triggered far faster;
        // or check if click is simulated on the element, and if it is, reject any non-simulated events

        if ((elapsed && elapsed > 100 && elapsed < 500) || (e.target._simulatedClick && !e._simulated)) {
            Z.DomEvent.stop(e);
            return;
        }
        Z.DomEvent._lastClick = timeStamp;

        return handler(e);
    }
};

Z.DomEvent.on = Z.DomEvent.addListener;
Z.DomEvent.off = Z.DomEvent.removeListener;