//L.Marker的默认实现拦截了鼠标双击事件的传播，导致地图监测不到双击事件
//此处重写了_fireMouseEvent方法，修正此问题
MeasureMarker = L.Marker.extend({
    _fireMouseEvent: function (e) {

        this.fire(e.type, {
            originalEvent: e,
            latlng: this._latlng
        });

        if (e.type === 'contextmenu' && this.hasEventListeners(e.type)) {
            L.DomEvent.preventDefault(e);
        }

        //修改了此处
        if (e.type !== 'mousedown' && e.type !== 'dblclick') {
            L.DomEvent.stopPropagation(e);
        } else {
            L.DomEvent.preventDefault(e);
        }
    }
});

SimpleDraw = function (map, options) {
    if (!map) {
        return null;
    }

    this._map = map;
    this._renderer = new FeatureRenderer();
    this._container = null;
    this._popup = null;
    this._enabled = false;
    this._drawing = false;
    this._drawType;
    this._drawTypeArray = ['point', 'polyline', 'polygon'];
    this._listenerArray = ['beforeClick', 'afterClick', 'beforeMouseMove', 'afterMouse', 'beforeDblClick', 'afterDblClick'];
    //this._listeners = {};

    this._drawGroup = null;
    this._drawGuide = null;
    this._shape = null;
    this._anchors = [];
    this._anchorLines = [];
    this._points = [];
    this._markers = [];

    this._isDblClick = false;

    if (this._map) {
        this._drawGroup = new L.LayerGroup();
        this._drawGuide = new L.LayerGroup();
        this._map.addLayer(this._drawGroup);
        this._map.addLayer(this._drawGuide);

        //this._container = this._map.map._panes.mapPane;
    }

    this.options = {
        listeners: {},
        markerStyle: {
            type: 'text',              //text、icon、div、circle
            iconStyle: {
            //                //for icon
            //                iconUrl: 'my-icon.png',
            //                iconRetinaUrl: 'my-icon@2x.png',
            //                shadowUrl: 'my-icon-shadow.png',
            //                shadowRetinaUrl: 'my-icon-shadow@2x.png',
            //                shadowSize: [68, 95],
            //                shadowAnchor: [22, 94],

            //                //for icon、div
            //                //iconSize: [38, 95],
            //                //iconAnchor: [22, 94],
            //                //popupAnchor: [-3, -76],

            //                //for text、div
            //                className: 'leaflet-div-icon',
            //                html: 'html',

            //                //for circle
            //                radius: 10,
            //                color: '#f00',
            //                weight: 5,
            //                opacity: 1,
            //                fillColor: '#ff0',
            //                fillOpacity: 1
            },
            markerStyle: {
            //                //for text、icon、div
            //                clickable: true,
            //                draggable:false,
            //                keyboard:true,
            //                title:'marker',
            //                alt:'alt',
            //                zIndexOffset:0,
            //                opacity:1,
            //                riseOnOver:false,
                //                riseOffset: 250
            }
        },
        drawStyle: {
            color: '#f00',
            weight: 3,
            opacity: 0.5,
            fillColor: '#03f',
            fillOpacity: 0.2,
            markerType: 'text'
        },
        guideStyle: {
            color: '#03f',
            weight: 3,
            opacity: 0.5
        },
        multiDraw: false,
        tooltip: true
    };

    var opt;
    if (options) {
        for (opt in options) {
            this.options[opt] = options[opt];
        }
    }
}

SimpleDraw.prototype.enable = function () {
    this._map.on('click', this._onClick, this);
    this._map.on('mousemove', this._onMouseMove, this);

    if (!this._popup) {
        this._popup = new L.Texttip(this._map);
    }

    if (this.options.tooltip) {
        this._popup.show();
    } else {
        this._popup.hide();
    }

    this._enabled = true;
}

SimpleDraw.prototype.disable = function () {
    this._map.off('click', this._onClick, this);
    this._map.off('mousemove', this._onMouseMove, this);

    if (this._popup) {
        this._popup.dispose();
        delete this._popup;
    }

    this._enabled = false;
}

SimpleDraw.prototype.beginDraw = function (drawType) {
    if (this._drawing) {
        return;
    }

    if (!this._drawTypeValide(drawType)) {
        return;
    }

    this._drawType = drawType.toLowerCase();

    if (!this._enabled) {
        this.enable();
    }
}

SimpleDraw.prototype._drawTypeValide = function (drawType) {
    var result = false, loop;

    if (!drawType) {
        return result;
    }

    drawType = drawType.toLowerCase();

    for (loop = 0; loop < this._drawTypeArray.length; loop++) {
        if (this._drawTypeArray[loop] == drawType) {
            result = true;
            break;
        }
    }

    return result;
}

SimpleDraw.prototype._onClick = function (event) {
    //    if (this._isDblClick) {
    //        this._isDblClick = false; alert(this._isDblClick);
    //        return;
    //    }

    if (!this._enabled) {
        return;
    }

    if (this.options.listeners.beforeClick) {
        this.options.listeners.beforeClick(event, this._drawing);
    }

    if (this._drawType == "point") {
        this._startShape();
        this._points = [new L.LatLng(event.latlng.lat, event.latlng.lng)];
        this._updateShape(this._shape, this._points);
        this._drawing = false;

        return;
    }

    if (!this._drawing) {
        if (!this.options.multiDraw) {
            this.clear();
        }

        this._startShape();

        //this._points = [event.latlng];
        this._points = [new L.LatLng(event.latlng.lat, event.latlng.lng)];
    } else {
        //this._points.push(event.latlng);
        this._points.push(new L.LatLng(event.latlng.lat, event.latlng.lng));
        this._updateShape(this._shape, this._points);
    }

    if (this._drawType == "polyline") {
        this._anchors = [event.latlng];

        if (this._anchorLines.length < 1) {
            var polyline = this._getGuideShape(this.options.guideStyle);
            this._drawGuide.addLayer(polyline);
            this._anchorLines.push(polyline);
        }
    } else if (this._drawType == "polygon") {
        if (this._anchors.length < 2) {
            polyline = this._getGuideShape(this.options.guideStyle);
            this._drawGuide.addLayer(polyline);
            this._anchors.push(event.latlng);
            this._anchorLines.push(polyline);
        } else {
            this._anchors[1] = event.latlng;
        }
    }

    //var icon = this._createVertexIcon();
    //var newMarker = new MeasureMarker(event.latlng, { icon: icon });
    //var newMarker = new L.CircleMarker(event.latlng, { radius: 5, color: '#f00', fillColor: "#fff", fillOpacity: 1 });
    var newMarker = this._createVertexMarker(event.latlng);

    var textContent = "";
    if (this.options.listeners.afterClick) {
        var textIcon = this._createTextIcon(textContent);
        var newTextMarker = new MeasureMarker(event.latlng, { icon: textIcon });

        //var iconMarker = newMarker, textMarker = newTextMarker;
        var markers = { iconMarker: newMarker, textMarker: newTextMarker };
        this.options.listeners.afterClick(event, this._points, markers);

        if (markers.iconMarker) {
            markers.iconMarker.addTo(this._map.map);
            this._markers.push(markers.iconMarker);
        }

        if (markers.textMarker) {
            markers.textMarker.addTo(this._map.map);
            this._markers.push(markers.textMarker);
        }
    } else {
        //默认只添加节点标注，不添加tip文本
        newMarker.addTo(this._map.map);
        this._markers.push(newMarker);
    }
}

//置为开始绘图状态
SimpleDraw.prototype._startShape = function () {
    this._drawing = true;
    this._shape = this._getDrawShape(this.options.drawStyle, this.options.markerStyle);
    this._drawGroup.addLayer(this._shape);
    //this._container.style.cursor = 'crosshair';

    if (this._drawType == "point") {
        return;
    }

    this._map.on('dblclick', this._onDblClick, this);
}

//创建图形对象
SimpleDraw.prototype._getDrawShape = function (style, options) {
    var shp, iconStyle, markerStyle, textIcon, divIcon;
    var style = style || {};

    if (this._drawType == "point") {
        if (options) {
            if (options.type == "text") {
                shp = this._getTextMarker(options.iconStyle, options.markerStyle);
            } else if (options.type == "div") {
                shp = this._getDivMarker(options.iconStyle, options.markerStyle);
            } else if (options.type == "circle") {
                shp = this._getCircleMarker(options.iconStyle, options.markerStyle);
            } else {
                shp = this._getIconMarker(options.iconStyle, options.markerStyle);
            }
        } else {
            shp = new L.Marker(new L.LatLng(0, 0));
        }

    } else if (this._drawType == "polyline") {
        shp = new L.Polyline([], style);
    } else if (this._drawType == "polygon") {
        shp = new L.Polygon([], style);
    }

    return shp;
}

//创建文本标注
SimpleDraw.prototype._getTextMarker = function (iconStyle, markerStyle) {
    return this._renderer.getTextMarker([0, 0], {iconStyle: iconStyle, markerStyle: markerStyle});
}

//创建方块标注
SimpleDraw.prototype._getDivMarker = function (iconStyle, markerStyle) {
    return this._renderer.getRectMarker([0, 0], { iconStyle: iconStyle, markerStyle: markerStyle });
}

//创建圆圈标注
SimpleDraw.prototype._getCircleMarker = function (iconStyle, markerStyle) {
    return this._renderer.getCircleMarker([0, 0], iconStyle);
}

//创建图片标注
SimpleDraw.prototype._getIconMarker = function (iconStyle, markerStyle) {
    return this._renderer.getPictureMarker([0, 0], { iconStyle: iconStyle, markerStyle: markerStyle });
}

//创建鼠标移动时的动态线
SimpleDraw.prototype._getGuideShape = function (style) {
    var shp;
    var style = style || {};

    shp = new L.Polyline([], style);

    return shp;
}

//更新图形坐标
SimpleDraw.prototype._updateShape = function (shp, points) {
    if (shp instanceof L.Polyline || shp instanceof L.Polygon) {
        shp.setLatLngs(points);
        shp.redraw();
    } else if (shp instanceof L.Marker || shp instanceof L.CircleMarker) {
        if (points.length > 0) {
            shp.setLatLng(points[points.length - 1]);
            //shp.redraw();
        }
    }
}

//创建顶点图标
SimpleDraw.prototype._createVertexIcon = function () {
    var iconOps = {
        iconSize: new L.Point(8, 8),
        clickable: true,
        draggable: false,
        keyboard: false
    }

    return new L.DivIcon(iconOps);
}

SimpleDraw.prototype._createVertexMarker = function (latlng) {
    var markerOps = {
        radius: 5,
        color: '#f00',
        fillColor: "#fff",
        fillOpacity: 1
    }

    //var icon = this._createVertexIcon();
    //var newMarker = new MeasureMarker(event.latlng, { icon: icon });
    var newMarker = new L.CircleMarker(latlng, markerOps);

    return newMarker;
}

//创建文本注记
SimpleDraw.prototype._createTextIcon = function (text) {
    text = text ? text : "";

    var iconOps = {
        text: text + "",
        iconAnchor: [-10, 4],
        clickable: true,
        draggable: false,
        keyboard: false
    }

    //return new L.DivIcon(iconOps);
    return new L.TextIcon(iconOps);
}

SimpleDraw.prototype._onMouseMove = function (event) {
    if (!this._enabled) {
        return;
    }

    if (this.options.listeners.beforeMouseMove) {
        this.options.listeners.beforeMouseMove(event, this._popup);
    }

    if (!this._drawing) {
        //        this._popup.updatePosition(event.latlng);
        //        this._popup.updateContent({ text: "单击确定起点", subtext: '' });
    } else {
        if (this._points.length == 0) {
            return;
        }

        var i;

        for (i = 0; i < this._anchorLines.length; i++) {
            this._updateShape(this._anchorLines[i], [this._anchors[i], event.latlng]);
        }
    }

    if (this.options.tooltip) {
        this._popup.updatePosition(event.latlng);
    }

    if (this.options.listeners.afterMouseMove) {
        this.options.listeners.afterMouseMove(event, this._points, this._anchors, this._popup);
    }
}

SimpleDraw.prototype._onDblClick = function (event) {
    //event.eventType = "dblclick";

    if (!this._enabled) {
        return;
    }

    if (!this._drawing) {
        return;
    }

    this._isDblClick = true;

    if (this.options.listeners.beforeDblClick) {
        this.options.listeners.beforeDblClick(event);
    }

    this._points.push(new L.LatLng(event.latlng.lat, event.latlng.lng));
    this._updateShape(this._shape, this._points);

    //    if (this.options.listeners.afterDblClick) {
    //        this.options.listeners.afterDblClick(event, this._points);
    //    }

    //    var icon = this._createVertexIcon();
    //    var newMarker = new MeasureMarker(event.latlng, { icon: icon });
    var newMarker = this._createVertexMarker(event.latlng);

    var textContent = "终点";
    if (this.options.listeners.afterDblClick) {
        var textIcon = this._createTextIcon(textContent);
        var newTextMarker = new MeasureMarker(event.latlng, { icon: textIcon });

        //var iconMarker = newMarker, textMarker = newTextMarker;
        var markers = { iconMarker: newMarker, textMarker: newTextMarker };
        this.options.listeners.afterDblClick(event, this._points, markers);

        if (markers.iconMarker) {
            markers.iconMarker.addTo(this._map.map);
            this._markers.push(markers.iconMarker);
        }

        if (markers.textMarker) {
            markers.textMarker.addTo(this._map.map);
            this._markers.push(markers.textMarker);
        }
    } else {
        //默认只添加节点标注，不添加tip文本
        newMarker.addTo(this._map.map);
        this._markers.push(newMarker);
    }

    this._finishShape();
}

//重置绘图状态
SimpleDraw.prototype._finishShape = function () {
    this._drawing = false;
    this._drawGuide.clearLayers();

    var i = 0;
    for (; i < this._anchorLines.length; i++) {
        delete this._anchorLines[i];
    }


    for (i = 0; i < this._anchors.length; i++) {
        delete this._anchors[i];
    }

    this._anchors = [];
    this._anchorLines = [];
    this._points = [];

    //this._map.off('mousemove', this._onMouseMove, this);
    this._map.off('dblclick', this._onDblClick, this);
    //this._map.off('click', this._onClick, this);
    //this._container.style.cursor = '';

    if (!this.options.multiDraw) {
        this.disable();
        //this.clear();
    }
}

//清除绘制内容
SimpleDraw.prototype.clear = function () {
    this._drawGroup.clearLayers();
    var i = 0;

    for (; i < this._markers.length; i++) {
        this._map.removeLayer(this._markers[i]);
        delete this._markers[i];
    }

    this._markers = [];
}

//设置事件回调
SimpleDraw.prototype.setListeners = function (listeners) {
    this.options.listeners = listeners;
}


//设置绘图样式
SimpleDraw.prototype.setDrawStyle = function (style) {
    this.options.drawStyle = style;
}


//设置绘图时的鼠标跟随线样式
SimpleDraw.prototype.setGuideStyle = function (style) {
    this.options.guideStyle = style;
}

SimpleDraw.prototype.resetDrawStyle = function () {
    this.options.markerStyle.iconStyle = {};
    this.options.markerStyle.markerStyle = {};
}

/**
* 测量控件
*
*/
MeasureControl = function (map, options) {
    //this._map = map.map;
    this._enabled = false;
    this._measureType = null;
    this._listeners = {};
    this._distance = 0;
    this._area = 0;

    this._options = {
        drawStyle: {
            color: '#f00',
            weight: 3,
            opacity: 1,
            fillColor: '#88a',
            fillOpacity: 0.5
        }, guideStyle: {
            color: '#f00',
            weight: 3,
            dashArray: '5,5',
            opacity: 0.5
        }, prop: {
            multiDraw: false,
            geodesic: true
        }
    }

    if (options) {
        var opt;

        if (options.drawStyle) {
            for (opt in options.drawStyle) {
                this._options.drawStyle[opt] = options.drawStyle[opt];
            }
        }

        if (options.guideStyle) {
            for (opt in options.guideStyle) {
                this._options.guideStyle[opt] = options.guideStyle[opt];
            }
        }

        if (options.prop) {
            for (opt in options.prop) {
                this._options.prop[opt] = options.prop[opt];
            }
        }
    }

    this._drawTool = new SimpleDraw(map, this._options);
    this._initListener();
}

//测量距离
MeasureControl.prototype.measureDistance = function () {
    this._measureType = "distance";
    this._drawTool.beginDraw("polyline");
}

//测量面积
MeasureControl.prototype.measureArea = function () {
    this._measureType = "area";
    this._drawTool.beginDraw("polygon");
}

MeasureControl.prototype._initListener = function () {
    var thisObj = this;

    this.listeners = {
        "afterClick": function (event, points, markers) {
            var tip = "";
            var iconMarker = markers.iconMarker;
            var textMarker = markers.textMarker;

            if (thisObj._measureType == "distance") {
                if (points.length <= 1) {
                    tip = "起点";
                } else {
                    tip = thisObj._getDistanceTip(points[points.length - 2], points[points.length - 1], thisObj._distance);
                    thisObj._distance += thisObj._getDistance(points[points.length - 2], points[points.length - 1]);
                }

                thisObj._updateTextMarkerContent(textMarker, tip);
            } else if (thisObj._measureType == "area") {
                //if (points.length == 2) {
                markers.textMarker = null;
                //} else {
                //    thisObj._area = thisObj._getArea(points);
                //    tip = thisObj._getAreaTip(points);
                //}
            }
        },
        "afterMouseMove": function (event, points, anchors, popup) {
            var tip = "";

            if (points.length < 1) {
                tip = "单击确定起点";
            } else {
                if (thisObj._measureType == "distance") {
                    tip = thisObj._getDistanceTip(points[points.length - 1], event.latlng, thisObj._distance);
                } else if (thisObj._measureType == "area") {
                    var curPoints = [], loop;

                    for (loop = 0; loop < points.length; loop++) {
                        curPoints.push(points[loop]);
                    }

                    curPoints.push(event.latlng);
                    tip = thisObj._getAreaTip(curPoints);
                }
            }

            popup.updateContent({ text: tip, subtext: '' });
        },
        "afterDblClick": function (event, points, markers) {
            var tip = "";
            thisObj._distance = 0;
            thisObj._area = 0;

            if (points.length < 1) {
                tip = "终点";
            } else {
                if (thisObj._measureType == "distance") {
                    //tip = thisObj._getDistanceTip(points[points.length - 1], event.latlng);
                    markers.textMarker = null;
                } else if (thisObj._measureType == "area") {
                    tip = thisObj._getAreaTip(points);
                }
            }

            //var textIcon = this._createTextIcon(tip);
            //var newTextMarker = new MeasureMarker(event.latlng, { icon: textIcon });
            if (markers.textMarker) {
                thisObj._updateTextMarkerContent(markers.textMarker, tip);
            }
            //markers.textMarker = newTextMarker;
        }
    };

    this._drawTool.setListeners(this.listeners);
}

//更新文本注记的内容
MeasureControl.prototype._updateTextMarkerContent = function (marker, text) {
    text = text ? text : "";

    var iconOps = {
        text: text + "",
        iconAnchor: [-10, 4],
        clickable: true,
        draggable: false,
        keyboard: false
    }

    //return new L.DivIcon(iconOps);
    var mkr = new L.TextIcon(iconOps);
    marker.setIcon(mkr);
}

//距离测量结果的文本表示
MeasureControl.prototype._getDistanceTip = function (point1, point2, baseDistance) {
    baseDistance = baseDistance || 0;
    var distance = this._getDistance(point1, point2);
    var totalDis = baseDistance + distance;
    //    var textContent = "";

    //    if (totalDis < 1000) {
    //        textContent = totalDis + "米";
    //    } else {
    //        textContent = totalDis / 1000 + "公里";
    //    }
    var textContent = L.MeasureUtil.readableDistance(totalDis);

    return textContent;
}

//计算两点距离
MeasureControl.prototype._getDistance = function (point1, point2) {
    var dis = 0;

    if (this._options.prop.geodesic) {
        dis = L.MeasureUtil.geodesicDistance(point1, point2); //point1.distanceTo(point2);
    } else {
        dis = L.MeasureUtil.planeDistance(point1, point2);
    }

    dis = Math.floor(dis);

    return dis;
}

//面积测量结果的文本表示
MeasureControl.prototype._getAreaTip = function (points) {
    var area = this._getArea(points);
    var totalArea = this._area + area;
    var textContent = L.MeasureUtil.readableArea(totalArea);

    return textContent;
}

//计算多边形面积
MeasureControl.prototype._getArea = function (points) {
    var area = 0;

    if (this._options.prop.geodesic) {
        area = L.MeasureUtil.geodesicArea(points); //point1.distanceTo(point2);
    } else {
        area = L.MeasureUtil.planeArea(points);
    }

    area = Math.floor(area);

    return area;
}

MeasureControl.prototype.clear = function () {
    this._drawTool.clear();
}

MeasureControl.prototype.enable = function () {
    this._drawTool.enable();
    this._enabled = true;
}

MeasureControl.prototype.disable = function () {
    this._drawTool.disable();
    this._enabled = false;
}

/**
* 测量辅助工具
*
*/
L.MeasureUtil = L.extend(L.MeasureUtil || {}, {
    //测量经纬度多边形面积 
    //Ported from the OpenLayers implementation. See https://github.com/openlayers/openlayers/blob/master/lib/OpenLayers/Geometry/LinearRing.js#L270
    geodesicArea: function (latLngs) {
        var pointsCount = latLngs.length,
			area = 0.0,
			d2r = L.LatLng.DEG_TO_RAD,
			p1, p2;

        if (pointsCount > 2) {
            for (var i = 0; i < pointsCount; i++) {
                p1 = latLngs[i];
                p2 = latLngs[(i + 1) % pointsCount];
                area += ((p2.lng - p1.lng) * d2r) *
						(2 + Math.sin(p1.lat * d2r) + Math.sin(p2.lat * d2r));
            }
            area = area * 6378137.0 * 6378137.0 / 2.0;
        }

        return Math.abs(area);
    },

    //测量平面多边形面积
    planeArea: function (latLngs) {
        var pointsCount = latLngs.length,
			area = 0.0,
        //d2r = L.LatLng.DEG_TO_RAD,
			p1, p2;

        if (pointsCount > 2) {
            for (var i = 0; i < pointsCount; i++) {
                p1 = latLngs[i];
                p2 = latLngs[(i + 1) % pointsCount];
                //area += ((p2.lng - p1.lng) * d2r) *
                //		(2 + Math.sin(p1.lat * d2r) + Math.sin(p2.lat * d2r));

                area += p1.lng * p2.lat - p2.lng * p1.lat

            }
            //area = area * 6378137.0 * 6378137.0 / 2.0;
            area /= 2;
        }

        return Math.abs(area);
    },

    readableArea: function (area, isMetric) {
        var areaStr;

        if (isMetric == undefined) {
            isMetric = true;
        }

        if (isMetric) {
            //            if (area >= 10000) {
            //                areaStr = (area * 0.0001).toFixed(2) + ' 公顷';  //ha
            if (area >= 10000) {
                areaStr = (area * 0.000001).toFixed(2) + ' 平方千米';  //ha
            } else {
                areaStr = area.toFixed(0) + ' 平方米;';  //m&sup2
            }
        } else {
            area /= 0.836127; // Square yards in 1 meter

            if (area >= 3097600) { //3097600 square yards in 1 square mile
                areaStr = (area / 3097600).toFixed(2) + ' 平方英里;';     //mi&sup2
            } else if (area >= 4840) {//48040 square yards in 1 acre
                areaStr = (area / 4840).toFixed(2) + ' 英亩';       //acres  
            } else {
                areaStr = Math.ceil(area) + ' 平方码;';            //yd&sup2
            }
        }

        return areaStr;
    },

    geodesicDistance: function (point1, point2) {
        var dis = point1.distanceTo(point2);

        return Math.abs(dis);
    },

    planeDistance: function (point1, point2) {
        var dis = (point2.lat - point1.lat) * (point2.lng - point1.lng) / 2;
        //dis = Math.floor(dis);

        return Math.abs(dis);
    },

    readableDistance: function (distance, isMetric) {
        var distanceStr;

        if (isMetric == undefined) {
            isMetric = true;
        }

        if (isMetric) {
            // show metres when distance is < 1km, then show km
            if (distance > 1000) {
                distanceStr = (distance / 1000).toFixed(2) + ' 公里';
            } else {
                distanceStr = Math.ceil(distance) + ' 米';
            }
        } else {
            distance *= 1.09361;

            if (distance > 1760) {
                distanceStr = (distance / 1760).toFixed(2) + ' 英里';     //miles
            } else {
                distanceStr = Math.ceil(distance) + ' 码';    //yd
            }
        }

        return distanceStr;
    }
});

/**
 * 标注控件
 *
 */
MarkerControl = function (map, options) {
    this._enabled = false;
    this._drawTool = new SimpleDraw(map, options);
    this._initListener();
}

MarkerControl.prototype._initListener = function () {
    var thisObj = this;

    this.listeners = {
        "afterClick": function (event, points, markers) {},
        "afterMouseMove": function (event, points, anchors, popup) {
            var tip = "单击确定";

            popup.updateContent({ text: tip, subtext: '' });
        },
        "afterDblClick": function (event, points, markers) {}
    };

    this._drawTool.setListeners(this.listeners);
}

MarkerControl.prototype.drawText = function (options) {
    this._drawTool.resetDrawStyle();

    if (options) {
        Util.applyOptions(this._drawTool.options.markerStyle.iconStyle, options, true);
    }
    this._drawTool.options.markerStyle.type = "text";
    this._drawTool.beginDraw("point");
}

MarkerControl.prototype.drawDivIcon = function (options) {
    this._drawTool.resetDrawStyle();

    if (options) {
        Util.applyOptions(this._drawTool.options.markerStyle.iconStyle, options, true);
    }
    this._drawTool.options.markerStyle.type = "div";
    this._drawTool.beginDraw("point");
}

MarkerControl.prototype.drawCircle = function (options) {
    this._drawTool.resetDrawStyle();

    if (options) {
        Util.applyOptions(this._drawTool.options.markerStyle.iconStyle, options, true);
    }
    this._drawTool.options.markerStyle.type = "circle";
    this._drawTool.beginDraw("point");
}

MarkerControl.prototype.drawIcon = function (options) {
    this._drawTool.resetDrawStyle();

    if (options) {
        Util.applyOptions(this._drawTool.options.markerStyle.iconStyle, options, true);
    }
    this._drawTool.options.markerStyle.type = "icon";
    this._drawTool.beginDraw("point");
}

MarkerControl.prototype.enable = function () {
    this._drawTool.enable();
    this._enabled = true;
}

MarkerControl.prototype.disable = function () {
    this._drawTool.disable();
    this._enabled = false;
}

