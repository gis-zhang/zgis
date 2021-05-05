/**
 * Created by Administrator on 2015/10/31.
 */
Z.GraphicLayerRenderTerrain = Z.IGraphicLayerRender.extend({
    initialize: function(options){
        //this.options = options;
        this._graphicRoot = new Z.SceneThreePaneItem();
        this._rootLatLng = null;     //图层根对象（threejs的Geometry3D对象）的中心点对应的空间坐标
        this._containerPane = null;
        this._anchor = {
            latLng1: null,     //锚点，作为graphic场景坐标计算的基准，所有graphic的空间坐标转为场景坐标时，均相对于此锚点进行
            latLng2: null,        //不同于锚点的另一定位点，用于计算缩放系数
            scenePoint1: null,
            scenePoint2: null
        };

        this._zIndex;
        this._graphicLayer;
        this._scene;
        this._intersectedObjects = {};

        this._visibleGraphics = [];
        this._invisibleGraphics = [];

        this._renderId = Z.Util.stamp(this, "layerRender");
        this._graphicObjects = {};
    },

    onAdd: function(graphicLayer, scene, index, containerPane, groupPane){
        if(!(scene instanceof Z.Scene3D) || !containerPane){
            return;
        }

        this._graphicLayer = graphicLayer;
        var layerIndex = index;

        if(!(typeof layerIndex === "number")){
            layerIndex = containerPane.getMaxChildIndex() + 1;
        }

        this._scene = scene;

        //if(containerPane instanceof Z.SceneThreePaneItem){
        //    //this._graphicRoot.index = layerIndex;
        //    //containerPane.addChild(this._graphicRoot, layerIndex);
        //    this._containerPane = containerPane;
        //    this.setZIndex(layerIndex);
        //}

        this._initAnchor();
        this._addEvents();
        //this._reset();
        //this._update();
        //this.setBaseIndex(containerPane.index);
        //this._zIndex = layerIndex;
        //this._setTileZIndex(layerIndex);
        //this._scene.refresh();

        //return containerPane.index + layerIndex;
        //Z.SingleTerrainPlane.getInstance().enablePolygonOffset();
        Z.SingleTerrainPlane.getInstance().addSurfaceLayer(this._renderId, "graphic", null, layerIndex);
        this._refreshGraphics();
        return layerIndex;
    },

    onRemove: function(scene){
        //this._reset();
        this._removeEvents();

        if(this._containerPane){
            //this._containerPane.root.remove(this._tileRoot);
            this._containerPane.removeChild(this._graphicRoot);
            this._containerPane = null;
        }

        Z.SingleTerrainPlane.getInstance().removeSurfaceLayer(this._renderId);
        //this._scene.refresh();
        this._scene = undefined;
    },

    show: function(){
        //this._graphicRoot.show();
        Z.SingleTerrainPlane.getInstance().addSurfaceLayer(this._renderId, "graphic");
    },

    hide: function(){
        //this._graphicRoot.hide();
        Z.SingleTerrainPlane.getInstance().removeSurfaceLayer(this._renderId);
    },

    setOpacity: function(opacity){
        //if(typeof opacity !== "number"){
        //    return;
        //}
        //
        //opacity = Math.min(1, Math.max(opacity, 0));
        //
        //var childObjects = this._graphicRoot.root.children;
        //
        //for(var i = 0; i < childObjects.length; i++){
        //    if(childObjects[i].material){
        //        childObjects[i].material.opacity = opacity;
        //    }
        //}
    },

    setZIndex: function(zIndex){
        if(typeof zIndex !== "number"){
            return;
        }

        this._zIndex = zIndex;
        ////this._containerPane.setChildIndex(this._graphicRoot, this._containerPane.index + zIndex);
        //this._containerPane.setChildIndex(this._graphicRoot, zIndex);
        //
        ///****************************待完善******************************/
        //var childObjects = this._graphicRoot.root.children;
        //
        //for(var i = 0; i < childObjects.length; i++){
        //    childObjects[i].renderOrder = this._containerPane.index + zIndex;
        //}
        ///****************************************************************/
        Z.SingleTerrainPlane.getInstance().updateLayerIndex(
            this._renderId,
            zIndex
        );
    },

    getZIndex: function(){
        return this._zIndex;
    },

    refresh: function(options){
        throw new Error("refresh方法尚未实现");
    },

    addGraphic: function(graphicLayer, graphic){
        if(graphic instanceof Z.Graphic || graphic instanceof Z.MultiGraphic) {
            graphic.onAdd(graphicLayer, this._graphicRoot, this._scene);

            var graphicStamp = Z.Util.stamp(graphic, 'graphic');
            var type = graphic.feature.shape.type;

            this._graphicObjects[graphicStamp] = {
                object: graphic.feature.shape.clone(),
                symbol: graphic.symbol.clone(),
                type: type,
                graphic: graphic
            };

            this._updateRenderContent();
            this._applyGraphicUpdateEvent(graphic, "on");
            this._refreshGraphics();
        }
    },

    removeGraphic: function(graphicLayer, graphic){
        if(graphic instanceof Z.Graphic || graphic instanceof Z.MultiGraphic) {
            graphic.onRemove(graphicLayer, this._graphicRoot.root, this._scene);

            var graphicStamp = Z.Util.stamp(graphic, 'graphic');
            delete this._graphicObjects[graphicStamp];

            this._updateRenderContent();
            this._applyGraphicUpdateEvent(graphic, "off");
            this._refreshGraphics();
        }
    },

    addGraphics: function(graphicLayer, graphics){
        graphics = graphics || [];

        if(graphics.length <= 0){
            return;
        }

        for(var i = 0; i < graphics.length; i++){
            var graphic = graphics[i];

            if(graphic instanceof Z.Graphic || graphic instanceof Z.MultiGraphic) {
                graphic.onAdd(graphicLayer, this._graphicRoot, this._scene);

                var graphicStamp = Z.Util.stamp(graphic, 'graphic');
                var type = graphic.feature.shape.type;

                this._graphicObjects[graphicStamp] = {
                    object: graphic.feature.shape.clone(),
                    symbol: graphic.symbol.clone(),
                    type: type,
                    graphic: graphic
                };

                this._applyGraphicUpdateEvent(graphic, "on");
            }
        }

        this._updateRenderContent();
        this._refreshGraphics();
    },

    removeGraphics: function(graphicLayer, graphics){
        graphics = graphics || [];

        if(graphics.length <= 0){
            return;
        }

        for(var i = 0; i < graphics.length; i++) {
            var graphic = graphics[i];

            if(graphic instanceof Z.Graphic || graphic instanceof Z.MultiGraphic) {
                graphic.onRemove(graphicLayer, this._graphicRoot.root, this._scene);

                var graphicStamp = Z.Util.stamp(graphic, 'graphic');
                delete this._graphicObjects[graphicStamp];

                this._applyGraphicUpdateEvent(graphic, "off");
            }
        }

        this._updateRenderContent();
        this._refreshGraphics();
    },

    clear: function(){
        //this._containerPane.removeChild(this._graphicRoot);
        //this._graphicRoot.resetRoot();
        //this._containerPane.addChild(this._graphicRoot);
        this._graphicObjects = {};

        this._updateRenderContent();
        this._refreshGraphics();
    },

    //经纬度坐标转换为此图层的场景坐标（由于图层本身的平移等处理，图层的场景坐标不一定与地图场景坐标一致）
    latLngToLayerScenePoint: function(latLng){
        var sl = this._anchor.scenePoint1,
            s2 = this._anchor.scenePoint2,
            l1 = this._anchor.latLng1,
            l2 = this._anchor.latLng2,
            sceneLatLngRatio = (s2.x - sl.x) / (l2.lng - l1.lng),
            scenePointX = (latLng.lng - l1.lng) * sceneLatLngRatio,
            scenePointY = (latLng.lat - l1.lat) * sceneLatLngRatio,
            alt = Z.Util.isNull(latLng.alt) ? NaN :
                (Z.Util.isNull(l1.alt) ? latLng.alt : (latLng.alt - l1.alt)),
            scenePointZ = this._scene.getSceneDistance(alt);

        return new Z.Point(scenePointX, scenePointY, scenePointZ);
    },

    _addEvents: function(onOff){
        this._applyEvents("on");
    },

    _removeEvents: function(){
        this._applyEvents("off");
    },

    _applyEvents: function(onOff){
        var thisObj = this,
            onOff = onOff || 'on';
        this._scene[onOff]("viewreset", thisObj._onViewReset, thisObj);
        this._scene[onOff]("moveend", thisObj._onMoveEnd, thisObj);
        this._scene[onOff]("zoomlevelschange", thisObj._onZoomLevelsChange, thisObj);
        //this._scene[onOff]("dragstart", thisObj._onDragStart, thisObj);
        this._scene[onOff]("drag", this._onDrag, thisObj);
        //this._scene[onOff]("dragend", thisObj._onDragEnd, thisObj);

        var domEvents = ['dblclick', 'click', 'mousedown', 'mouseup', 'mouseover',
                'mouseout', 'mousemove', 'contextmenu'],
            i, len;

        for (i = 0, len = domEvents.length; i < len; i++) {
            this._scene[onOff](domEvents[i], thisObj._onMouseEvent, thisObj);
        }
    },

    //对于仅仅是浏览范围变化的情况，不再重新计算每个要素的场景坐标
    _onViewReset: function(){
        this._refreshGraphics();
    },

    _refreshGraphics: function(){
        //var graphics = this._graphicLayer.getGraphics(),
        //    visibleBounds = this._scene.getBounds();
        //
        //for(var i = 0; i < graphics.length; i++){
        //    var shape = graphics[i].feature.shape;
        //    var graphicBounds = (shape instanceof Z.Geometry) ? shape.getBounds() : shape;
        //
        //    if(visibleBounds.intersects(graphicBounds)){
        //        graphics[i].refresh();
        //    }else{
        //        graphics[i].hideTitle();
        //        graphics[i].hideIcon();
        //    }
        //    //graphics[i].refresh();
        //}
        this._refreshVisibleStatus();
        this._refreshVisibleGraphics();
        this._refreshInvisibleGraphics();
    },

    _refreshVisibleStatus: function(){
        var graphics = this._graphicObjects,//this._graphicLayer.getGraphics(),
            visibleBounds = this._scene.getBounds();
        this._visibleGraphics = [];
        this._invisibleGraphics = [];

        //for(var i = 0; i < graphics.length; i++){
        for(var key in graphics){
            var curGraphic = graphics[key].graphic;
            var shape = curGraphic.feature.shape;
            var graphicBounds = (shape instanceof Z.Geometry) ? shape.getBounds() : shape;

            if(visibleBounds.intersects(graphicBounds)){
                this._visibleGraphics.push(curGraphic);
            }else{
                this._invisibleGraphics.push(curGraphic);
            }
        }
    },

    _refreshVisibleGraphics: function(){
        var graphics = this._visibleGraphics;

        for(var i = 0; i < graphics.length; i++){
            graphics[i].refresh();
            graphics[i].show();
        }
    },

    _refreshInvisibleGraphics: function(){
        var graphics = this._invisibleGraphics;

        for(var i = 0; i < graphics.length; i++){
            //graphics[i].hideTitle();
            //graphics[i].hideIcon();
            graphics[i].hide();
        }
    },

    _onMoveEnd: function(){
        this._onZoomLevelsChange();
    },

    _onZoomLevelsChange: function(){
        /***方案一：刷新每一个graphics，重新计算场景坐标***/
        this._refreshAnchor();
        //this._repositionRoot();

        //var graphics = this._graphicLayer.getGraphics();
        //
        //for(var i = 0; i < graphics.length; i++){
        //    graphics[i].updateFeature(graphics[i].feature);
        //}

        this._scene.refresh();
        this._refreshGraphics();

        ///***方案二：直接设置graphicLayer根对象的缩放系数和位置***/
        //var newScenePoint1 = this._scene.latLngToScenePoint(this._anchor.latLng1),
        //    newScenePoint2 = this._scene.latLngToScenePoint(this._anchor.latLng2),
        //    scale = (newScenePoint2.x - newScenePoint1.x) / (this._anchor.scenePoint2.x - this._anchor.scenePoint1.x);
        //
        //this._graphicRoot.root.scale.set(scale, scale, scale);
        //this._graphicRoot.root.position.set(newScenePoint1.x, newScenePoint1.y, newScenePoint1.z);
        //
        //this._scene.refresh();
    },

    //_onDragStart: function(e){
    //    this._dragStartPoint = this._graphicRoot.root.position.clone();
    //},
    //
    _onDrag: function(e){
        //var sceneObj = this._scene;
        //
        //if(!e.startPoint || !e.newPoint){
        //    return;
        //}
        //
        //var startPoint = sceneObj.screenPointToScenePoint(e.startPoint);
        //var newPoint = sceneObj.screenPointToScenePoint(e.newPoint);
        //
        //if(!startPoint || !newPoint){
        //    return;
        //}
        //
        //var delta = newPoint.subtract(startPoint);
        //this._graphicRoot.root.position.x = this._dragStartPoint.x + delta.x;
        //this._graphicRoot.root.position.y = this._dragStartPoint.y + delta.y;
        //this._graphicRoot.root.position.z = this._dragStartPoint.z + delta.z;
        //this._scene.refresh();
        //this._refreshGraphics();
        this._refreshVisibleGraphics();
    },
    //
    //_onDragEnd: function(e){
    //    //var sceneObj = this._scene;
    //    //var startPoint = sceneObj.screenPointToScenePoint(e.startPoint);
    //    //var newPoint = sceneObj.screenPointToScenePoint(e.newPoint);
    //    ////var delta = newPoint.subtract(startPoint);
    //    //this._graphicRoot.root.position.x = this._dragStartPoint.x;
    //    //this._graphicRoot.root.position.y = this._dragStartPoint.y;
    //    //this._graphicRoot.root.position.z = this._dragStartPoint.z;
    //
    //    this._dragStartPoint =null;
    //},

    _onMouseEvent: function(e){
        var objs = e.objects || [], latLng = e.latlng, objectArray = [], objectSet = {};

        //触发图层事件
        for(var i = 0; i < objs.length; i++){
            if(!(objs[i] instanceof Z.SurfacePlane)){
                continue;
            }

            var surfacePlane = objs[i];
            var graphic = surfacePlane.getGraphic(this._renderId, latLng);

            if(!graphic){//console.info("0");
                continue;
            }
            //console.info("1");
            var stamp = Z.Util.stamp(graphic, 'graphic');

            //提取出属于此图层的graphic对象
            if(this._graphicLayer.hasGraphic(graphic)){
                if(objectSet[stamp]){
                    continue;         //在三维中，对于组合对象的每个threejs组成对象，都会统计一次，因此会存在重复的情况
                }

                objectArray[objectArray.length] = graphic;
                objectSet[stamp] = graphic;

                break;
            }
        }

        //触发图层的鼠标事件
        this._fireGraphicLayerMouseEvent(e, objectArray);
        //触发每个要素的鼠标事件
        this._fireGraphicsMouseEvent(e, objectSet);

        this._intersectedObjects = objectSet;

        if(e.type === "click"){
            if(!this._nullClick(objectSet)){
                this._clickedObjects = objectSet;
            }
        }
    },

    _fireGraphicLayerMouseEvent: function(sceneEvent, graphicArray){
        this.fire(sceneEvent.type, {
            latlng: sceneEvent.latlng,
            scenePoint: sceneEvent.scenePoint,
            containerPoint: sceneEvent.containerPoint,
            originalEvent: sceneEvent.originalEvent,
            objects: graphicArray
        });
    },

    _fireGraphicsMouseEvent: function(sceneEvent, objectSet){
        //相对于上一次鼠标事件，对于鼠标位置已经离开的要素触发mouseout事件
        for(var key in this._intersectedObjects){
            if(!objectSet[key]){
                this._fireOneGraphicEvent("mouseout", sceneEvent, this._intersectedObjects[key]);
            }
        }

        if(sceneEvent.type === "click"){
            var nullClick = this._nullClick(objectSet);

            if(!nullClick){
                for(var key in this._clickedObjects){
                    if(!objectSet[key]){
                        this._fireOneGraphicEvent("unselect", sceneEvent, this._clickedObjects[key]);
                    }
                }
            }
        }

        for(var key in objectSet){
            //对新增的触发mouseover事件
            if(!this._intersectedObjects[key]){
                this._fireOneGraphicEvent("mouseover", sceneEvent, objectSet[key]);
            }

            if(sceneEvent.type === "click"){
                this._fireOneGraphicEvent("select", sceneEvent, objectSet[key]);
            }

            //对于当前鼠标选中的要素触发正常鼠标事件
            this._fireOneGraphicEvent(sceneEvent.type, sceneEvent, objectSet[key]);
        }
    },

    _fireOneGraphicEvent: function(type, sceneEvent, graphicObject){
        if(graphicObject){
            //graphicObject.graphic.fire(type, {
            graphicObject.fire(type, {
                latlng: sceneEvent.latlng,
                scenePoint: sceneEvent.scenePoint,
                containerPoint: sceneEvent.containerPoint,
                originalEvent: sceneEvent.originalEvent,
                object: graphicObject
            });
        }
    },

    _nullClick: function(objectSet){    //判断是否点击到空白处
        var nullCilck = true,
            objectSet = objectSet || {};

        for(var key in objectSet){
            if(key){
                nullCilck = false;
                break;
            }
        }

        return nullCilck;
    },

    _initAnchor: function(){
        var sceneBounds = this._scene.getBounds();

        this._anchor = {
            latLng1: sceneBounds.getCenter(),
            latLng2: sceneBounds.getNorthEast(),        //不同于锚点的另一定位点，用于计算缩放系数
            scenePoint1: new Z.Point(0, 0, 0),
            scenePoint2: this._scene.latLngToScenePoint(sceneBounds.getNorthEast())
        };

        this._initRootLatLng();
    },

    _refreshAnchor: function(){
        var sceneBounds = this._scene.getBounds();

        this._anchor.scenePoint1 = this._scene.latLngToScenePoint(this._anchor.latLng1);
        this._anchor.scenePoint2 = this._scene.latLngToScenePoint(this._anchor.latLng2);
    },

    _initRootLatLng: function(){
        var rootPos = this._graphicRoot.root.position;
        this._rootLatLng = this._scene.scenePointToLatLng(new Z.Point(rootPos.x, rootPos.y, rootPos.z));
    },

    //_repositionRoot: function(){
    //    var rootPos = this._scene.latLngToScenePoint(this._rootLatLng);
    //    this._graphicRoot.root.position.x = rootPos.x;
    //    this._graphicRoot.root.position.y = rootPos.y;
    //    this._graphicRoot.root.position.z = rootPos.z;
    //}

    //_getGraphicType: function(graphic){
    //    var shape = graphic.feature.shape.type;
    //        type = null;
    //
    //    if(shape instanceof Z.Polyline){
    //        type = "polyline";
    //    }
    //}

    _updateRenderContent: function(){
        var objs = [], thisObjs = this._graphicObjects;

        for(var key in thisObjs){
            objs.push(thisObjs[key]);
        }

        Z.SingleTerrainPlane.getInstance().updateLayerContent(
            this._renderId,
            objs
        );
        //Z.SingleTerrainPlane.getInstance().draw();
    },

    _applyGraphicUpdateEvent: function(graphic, onOff){
        var thisObj = this,
            onOff = onOff || 'on';
        graphic[onOff]("featureupdated", thisObj._onGraphicFeatureUpdate, thisObj);
        graphic[onOff]("symbolupdated", thisObj._onGraphicSymbolUpdate, thisObj);
    },

    _onGraphicFeatureUpdate: function(e){
        var graphic = e.target;
        var graphicStamp = Z.Util.stamp(graphic, 'graphic');
        //var type = graphic.feature.shape.type;

        this._graphicObjects[graphicStamp].object = graphic.feature.shape;
        this._updateRenderContent();
    },

    _onGraphicSymbolUpdate: function(e){
        var graphic = e.target;
        var graphicStamp = Z.Util.stamp(graphic, 'graphic');
        //var type = graphic.feature.shape.type;

        this._graphicObjects[graphicStamp].symbol = graphic.symbol;
        this._updateRenderContent();
    }
});