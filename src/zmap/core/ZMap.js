/**
 * Created by Administrator on 2015/10/24.
 */
var ZMap = Z.Class.extend({
    includes: Z.EventManager,
    //options:DefaultZMapConfig,

    /*构造函数*/
    initialize: function(containerId, options){
        this.options = {};
        this._container = null;                    //地图容器
        this._containerWidth = 0;
        this._containerHeight = 0;
        this._screenTopLeftCorner = null;               //地图容器的左上角相对于整个页面的坐标（单位为像素）
        this._pageOffset = null;                         //页面向下和向右滚动的距离
        this._defaultGraphicLayer = null;               //默认graphic图层
        this._layers = [];               //应用图层
        this._popup = null;
        this._scene = null;               //地图场景
        this._currentSceneType = null;               //当前的地图场景类型
        this._status = {                 //地图的即时状态
            latLngBounds:{},
            center:{},
            zoomLevel: 1
        };
        this._pyramidModel = null;

        this._initContainer(containerId);
        this._applyOptions(options);
        this._initPyramidModel(this.options);
        this._initMapStatus();
        this._initScene();
        //this._initEvents();
        this._initMapEvent();

        this.fire("load");
    },

    addLayer: function(layer, index, layerGroup){
        if(!this._scene || !(layer instanceof Z.ILayer)){
            return;
        }

        if(index < 0 || index >= 1000){
            console.error("index的值必须在0到999之间");          //将index强制限制在0到999之间。每个图层组里最多允许999个图层
            return;
        }

        if(this.hasLayer(layer)){
            return;
        }

        //var layerArray = this._layers[layerGroup + ""],
        //    layerLength = this._layers.length;
        //var layerIndex = (index === undefined) ? (layerLength > 0 ? this._layers[layerLength - 1].index + 1 : 0) : index;
        ////index = Math.max(0, Math.min(this._layers.length, index));
        //var layerId = Z.Util.stamp(layer);

        var layerIndex = this._scene.addLayer(layer, index, layerGroup);

        this._layers.push({layer: layer, index:layerIndex});
        //if(layerLength <= 0){
        //    this._layers.push({layer: layer, index:layerIndex});
        //}else{
        //    for(var i = 0; i < layerLength; i++){
        //        if(layerIndex < this._layers[i].index){
        //            this._layers.splice(i, 0, {layer: layer, index:layerIndex});
        //            break;
        //        }
        //    }
        //
        //    if(i >= layerLength){
        //        this._layers.push({layer: layer, index:layerIndex});
        //    }
        //}

        this.fire("layeradd", {layer: layer});
    },

    removeLayer: function(layer){
        this._scene.removeLayer(layer);

        for(var i = this._layers.length - 1; i >=0; i--){
            if(layer === this._layers[i].layer){
                this._layers.splice(i, 1);
            }
        }

        this.fire("layerremove", {layer: layer});
    },

    getLayers: function(){
        return Z.Util.ArrayClone(this._layers);
    },

    /*layer参数可以是图层对象，也可以是图层id*/
    getLayer: function(layer){
        var layerId = "";

        if((typeof layer) === "string"){
            layerId = layer;
        }else if(layer instanceof  Z.ILayer){
            layerId = Z.Util.stamp(layer);
        }else{
            return;
        }

        var targetLayer = null,
            currentLayerId = "";

        for(var i = this._layers.length - 1; i >=0; i--){
            currentLayerId = Z.Util.stamp(this._layers[i].layer);

            if(layerId === currentLayerId){
                targetLayer = this._layers[i];
                break;
            }
        }

        return targetLayer;
    },

    hasLayer: function(layer){
        return !(this.getLayer(layer)) ? false : true;
    },

    panTo: function(latLng, level){
        if(!this._scene){
            return;
        }

        latLng = Z.LatLng.create(latLng);
        level = (typeof  level === 'number') ? Math.floor(level) : level;

        if(!latLng){
            return;
        }

        this._scene.panTo(latLng, level);

        this._updateMapStatus(null, latLng, level);
    },

    panBy: function(x, y){   //Z.Point
        var dis = Z.Point.create(x, y);
        var offsetX = ((dis.x === undefined || dis.x === NaN)  ? 0 : dis.x),
            offsetY = ((dis.y === undefined || dis.x === NaN) ? 0 : dis.y);

        if(offsetX === 0 && offsetY === 0){
            return;
        }

        if(this._scene){
            this._scene.panByPixel(offsetX, offsetY);
        }
    },

    getZoom: function(){
        return this._status.zoomLevel;
    },

    setZoom: function(zoomLevel){
        if(typeof zoomLevel !== "number"){
            return;
        }

        zoomLevel = this._limitZoom(zoomLevel);

        if(zoomLevel === this._status.zoomLevel){
            return;
        }

        this._scene.setZoom(zoomLevel);
        this._updateMapStatus(null, null, zoomLevel);
    },

    zoomIn: function(){
        if(this._status.zoomLevel < this.options.maxZoom){
            var newZoom = this._status.zoomLevel + 1;
            this.setZoom(newZoom);
        }
    },

    zoomOut: function(){
        if(this._status.zoomLevel > this.options.minZoom) {
            var newZoom =this._status.zoomLevel - 1;
            this.setZoom(newZoom);
        }
    },

    setView: function(bounds){
        if(!(bounds instanceof Z.LatLngBounds)) {
            return;
        }

        var level = this._getFitableZoomLevel(bounds);
        var center = bounds.getCenter();
        this._scene.panTo(center, level);
        //var fillScale = this._scene.getGeometryFillScale(bounds);
        //var newLevel = this._pyramidModel.scalingLevel(level, fillScale);
        var newBounds = this._getFitableBounds(center, level);
        this._updateMapStatus(newBounds, center, level);
    },

    fitBounds: function(bounds){
        this.setView(bounds);
    },

    fitFeature: function(feature){
        alert("fitFeature方法尚未实现");
    },

    fitFeatures: function(features){
        alert("fitFeatures方法尚未实现");
    },

    fullMap: function(){
        //this.panTo(this.options.center, this.options.levelDefine[this.options.initZoom].level);
        this.panTo(this.options.center, this.options.initZoom);
    },

    openPopup: function(popup, latlng, options){
        this._scene.openPopup(popup, latlng, options);
    },

    closePopup: function(popup){
        this._scene.closePopup();
    },

    /*切换地图场景*/
    switchScene: function(sceneType){
        if(sceneType === this._currentSceneType){
            return;
        }

        alert("switchScene方法尚未实现");
    },

    //fullMap: function(){
    //    alert("fullMap方法尚未实现");
    //},

    getBounds: function(){
        return this._status.latLngBounds.clone();
    },

    getCenter: function(){
        return this._status.center;
    },

    getZoom: function(){
        return this._status.zoomLevel;
    },

    getScale: function(){
        alert("getScale方法尚未实现");
    },

    getSize: function(){
        return Z.Point.create(this._containerWidth, this._containerHeight);
    },

    /*地图内容实际显示的空间范围。在二维地图中，与地图容器一致，在三维地图中，在非垂直俯视的情况下，由于视角的原因，范围大于地图容器大小。*/
    getContentBounds: function(){
        return this._scene.getContentBounds();
    },

    on: function(event, func, context){
        this._scene.on(event, func, context);
    },

    off: function(event, func, context){
        this._scene.off(event, func, context);
    },

    screenPointToLatLng: function(point){
        if(!(point instanceof Z.Point)) {
            if(point && (typeof point.x === "number") && (typeof point.y === "number")){
                point = new Z.Point(point.x, point.y);
            }else{
                return null;
            }
        }

        this.reposition();
        var sceneScreenPoint = point.add(this._pageOffset).subtract(this._screenTopLeftCorner);

        return this._scene.screenPointToLatLng(sceneScreenPoint);
    },

    latLngToScreenPoint: function(latLng){
        latLng = Z.LatLng.create(latLng);

        if(!(latLng instanceof Z.LatLng)) {
            return null;
        }

        var layerPoint = this._scene.latLngToScreenPoint(latLng);
        this.reposition();

        return this._screenTopLeftCorner.add(layerPoint).subtract(this._pageOffset);
    },

    containerPointToLatLng: function(point){
        if(!(point instanceof Z.Point)) {
            if(point && (typeof point.x === "number") && (typeof point.y === "number")){
                point = new Z.Point(point.x, point.y);
            }else{
                return null;
            }
        }

        return this._scene.screenPointToLatLng(sceneScreenPoint);
    },

    latLngToContainerPoint: function(latLng){
        latLng = Z.LatLng.create(latLng);

        if(!(latLng instanceof Z.LatLng)) {
            return null;
        }

        return this._scene.latLngToScreenPoint(latLng);
    },

    resize: function(){
        if(this._container){
            var containerWidth = this._container.offsetWidth || this._container.clientWidth;
            var containerHeight = this._container.offsetHeight || this._container.clientHeight;
            var tolerance = 0.0000001;

            if(containerWidth < tolerance || containerHeight < tolerance){
                return;
            }

            this._containerWidth = containerWidth;
            this._containerHeight = containerHeight;
        }

        if(this._scene){
            this._scene.resize();
        }
    },

    reposition: function(){
        if(this._container) {
            var left = this._container.offsetLeft || this._container.clientLeft,
                top = this._container.offsetTop || this._container.clientTop,
                offsetX = window.pageXOffset || document.body.scrollLeft,
                offsetY = window.pageYOffset || document.body.scrollTop;

            if(!this._screenTopLeftCorner){
                this._screenTopLeftCorner = new Z.Point(left, top);
                this._pageOffset = new Z.Point(offsetX, offsetY);
            }else{
                this._screenTopLeftCorner.x = left;
                this._screenTopLeftCorner.y = top;
                this._pageOffset.x = offsetX;
                this._pageOffset.y = offsetY;
            }

        }
    },

    refresh: function(){
        if(this._scene){
            this._scene.refresh();
        }
    },

    setSunLight: function(sunHeight){
        if(this._scene){
            this._scene.setSunLight(sunHeight);
        }
    },

    setAmbientLight: function(color){
        if(this._scene){
            this._scene.setAmbientLight(color);
        }
    },

    rotateByEuler: function(rotate){
        if(this._scene){
            this._scene.rotateByEuler(rotate);
        }
    },

    rotateByVH: function(v, h){
        if(this._scene){
            this._scene.rotateByVH(v, h);
        }
    },

    getRotateByEuler: function(){
        if(this._scene){
            return this._scene.getRotateByEuler();
        }
    },

    resetRotate: function(){
        if(this._scene){
            this._scene.resetRotate();
        }
    },

    _initContainer: function(containerId){
        var container = null;

        if(Z.DomUtil.isDom(containerId)){
            container = containerId;
        }else{
            container = Z.DomUtil.get(containerId);
        }

        if (!container) {
            throw new Error('地图创建失败，未找到指定的地图容器：'  +　'id＝' + containerId);
        } else if (container._zmap) {
            throw new Error('地图容器已经初始化，请检查是否在同一地图容器中构造了多个地图对象');
        }

        container._zmap = true;
        Z.DomUtil.addClass(container, "zmap-container");
        this._container = container;

        this.resize();
        this.reposition();
    },

    /*创建地图场景。对于mixed类型，初始显示为2d模式*/
    _initScene: function(){
        var sceneType = (this.options.sceneType || 'mixed').toLowerCase();

        if(this._supportWebGL() && (sceneType === '3d' || sceneType === 'mixed')){
            this._scene = (sceneType === '3d') ?
                (this._currentSceneType = '3d') :
                (this._currentSceneType = '2d');
        }else{
            this.options.sceneType = '2d';
            this._currentSceneType = '2d';
        }

        this.options.pyramidModel = this._pyramidModel;

        this._scene = (this._currentSceneType === '3d') ?
            new Z.Scene3D(this._container, this.options) :
            new Z.Scene2D(this._container, this.options);

        this._updateMapStatus();
    },

    //_initEvents: function(){
    //    if(this._scene){
    //        this._scene.on("viewreset", this._onSceneViewReset, this);
    //        this._scene.on("zoomlevelschange", this._onSceneZoomChange, this);
    //    }
    //},

    _initMapEvent: function(onOff){
        if (!Z.DomEvent || !this._scene) { return; }

        onOff = onOff || 'on';

        this._scene.on("viewreset", this._onSceneViewReset, this);
        this._scene.on("zoomlevelschange", this._onSceneZoomChange, this);

        var events = ['preclick', 'click', 'dblclick', 'mousedown', 'mouseup', 'mouseover',
                'mouseout', 'mousemove', 'contextmenu', 'resize', 'movestart', 'move', 'moveend',
                'dragstart', 'drag', 'dragend'],
            i, len;

        for (i = 0, len = events.length; i < len; i++) {
            this._scene[onOff](events[i], this._fireMapEvent, this);
        }
    },

    _fireMapEvent: function(e){
        this.fire(e.type, e);
    },

    _onSceneViewReset: function(){
        this._updateMapStatus();
        this.fire("viewreset");
    },

    _onSceneZoomChange: function(){
        this._updateMapStatus();
        this.fire("zoomlevelschange");
    },

    _applyOptions: function(options){
        options = options || {};//DefaultZMapConfig
        this.options = Z.Util.applyOptions(this.options, DefaultZMapConfig, true, ['sceneConfig']);
        this.options.sceneConfig = Z.Util.applyOptions(this.options.sceneConfig, DefaultZMapConfig.sceneConfig, true);
        this.options = Z.Util.applyOptions(this.options, options, false, ['sceneConfig']);
        this.options.sceneConfig = Z.Util.applyOptions(this.options.sceneConfig, options.sceneConfig, false);
        this.options.crs = this._getCRS(this.options.crs);
        //var crs = this._getCRS(this.options.crs),
        //    projection = this._getProjection(this.options.projection);
        //
        //this.options.projModel = new Z.ProjModel(crs, projection);

        this.options.center = new Z.LatLng(this.options.center.y, this.options.center.x);
        //var bounds = this._getFitableBounds(this.options.center,this.options.initZoom );
        //this.options.bounds = bounds;
        //this.options.maxBounds = Z.LatLngBounds.create([this.options.maxBounds.miny, this.options.maxBounds.minx],
        //    [this.options.maxBounds.maxy, this.options.maxBounds.maxx]);
        //this._updateMapStatus(bounds, this.options.center, this.options.initZoom);
    },

    _initMapStatus: function(){
        var bounds = this._getFitableBounds(this.options.center,this.options.initZoom );
        this.options.bounds = bounds;
        this.options.maxBounds = Z.LatLngBounds.create([this.options.maxBounds.miny, this.options.maxBounds.minx],
            [this.options.maxBounds.maxy, this.options.maxBounds.maxx]);
        this._updateMapStatus(bounds, this.options.center, this.options.initZoom);
    },

    _getCRS: function(crsString){
        crsString = crsString || "";
        crsString = crsString.toUpperCase();

        //if(crsString === "EPSG4326"){
        //    return Z.CRS.EPSG4326;
        //}else if(crsString === "EPSG4490"){
        //    return Z.CRS.EPSG4490;
        //}else if(crsString === "EPSG900913"){
        //    return Z.CRS.EPSG900913;
        //}else if(crsString === "EPSG3857"){
        //    return Z.CRS.EPSG3857;
        //}else if(crsString === "Simple"){
        //    return Z.CRS.Simple;
        //}else{
        //    //return Z.CRS.EPSG4326;
        //    return Z.CRS.EPSG4490;
        //}
        return Z.CRS[crsString] || Z.CRS.EPSG4326;
    },

    //_getProjection: function(projString){
    //    projString = projString || "";
    //
    //    return Z.Projection[projString] || Z.Projection.LatLng;
    //},

    _updateMapStatus: function(latLngBounds, center, level){
        this._status.latLngBounds = latLngBounds || this._scene.getBounds();
        this._status.center = center || this._scene.getBounds().getCenter();
        this._status.zoomLevel = level || this._scene.getZoom();
    },

    /*将地图级别限定在指定范围*/
    _limitZoom: function(zoomLevel){
        return Math.min(this.options.maxZoom, Math.max(this.options.minZoom, zoomLevel));
    },

    /*找到与指定地图范围最匹配的地图级别*/
    _getFitableZoomLevel: function(bounds){
        //var fitableZoomLevel = this._pyramidModel.fitZoomLevel(bounds, this._containerWidth, this._containerHeight);

        var fillScale = this._scene.getGeometryFillScale(bounds);
        var newLevel = this._pyramidModel.scalingLevel(this._status.zoomLevel, 1 / fillScale);

        //return fillScale < 1 ? Math.max(newLevel.level, fitableZoomLevel.level) : Math.min(newLevel.level, fitableZoomLevel.level);
        return newLevel.level;
    },

    /*找到指定地图级别的范围*/
    _getFitableBounds: function(center, level){
        //var resolution = this.options.levelDefine[level].resolution;
        //var spatialWidth = this._containerWidth * resolution;
        //var spatialHeight = this._containerHeight * resolution;
        //var minx = center.lng - spatialWidth / 2;
        //var maxx = center.lng + spatialWidth / 2;
        //var miny = center.lat - spatialHeight / 2;
        //var maxy = center.lat + spatialHeight / 2;
        //
        //return Z.LatLngBounds.create(Z.LatLng.create(miny, minx), Z.LatLng.create(maxy, maxx));

        return this._pyramidModel.getFitableBounds(center, level, this._containerWidth, this._containerHeight);
    },

    /*判断浏览器是否支持WebGL*/
    _supportWebGL: function(){
        var cvs = document.createElement('canvas');
        var contextNames = ['webgl','experimental-webgl','moz-webgl','webkit-3d'];
        var ctx;

        for(var i = 0; i < contextNames.length; i++){
            try{
                ctx = cvs.getContext(contextNames[i]);
                if(ctx){
                    break;
                }
            }catch(e){}
        }

        return ctx ? true : false;
    },

    _initPyramidModel: function(options){
        //var pyramidOptions = {
        //    //latLngBounds: this._latLngBounds.clone(),
        //    levelDefine: options.levelDefine,
        //    crs: this._getCRS(options.pyramidCRS) || options.crs
        //};
        //
        ////this._pyramidModel = new Z.PyramidModel(pyramidOptions);
        ////this._pyramidModel = new Z.CustomPyramidModel(pyramidOptions);
        //this._pyramidModel = Z.PyramidModelFactory.create(pyramidOptions);
        var pyramidOptions = {
            //latLngBounds: this._latLngBounds.clone(),
            pyramidId: options.pyramidId,
            pyramidDefine: options.pyramidDefine || {},
            projModel: options.projModel
        };

        //this._pyramidModel = new Z.PyramidModel(pyramidOptions);
        //this._pyramidModel = new Z.CustomPyramidModel(pyramidOptions);
        this._pyramidModel = Z.PyramidModelFactory.create(pyramidOptions);

        var fromCRS = options.crs,
            toCRS = this._pyramidModel.crs;
        this._pyramidModel.projModel = new Z.ProjModel(fromCRS, toCRS);

        this.options.projModel = this._pyramidModel.projModel;
    }
});
