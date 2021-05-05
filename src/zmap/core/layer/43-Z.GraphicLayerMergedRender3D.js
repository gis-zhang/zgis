/**
 * Created by Administrator on 2015/10/31.
 */
Z.GraphicLayerMergedRender3D = Z.GraphicLayerRender3D.extend({
    initialize: function(options){
        Z.GraphicLayerRender3D.prototype.initialize.apply(this, arguments);

        this._mergedRoot = new Z.MergedMesh3D1();
        //this._graphicGrid = new Z.GraphicGrid();
        this._graphicContainer = new Z.SceneThreePaneItem();
    },

    onAdd: function(graphicLayer, scene, index, containerPane, groupPane){
        Z.GraphicLayerRender3D.prototype.onAdd.apply(this, arguments);
        //this._graphicRoot.root.add(this._mergedRoot.root);
    },

    onRemove: function(scene){
        Z.GraphicLayerRender3D.prototype.onRemove.apply(this, arguments);
        this._graphicRoot.root.remove(this._mergedRoot.root);
        //this._graphicRoot.root.remove(this._mergedRoot._mergedGraphic);
    },

    addGraphics: function(graphicLayer, graphics){
        var inputGraphics = (graphics instanceof Array) ? graphics : (graphics ? [graphics] : []);

        if(inputGraphics.length <= 0){
            return;
        }

        var meshes = [];

        for(var i = 0; i < inputGraphics.length; i++) {
            var graphic = inputGraphics[i];
            //if(i == 10256){debugger;}
            if (graphic instanceof Z.Graphic || graphic instanceof Z.ComposeGraphic1) {
                //graphic.onAdd(graphicLayer, this._graphicRoot, this._scene);
                graphic.onAdd(graphicLayer, this._graphicContainer, this._scene);
console.info("graphicAdded:" + i);

                if(graphic instanceof Z.Graphic){
                    var curMeshs = this._getGraphicMesh(graphic._mainElement._render._renderedObject);

                    for(var j = 0; j < curMeshs.length; j++){
                        //this._mergedRoot.addMesh(curMeshs[j]);
                        ////this._graphicGrid.addGraphic(meshs[j]);
                        var meshObj = this._recomputeVertices(curMeshs[j]);
                        meshes.push(meshObj);
                    }

                    this._applyGraphicChangeListener(graphic, 'on');
                }

                //document.getElementById("parseState").innerHTML= (i + 1) + "/" + graphics.length;
            }
        }

        this._mergedRoot.addMeshes(meshes);
        console.info("graphicMerged:");
        //this._mergedRoot.reorderFacesByMaterial();
        //console.info("reordered:");

        if(this._mergedRoot.root){
            if(!this._mergedRoot.root.parent){
                this._graphicRoot.root.add(this._mergedRoot.root);
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
                //graphic.onRemove(graphicLayer, this._graphicRoot.root, this._scene);
                graphic.onRemove(graphicLayer, this._graphicContainer, this._scene);

                if (graphic instanceof Z.Graphic) {
                    //this._mergedRoot.deleteMesh(graphic._mainElement._render._renderedObject);

                    var curMeshs = this._getGraphicMesh(graphic._mainElement._render._renderedObject);

                    for(var j = 0; j < curMeshs.length; j++){
                        this._mergedRoot.deleteMesh(curMeshs[j].mesh);
                    }

                    this._applyGraphicChangeListener(graphic, 'off');
                }
            }
        }
    },

    clear: function(){
        //this._containerPane.removeChild(this._graphicRoot);
        //this._graphicRoot.resetRoot();
        //this._containerPane.addChild(this._graphicRoot);
        Z.GraphicLayerRender3D.prototype.clear.apply(this, arguments);
        this._mergedRoot.clear();
    },

    getSceneHeight: function(height){
        var sceneLatLngRatio = this._anchor.sceneHeight / this._anchor.latLngHeight;

        return height * sceneLatLngRatio;
    },

    //对于仅仅是浏览范围变化的情况，不再重新计算每个要素的场景坐标
    _onViewReset: function(){
        //this._refreshGraphics();
        Z.GraphicLayerRender3D.prototype._onViewReset.apply(this, arguments);
        this._mergedRoot.updateRasterIndex();
    },

    _refreshGraphics: function(){
        var graphics = this._graphicLayer.getGraphics();

        for(var i = 0; i < graphics.length; i++){
            graphics[i].refresh();
        }
    },

    //_onMoveEnd: function(){
    //    this._onZoomLevelsChange();
    //},

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

        this._scene.refresh();

        this._mergedRoot.updateRasterIndex();

        this._refreshGraphics();
    },

    ////override
    //_applyEvents: function(onOff){
    //    Z.GraphicLayerRender3D.prototype._applyEvents.apply(this, arguments);
    //
    //    //_applyGraphicChangeListener
    //},

    //override
    _onMouseEvent: function(e){
        var objs = e.objects || [], intersections = e.intersections || [], objectArray = [], objectSet = {}, stamp;
console.info(e.type + ":objects.length=" + objs.length);
        //触发图层事件
        for(var i = 0; i < intersections.length; i++){
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

            //if(intersections[i].graphic !== this._mergedRoot){
            //    continue;
            //}else{
            //    var face = intersections[i].rawIntersection.face;
            //    var ownerMesh = face.ownerMesh;
            //    var graphicObject = ownerMesh._graphicObj;
            //
            //    stamp = Z.Util.stamp(graphicObject, 'graphic');
            //
            //    //提取出属于此图层的graphic对象
            //    if(this._graphicLayer.hasGraphic(graphicObject)){
            //        if(objectSet[stamp]){
            //            continue;         //在三维中，对于组合对象的每个threejs组成对象，都会统计一次，因此会存在重复的情况
            //        }
            //
            //        if(graphicObject.eventFirable){
            //            objectArray[objectArray.length] = graphicObject;    //graphic与e中的顺序保持一致：按距离由近及远排序
            //            objectSet[stamp] = graphicObject;
            //        }
            //
            //        break;
            //    }
            //}
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

    _getGraphicMesh: function(mesh){
        var meshs = [];

        if(mesh instanceof THREE.Mesh || mesh instanceof THREE.Line){
            //mesh.updateMatrix();
            //this._graphicRoot.root.updateMatrixWorld(true);
            //var meshWorldPos = mesh.getWorldPosition();
            var meshWorldPos = this._getWorldPosition(mesh);
            meshs.push({position: meshWorldPos, mesh: mesh});
        //}if(mesh instanceof THREE.Line){
        //    //mesh.updateMatrix();
        //    //this._graphicRoot.root.updateMatrixWorld(true);
        //    //var meshWorldPos = mesh.getWorldPosition();
        //    var meshWorldPos = this._getWorldPosition(mesh);
        //    meshs.push({position: meshWorldPos, mesh: mesh});
        }else if(mesh && mesh.children && mesh.children.length > 0){
            //var basePosition = mesh.position.clone();

            for(var i = 0; i < mesh.children.length; i++){
                var curMeshs = this._getGraphicMesh(mesh.children[i]);

                for(var j = 0; j < curMeshs.length; j++){
                    //curMeshs[j].position.add(basePosition);
                    meshs.push(curMeshs[j]);
                }
            }
        }

        return meshs;
    },

    _getWorldPosition: function(mesh){
        var pos = mesh.position.clone();

        if(mesh.parent){
            var parentPos = this._getWorldPosition(mesh.parent);
            pos = pos.add(parentPos);
        }

        return pos;
    },

    _recomputeVertices: function(mesh){
        var offset = mesh.position,
            tolerence = 0.00000001,
            meshObj = mesh.mesh;

        //if(offset.x > tolerence || offset.y > tolerence || offset.z > tolerence){
        //    meshObj = meshObj.clone();
        //    meshObj.geometry =  meshObj.geometry.clone();
        //    var vertices = meshObj.geometry.vertices;
        //
        //    for(var i = 0; i < vertices.length; i++){
        //        vertices[i] = vertices[i].add(offset);
        //    }
        //
        //    meshObj.verticesNeedUpdate = true;
        //}

        meshObj._z_posOffset = offset;

        return meshObj;
    },

    _applyGraphicChangeListener: function(graphic, onOff){
        if(!(graphic instanceof Z.Graphic)){
            return;
        }

        var events = ['symbolupdated', 'featureupdated', 'show', 'hide'];

        for (var i = 0, len = events.length; i < len; i++) {
            graphic[onOff](events[i], this._updateGraphic, this);
        }

        //if(graphic instanceof Z.AbstractBuilding){
        //    var buildingEvents = ["showBuildingSurface", "showFloors", "showAllFloors",
        //        "showFloorSurface", "showCells", "showFloorCells"];
        //
        //    for (var j = 0, bLen = buildingEvents.length; j < bLen; j++) {
        //        graphic[onOff](buildingEvents[j], this._updateGraphic, this);
        //    }
        //}
    },

    _updateGraphic: function(event){
        var graphic = event.target;
        //var graphicId = Z.Util.stamp(graphic, 'graphic');
        //var graphicLayer = graphic._layer;

        //this.removeGraphics(graphicLayer, [graphic]);
        //this.addGraphics(graphicLayer, [graphic]);
        var curMeshs = this._getGraphicMesh(graphic._mainElement._render._renderedObject);

        for(var j = 0; j < curMeshs.length; j++){
            //curMeshs[j].mesh.userData.graphicId = curMeshs[j].mesh.userData.graphicId || graphicId;
            this._mergedRoot.deleteMesh(curMeshs[j].mesh);

            var meshObj = this._recomputeVertices(curMeshs[j]);
            this._mergedRoot.addMeshes([meshObj]);
        }

        //this._mergedRoot.updateRasterIndex();
    }
});