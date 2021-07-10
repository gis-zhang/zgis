/**
 * Created by Administrator on 2015/10/31.
 */
Z.GraphicLayerRender3D = Z.IGraphicLayerRender.extend({
    initialize: function(urls, options){
        this.options = {};
        this.options = Z.Util.applyOptions(this.options, options, false);

        this._graphicRoot = new Z.SceneThreePaneItem();
        //this._rootLatLng = null;     //图层根对象（threejs的Geometry3D对象）的中心点对应的空间坐标
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
    },

    onAdd: function(graphicLayer, scene, index, containerPane, groupPane){
        if(!(scene instanceof Z.Scene3D) || !containerPane){
            return;
        }

        this._graphicLayer = graphicLayer;
        var layerIndex = index;

        if(!(typeof layerIndex === "number")){
            if(groupPane){
                layerIndex = groupPane.getMaxChildIndex() + 1;
            }else{
                layerIndex = containerPane.getMaxChildIndex() + 1;
            }
        }

        this._scene = scene;

        if(containerPane instanceof Z.SceneThreePaneItem){
            //this._graphicRoot.index = layerIndex;
            //containerPane.addChild(this._graphicRoot, layerIndex);
            this._containerPane = containerPane;
            this.setZIndex(layerIndex);
        }

        this._initAnchor();
        this._addEvents();
        //this._reset();
        //this._update();
        //this.setBaseIndex(containerPane.index);
        //this._zIndex = layerIndex;
        //this._setTileZIndex(layerIndex);
        //this._scene.refresh();

        //return containerPane.index + layerIndex;
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

        //this._scene.refresh();
        this._scene = undefined;
    },

    show: function(){
        this._graphicRoot.show();
    },

    hide: function(){
        this._graphicRoot.hide();
    },

    setOpacity: function(opacity){
        if(typeof opacity !== "number"){
            return;
        }

        opacity = Math.min(1, Math.max(opacity, 0));

        var childObjects = this._graphicRoot.root.children;

        for(var i = 0; i < childObjects.length; i++){
            if(childObjects[i].material){
                childObjects[i].material.opacity = opacity;
            }
        }
    },

    setZIndex: function(zIndex){
        if(typeof zIndex !== "number"){
            return;
        }

        this._zIndex = zIndex;
        //this._containerPane.setChildIndex(this._graphicRoot, this._containerPane.index + zIndex);
        this._containerPane.setChildIndex(this._graphicRoot, zIndex);

        /****************************待完善******************************/
        //var childObjects = this._graphicRoot.root.children;
        //
        //for(var i = 0; i < childObjects.length; i++){
        //    childObjects[i].renderOrder = this._containerPane.index + zIndex;
        //}
        /****************************************************************/
    },

    getZIndex: function(){
        return this._zIndex;
    },

    refresh: function(options){
        throw new Error("refresh方法尚未实现");
    },

    addGraphic: function(graphicLayer, graphic){
        //if(graphic instanceof Z.Graphic || graphic instanceof Z.MultiGraphic) {
        //    graphic.onAdd(graphicLayer, this._graphicRoot, this._scene);
        //}
        var graphics = (graphic instanceof Array) ? graphic : (graphic ? [graphic] : []);
        this.addGraphics(graphicLayer, graphics);
    },

    removeGraphic: function(graphicLayer, graphic){
        //if(graphic instanceof Z.Graphic || graphic instanceof Z.MultiGraphic) {
        //    graphic.onRemove(graphicLayer, this._graphicRoot.root, this._scene);
        //}
        var graphics = (graphic instanceof Array) ? graphic : (graphic ? [graphic] : []);
        this.removeGraphics(graphicLayer, graphics);
    },

    addGraphics: function(graphicLayer, graphics){
        var inputGraphics = (graphics instanceof Array) ? graphics : (graphics ? [graphics] : []);

        if(inputGraphics.length <= 0){
            return;
        }

        for(var i = 0; i < inputGraphics.length; i++) {
            var graphic = inputGraphics[i];

            if (graphic instanceof Z.Graphic || graphic instanceof Z.ComposeGraphic1) {
                graphic.onAdd(graphicLayer, this._graphicRoot, this._scene);
            }
        }
    },

    removeGraphics: function(graphicLayer, graphics){
        var inputGraphics = (graphics instanceof Array) ? graphics : (graphics ? [graphics] : []);

        if(inputGraphics.length <= 0){
            return;
        }

        for(var i = 0; i < inputGraphics.length; i++) {
            var graphic = inputGraphics[i];

            if (graphic instanceof Z.Graphic || graphic instanceof Z.ComposeGraphic1) {
                graphic.onRemove(graphicLayer, this._graphicRoot, this._scene);
            }
        }
    },

    clear: function(){
        this._containerPane.removeChild(this._graphicRoot);
        this._graphicRoot.resetRoot();
        this._containerPane.addChild(this._graphicRoot);
    },

    //经纬度坐标转换为此图层的场景坐标（由于图层本身的平移等处理，图层的场景坐标不一定与地图场景坐标一致）
    latLngToLayerScenePoint: function(latLng){
        var s1 = this._anchor.scenePoint1,
            s2 = this._anchor.scenePoint2,
            l1 = this._anchor.latLng1,
            l2 = this._anchor.latLng2,
            sceneLatRatio = (s2.y - s1.y) / (l2.lat - l1.lat),
            sceneLngRatio = (s2.x - s1.x) / (l2.lng - l1.lng),
            scenePointX = (latLng.lng - l1.lng) * sceneLngRatio,
            scenePointY = (latLng.lat - l1.lat) * sceneLatRatio,
            alt = Z.Util.isNull(latLng.alt) ? NaN :
                (Z.Util.isNull(l1.alt) ? latLng.alt : (latLng.alt - l1.alt)),
        //scenePointZ = this._scene.getSceneDistance(alt);
            scenePointZ = this.getSceneHeight(alt);

            //l1Proj = this._scene._projModel.forwardTransform(this._anchor.latLng1),
            //l2Proj = this._scene._projModel.forwardTransform(this._anchor.latLng2),
            //latLngProj = this._scene._projModel.forwardTransform(latLng),
            //
            //sceneLngRatio = (s2.x - s1.x) / (l2Proj.lng - l1Proj.lng),
            //sceneLatRatio = (s2.y - s1.y) / (l2Proj.lat - l1Proj.lat),
            //scenePointX = (latLngProj.lng - l1Proj.lng) * sceneLngRatio,
            //scenePointY = (latLngProj.lat - l1Proj.lat) * sceneLatRatio,
            //alt = Z.Util.isNull(latLng.alt) ? NaN :
            //    (Z.Util.isNull(l1.alt) ? latLng.alt : (latLng.alt - l1.alt)),
            ////scenePointZ = this._scene.getSceneDistance(alt);
            //scenePointZ = this.getSceneHeight(alt);

        return new Z.Point(scenePointX, scenePointY, scenePointZ);
    },

    getSceneHeight: function(height){
        height = height || 0;
        var sceneLatLngRatio = this._anchor.sceneHeight / this._anchor.latLngHeight;

        return height * sceneLatLngRatio;
        //return this._scene.getSceneDistance(height);
    },

    layerScenePointToLatLng: function(point){
        var s1 = this._anchor.scenePoint1,
            s2 = this._anchor.scenePoint2,
            l1 = this._anchor.latLng1,
            l2 = this._anchor.latLng2,
            sceneLatLngRatio = (s2.x - s1.x) / (l2.lng - l1.lng),
            lng = (point.x - s1.x) / sceneLatLngRatio + l1.lng,
            lat = (point.y - s1.y) / sceneLatLngRatio + l1.lat,
            z = Z.Util.isNull(point.z) ? NaN :
                (Z.Util.isNull(s1.z) ? point.z : (point.z - s1.z)),
        //scenePointZ = this._scene.getSceneDistance(alt);
            alt = this.getLatLngHeight(z) + l1.alt;

        return new Z.LatLng(lat, lng, alt);
    },

    getLatLngHeight: function(sceneHeight){
        sceneHeight = sceneHeight || 0;
        var sceneLatLngRatio = this._anchor.sceneHeight / this._anchor.latLngHeight;

        return sceneHeight / sceneLatLngRatio;
        //return this._scene.getSceneDistance(height);
    },

    delegateGraphicEvent: function(graphic, domEvent){
        if(!graphic || !domEvent){
            return;
        }

        var containerPoint = this._scene.documentPointToContainer(new Z.Point(domEvent.clientX, domEvent.clientY));
        var scenePoint = this._scene.screenPointToScenePoint(containerPoint),
            latlng = this._scene.screenPointToLatLng(containerPoint);
        var eventObj = {
            type: domEvent.type,
            latlng: latlng,
            scenePoint: scenePoint,
            containerPoint: containerPoint,
            originalEvent: domEvent,
            objects: [graphic]
        }

        this._onMouseEvent(eventObj);
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
        // this._scene[onOff]("dragstart", thisObj._onDragStart, thisObj);
        // this._scene[onOff]("drag", this._onDrag, thisObj);
        // this._scene[onOff]("dragend", thisObj._onDragEnd, thisObj);

        var domEvents = ['dblclick', 'click', 'mousedown', 'mouseup', 'mouseover',
                'mouseout', 'mousemove', 'contextmenu'],
            i, len;

        //for (i = 0, len = domEvents.length; i < len; i++) {
        //    this._scene[onOff](domEvents[i], thisObj._onMouseEvent, thisObj);
        //}
        this._scene[onOff](domEvents, thisObj._onMouseEvent, thisObj);
    },

    //对于仅仅是浏览范围变化的情况，不再重新计算每个要素的场景坐标
    _onViewReset: function(){
        this._scene.refresh();
        this._refreshGraphics();
    },

    _refreshGraphics: function(){
        var graphics = this._graphicLayer.getGraphics();

        for(var i = 0; i < graphics.length; i++){
            graphics[i].refresh();
        }
    },

    _onMoveEnd: function(){
        this._onZoomLevelsChange();
    },

    _onZoomLevelsChange: function(){
        ///***方案一：刷新每一个graphics，重新计算场景坐标***/
        //this._refreshAnchor();
        //this._repositionRoot();
        //
        //var graphics = this._graphicLayer.getGraphics();
        //
        //for(var i = 0; i < graphics.length; i++){
        //    graphics[i].updateFeature(graphics[i].feature);
        //}
        //
        //this._scene.refresh();

        /***方案二：直接设置graphicLayer根对象的缩放系数和位置***/
        var newScenePoint1 = this._scene.latLngToScenePoint(this._anchor.latLng1),
            newScenePoint2 = this._scene.latLngToScenePoint(this._anchor.latLng2),
            scale = (newScenePoint2.x - newScenePoint1.x) / (this._anchor.scenePoint2.x - this._anchor.scenePoint1.x);

        this._graphicRoot.root.scale.set(scale, scale, scale);
        this._graphicRoot.root.position.set(newScenePoint1.x, newScenePoint1.y, newScenePoint1.z);

        this._graphicRoot.root.updateMatrix();
        this._graphicRoot.root.updateMatrixWorld(true);

        this._scene.refresh();
        this._refreshGraphics();
    },

    // _onDragStart: function(e){
    //     this._dragStartPoint = this._graphicRoot.root.position.clone();
    // },

    // _onDrag: function(e){
    //     var sceneObj = this._scene;

    //     if(!e.startPoint || !e.newPoint){
    //         return;
    //     }

    //     var startPoint = sceneObj.screenPointToScenePoint(e.startPoint);
    //     var newPoint = sceneObj.screenPointToScenePoint(e.newPoint);

    //     if(!startPoint || !newPoint){
    //         return;
    //     }

    //     var delta = newPoint.subtract(startPoint),
    //         x = this._dragStartPoint.x + delta.x,
    //         y = this._dragStartPoint.y + delta.y,
    //         z = this._dragStartPoint.z + delta.z;

    //     this._graphicRoot.root.position.set(x, y, z);
    //     this._graphicRoot.root.position.matrixWorldNeedsUpdate = true;
    //     this._scene.refresh();
    //     this._refreshGraphics();
    // },

    // _onDragEnd: function(e){
    //     //var sceneObj = this._scene;
    //     //var startPoint = sceneObj.screenPointToScenePoint(e.startPoint);
    //     //var newPoint = sceneObj.screenPointToScenePoint(e.newPoint);
    //     ////var delta = newPoint.subtract(startPoint);
    //     //this._graphicRoot.root.position.x = this._dragStartPoint.x;
    //     //this._graphicRoot.root.position.y = this._dragStartPoint.y;
    //     //this._graphicRoot.root.position.z = this._dragStartPoint.z;

    //     this._dragStartPoint =null;
    // },

    _onMouseEvent: function(e){
        var objs = e.objects || [], objectArray = [], objectSet = {}, stamp;
        //console.info(e.type + ":objects.length=" + objs.length);
        //触发图层事件
        for(var i = 0; i < objs.length; i++){
            if(!(objs[i] instanceof Z.Graphic) || !objs[i].eventCapturable || !(objs[i].isShowing())){
                continue;
            }

            stamp = Z.Util.stamp(objs[i], 'graphic');

            //提取出属于此图层的graphic对象
            //if(this._graphicLayer.hasGraphic(objs[i].graphic)){
            if(this._graphicLayer.hasGraphic(objs[i])){
                if(objectSet[stamp]){
                    continue;         //在三维中，对于组合对象的每个threejs组成对象，都会统计一次，因此会存在重复的情况
                }

                if(objs[i].eventFirable){
                    objectArray[objectArray.length] = objs[i];    //graphic与e中的顺序保持一致：按距离由近及远排序
                    objectSet[stamp] = objs[i];
                }

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
        var mouseoutGraphics = [];

        //相对于上一次鼠标事件，对于鼠标位置已经离开的要素触发mouseout事件
        for(var key in this._intersectedObjects){
            if(!objectSet[key]){
                this._fireOneGraphicEvent("mouseout", sceneEvent, this._intersectedObjects[key]);
                mouseoutGraphics.push(this._intersectedObjects[key]);
            }
        }

        if(mouseoutGraphics.length > 0){
            var mouseoutEvent = {
                type: "mouseout",
                latlng: sceneEvent.latlng,
                scenePoint: sceneEvent.scenePoint,
                containerPoint: sceneEvent.containerPoint,
                originalEvent: sceneEvent.originalEvent
            };

            this._fireGraphicLayerMouseEvent(mouseoutEvent, mouseoutGraphics);
        }

        var unselectGraphics = [];

        if(sceneEvent.type === "click"){
            var nullClick = this._nullClick(objectSet);

            if(!nullClick){
                for(var key in this._clickedObjects){
                    if(!objectSet[key]){
                        this._fireOneGraphicEvent("unselect", sceneEvent, this._clickedObjects[key]);
                        unselectGraphics.push(this._clickedObjects[key]);
                    }
                }
            }
        }

        if(unselectGraphics.length > 0){
            var unselectEvent = {
                type: "unselect",
                latlng: sceneEvent.latlng,
                scenePoint: sceneEvent.scenePoint,
                containerPoint: sceneEvent.containerPoint,
                originalEvent: sceneEvent.originalEvent
            };

            this._fireGraphicLayerMouseEvent(unselectEvent, unselectGraphics);
        }

        var selectedGraphics = [],
            mouseoverGraphics = [];

        for(var key in objectSet){
            //对新增的触发mouseover事件
            if(!this._intersectedObjects[key]){//console.info("_fireGraphicsMouseEvent: mouseover");
                this._fireOneGraphicEvent("mouseover", sceneEvent, objectSet[key]);
                mouseoverGraphics.push(objectSet[key]);
            }

            if(sceneEvent.type === "click"){
                this._fireOneGraphicEvent("select", sceneEvent, objectSet[key]);
                selectedGraphics.push(objectSet[key]);
            }

            //对于当前鼠标选中的要素触发正常鼠标事件
            this._fireOneGraphicEvent(sceneEvent.type, sceneEvent, objectSet[key]);
        }

        if(mouseoverGraphics.length > 0){
            var mouseoverEvent = {
                type: "mouseover",
                latlng: sceneEvent.latlng,
                scenePoint: sceneEvent.scenePoint,
                containerPoint: sceneEvent.containerPoint,
                originalEvent: sceneEvent.originalEvent
            };

            this._fireGraphicLayerMouseEvent(mouseoverEvent, mouseoverGraphics);
        }

        if(selectedGraphics.length > 0){
            var selectEvent = {
                type: "select",
                latlng: sceneEvent.latlng,
                scenePoint: sceneEvent.scenePoint,
                containerPoint: sceneEvent.containerPoint,
                originalEvent: sceneEvent.originalEvent
            };

            this._fireGraphicLayerMouseEvent(selectEvent, selectedGraphics);
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
        var sceneBounds = this._scene.getBounds(),
            latLngHeight = 10,
            sceneHeight = this._scene.getSceneDistance(latLngHeight);

        this._anchor = {
            latLng1: sceneBounds.getCenter(),
            //latLng1: sceneBounds.getSouthWest(),//sceneBounds.getCenter(),
            latLng2: sceneBounds.getNorthEast(),        //不同于锚点的另一定位点，用于计算缩放系数
            scenePoint1: new Z.Point(0, 0, 0),
            //scenePoint1: this._scene.latLngToScenePoint(sceneBounds.getSouthWest()),//new Z.Point(0, 0, 0),
            scenePoint2: this._scene.latLngToScenePoint(sceneBounds.getNorthEast()),
            latLngHeight: latLngHeight,
            sceneHeight: sceneHeight
        };

        // this._initRootLatLng();
    },

    // _refreshAnchor: function(){
    //     var sceneBounds = this._scene.getBounds();

    //     this._anchor.scenePoint1 = this._scene.latLngToScenePoint(this._anchor.latLng1);
    //     this._anchor.scenePoint2 = this._scene.latLngToScenePoint(this._anchor.latLng2);
    // },

    // _initRootLatLng: function(){
    //     var rootPos = this._graphicRoot.root.position;
    //     this._rootLatLng = this._scene.scenePointToLatLng(new Z.Point(rootPos.x, rootPos.y, rootPos.z));
    // },

    // _repositionRoot: function(){
    //     var rootPos = this._scene.latLngToScenePoint(this._rootLatLng);
    //     this._graphicRoot.root.position.set(rootPos.x, rootPos.y, rootPos.z);
    //     this._graphicRoot.root.position.matrixWorldNeedsUpdate = true;
    //     this._graphicRoot.root.updateMatrix();
    //     this._graphicRoot.root.updateMatrixWorld(true);
    // }
});