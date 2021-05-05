/**
 * Created by Administrator on 2015/12/2.
 */
Z.GraphicRender2D = Z.IGraphicRender.extend({
    initialize: function(graphic){
        this._graphic = graphic;
        this._renderedObject = null;
        //this._container = null;
        //this._baseIndex = null;
        //this._layerIndex = null;
        //this._layer = null;
        //this._scene = null;
        this._added = false;
    },

    //onAdd: function(graphicLayer, container, scene, baseIndex, layerIndex){
    onAdd: function(graphicLayer, container, scene){
        this._container = container;
        this._baseIndex = graphicLayer.getContainerPane().index;
        this._layerIndex = graphicLayer.getZIndex();
        //this._layer = graphicLayer;
        //this._scene = scene;
        //
        if(!this._renderedObject){
            this._renderedObject = this.getRenderedObject(this._baseIndex, this._layerIndex);
        }

        if(this._renderedObject){
            container.addLayer(this._renderedObject);
            this._applyEvents('on');
        }

        this._added = true;
    },

    onRemove: function(graphicLayer){
        if(this._renderedObject && this._container){
            this._container.removeLayer(this._renderedObject);
        }

        this._applyEvents('off');
        this._renderedObject = null;
        this._container = null;
        //this._layer = null;
        //this._scene = null;
        this._added = false;
    },

    getRenderedObject: function(baseIndex, layerIndex){
        var  graphicObject = this.buildGraphicObject(baseIndex, layerIndex);
        graphicObject.graphic = this._graphic.ownerGraphic;

        return graphicObject;
    },

    buildGraphicObject: function(){},

    updateGeometry: function(shape){
        //if(this._renderedObject){
        //    var newGeometry = this.buildGeometry(shape);
        //    this._renderedObject.geometry = newGeometry;
        //}
    },

    updateSymbol: function(symbol){
        //if(this._renderedObject){
        //    //this.disposeRenderedObject();
        //    var  graphicObject = this.getRenderedObject(this._baseIndex, this._layerIndex);
        //    this._container.remove(this._renderedObject);
        //    var oldObject = this._renderedObject;
        //    this._renderedObject = graphicObject;
        //    this._container.add(this._renderedObject);
        //    this._disposeRenderedObject(oldObject);
        //}
    },

    dispose: function(){
        if(this._added){
            this.onRemove();
        }
    },

    refresh: function(){

    },

    _applyEvents: function(onOff){
        var thisObj = this,
            onOff = onOff || 'on';
        var domEvents = ['dblclick', 'click', 'mousedown', 'mouseup', 'mouseover',
                'mouseout', 'mousemove', 'contextmenu'],
            i, len;

        for (i = 0, len = domEvents.length; i < len; i++) {
            this._renderedObject[onOff](domEvents[i], thisObj._onMouseEvent, thisObj);
        }
    },

    _onMouseEvent: function(leafletEvent){
        if(this._renderedObject && this._renderedObject.graphic && this._renderedObject.graphic.fire){
            this._renderedObject.graphic.fire(leafletEvent.type, {
                latlng: Z.LeafletUtil.latLngFromLeaflet(leafletEvent.latlng),
                scenePoint: Z.LeafletUtil.pointFromLeaflet(leafletEvent.layerPoint),
                containerPoint: Z.LeafletUtil.pointFromLeaflet(leafletEvent.containerPoint),
                originalEvent: leafletEvent.originalEvent,
                object: this._renderedObject.graphic
            });
        }
    }
    //
    //_enableZIndex: function(material){
    //    Z.ZIndexManager.enableZIndex(material);
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
    //_setGraphicBaseIndex: function(graphicObject, baseIndex){
    //    if(graphicObject){
    //        if(graphicObject.material){
    //            this._setBaseIndex(graphicObject, baseIndex);
    //        }else if(graphicObject.children.length > 0){
    //            for(var i = 0; i < graphicObject.children.length; i++){
    //                this._setGraphicBaseIndex(graphicObject.children[i], baseIndex);
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