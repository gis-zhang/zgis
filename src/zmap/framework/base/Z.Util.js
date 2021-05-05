/**
 * Created by Administrator on 2015/10/23.
 */
var Z={};

//Z.Util = L.extend({},L.Util,{
Z.Util = {
    extend: function (dest) { // (Object[, Object, ...]) ->
        var sources = Array.prototype.slice.call(arguments, 1),
            i, j, len, src;

        for (j = 0, len = sources.length; j < len; j++) {
            src = sources[j] || {};
            for (i in src) {
                if (src.hasOwnProperty(i)) {
                    dest[i] = src[i];
                }
            }
        }
        return dest;
    },

    bind: function (fn, obj) { // (Function, Object) -> Function
        var args = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : null;
        return function () {
            return fn.apply(obj, args || arguments);
        };
    },

    invokeEach: function (obj, method, context) {
        var i, args;

        if (typeof obj === 'object') {
            args = Array.prototype.slice.call(arguments, 3);

            for (i in obj) {
                method.apply(context, [i, obj[i]].concat(args));
            }
            return true;
        }

        return false;
    },

    falseFn: function (target) {
        if(target){
            target = false;
        }

        return false;
    },

    formatNum: function (num, digits) {
        var pow = Math.pow(10, digits || 5);
        return Math.round(num * pow) / pow;
    },

    splitWords: function (str) {
        //return Z.Util.trim(str).split(/\s+/);  //stringTrim
        return Z.Util.stringTrim(str).split(/\s+/);
    },

    //如果union为true，将toOptions和fromOptions的属性合并，否则将fromOptions中出excludes以外的属性添加到toOptions中并替换toOptions中的同名属性
    applyOptions: function (toOptions, fromOptions, union, excludes) {
        excludes = excludes || [];
        var excludesObj = excludes ? {} : null;

        for (var i = 0; i < excludes.length; i++) {
            excludesObj[excludes[i]] = 1;
        }

        if (toOptions && fromOptions) {
            var prop;

            if (union) {
                for (prop in fromOptions) {
                    if (excludesObj && !(prop in excludesObj)) {
                        toOptions[prop] = fromOptions[prop];
                    }
                }
            } else {
                for (prop in toOptions) {
                    var curFromValue = fromOptions[prop];

                    if ((curFromValue !== undefined) && excludesObj && !(prop in excludesObj)) {
                        toOptions[prop] = curFromValue;
                    }

                    //if ((fromOptions[prop] !== undefined) && excludesObj && !(prop in excludesObj)) {
                    //    toOptions[prop] = fromOptions[prop];
                    //}
                }
            }
        }

        return toOptions;
    },

    getParamString: function (obj, existingUrl, uppercase) {
        var params = [];
        for (var i in obj) {
            params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i]));
        }
        return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');
    },

    template: function (str, data) {
        return str.replace(/\{ *([\w_]+) *\}/g, function (str, key) {
            var value = data[key];
            if (value === undefined) {
                throw new Error('No value provided for variable ' + str);
            } else if (typeof value === 'function') {
                value = value(data);
            }
            return value;
        });
    },

    stamp: (function () {
        var lastId = 0,
            key = '_zmap_id';
        return function (obj, suffix) {
            var newKey = suffix ? (key + "_" + suffix) : key;
            obj[newKey] = obj[newKey] || ++lastId;
            return obj[newKey];
        };
    }()),

    /*浅复制数组*/
    arrayClone: function (srcArray) {
        var distArray = null;

        if (srcArray instanceof Array) {
            distArray = [];

            for (var i = 0; i < srcArray.length; i++) {
                distArray[i] = srcArray[i];
            }
        }

        return distArray;
    },

    /*浅复制对象*/
    objectClone: function (fromObject, toObject, options) {
        var newObject = toObject || {},
            options = options || {};

        for (var i in fromObject) {
            if (!fromObject.hasOwnProperty(i) ||
                (i === 'prototype' && !options.includePrototype) ||
                (fromObject[i] instanceof Function && !options.includeFunctions)) {
                continue;
            }

            newObject[i] = fromObject[i];
        }

        return newObject;
    },

    /*判断对象是否为空*/
    isNull: function (obj) {
        if (typeof obj === "number") {
            return isNaN(obj);
        } else {
            return !obj;
        }
    },

    /*判断对象是否为数字0*/
    isZero: function (obj) {
        return Z.Util.numberEquals(obj, 0);
    },

    /*判断对象是否为数字*/
    isNumber: function (obj) {
        if (typeof obj === "number") {
            return !isNaN(obj);
        } else {
            return false;
        }
    },

    /*判断对象是否为数字0*/
    numberEquals: function (num1, num2) {
        if (typeof num1 === "number"
            && typeof num2 === "number"
            && Math.abs(num1 - num2) < 0.00000001) {
            return true;
        } else {
            return false;
        }
    },

    /*将数字规范化到指定范围*/
    scopeNumber: function (num, min, max) {
        if (!Z.Util.isNumber(num)) {
            num = 0;
        }

        return Math.min(Math.max(0, num), 1);
    },

    /*添加对象到数组数组*/
    addToArray: function (array, obj, index) {
        if (this.isNull(obj) || !(array instanceof Array)) {
            return;
        }

        index = this.limitIndexToArray(array, index);
        array.splice(index, 0, obj);
    },

    removeFromArray: function (array, obj) {
        if (this.isNull(obj) || !(array instanceof Array)) {
            return;
        }

        for (var i = array.length - 1; i >= 0; i--) {
            if (obj === array[i]) {
                array.splice(i, 1);
            }
        }
    },

    /*将索引限制在数组大小范围内*/
    limitIndexToArray: function (array, index) {
        if (!(array && array.length !== undefined)) {
            return;
        }

        index = (index === undefined) ? array.length : index;
        index = Math.max(0, Math.min(array.length, index));

        return index;
    },

    getVectorBounds: function (vectors) {
        vectors = vectors || [];

        if (vectors.length <= 0) {
            return null;
        }

        var minx, maxx, miny, maxy, minz, maxz;

        for (var i = 0; i < vectors.length; i++) {
            if (!vectors[i]) {
                continue;
            }

            if (minx === undefined) {
                minx = vectors[i].x,
                    maxx = vectors[i].x,
                    miny = vectors[i].y,
                    maxy = vectors[i].y,
                    minz = vectors[i].z,
                    maxz = vectors[i].z;
            } else {
                minx = Math.min(vectors[i].x, minx);
                maxx = Math.max(vectors[i].x, maxx);
                miny = Math.min(vectors[i].y, miny);
                maxy = Math.max(vectors[i].y, maxy);
                minz = Math.min(vectors[i].z, minz);
                maxz = Math.max(vectors[i].z, maxz);
            }
        }

        return Z.GLBounds.create(new Z.Point(minx, miny, minz), new Z.Point(maxx, maxy, maxz));
    },

    getPointBounds: function (points) {
        points = points || [];

        if (points.length <= 0) {
            return null;
        }

        var minx, maxx, miny, maxy, minz, maxz;

        for (var i = 0; i < points.length; i++) {
            if (!points[i]) {
                continue;
            }

            if (minx === undefined) {
                minx = points[i].x,
                    maxx = points[i].x,
                    miny = points[i].y,
                    maxy = points[i].y,
                    minz = points[i].z,
                    maxz = points[i].z;
            } else {
                minx = Math.min(points[i].x, minx);
                maxx = Math.max(points[i].x, maxx);
                miny = Math.min(points[i].y, miny);
                maxy = Math.max(points[i].y, maxy);
                minz = Math.min(points[i].z, minz);
                maxz = Math.max(points[i].z, maxz);
            }
        }

        return Z.Bounds.create(new Z.Point(minx, miny, minz), new Z.Point(maxx, maxy, maxz));
    },

    stringBeginsWith: function (str, sub) {
        if (typeof str != "string") {
            return false;
        }

        if (str.length == 0) {
            return false;
        }

        sub = sub || ' ';

        return str.substring(0, sub.length) === sub;
    },

    stringEndsWith: function (str, sub) {
        if (typeof str != "string") {
            return false;
        }

        if (str.length == 0) {
            return false;
        }

        sub = sub || ' ';

        return str.substring(str.length - sub.length) === sub;
    },

    stringTrim: function (str, sub) {
        if (typeof str != "string") {
            return str;
        }

        if (str.length == 0) {
            return str;
        }

        sub = sub || /(^\s+)|(\s+$)/g; // Defaults to trimming spaces

        // Trim beginning spaces
        //while (Z.Util.stringBeginsWith(str, sub)) {
        //    str = str.substring(1);
        //}

        // Trim ending spaces
        //while (Z.Util.stringEndsWith(str, sub)) {
        //    str = str.substring(0, str.length - 1);
        //}

        str = str.replace(sub, "");

        return str;
    },

    isFunction: function (fn) {
        if (!fn) {
            return false;
        } else {
            return Object.prototype.toString.call(fn) === '[object Function]';
        }
    },

    getConfigValue: function (object, configItem) {
        if (!object || !configItem) {
            return null;
        }

        var result;

        if (Z.Util.isFunction(configItem)) {
            result = configItem(object);
        } else {
            result = configItem;

            if (typeof result === "string" && result.indexOf("#{") >= 0) {
                result = this._extractPropValue(object, result);
            }
        }

        return result;


    },

    _extractPropValue: function(object, configValue) {
        //提取#{prop}中的属性
        if(configValue === undefined || configValue === null){
            return null;
        }

        var value = configValue.replace(/\s+/, ""),
            //regExp = /#{([\w\d\u4e00-\u9fa5]*)}/gi;
            regExp = /#{([\w\u4e00-\u9fa5]+)}/g;
        var r = value.match(regExp) || [];
        var matchLength = r.length;

        for (var i = 0; i < matchLength; i++) {
            //var item = r[i].replace(/\s*/, "");
            var item = r[i];
            var propName = item.substring(2, item.length - 1);
            var propValue = object[propName] || "";

            if (r.length === 1) {
                if (item === value.replace(/\s+/, "")) {
                    value = propValue;
                } else {
                    value = value.replace(item, propValue);
                }
            } else {
                value = value.replace(item, propValue);
            }
        }

        return value;
    },

    isArray: function (array) {
        if (array instanceof Array
            || array instanceof Float32Array
            || array instanceof Float64Array
            || array instanceof Int32Array
            || array instanceof Int16Array
            || array instanceof Int8Array
            || array instanceof Uint32Array
            || array instanceof Uint16Array
            || array instanceof Uint8Array) {
            return true;
        } else {
            return false;
        }
    }
//});
};

Z.extend = Z.Util.extend;
Z.bind = Z.Util.bind;
Z.stamp = Z.Util.stamp;
Z.setOptions = Z.Util.setOptions;

(function () {
    // inspired by http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    function getPrefixed(name) {
        var i, fn,
            prefixes = ['webkit', 'moz', 'o', 'ms'];

        for (i = 0; i < prefixes.length && !fn; i++) {
            fn = window[prefixes[i] + name];
        }

        return fn;
    }

    var lastTime = 0;

    function timeoutDefer(fn) {
        var time = +new Date(),
            timeToCall = Math.max(0, 16 - (time - lastTime));

        lastTime = time + timeToCall;
        return window.setTimeout(fn, timeToCall);
    }

    var requestFn = window.requestAnimationFrame ||
        getPrefixed('RequestAnimationFrame') || timeoutDefer;

    var cancelFn = window.cancelAnimationFrame ||
        getPrefixed('CancelAnimationFrame') ||
        getPrefixed('CancelRequestAnimationFrame') ||
        function (id) { window.clearTimeout(id); };


    Z.Util.requestAnimFrame = function (fn, context, immediate, element) {
        fn = Z.bind(fn, context);

        if (immediate && requestFn === timeoutDefer) {
            fn();
        } else {
            return requestFn.call(window, fn, element);
        }
    };

    Z.Util.cancelAnimFrame = function (id) {
        if (id) {
            cancelFn.call(window, id);
        }
    };

}());