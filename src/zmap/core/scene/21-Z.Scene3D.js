/**
 * Created by Administrator on 2015/10/29.
 */
Z.Scene3D = Z.IScene.extend({
    initialize: function(container, options){
        //属性定义
        this._container = container;               //渲染容器
        this._containerWidth = container ? container.clientWidth : 400;
        this._containerHeight = container ? container.clientHeight : 400;
        //this._containerLeft = container ? container.offsetLeft : 0;
        //this._containerTop = container ? container.offsetTop : 0;
        var offsetPoint = Z.DomUtil.getOffsetPoint(container) || {};
        this._containerLeft = offsetPoint.left || 0;
        this._containerTop = offsetPoint.top || 0;
        this._rotation = {x:0, y:0, z:0};//初始旋转角    //{x:90, y: 90, z:-180};
        this._bgColor = '#ffffff';            //背景颜色
        this._ambientLight = "#ffffff";  //"#888888";    //"#333333";      //环境光颜色
        this._sunLight = "#aaaaaa";           //太阳光颜色
        //this._sunLightPosition = "#aaaaaa";           //太阳光位置
        this._sunIntensity = 0.8;              //太阳光强度。取值范围在0-1之间
        this._sunHeight = {h: 30, v: 45};      //太阳高度角,h为水平方向，v为垂直方向
        this._sceneRender = null;              //场景渲染器
        this._viewFrame = null;                //各显示面板框架架构
        this._contentFrame = null;             //地图内容框架结构
        //this._latLngBounds = null;             //正射经纬度范围
        //this._latLngCenter = null;             //正射经纬度中心点
        //this._viewableLatLngBounds = null;   //可见的经纬度范围
        //this._orthoGLBounds = null;           //正射视角时的webgl场景范围
        //this._viewableGLBounds = null;        //可见范围的webgl场景范围
        this._level = null;                     //当前缩放级别
        this._dragger = null;                   //
        this._touchZoom = null;
        //this._pyramidModel = null;             //金字塔模型
        this._vhRotationLimit = {
            minV: 0,
            maxV: 90,
            minH: 0,
            maxH: 360
        };

        this._currentGraphics = {
            select: [],
            mouseover: []
        };

        //属性初始化
        this.options = options || {};
        this._latLngBounds = options.bounds.clone();
        this._projBounds = this._latLngBounds2ProjBounds(this._latLngBounds, options.projModel);
        this._viewableLatLngBounds = options.bounds.clone();
        this._viewableProjBounds = this._latLngBounds2ProjBounds(this._viewableLatLngBounds, options.projModel);
        this._latLngCenter = options.center.clone();
        this._projCenter = options.projModel ? options.projModel.forwardTransform(this._latLngCenter) : this._latLngCenter;
        //this._projCenter = this._projBounds.getCenter();
        //this._latLngCenter = options.projModel ? options.projModel.reverseTransform(this._projCenter) : this._projCenter;
        this._level = options.initZoom;
        this._viewFrame = new Z.SceneViewFrame(container);
        this._sceneRender = new Z.SceneRender3D(this._viewFrame.mapPane.root, this._getRenderOptions(container, options));
        this._contentFrame = new Z.MapContentFrame();
        //this._sceneRender.addObject(this._contentFrame.rootPane.root);
        this._layerRoot = new Z.SceneThreePaneItem();
        this._sceneRender.addObject(this._layerRoot.root);

        this._sceneRender.render();
        //this._initPyramidModel(options);
        this._pyramidModel = options.pyramidModel;             //金字塔模型
        this._projModel = options.projModel;

        if(options.vhRotationLimit){
            this.setVHRotationLimit(options.vhRotationLimit.minV, options.vhRotationLimit.maxV, options.vhRotationLimit.minH, options.vhRotationLimit.maxH);
        }

        this._initEvents();
        this._enableDrag();

        this._orthoGLBounds = this._sceneRender.getOrthoGLBounds();
        this._viewableGLBounds = this._sceneRender.getVisibleGLBounds();

        this._terrainPlane = null;
        this._initSurfacePlane();

        this._statusVersion = 0;    //状态的版本。每次状态的改变都生产一个新版本

        this.fire("load");
    },

    getCRS: function(){
        return this.options.crs;
    },

    getBounds: function(){
        return this._latLngBounds.clone();
    },

    setZoom: function(zoomLevel){
        if(this._level === zoomLevel || Math.abs(this._level - zoomLevel) < 0.000001){
            return;
        }

        var scale = this._pyramidModel.getScale(zoomLevel),
            curScale = this._pyramidModel.getScale(this._level),

            projWidth = this._projBounds.getEast() - this._projBounds.getWest(),
            projHeight = this._projBounds.getNorth() - this._projBounds.getSouth(),
            newProjWidth = projWidth * scale/curScale,
            newProjHeight = projHeight * scale/curScale,
            newProjBounds = Z.LatLngBounds.create(
                [this._projCenter.lat - newProjHeight/ 2, this._projCenter.lng - newProjWidth/ 2, this._projBounds.getBottom()],
                [this._projCenter.lat + newProjHeight/ 2, this._projCenter.lng + newProjWidth/ 2, this._projBounds.getTop()]);

        var newLatLngBounds = this._projBounds2LatLngBounds(newProjBounds, this._projModel);

        this._updateSceneStatus(this._latLngCenter, newLatLngBounds);
        var oldLevel = this._level;
        this._level = zoomLevel;

        //this._changeStatusVersion();

        this._sceneRender.needsUpdate = true;
        this.fire("zoomlevelschange", {oldLevel: oldLevel, newLevel: zoomLevel});
    },

    zoomByScaling: function(scaling, startZoom){
        var newLevel = this._pyramidModel.scalingLevel(startZoom || this._level, scaling);
        this.setZoom(newLevel.level);
    },

    getZoom: function(){
        return this._level;
    },

    getScale: function(zoom){
        if(zoom === undefined){
            zoom = this._level;
        }

        return this._pyramidModel.getScale(zoom);
    },

    getSize: function(){
        return this._sceneRender.getSize();
    },

    getTopLeftPos: function(){
        return new Z.Point(this._containerLeft, this._containerTop);
    },

    panTo: function(center, zoomLevel){
        if(!(center instanceof Z.LatLng)){
            return;
        }

        this.fire("movestart");

        //var delta = center.subtract(this._latLngBounds.getCenter());
        //this._offsetLatLng(delta);
        this._centerAt(center);
        this.fire("move");
        this.fire("moveend");

        //if(this._level === zoomLevel || Z.Util.isNull(zoomLevel)){
        //    this.fire("viewreset");
        //}else{
        //    this.setZoom(zoomLevel);
        //}
        if(this._level !== zoomLevel && !Z.Util.isNull(zoomLevel)){
            this.setZoom(zoomLevel);
        }

        this.fire("viewreset");
    },

    panByPixel: function(x, y){   //Z.Point      ----pixel distance
        //var dis = Z.Point.create(x, y);
        var offsetX = ((x === undefined || x === NaN)  ? 0 : x),
            offsetY = ((y === undefined || x === NaN) ? 0 : y);

        if(offsetX === 0 && offsetY === 0){
            return;
        }

        this.fire("movestart");

        this._offsetPixel(Z.Point.create(offsetX, offsetY));

        this.fire("move");
        this.fire("moveend");
        this.fire("viewreset");
    },

    panByLatLng: function(lat, lng){   //Z.Point      ----pixel distance
        var dis = Z.LatLng.create(lat, lng);
        var offsetX = ((dis.lng === undefined || dis.lng === NaN)  ? 0 : dis.lng),
            offsetY = ((dis.lat === undefined || dis.lat === NaN) ? 0 : dis.lat);

        if(offsetX === 0 && offsetY === 0){
            return;
        }

        this.fire("movestart");

        this._offsetLatLng(new Z.LatLng(offsetY, offsetX));

        this.fire("move");
        this.fire("moveend");
        this.fire("viewreset");
    },

    /**
     * 将场景旋转指定角度
     * @param rotate: {x,y,z}
     */
    rotateByEuler: function(rotate){
        if(rotate){
            this._sceneRender.rotateByEuler(rotate);
            this._sceneRender.render();
            this._rotation = rotate;

            this._updateSceneStatus();
            this._sceneRender.needsUpdate = true;

            this.fire("rotatestart");
            this.fire("rotate");
            this.fire("rotateend");
            this.fire("viewreset");
        }
    },

    rotateByVH: function(v, h){
        v = v || 0;
        h = h || 0;

        if(v !== 0 || h !== 0){
            var rotationLimit = this.getVHRotationLimit(),
                currentVHRotation = this.getVHRotateByEuler();
            var rotatedV = (currentVHRotation.v + v) % 180,
                rotatedH = ((currentVHRotation.h + h) % 360 + 360) % 360;
            rotatedV = Math.min(Math.max(rotatedV, rotationLimit.minV), rotationLimit.maxV);
            rotatedH = Math.min(Math.max(rotatedH, rotationLimit.minH), rotationLimit.maxH);
            v = rotatedV - currentVHRotation.v;
            h = rotatedH - currentVHRotation.h;

            this._sceneRender.rotateByVH(v, h);
            this._sceneRender.render();

            var radRotation = this._sceneRender.getRotateByRad();

            this._rotation = {
                x: radRotation.x * 180 / Math.PI || 0,
                y: radRotation.y * 180 / Math.PI || 0,
                z: radRotation.z * 180 / Math.PI || 0
            };

            this._updateSceneStatus();
            this._sceneRender.needsUpdate = true;

            this.fire("rotatestart");
            this.fire("rotate");
            this.fire("rotateend");
            this.fire("viewreset");
        }
    },

    calculateVHRotation: function(fromScreenPoint, toScreenPoint){
        return this._sceneRender.calculateVHRotation(fromScreenPoint, toScreenPoint);
    },

    /*重置场景到初始视角*/
    resetRotate: function(){
        this._sceneRender.resetCamera();
        this._rotation = {x:0, y:0, z:0};        //初始旋转角
        this._updateSceneStatus();
        this._sceneRender.needsUpdate = true;

        this.fire("rotatestart");
        this.fire("rotate");
        this.fire("rotateend");
        this.fire("viewreset");
    },

    getRotateByEuler: function(){
        //var radRotate = this._sceneRender.getRotateByRad(),
        //    multiply = 180 / Math.PI;
        //return new Z.Point(radRotate.x * multiply, radRotate.y * multiply, radRotate.z * multiply);
        //return this._rotation;
        return {x: this._rotation.x, y: this._rotation.y, z: this._rotation.z};
    },

    getVHRotateByEuler: function(){
        var radRotate = this._sceneRender.getVHRotateByRad(),
            radToEuler = 180 / Math.PI;

        return {
            v: radRotate.v * radToEuler,
            h: radRotate.h * radToEuler
        }
    },

    getVHRotationLimit: function(){
        return Z.Util.objectClone(this._vhRotationLimit);
    },

    setVHRotationLimit: function(minV, maxV, minH, maxH){
        var limit = this._vhRotationLimit;
        limit.minV = Z.Util.isNumber(minV) ? minV : limit.minV;
        limit.minH = Z.Util.isNumber(minH) ? minH : limit.minH;
        limit.maxV = Z.Util.isNumber(maxV) ? maxV : limit.maxV;
        limit.maxH = Z.Util.isNumber(maxH) ? maxH : limit.maxH;
    },

    getRotateByRad: function(){
        //return this._sceneRender.getRotateByRad();
        var euler = this.getRotateByEuler(),
            multiply = Math.PI / 180;

        return {x: euler.x * multiply, y: euler.y * multiply, z: euler.z * multiply};
    },

    getContentBounds: function(){
        //var renderOrthoBounds = this._sceneRender.getOrthoGLBounds();
        //var renderContentBounds = this._sceneRender.getVisibleGLBounds();
        //var widthRatio = (this._latLngBounds.getEast() - this._latLngBounds.getWest()) / renderOrthoBounds.getWidth();
        //var heightRatio = (this._latLngBounds.getNorth() - this._latLngBounds.getSouth()) / renderOrthoBounds.getHeight();
        //var latLngWidth = renderContentBounds.getWidth() * widthRatio;
        //var latLngHeight = renderContentBounds.getHeight() * heightRatio;
        //var west = this._latLngCenter.lng - latLngWidth * (renderOrthoBounds.getCenter().x - renderContentBounds.getBottomLeft().x) / renderContentBounds.getWidth();
        //var east = west + latLngWidth;
        //var north = this._latLngCenter.lat + latLngHeight * (renderContentBounds.getTopRight().y - renderOrthoBounds.getCenter().y) / renderContentBounds.getHeight();
        //var south = north - latLngHeight;
        //
        //return new Z.LatLngBounds.create(new Z.LatLng(south, west), new Z.LatLng(north, east));
        return this._viewableLatLngBounds.clone();
    },

    //getContentGLBounds: function(){
    //    return this._sceneRender.getVisibleGLBounds().clone();
    //},

    getPixelSceneRatio: function(){
        //var renderOrthoBounds = this._sceneRender.getOrthoGLBounds();
        //var widthRatio = this._container.clientWidth / renderOrthoBounds.getWidth();
        //var heightRatio = this._container.clientHeight / renderOrthoBounds.getHeight();
        var renderOrthoBounds = this._orthoGLBounds;
        var widthRatio = this._containerWidth / renderOrthoBounds.getWidth();
        var heightRatio = this._containerHeight / renderOrthoBounds.getHeight();

        return new Z.Point.create(widthRatio, heightRatio);
    },

    getLatLngSceneRatio: function(){
        var orthoLatLngBounds = this._latLngBounds,//this.getBounds(),
            orthoSceneBounds = this._orthoGLBounds;//this._sceneRender.getOrthoGLBounds();
        var widthRatio = (orthoLatLngBounds.getEast() - orthoLatLngBounds.getWest()) / orthoSceneBounds.getWidth();
        var heightRatio = (orthoLatLngBounds.getNorth() - orthoLatLngBounds.getSouth()) / orthoSceneBounds.getHeight();

        return new Z.Point.create(widthRatio, heightRatio);
    },

    latLngToScreenPoint: function(latLng){
        var glPoint = this._latLngToGLPoint(latLng);
        return this._sceneRender.webGLPointToScreen(glPoint);
    },

    latLngToScenePoint: function(latLng){
        return this._latLngToGLPoint(latLng);
    },

    scenePointToLatLng: function(point){
        return this._glPointToLatLng(point);
    },

    screenPointToLatLng: function(point){
        var glPoint = this._sceneRender.screenPointToWebGL(point);

        if(glPoint){
            return this._glPointToLatLng(glPoint);
        }else{
            return null;
        }
    },

    screenPointToScenePoint: function(point){
        var vector = this._sceneRender.screenPointToWebGL(point);

        if(vector){
            return Z.Point.create(vector.x, vector.y, vector.z);
        }else{
            return null;
        }
    },

    //根据当前相机的视角，计算bounds在地表投影后的外接矩形
    getProjBounds: function(latLngBounds){
        var cameraDirection = this._sceneRender.getCameraDirection();
    },

    //不同的图层分组：底图、业务图层
    addLayer: function(layer, index, layerGroup){
        if(!(layer instanceof Z.ILayer)){
            return;
        }

        var containerPane = null;

        if(layerGroup === Z.LayerGroup.BaseBgLayer){
            containerPane = this._contentFrame.baseBgPane;
        }else if(layerGroup === Z.LayerGroup.BaseOverLayer){
            containerPane = this._contentFrame.baseOverPane;
        }else{
            containerPane = this._contentFrame.layerPane;
        }

        //var baseIndex = containerPane.index;
        //layer.onAdd(this, baseIndex + index, containerPane);
        //layer.onAdd(this, index, containerPane);
        layer.onAdd(this, index, this._layerRoot, containerPane);
        //this.refresh();

        if(this.options.selectionMutex){
            this._applyLayerEvents(layer, "on");
        }

        this._sceneRender.addUpdateChecker(layer);

        this.fire('layeradd', { layer: layer });
    },

    removeLayer: function(layer){
        if(!(layer instanceof Z.ILayer)){
            return;
        }

        layer.onRemove(this);
        //this.refresh();

        if(this.options.selectionMutex){
            this._applyLayerEvents(layer, "off");
        }

        this._sceneRender.removeUpdateChecker(layer);

        this.fire('layerremove', { layer: layer });
    },

    addControl: function(control){
        control.onAdd(this);
    },

    removeControl: function(control){
        control.onRemove(this);
    },

    //setRotationByEuler: function(rotate){
    //    if(rotate){
    //        this._sceneRender.setRotationByEuler(rotate);
    //        this._sceneRender.render();
    //        this._rotation = rotate;
    //    }
    //},

    setSunLightPosition: function(sunLightPosition){
        if(sunLightPosition){
            this._sceneRender.setLightPosition(sunLightPosition);
            this._sceneRender.render();
            //this._sunLight = sunLightPosition;
        }
    },

    setSunLightColor: function(sunLightColor){
        if(sunLightColor){
            this._sceneRender.setLightColor(sunLightColor);
            this._sceneRender.render();
            this._sunLight = sunLightColor;
        }
    },

    getSunLightColor: function(){
        return this._sunLight;
    },

    setAmbientLight: function(ambientLight){
        if(ambientLight){
            this._sceneRender.setAmbientColor(ambientLight);
            this._sceneRender.render();
            this._ambientLight = ambientLight;
        }
    },

    getAmbientLight: function(){
        return this._ambientLight;
    },

    setBgColor: function(color){
        if(color){
            this._sceneRender.setBgColor(color);
            this._sceneRender.render();
        }
    },

    refresh: function(){
        //console.info("refresh");
        this.refreshPopup();
        //console.info("brfore this._sceneRender.render()");
        this._sceneRender.needsUpdate = true;
        this._sceneRender.render();
    },

    resize: function(){
        var tolerance = 0.000001;
        var oldWidth = this._containerWidth;
        var oldHeight = this._containerHeight;
        var newWidth = this._container.clientWidth;
        var newHeight = this._container.clientHeight;

        if(newWidth < tolerance || newHeight < tolerance){
            return;
        }

        this._containerWidth = newWidth;
        this._containerHeight = newHeight;

        //if(Math.abs(oldWidth - this._containerWidth) < tolerance && Math.abs(oldHeight - this._containerHeight) < tolerance){
        //    return;
        //}

        //this._containerLeft = this._container.offsetLeft;
        //this._containerTop = this._container.offsetTop;
        var offsetPoint = Z.DomUtil.getOffsetPoint(this._container) || {};
        this._containerLeft = offsetPoint.left || 0;
        this._containerTop = offsetPoint.top || 0;

        this._viewFrame.resize();
        this._sceneRender.render();

        //this._latLngBounds
        //var newLatLngBounds = this._projBounds2LatLngBounds(newProjBounds, this._projModel);
        var latLngWidth = this._latLngBounds.getEast() - this._latLngBounds.getWest();

        if(Math.abs(oldWidth) > tolerance){
            latLngWidth = latLngWidth * (this._containerWidth / oldWidth);
        }

        var latLngHeight = this._latLngBounds.getNorth() - this._latLngBounds.getSouth();

        if(Math.abs(oldHeight) > tolerance){
            latLngHeight = latLngHeight * (this._containerHeight / oldHeight);
        }

        var newSouthWest = Z.LatLng.create(this._latLngCenter.lat - latLngHeight / 2, this._latLngCenter.lng - latLngWidth / 2);
        var newNorthEast = Z.LatLng.create(this._latLngCenter.lat + latLngHeight / 2, this._latLngCenter.lng + latLngWidth / 2);
        var newLatLngBounds = new Z.LatLngBounds(newSouthWest, newNorthEast);

        this._updateSceneStatus(this._latLngCenter, newLatLngBounds);
        this._sceneRender.resize();
        this._sceneRender.needsUpdate = true;

        this.fire("viewreset");
    },

    getMaxAnisotropy: function(){
        return this._sceneRender.getMaxAnisotropy();
    },

    //将空间距离（单位为米）转换为场景距离（场景坐标）
    getSceneDistance: function(distance){
        return Math.abs(this._meterDistanceToScene(distance));
    },

    openPopup: function(title, content, latLng, options){
        var popup = Z.SinglePopup.getInstance(this, options);
        popup.setTitle(title);
        popup.setContent(content);

        if(latLng){
            popup.setLatLng(latLng);
        }

        popup.open();
    },

    closePopup: function(){
        var popup = Z.SinglePopup.getInstance(this);
        popup.close();
    },

    refreshPopup: function(){
        var popup = Z.SinglePopup.getInstance(this);

        if(popup.isOpened()){
            popup.update();
        }
    },

    //计算geometry占整个视域空间的比例
    getGeometryFillScale: function(geometry){
        var boundingBox = null;

        if(geometry instanceof Z.Geometry){
            boundingBox = geometry.getBounds();
        }else if(geometry instanceof Z.LatLngBounds){
            boundingBox = geometry;
        }else{
            return;
        }

        var southWest = boundingBox.getSouthWest(),
            northEast = boundingBox.getNorthEast();
        var southWestGl = this.latLngToScenePoint(southWest),
            northEastGl = this.latLngToScenePoint(northEast);
        //var boundingBoxGl = new Z.GLBounds(southWestGl, northEastGl);
        var scale = this._sceneRender.getFillScale({min: southWestGl, max: northEastGl});

        return scale;
    },

    documentPointToContainer: function(point){
        return Z.DomEvent.getMousePosition({clientX: point.x, clientY: point.y}, this._container);
    },

    _getRenderOptions: function(container, sceneOptions){
        return {
            width: container.clientWidth,
            height: container.clientHeight,
            bgColor: this._bgColor,
            ambientColor:this._ambientLight,
            lightColor:this._sunLight,
            lightIntensity: this._sunIntensity,
            lightAngle: this._sunHeight,
            rotation: {x:0, y: 0, z:0},
            showFrameRate: sceneOptions.showFrameRate
        };
    },

    _initSurfacePlane: function(){
        this._terrainPlane = Z.SingleTerrainPlane.getInstance();
        this._terrainPlane.enablePolygonOffset();
        //this._terrainPlane.onAdd(this, this._pyramidModel, this._contentFrame.rootPane.root);
        this._terrainPlane.onAdd(this, this._pyramidModel, this._layerRoot.root);
    },

    _disposeSurfacePlane: function(){
        if(this._terrainPlane){
            this._terrainPlane.onRemove();
            this._terrainPlane = null;
        }
    },

    //_initPyramidModel: function(options){
    //    var pyramidOptions = {
    //        //latLngBounds: this._latLngBounds.clone(),
    //        levelDefine: options.levelDefine,
    //        crs: options.crs
    //    };
    //
    //    //this._pyramidModel = new Z.PyramidModel(pyramidOptions);
    //    //this._pyramidModel = new Z.CustomPyramidModel(pyramidOptions);
    //    this._pyramidModel = Z.PyramidModelFactory.create(pyramidOptions);
    //},

    _initEvents: function(onOff){
        if (!Z.DomEvent) { return; }

        onOff = onOff || 'on';

        //Z.DomEvent[onOff](this._container, 'click', this._onMouseClick, this);

        var domEvents = ['dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'mouseenter',
        //var domEvents = ['dblclick', 'mousedown', 'mouseup', 'mouseenter',
                'mouseleave', 'mousemove', 'contextmenu'],
            i, len;

        for (i = 0, len = domEvents.length; i < len; i++) {
            Z.DomEvent[onOff](this._container, domEvents[i], this._fireMouseEvent, this);
        }

        Z.DomEvent[onOff](this._container, 'mousewheel', this._onMouseWheel, this);
        Z.DomEvent[onOff](this._container, 'MozMousePixelScroll', Z.DomEvent.preventDefault);

        //if (this.options.trackResize) {
        Z.DomEvent[onOff](window, 'resize', this._onResize, this);
        Z.DomEvent[onOff](window, 'scroll', this._onScroll, this);
        //}

        this._enableTouchZoom();
        this._enableRightRotate();
    },

    _onMouseWheel: function(e){
        var delta = Z.DomEvent.getWheelDelta(e),
            zoom = this._level;

        //this._delta += delta;
        //this._lastMousePos = this._map.mouseEventToContainerPoint(e);
        //
        //if (!this._startTime) {
        //    this._startTime = +new Date();
        //}
        //
        //var left = Math.max(40 - (+new Date() - this._startTime), 0);
        //
        //clearTimeout(this._timer);
        //this._timer = setTimeout(L.bind(this._performZoom, this), left);

        //delta = delta > 0 ? Math.ceil(delta) : Math.floor(delta);
        //delta = Math.max(Math.min(delta, 4), -4);
        delta = delta / 8;
        //delta = map._limitZoom(zoom + delta) - zoom;
        var newLevel = this._pyramidModel.scalingLevel(zoom, Math.pow(2, delta));
        this.setZoom(newLevel.level);

        Z.DomEvent.preventDefault(e);
        Z.DomEvent.stopPropagation(e);
    },

    _onMouseClick: function(e){
        this.fire('preclick');
        this._fireMouseEvent(e);
    },

    _onResize: function(e){
        //this._containerWidth = this._container.clientWidth;
        //this._containerHeight = this._container.clientHeight;
        ////this._containerLeft = this._container.offsetLeft;
        ////this._containerTop = this._container.offsetTop;
        //var offsetPoint = Z.DomUtil.getOffsetPoint(this._container) || {};
        //this._containerLeft = offsetPoint.left || 0;
        //this._containerTop = offsetPoint.top || 0;
        //
        //this._sceneRender.resize();
        //this._sceneRender.render();
        this.resize();
        this._fireMouseEvent(e);//alert("resize");
    },

    _onScroll: function(e){
        //this._containerLeft = this._container.offsetLeft;
        //this._containerTop = this._container.offsetTop;
        var offsetPoint = Z.DomUtil.getOffsetPoint(this._container) || {};
        this._containerLeft = offsetPoint.left || 0;
        this._containerTop = offsetPoint.top || 0;

        this._sceneRender.render();
    },

    _fireMouseEvent: function(e){
        var type = e.type;

        type = (type === 'mouseenter' ? 'mouseover' : (type === 'mouseleave' ? 'mouseout' : type));

        //if (!this.hasEventListeners(type)) { return; }

        if (type === 'contextmenu') {
            Z.DomEvent.preventDefault(e);
        }

        if(this._dragger && this._dragger.isDraging() && type !== "mousemove"){
            return;
        }

        if(type === 'resize'){
            this.fire(type);
        }else{
            var containerPoint = Z.DomEvent.getMousePosition(e, this._container);

            if(!containerPoint){
                this.fire(type);
            }else{
                this._fireEventFromContainerPoint(e, type, containerPoint);
            }
        }
    },

    _fireEventFromContainerPoint: function(e, type, containerPoint){
        //if(type === "mouseout"){return;}
        var scenePoint = this._sceneRender.screenPointToWebGL(containerPoint),
            latlng = this.screenPointToLatLng(containerPoint),
            intersectObjs = this._sceneRender.getIntersectObjects(containerPoint),
            objects = [];
        //console.info("intersectObjs.length=" + intersectObjs.length);
        for(var i = 0; i < intersectObjs.length; i++){
            objects.push(intersectObjs[i].graphic);
        }
        //console.info(type + "| latlng:" + latlng.lat + "," + latlng.lng + "| scenePoint:" + scenePoint.x + "," + scenePoint.y + "," + scenePoint.z + "| containerPoint:" + containerPoint.x + "," + containerPoint.y);
        //console.info(type + "(" + intersectObjs.length + ") | containerPoint:" + containerPoint.x + "," + containerPoint.y + " | objects.length=" + objects.length);
        this.fire(type, {
            latlng: latlng,
            scenePoint: scenePoint,
            containerPoint: containerPoint,
            originalEvent: e,
            //objects: intersectObjs.length > 0 ? [intersectObjs[0]] : []
            objects: objects,
            intersections: intersectObjs
        });
    },

    _enableDrag: function(){
        this._dragger = this._dragger || new Z.Scene3D.Drag(this);
        this._dragger.enable();

        this._dragger.on("click", this._checkClick, this);
    },

    //_disableDrag: function(){
    //    if(this._dragger){
    //        this._dragger.disable();
    //    }
    //},

    _checkClick: function(e){
        var containerPoint = e.containerPoint,
            originalEvent = e.originalEvent;
        this._fireEventFromContainerPoint(originalEvent, "click", containerPoint);
    },

    _enableTouchZoom: function(){
        //Z.DomEvent.on(this._container, 'touchstart', this._onTouchStart, this);
        if(!this._touchZoom){
            this._touchZoom = new Z.Scene3D.TouchZoom(this, this._container);
        }

        this._touchZoom.enable();
    },

    //_disableTouchZoom: function(){
    //    //Z.DomEvent.on(this._container, 'touchstart', this._onTouchStart, this);
    //    if(this._touchZoom){
    //        this._touchZoom.disable();
    //    }
    //},

    _enableRightRotate: function(){
        if(!this._rightRotate){
            this._rightRotate = new Z.Scene3D.RightRotate(this);
        }

        this._rightRotate.enable();
    },

    _offsetPixel: function(pixelOffset, fromPoint){
        fromPoint = fromPoint || new Z.Point(this._container.clientWidth / 2, this._container.clientHeight / 2);
        var targetPoint = fromPoint.add(pixelOffset),
            fromLatLng = this.screenPointToLatLng(fromPoint),
            targetLatLng = this.screenPointToLatLng(targetPoint);

        if(fromLatLng && targetLatLng){
            var latLngOffset = targetLatLng.subtract(fromLatLng);
            this._offsetLatLng(latLngOffset);
        }

        //var contentBounds = this.getContentBounds(),
        //    widthRatio = pixelOffset.x / this._container.clientWidth,
        //    heightRatio = pixelOffset.y / this._container.clientHeight,
        //    latLngOffsetX = (contentBounds.getEast() - contentBounds.getWest()) * widthRatio,
        //    latLngOffsetY = -(contentBounds.getNorth() - contentBounds.getSouth()) * heightRatio;
        //
        //this._offsetLatLng(new Z.LatLng(latLngOffsetY, latLngOffsetX));
    },

    _offsetLatLng: function(latLngOffset){
        //fromLatLng = fromLatLng || this._latLngCenter;
        var newLatLngCenter = this._latLngCenter.add(latLngOffset);
        this._centerAt(newLatLngCenter);
        //var newLatLngCenter = fromLatLng.add(latLngOffset),
        //    newLatLngBounds = this._latLngBounds.translate(latLngOffset.lat, latLngOffset.lng, latLngOffset.alt);
        //
        //this._updateSceneStatus(newLatLngCenter, newLatLngBounds);
    },

    _centerAt: function(centerLatLng){
        var //newLatLngCenter = this._latLngCenter,
            latLngOffset = centerLatLng.subtract(this._latLngCenter),
            newLatLngBounds = this._latLngBounds.translate(latLngOffset.lat, latLngOffset.lng, latLngOffset.alt);

        this._updateSceneStatus(centerLatLng, newLatLngBounds);
        this._sceneRender.needsUpdate = true;
    },

    /***经纬度坐标转换为webgl坐标***/
    _latLngToGLPoint: function(latLng){
        var renderContentBounds = this._viewableGLBounds,
            latLngBounds = this._viewableProjBounds,
            projLatLng = this._projModel ? this._projModel.forwardTransform(latLng) : latLng;
        var x = renderContentBounds.getBottomLeft().x + renderContentBounds.getWidth() * (projLatLng.lng - latLngBounds.getWest())/(latLngBounds.getEast() - latLngBounds.getWest());
        var y = renderContentBounds.getTopRight().y - renderContentBounds.getHeight() * (latLngBounds.getNorth() - projLatLng.lat)/(latLngBounds.getNorth() - latLngBounds.getSouth());

        //var z = renderContentBounds.getTopRight().z - renderContentBounds.getThickness() * (latLngBounds.getTop() - latLng.alt)/(latLngBounds.getTop() - latLngBounds.getBottom());
        var z = this._meterDistanceToScene((latLng.alt || 0) - (latLngBounds.getCenter().alt || 0));

        return new Z.Point(x, y, z);
    },

    /***webgl坐标转换为经纬度坐标***/
    _glPointToLatLng: function(glPoint){
        var renderContentBounds = this._viewableGLBounds;
        var latLngBounds = this._viewableProjBounds;
        var lng = latLngBounds.getWest() +(latLngBounds.getEast() - latLngBounds.getWest()) * (glPoint.x - renderContentBounds.getBottomLeft().x)/renderContentBounds.getWidth();
        var lat = latLngBounds.getSouth() +(latLngBounds.getNorth() - latLngBounds.getSouth()) * (glPoint.y - renderContentBounds.getBottomLeft().y)/renderContentBounds.getHeight();
        //var alt = latLngBounds.getBottom() +(latLngBounds.getTop() - latLngBounds.getBottom()) * (glPoint.z - renderContentBounds.getBottomLeft().z)/renderContentBounds.getThickness();
        var alt = this._sceneDistanceToMeter(glPoint.z) + (latLngBounds.getCenter().alt || 0);

        var latLng = new Z.LatLng(lat, lng, alt);

        return this._projModel ? this._projModel.reverseTransform(latLng) : latLng;
    },

    _updateSceneStatus: function(newLatLngCenter, newLatLngBounds){
        //newLatLngCenter = newLatLngCenter || this._latLngCenter;
        //newLatLngBounds = newLatLngBounds || this._latLngBounds;

        if(newLatLngCenter !== this._latLngCenter && newLatLngCenter instanceof Z.LatLng){
            this._latLngCenter = newLatLngCenter;
            this._projCenter = this._projModel ? this._projModel.forwardTransform(this._latLngCenter) : this._latLngCenter;
        }

        if(newLatLngBounds !== this._latLngBounds && newLatLngBounds instanceof Z.LatLngBounds){
            this._latLngBounds = newLatLngBounds;
            this._projBounds = this._latLngBounds2ProjBounds(this._latLngBounds, this._projModel);
        }

        this._viewableLatLngBounds = this._getContentBounds();
        //this._viewableProjBounds = this._latLngBounds2ProjBounds(this._viewableLatLngBounds, this._projModel);
        this._orthoGLBounds = this._sceneRender.getOrthoGLBounds();
        this._viewableGLBounds = this._sceneRender.getVisibleGLBounds();

        //if(this._projModel){
        //    var viewableNorthEast = this._viewableLatLngBounds.getNorthEast(),
        //    viewableSouthWest = this._viewableLatLngBounds.getSouthWest();
        //
        //    var projNorthEast = this._projModel.forwardTransform(viewableNorthEast),
        //        projSouthWest = this._projModel.forwardTransform(viewableSouthWest);
        //
        //    this._viewableProjBounds = new Z.LatLngBounds(projNorthEast, projSouthWest);
        //}else{
        //    this._viewableProjBounds = this._viewableLatLngBounds;
        //}
        this._viewableProjBounds = this._latLngBounds2ProjBounds(this._viewableLatLngBounds, this._projModel);
    },

    _latLngBounds2ProjBounds: function(latLngBounds, projModel){
        var projBounds = latLngBounds;

        if(projModel){
            var viewableNorthEast = latLngBounds.getNorthEast(),
                viewableSouthWest = latLngBounds.getSouthWest();

            var projNorthEast = projModel.forwardTransform(viewableNorthEast),
                projSouthWest = projModel.forwardTransform(viewableSouthWest);

            projBounds = new Z.LatLngBounds(projNorthEast, projSouthWest);
        }

        return projBounds;
    },

    _projBounds2LatLngBounds: function(projBounds, projModel){
        var latLngBounds = projBounds;

        if(projModel){
            var viewableNorthEast = projBounds.getNorthEast(),
                viewableSouthWest = projBounds.getSouthWest();

            var latLngNorthEast = projModel.reverseTransform(viewableNorthEast),
                latLngSouthWest = projModel.reverseTransform(viewableSouthWest);

            latLngBounds = new Z.LatLngBounds(latLngNorthEast, latLngSouthWest);
        }

        return latLngBounds;
    },

    _getContentBounds: function(){
        var renderOrthoBounds = this._sceneRender.getOrthoGLBounds();
        var renderContentBounds = this._sceneRender.getVisibleGLBounds();
        var tolerance = 0.0000001;
        var west, east, north, south;

        if(Math.abs(renderOrthoBounds.getWidth()) > tolerance){
            var widthRatio = (this._projBounds.getEast() - this._projBounds.getWest()) / renderOrthoBounds.getWidth();
            var projWidth = renderContentBounds.getWidth() * widthRatio;
            west = this._projCenter.lng - projWidth * (renderOrthoBounds.getCenter().x - renderContentBounds.getBottomLeft().x) / renderContentBounds.getWidth();
            east = west + projWidth;
        }else{
            west = this._projCenter.lng;
            east = this._projCenter.lat;
        }

        if(Math.abs(renderOrthoBounds.getHeight()) > tolerance) {
            var heightRatio = (this._projBounds.getNorth() - this._projBounds.getSouth()) / renderOrthoBounds.getHeight();
            var projHeight = renderContentBounds.getHeight() * heightRatio;
            north = this._projCenter.lat + projHeight * (renderContentBounds.getTopRight().y - renderOrthoBounds.getCenter().y) / renderContentBounds.getHeight();
            south = north - projHeight;
        }else{
            north = this._projCenter.lat;
            south = this._projCenter.lng;
        }

        var bottom = Z.Util.isNumber(this._projBounds.getBottom()) ? this._projBounds.getBottom() : this._projCenter.alt;
        var top = Z.Util.isNumber(this._projBounds.getTop()) ? this._projBounds.getTop() : this._projCenter.alt;

        var latLngSouthWest = new Z.LatLng(south, west, bottom),
            latLngNorthEast = new Z.LatLng(north, east, top);

        if(this._projModel){
            latLngSouthWest = this._projModel.reverseTransform(latLngSouthWest);
            latLngNorthEast = this._projModel.reverseTransform(latLngNorthEast);
        }

        return new Z.LatLngBounds.create(latLngSouthWest, latLngNorthEast);
    },

    _meterDistanceToScene: function(distance){
        if(typeof distance === "number" && !Z.Util.isZero(distance) && !isNaN(distance)){
            var projModel = this.options.projModel,
                latLng1 = projModel.unproject(new Z.Point(0, 0)),
                latLng2 = projModel.unproject(new Z.Point(0, distance)),
                latLngSceneRatio = this.getLatLngSceneRatio().y;

            return (latLng2.lat - latLng1.lat) / latLngSceneRatio;
        }else{
            return 0;
        }
    },

    _sceneDistanceToMeter: function(distance){
        if(typeof distance === "number" && !Z.Util.isZero(distance) && !isNaN(distance)){
            var projModel = this.options.projModel,
                latLngSceneRatio = this.getLatLngSceneRatio().y;
            var latLngDistance = distance * latLngSceneRatio;

            return projModel.project(new Z.LatLng(latLngDistance, 0)).y;
        }else{
            return 0;
        }
    },

    _applyLayerEvents: function(layer, onOff){
        if(!layer){
            return;
        }

        onOff = onOff || "on";
        var events = ["select", "mouseover"];

        for(var key in events){
            //layer[onOff](key, this._onLayerGraphicEvent, this);
        }
    },

    _onLayerGraphicEvent: function(e){
        var newGraphics = e.objects,
            currentGraphics = this._currentGraphics[e.type];

        for(var i = 0; i < currentGraphics.length; i++){
            var curGraphic = currentGraphics[i],
                exist = false;

            for(var j = 0; j < newGraphics.length; j++){
                if(newGraphics[j] === curGraphic){
                    exist = true;
                    break;
                }
            }

            if(!exist){
                if(e.type == "select"){
                    curGraphic.doUnselect();
                }else if(e.type == "mouseover"){
                    curGraphic.doMouseOut();
                }

            }
        }

        this._currentGraphics[e.type] = newGraphics;
    }

    //_changeStatusVersion: function(){
    //    this._statusVersion++;
    //}
});