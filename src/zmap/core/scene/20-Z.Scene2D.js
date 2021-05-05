/**
 * Created by Administrator on 2015/10/29.
 */
Z.Scene2D = Z.IScene.extend({
    initialize: function(container, options){
        //this._leafletMap = this._getLeafletMap(container, options);
        this.options = options;
        this._containerLeft = container ? container.offsetLeft : 0;
        this._containerTop = container ? container.offsetTop : 0;
        this._viewFrame = new Z.SceneViewFrame(container);
        this._contentFrame = new Z.MapContentFrame();
        this._leafletMap = this._getLeafletMap(this._viewFrame.mapPane.root, options);
        this._currentLevel = this._leafletMap.getZoom();
        this._applyEvents('on');
    },

    getBounds: function(){
        var leafletBounds = this._leafletMap.getBounds();
        return Z.LeafletUtil.latLngBoundsFromLeaflet(leafletBounds);
    },

    getPixelSceneRatio: function(){
        return new Z.Point.create(1, 1);
    },

    getLatLngSceneRatio: function(){
        var orthoLatLngBounds = this.getBounds(),
            size = this.getSize(),
            widthRatio = (orthoLatLngBounds.getEast() - orthoLatLngBounds.getWest()) / size.x,
            heightRatio = (orthoLatLngBounds.getNorth() - orthoLatLngBounds.getSouth()) / size.y;

        return new Z.Point.create(widthRatio, heightRatio);
    },

    setZoom: function(zoomLevel){
        this._leafletMap.setZoom(zoomLevel);
    },

    getZoom: function(){
        return this._leafletMap.getZoom();
    },

    getScale: function(zoom){
        throw new error("尚未实现");
    },

    getSize: function(){
        var leafletSize = this._leafletMap.getSize();

        return new Z.Point(leafletSize.x, leafletSize.y);
    },

    getTopLeftPos: function(){
        return new Z.Point(this._containerLeft, this._containerTop);
    },

    panTo: function(center, zoomLevel){
        var leafLetCenter = Z.LeafletUtil.latLngToLeaflet(center);
        this._leafletMap.panTo(leafLetCenter, zoomLevel);
    },

    panByPixel: function(x, y){   //Z.Point
        var offsetX = (x === undefined ? 0 : x),
            offsetY = (y === undefined ? 0 : y);

        if(offsetX === 0 && offsetY === 0){
            return;
        }

        this._offsetPixel(Z.Point.create(offsetX, offsetY));
        //var panDistance = L.point(x, y);
        //this._leafletMap.panBy(panDistance);

        //this.fire("viewreset");
    },

    panByLatLng: function(lat, lng){   //
        var offsetX = (lng === undefined ? 0 : lng),
            offsetY = (lat === undefined ? 0 : lat);

        if(offsetX === 0 && offsetY === 0){
            return;
        }

        this._offsetLatLng(new Z.LatLng(offsetY, offsetX));
    },

    _offsetPixel: function(pixelOffset){
        var panDistance = L.point(pixelOffset.x, pixelOffset.y);
        this._leafletMap.panBy(panDistance);
    },

    _offsetLatLng: function(latLngOffset){
        var mapBounds = this.getBounds(),
            mapWidth = mapBounds.getEast()  -  mapBounds.getWest(),
            mapHeight = mapBounds.getNorth()  -  mapBounds.getSouth(),
            containerSize = this._leafletMap.getSize();
        var x = containerSize.x * latLngOffset.lng/mapWidth;
        var y = -containerSize.y * latLngOffset.lat/mapHeight;

        this._offsetPixel(Z.Point.create(x, y));
    },

    getContentBounds: function(){
        return this.getBounds();
    },

    latLngToScreenPoint: function(latLng){
        var mapBounds = this.getBounds(),
            mapWidth = mapBounds.getEast()  -  mapBounds.getWest(),
            mapHeight = mapBounds.getNorth()  -  mapBounds.getSouth(),
            containerSize = this._leafletMap.getSize();
        var x = containerSize.x * (latLng.lng - mapBounds.getWest())/mapWidth;
        var y = containerSize.y * (mapHeight - latLng.lat + mapBounds.getSouth())/mapHeight;

        return Z.Point.create(x, y);
    },

    screenPointToLatLng: function(point){
        var mapBounds = this.getBounds(),
            mapWidth = mapBounds.getEast()  -  mapBounds.getWest(),
            mapHeight = mapBounds.getNorth()  -  mapBounds.getSouth(),
            containerSize = this._leafletMap.getSize();
        var x = mapBounds.getWest() + mapWidth * point.x/containerSize.x;
        var y = mapBounds.getSouth() + mapHeight * (containerSize.y - point.y)/containerSize.y;

        return Z.LatLng.create(y, x);
    },

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

        layer.onAdd(this, index, containerPane);

        this.fire('layeradd', { layer: layer });
    },

    removeLayer: function(layer){
        if(!(layer instanceof Z.ILayer)){
            return;
        }

        layer.onRemove(this);

        this.fire('layerremove', { layer: layer });
    },

    openPopup: function(content, latLng, options){
        var popup = Z.SinglePopup.getInstance(this, options);
        popup.setContent(content);

        if(latLng){
            popup.setLatLng(latLng);
        }

        popup.open();
    },

    closePopup: function(){
        var popup = Z.SinglePopup.getInstance(this, options);
        popup.close();
    },

    addControl: function(control){
        control.onAdd(this);
    },

    removeControl: function(control){
        control.onRemove(this);
    },

    refresh: function(){
        //对dom的更改自动生效，无需手工刷新
    },

    resize: function(){

    },

    setSunLight: function(color){
        console.info("二维地图不支持设置太阳光照");
    },

    setAmbientLight: function(color){
        console.info("二维地图不支持设置环境光");
    },

    rotateByEuler: function(rotate){
        console.info("二维地图不支持旋转");
    },

    resetRotate: function(){
        console.info("二维地图不支持旋转");
    },

    getRotateByRad: function(){
        console.info("二维地图不支持旋转");
    },

    _getLeafletMap: function(container, sceneOptions){
        var leafletOptions = this._getLeafletOptions(sceneOptions);
        leafletOptions.crs = this._getLeafletCRS(sceneOptions.crs, sceneOptions);
        var zoomCtrlType = null;

        if (sceneOptions.sceneConfig.zoomSlider) {
            zoomCtrlType = sceneOptions.sceneConfig.zoomSlider.toLowerCase();

            if (zoomCtrlType === "small") {
                leafletOptions.zoomControl = true;
            } else {
                leafletOptions.zoomControl = false;
            }
        }

        var map = L.map(container, leafletOptions);

        if (zoomCtrlType == "slider") {
            map.addControl(new L.Control.Zoomslider()) ;
        }

        return map;
    },

    _getLeafletOptions: function(sceneOptions){
        return {
            center: sceneOptions.center ? L.latLng(sceneOptions.center.lat, sceneOptions.center.lng) : L.latLng(118, 32),
            zoom:sceneOptions.initZoom ? sceneOptions.initZoom : undefined,
            layers:undefined,
            minZoom:sceneOptions.minZoom ? sceneOptions.minZoom : undefined,
            maxZoom:sceneOptions.maxZoom ? sceneOptions.maxZoom : maxZoom,
            maxBounds:sceneOptions.maxBounds ?
                L.latLngBounds(
                    L.latLng(sceneOptions.maxBounds.miny, sceneOptions.maxBounds.minx),
                    L.latLng(sceneOptions.maxBounds.maxy, sceneOptions.maxBounds.maxx)) : undefined,
            crs:undefined
        };
    },

    _getLeafletCRS: function(crs, sceneOptions){
        crs = crs ? (crs.code ? crs.code.toLowerCase() : (crs + "").toLowerCase()) : "epsg3857";

        if (crs === "epsg3857") {
            crs = L.CRS.EPSG3857;
        }else if(crs === "epsg4326"){
            crs = L.CRS.EPSG4326;
        }else if(crs === "simple"){
            crs = L.CRS.Simple;
        } else if (crs === "perspective") {
            crs = L.CRS.Perspective.clone();

            if (sceneOptions.levelDefine) {
                crs.origin = new L.LatLng(90, -180);
                crs.levelDefine = sceneOptions.levelDefine;
            }
        } else {
            crs = L.CRS.CustomLevel.clone();

            if (sceneOptions.levelDefine) {
                crs.origin = new L.LatLng(90, -180);
                crs.levelDefine = sceneOptions.levelDefine;
            }
        }

        return crs;
    },

    _applyEvents: function(onOff){
        if (!Z.DomEvent) { return; }

        onOff = onOff || 'on';

        this._applyMouseEvents(onOff);
        this._applyResizeEvents(onOff);
        this._applyMapControlEvents(onOff);

        //if (this.options.trackResize) {
        //Z.DomEvent[onOff](window, 'resize', this._onResize, this);
        //}
        Z.DomEvent[onOff](window, 'scroll', this._onScroll, this);
    },

    _applyMouseEvents: function(onOff){
        this._leafletMap[onOff]('click', this._onMouseClick, this);

        var domEvents = ['dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'mousemove', 'contextmenu'],
            i, len;

        for (i = 0, len = domEvents.length; i < len; i++) {
            this._leafletMap[onOff](domEvents[i], this._fireMouseEvent, this);
        }

        //if (this.options.trackResize) {
        //Z.DomEvent[onOff](window, 'resize', this._onResize, this);
        //}
    },

    _onMouseClick: function(e){
        this.fire('preclick');
        this._fireMouseEvent(e);
    },

    _fireMouseEvent: function(e){
        var type = e.type;

        if (type === 'contextmenu') {
            Z.DomEvent.preventDefault(e);
        }

        this.fire(type, {
            latlng: Z.LeafletUtil.latLngFromLeaflet(e.latlng),
            scenePoint: Z.LeafletUtil.pointFromLeaflet(e.layerPoint),
            containerPoint: Z.LeafletUtil.pointFromLeaflet(e.containerPoint),
            originalEvent: e.originalEvent,
            objects: []
        });
    },

    _applyResizeEvents: function(onOff){
        this._leafletMap[onOff]('resize', this._fireResizeEvent, this);
    },

    _fireResizeEvent: function(e){
        this.fire(e.type, {
            oldSize: Z.LeafletUtil.pointFromLeaflet(e.oldSize),
            newSize: Z.LeafletUtil.pointFromLeaflet(e.newSize)
        });
    },

    _applyMapControlEvents: function(onOff){
        this._leafletMap[onOff]('zoomlevelschange', this._fireZoomLevelsChangeEvent, this);

        var events = ['movestart', 'move', 'moveend', 'dragstart', 'drag', 'dragend', 'viewreset'],
            i, len;

        for (i = 0, len = events.length; i < len; i++) {
            this._leafletMap[onOff](events[i], this._fireMapControlEvent, this);
        }
    },

    _fireZoomLevelsChangeEvent: function(e){
        this.fire(e.type, {oldLevel: this._currentLevel, newLevel: this._leafletMap.getZoom()});
        this._currentLevel = this._leafletMap.getZoom();
    },

    _fireMapControlEvent: function(e){
        if(e.type === 'dragend'){
            this.fire(e.type, {distance: e.distance});
        }else{
            this.fire(e.type);
        }

        if(e.type === 'move'){
            this.fire("viewreset");
        }

        if(e.type === 'moveend'){
            if(this._currentLevel === this._leafletMap.getZoom()){
                this.fire("viewreset");
            }
        }
    },

    _onScroll: function(e){
        var container = this._viewFrame.rootPane.root;

        this._containerLeft = container.offsetLeft;
        this._containerTop = container.offsetTop;
    },
});