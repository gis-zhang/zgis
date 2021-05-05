/**
 * Created by Administrator on 2015/10/23.
 */
//Z.DomUtil = Z.extend({},L.DomUtil, {
Z.DomUtil = {
    get: function (id) {
        return (typeof id === 'string' ? document.getElementById(id) : id);
    },

    getStyle: function (el, style) {

        var value = el.style[style];

        if (!value && el.currentStyle) {
            value = el.currentStyle[style];
        }

        if ((!value || value === 'auto') && document.defaultView) {
            var css = document.defaultView.getComputedStyle(el, null);
            value = css ? css[style] : null;
        }

        return value === 'auto' ? null : value;
    },

    getViewportOffset: function (element) {

        var top = 0,
            left = 0,
            el = element,
            docBody = document.body,
            docEl = document.documentElement,
            pos;

        do {
            top  += el.offsetTop  || 0;
            left += el.offsetLeft || 0;

            //add borders
            top += parseInt(Z.DomUtil.getStyle(el, 'borderTopWidth'), 10) || 0;
            left += parseInt(Z.DomUtil.getStyle(el, 'borderLeftWidth'), 10) || 0;

            pos = Z.DomUtil.getStyle(el, 'position');

            if (el.offsetParent === docBody && pos === 'absolute') { break; }

            if (pos === 'fixed') {
                top  += docBody.scrollTop  || docEl.scrollTop  || 0;
                left += docBody.scrollLeft || docEl.scrollLeft || 0;
                break;
            }

            if (pos === 'relative' && !el.offsetLeft) {
                var width = Z.DomUtil.getStyle(el, 'width'),
                    maxWidth = Z.DomUtil.getStyle(el, 'max-width'),
                    r = el.getBoundingClientRect();

                if (width !== 'none' || maxWidth !== 'none') {
                    left += r.left + el.clientLeft;
                }

                //calculate full y offset since we're breaking out of the loop
                top += r.top + (docBody.scrollTop  || docEl.scrollTop  || 0);

                break;
            }

            el = el.offsetParent;

        } while (el);

        el = element;

        do {
            if (el === docBody) { break; }

            top  -= el.scrollTop  || 0;
            left -= el.scrollLeft || 0;

            el = el.parentNode;
        } while (el);

        return new L.Point(left, top);
    },

    documentIsLtr: function () {
        if (!Z.DomUtil._docIsLtrCached) {
            Z.DomUtil._docIsLtrCached = true;
            Z.DomUtil._docIsLtr = Z.DomUtil.getStyle(document.body, 'direction') === 'ltr';
        }
        return Z.DomUtil._docIsLtr;
    },

    create: function (tagName, className, container) {

        var el = document.createElement(tagName);
        el.className = className;

        if (container) {
            container.appendChild(el);
        }

        return el;
    },

    hasClass: function (el, name) {
        if (el.classList !== undefined) {
            return el.classList.contains(name);
        }
        var className = Z.DomUtil._getClass(el);
        return className.length > 0 && new RegExp('(^|\\s)' + name + '(\\s|$)').test(className);
    },

    addClass: function (el, name) {
        if (el.classList !== undefined) {
            var classes = Z.Util.splitWords(name);
            for (var i = 0, len = classes.length; i < len; i++) {
                el.classList.add(classes[i]);
            }
        } else if (!Z.DomUtil.hasClass(el, name)) {
            var className = Z.DomUtil._getClass(el);
            Z.DomUtil._setClass(el, (className ? className + ' ' : '') + name);
        }
    },

    removeClass: function (el, name) {
        if (el.classList !== undefined) {
            el.classList.remove(name);
        } else {
            Z.DomUtil._setClass(el, Z.Util.trim((' ' + Z.DomUtil._getClass(el) + ' ').replace(' ' + name + ' ', ' ')));
        }
    },

    _setClass: function (el, name) {
        if (el.className.baseVal === undefined) {
            el.className = name;
        } else {
            // in case of SVG element
            el.className.baseVal = name;
        }
    },

    _getClass: function (el) {
        return el.className.baseVal === undefined ? el.className : el.className.baseVal;
    },

    setOpacity: function (el, value) {

        if ('opacity' in el.style) {
            el.style.opacity = value;

        } else if ('filter' in el.style) {

            var filter = false,
                filterName = 'DXImageTransform.Microsoft.Alpha';

            // filters collection throws an error if we try to retrieve a filter that doesn't exist
            try {
                filter = el.filters.item(filterName);
            } catch (e) {
                // don't set opacity to 1 if we haven't already set an opacity,
                // it isn't needed and breaks transparent pngs.
                if (value === 1) { return; }
            }

            value = Math.round(value * 100);

            if (filter) {
                filter.Enabled = (value !== 100);
                filter.Opacity = value;
            } else {
                el.style.filter += ' progid:' + filterName + '(opacity=' + value + ')';
            }
        }
    },

    testProp: function (props) {

        var style = document.documentElement.style;

        for (var i = 0; i < props.length; i++) {
            if (props[i] in style) {
                return props[i];
            }
        }
        return false;
    },

    getTranslateString: function (point) {
        // on WebKit browsers (Chrome/Safari/iOS Safari/Android) using translate3d instead of translate
        // makes animation smoother as it ensures HW accel is used. Firefox 13 doesn't care
        // (same speed either way), Opera 12 doesn't support translate3d

        var is3d = Z.Browser.webkit3d,
            open = 'translate' + (is3d ? '3d' : '') + '(',
            close = (is3d ? ',0' : '') + ')';

        return open + point.x + 'px,' + point.y + 'px' + close;
    },

    getScaleString: function (scale, origin) {

        var preTranslateStr = Z.DomUtil.getTranslateString(origin.add(origin.multiplyBy(-1 * scale))),
            scaleStr = ' scale(' + scale + ') ';

        return preTranslateStr + scaleStr;
    },

    setPosition: function (el, point, disable3D) { // (HTMLElement, Point[, Boolean])

        // jshint camelcase: false
        el._leaflet_pos = point;

        if (!disable3D && Z.Browser.any3d) {
            el.style[Z.DomUtil.TRANSFORM] =  Z.DomUtil.getTranslateString(point);
        } else {
            el.style.left = point.x + 'px';
            el.style.top = point.y + 'px';
        }
    },

    getPosition: function (el) {
        // this method is only used for elements previously positioned using setPosition,
        // so it's safe to cache the position for performance

        // jshint camelcase: false
        return el._leaflet_pos;
    },

    disableTextSelection: function () {
        if ('onselectstart' in document) {
            Z.DomEvent.on(window, 'selectstart', Z.DomEvent.preventDefault);
        }else{
            var userSelectProperty = Z.DomUtil.testProp(
                ['userSelect', 'WebkitUserSelect', 'OUserSelect', 'MozUserSelect', 'msUserSelect']);

            if (userSelectProperty) {
                var style = document.documentElement.style;
                this._userSelect = style[userSelectProperty];
                style[userSelectProperty] = 'none';
            }
        }
    },

    enableTextSelection: function () {
        if ('onselectstart' in document) {
            Z.DomEvent.off(window, 'selectstart', Z.DomEvent.preventDefault);
        }else{
            var userSelectProperty = Z.DomUtil.testProp(
                ['userSelect', 'WebkitUserSelect', 'OUserSelect', 'MozUserSelect', 'msUserSelect']);

            if (userSelectProperty) {
                document.documentElement.style[userSelectProperty] = this._userSelect;
                delete this._userSelect;
            }
        }
    },

    disableImageDrag: function () {
        Z.DomEvent.on(window, 'dragstart', Z.DomEvent.preventDefault);
    },

    enableImageDrag: function () {
        Z.DomEvent.off(window, 'dragstart', Z.DomEvent.preventDefault);
    },

    colorToGRBA: function(color, opacity){
        var result = color;

        if((typeof opacity !== 'number') || opacity === NaN){
            opacity = 1;
        }

        opacity = Math.min(1, Math.max(0, opacity));

        if(typeof color === "string"){
            if(color.length >= 7 && color.indexOf("#") >= 0){
                color = color.substring(color.indexOf("#") + 1);
                var r = (_hex2Int(color.charAt(0))<<4) + _hex2Int(color.charAt(1)),
                    g = (_hex2Int(color.charAt(2))<<4) + _hex2Int(color.charAt(3)),
                    b = (_hex2Int(color.charAt(4))<<4) + _hex2Int(color.charAt(5));

                result = "rgba(" + r + "," + g + "," + b + "," + opacity + ")";
            }else if(color.length >= 8 && color.indexOf("0x") >= 0){
                color = color.substring(color.indexOf("0x") + 2);
                var r = (_hex2Int(color.charAt(0))<<4) + _hex2Int(color.charAt(1)),
                    g = (_hex2Int(color.charAt(2))<<4) + _hex2Int(color.charAt(3)),
                    b = (_hex2Int(color.charAt(4))<<4) + _hex2Int(color.charAt(5));

                result = "rgba(" + r + "," + g + "," + b + "," + opacity + ")";
            }
        }else if(typeof color === "number"){
            var r = (color >> 16) & 0x0000ff,
                g = (color >> 8) & 0x0000ff,
                b = color & 0x0000ff;

            result = "rgba(" + r + "," + g + "," + b + "," + opacity + ")";
        }

        return result;

        function _hex2Int(hex){
            return parseInt("0x" + hex);
        }
    },

    isDom: function(obj){
        if( typeof HTMLElement === 'object' ){
            return obj instanceof HTMLElement;
        }else{
            return obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
        }
    },

    getOffsetPoint: function(domNode){
        if(!Z.DomUtil.isDom(domNode)){
            return;
        }

        var offsetLeft = domNode.offsetLeft,
            offsetTop = domNode.offsetTop;

        if(domNode.offsetParent){
            var parentOffset = Z.DomUtil.getOffsetPoint(domNode.offsetParent);
            offsetLeft += parentOffset.left;
            offsetTop += parentOffset.top;
        }

        return {left: offsetLeft, top: offsetTop};
    }
};

Z.DomUtil.TRANSFORM = Z.DomUtil.testProp(
    ['transform', 'WebkitTransform', 'OTransform', 'MozTransform', 'msTransform']);

// webkitTransition comes first because some browser versions that drop vendor prefix don't do
// the same for the transitionend event, in particular the Android 4.1 stock browser

Z.DomUtil.TRANSITION = Z.DomUtil.testProp(
    ['webkitTransition', 'transition', 'OTransition', 'MozTransition', 'msTransition']);

Z.DomUtil.TRANSITION_END =
    Z.DomUtil.TRANSITION === 'webkitTransition' || Z.DomUtil.TRANSITION === 'OTransition' ?
    Z.DomUtil.TRANSITION + 'End' : 'transitionend';