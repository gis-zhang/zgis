/**
 * Created by Administrator on 2015/12/2.
 */
Z.GraphicRenderTerrain = Z.IGraphicRender.extend({
    initialize: function(graphic){
        //this._graphic = graphic;
        //this._renderedObject = null;
        //this._container = null;
        //this._baseIndex = null;
        //this._layerIndex = null;
        //this._layer = null;
        //this._scene = null;
        //this._added = false;
    },

    //onAdd: function(graphicLayer, container, scene, baseIndex, layerIndex){
    onAdd: function(graphicLayer, container, scene){
        //this._container = container.root;
        //this._baseIndex = graphicLayer.getContainerPane().index;
        //this._layerIndex = graphicLayer.getZIndex();
        //this._layer = graphicLayer;
        //this._scene = scene;
        //
        //if(!this._renderedObject){
        //    this._renderedObject = this.getRenderedObject(this._baseIndex, this._layerIndex);
        //    this._renderedObject.castShadow = true;
        //}
        //
        //if(this._renderedObject){
        //    this._container.add(this._renderedObject);
        //}
        //
        //this._added = true;
    },

    //移除时并不会销毁渲染对象，如果要销毁渲染对象需要显示调用dispose方法
    onRemove: function(graphicLayer){
        //if(this._renderedObject && this._container){
        //    this._container.remove(this._renderedObject);
        //    //this._disposeRenderedObject(this._renderedObject);
        //}
        //
        ////this._renderedObject = null;
        //this._container = null;
        //this._layer = null;
        //this._scene = null;
        //this._added = false;
    },

    //getRenderedObject: function(baseIndex, layerIndex){
    //    if(this._graphic){
    //        var geometry = this.buildGeometry(this._graphic.feature.shape),
    //            material = this.buildMaterial(this._graphic.symbol);
    //        //this._enableZIndex(material);
    //
    //        var  graphicObject = this.buildGraphicObject(geometry, material);
    //
    //        this._attachGraphic(graphicObject);
    //        this._enableTransparent(graphicObject);
    //        //Z.ZIndexManager.setZIndex(graphicObject, layerIndex, baseIndex);
    //
    //        return graphicObject;
    //    }else{
    //        return null;
    //    }
    //},
    //
    //buildGeometry: function(shape){},
    //
    //buildMaterial: function(symbol){},
    //
    //buildGraphicObject: function(geometry, material){
    //    return new THREE.Mesh(geometry, material);
    //},
    //
    //updateGeometry: function(shape){
    //    if(this._renderedObject){
    //        var newGeometry = this.buildGeometry(shape);
    //
    //        if(newGeometry instanceof Array && newGeometry.length === 1){
    //            if(newGeometry.length <= 0){
    //                this._renderedObject.geometry = new THREE.Geometry();
    //            }else if(newGeometry.length === 1){
    //                this._renderedObject.geometry = newGeometry[0];
    //            }else{
    //                this._updateGraphic();
    //            }
    //        }else{
    //            this._renderedObject.geometry = newGeometry;
    //        }
    //    }
    //},
    //
    //updateSymbol: function(symbol){
    //    this._updateGraphic();
    //},
    //
    ////showTitle: function(titleSymbol){
    ////    dgdg
    ////},
    ////
    ////getTitleAnchorPoint: function(){
    ////    mh
    ////},
    //
    ////getBBoxForScene: function(){
    ////    if(this._renderedObject){
    ////        this._renderedObject.computeBoundingBox();
    ////        var bbox = this._renderedObject.boundingBox;
    ////
    ////        return Z.GLBounds.create(Z.ThreejsUtil.vector2GLPoint(bbox.min), Z.ThreejsUtil.vector2GLPoint(bbox.max));
    ////    }else{
    ////        return null;
    ////    }
    ////},
    //
    //dispose: function(){
    //    if(this._added){
    //        this.onRemove(this._layer);
    //    }
    //
    //    this._disposeRenderedObject(this._renderedObject);
    //    this._renderedObject = null;
    //},
    //
    refresh: function(){

    },
    //
    ////setScale: function(scale){    //{x, y, z}
    ////    if(this._renderedObject){
    ////        //this._renderedObject.scale.set(scale.x, scale.y, scale.z);
    ////        this._setGeometryScale(this._renderedObject, scale);
    ////    }
    ////},
    ////
    ////_setGeometryScale: function(obj, scale){
    ////    var geo = obj ? obj.geometry : null;
    ////
    ////    if(geo){
    ////        //this._renderedObject.geometry.scale(scale.x, scale.y, scale.z);
    ////        geo.computeBoundingBox();
    ////        var gCenter = geo.boundingBox.min.clone().add(geo.boundingBox.max.clone()).divideScalar(2),//geo.center(),
    ////            points = geo.vertices;
    ////
    ////        for(var i = 0; i < points.length; i++){
    ////            //var curP = points[i],
    ////            //    offset = curP.clone().sub(gCenter);
    ////            //curP.x = offset.x * scale.x + gCenter.x;
    ////            //curP.y = offset.y * scale.y + gCenter.y;
    ////            //curP.z = offset.z * scale.z + gCenter.z;
    ////            var curP = points[i];
    ////            curP.x = (curP.x - gCenter.x) * scale.x + gCenter.x;
    ////            curP.y = (curP.y - gCenter.y) * scale.y + gCenter.y;
    ////            curP.z = (curP.z - gCenter.z) * scale.z + gCenter.z;
    ////        }
    ////
    ////        geo.verticesNeedUpdate = true;
    ////    }
    ////
    ////    if(obj.children.length > 0){
    ////        for(var j = 0; j < obj.children.length; j++){
    ////            this._setGeometryScale(obj.children[j], scale);
    ////        }
    ////    }
    ////},
    //
    //_enableZIndex: function(material){
    //    Z.ZIndexManager.enableZIndex(material);
    //},
    //
    //_attachGraphic: function(graphicObject){
    //    if(graphicObject){
    //        if(graphicObject.children.length > 0){
    //            for(var i = 0; i < graphicObject.children.length; i++){
    //                this._attachGraphic(graphicObject.children[i]);
    //            }
    //        }else if(!graphicObject._disableMouseEvent){
    //            graphicObject._graphicObj = this._graphic.ownerGraphic;
    //        }
    //    }
    //},
    //
    //_enableTransparent: function(graphicObject){
    //    if(graphicObject){
    //        if(graphicObject.material){
    //            graphicObject.material.transparent = true;
    //            //graphicObject.material.needsUpdate = true;
    //        }else if(graphicObject.children.length > 0){
    //            for(var i = 0; i < graphicObject.children.length; i++){
    //                this._enableTransparent(graphicObject.children[i]);
    //            }
    //        }
    //    }
    //},
    //
    //_latLngPointToScene: function(latLngVector){    //latLngVector=>THREE.Vector3
    //    var latLng = new Z.LatLng(latLngVector.y, latLngVector.x, latLngVector.z);
    //    var scenePoint = this._layer.latLngToLayerScenePoint(latLng);
    //
    //    return new THREE.Vector3(scenePoint.x, scenePoint.y, scenePoint.z);
    //},
    //
    //_updateGraphic: function(){
    //    if(this._renderedObject){
    //        //this.disposeRenderedObject();
    //        var  graphicObject = this.getRenderedObject(this._baseIndex, this._layerIndex);
    //        this._container.remove(this._renderedObject);
    //        var oldObject = this._renderedObject;
    //        this._renderedObject = graphicObject;
    //        this._container.add(this._renderedObject);
    //        this._disposeRenderedObject(oldObject);
    //    }
    //},
    //
    //_disposeRenderedObject: function(object){
    //    if(!object){
    //        return;
    //    }
    //
    //    var childrenLength = object.children.length;
    //
    //    for(var i = 0; i < childrenLength; i++){
    //        this._disposeRenderedObject(object.children[i]);
    //    }
    //
    //    this._disposeMaterial(object.material);
    //},
    //
    //_disposeMaterial: function(material){
    //    if(!material){
    //        return;
    //    }
    //
    //    if(material.materials){
    //        var materialsLength = material.materials.length;
    //
    //        for(var i = 0; i < materialsLength; i++){
    //            this._disposeMaterial(material.materials[i]);
    //        }
    //    }else{
    //        if(material.texture){
    //            material.texture.dispose();
    //        }
    //
    //        if(material.dispose){
    //            material.dispose();
    //        }
    //    }
    //}
});