/**
 * Created by Administrator on 2015/11/20.
 */
Z.SurfacePlane = Z.Class.extend({
    initialize: function(scene, container){
        //this.needsUpdate = false;
        this._scene = scene;
        this._container = container;
        this._tileMaterial = null;
        this._tilePlane = null;
        this._tileTexture = null;
        this._graphicHotAreaTexture = null;

        this._currentZoom = 0;
        this._currentGridZoom = 0;
        //this._currentTileBounds = null;

        this._onAddDone = false;
        var thisObj = this;

        Object.defineProperties(this, {
            needsUpdate: {
                get: function () {
                    if(thisObj._tileTexture){
                        return thisObj._tileTexture.needsUpdate;
                    }else{
                        return false;
                    }
                }
            }
        });

        this._initTileMaterial();
    },

    onAdd: function(scene, pyramidModel, container){
        if(this._onAddDone){
            this.onRemove();
        }

        this._scene = scene;
        this._container = container;
        this._pyramidModel = pyramidModel;
        this._createTilePane();
        this._createHotAreaPane();
        this._appendTilePane();
        this._updateTilePane();

        //this._createHotAreaPane();
        //this._updateHotAreaPaneSize();

        this._applyEvents("on");
        this._onAddDone = true;
        //this.needsUpdate = true;

        //document.getElementById("mapTileContent").appendChild(this._tilePlane.material.map.image);
    },

    onRemove: function(){
        this._scene = null;
        this._container = null;
        this._removeTilePane();
        this._disposeTilePane();
        this._disposeHotAreaPane();
        this._applyEvents("off");
        this._onAddDone = false;
        //this.needsUpdate = true;
    },

    addSurfaceLayer: function(layerId, layerType, layerContent, layerIndex, layerOptions){
        if(this._tileTexture){
            var newLayerOptions = this._getLayerOptions(layerOptions);
            this._tileTexture.addSurfaceLayer(layerId, layerType, layerContent, layerIndex, newLayerOptions);
            //this.draw();
        }

        if(this._graphicHotAreaTexture && layerType === "graphic"){
            this._graphicHotAreaTexture.addSurfaceLayer(layerId, layerType, layerContent, layerIndex, newLayerOptions);
        }

        //this.needsUpdate = true;
    },

    removeSurfaceLayer: function(layerId){
        if(this._tileTexture){
            this._tileTexture.removeSurfaceLayer(layerId);
            //this.draw();
        }

        if(this._graphicHotAreaTexture){
            this._graphicHotAreaTexture.removeSurfaceLayer(layerId);
        }

        //this.needsUpdate = true;
    },

    updateLayerIndex: function(layerId, layerIndex){
        if(this._tileTexture){
            this._tileTexture.updateLayerIndex(layerId, layerIndex);
        }

        if(this._graphicHotAreaTexture){
            this._graphicHotAreaTexture.updateLayerIndex(layerId, layerIndex);
        }

        //this.needsUpdate = true;
    },

    updateLayerContent: function(layerId, layerContent, layerOptions){
        if(this._tileTexture){
            var newLayerOptions = this._getLayerOptions(layerOptions);
            this._tileTexture.updateLayerContent(layerId, layerContent, newLayerOptions);
        }

        if(this._graphicHotAreaTexture){
            var newLayerOptions = this._getLayerOptions(layerOptions);
            this._graphicHotAreaTexture.updateLayerContent(layerId, layerContent, newLayerOptions);
        }

        //this.needsUpdate = true;
    },

    draw: function(){
        //if(!this.needsUpdate){
        //    return;
        //}

        if(this._tileTexture){
            this._tileTexture.clear();
            this._tileTexture.draw();

            if(this._tilePlane.material){
                if(this._tilePlane.material.map){
                    this._tilePlane.material.map.needsUpdate = true;
                }

                console.info("Z.SurfacePlane.draw() done");
                this._tilePlane.material.needsUpdate = true;
            }
        }

        if(this._graphicHotAreaTexture){
            this._graphicHotAreaTexture.clear();
            this._graphicHotAreaTexture.draw();
        }

        //this.needsUpdate = false;
    },

    refresh: function(){
        if(this._tileTexture){
            if(!this._tileTexture.needsUpdate){
                return;
            }

            this.draw();
            this._tileTexture.needsUpdate = false;
        }
    },

    getGraphic: function(layerId, latLng){
        if(this._graphicHotAreaTexture){
            return this._graphicHotAreaTexture.getGraphic(layerId, latLng);
        }else{
            return null;
        }
    },

    enablePolygonOffset: function(polygonOffsetFactor, polygonOffsetUnits){
        var mat = this._tileMaterial;
        mat.polygonOffset = true;
        mat.polygonOffsetFactor = polygonOffsetFactor ? polygonOffsetFactor : (mat.polygonOffsetFactor || 1);
        mat.polygonOffsetUnits = polygonOffsetUnits ? polygonOffsetUnits : (mat.polygonOffsetUnits || 1);
        mat.needsUpdate = true;

        if(this._tilePlane){
            var mat1 = this._tilePlane.material;
            mat1.polygonOffset = true;
            mat1.polygonOffsetFactor = mat.polygonOffsetFactor;
            mat1.polygonOffsetUnits = mat.polygonOffsetUnits;
            mat1.needsUpdate = true;
        }
    },

    disablePolygonOffset: function(){
        this._tileMaterial.polygonOffset = false;
        this._tileMaterial.needsUpdate = true;

        if(this._tilePlane){
            this._tilePlane.material.polygonOffset = false;
            this._tilePlane.material.needsUpdate = true;
        }
    },

    _initTileMaterial: function(){
        //var mat = new THREE.MeshLambertMaterial({
        var mat = new THREE.MeshBasicMaterial({
            //polygonOffset: true,
            //polygonOffsetFactor: 1,
            //polygonOffsetUnits: 1,
            //wireframe: true,
            transparent: true,
            opacity: 1,
            //color: 0xff0000,
            fog: true
        });

        //Z.ZIndexManager.enableZIndex(mat);
        this._tileMaterial = mat;
    },

    _createTilePane: function(){
        var material = this._tileMaterial.clone();
        this._tilePlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
        //this._tilePlane.castShadow = true;
        this._tileTexture = new Z.AggragatedSurfaceTexture();
        var canvasElement = this._tileTexture.getElement();
        var texture = new THREE.Texture(canvasElement);
        texture.minFilter = THREE.NearestFilter;
        //texture.minFilter = THREE.NearestMipMapNearestFilter;
        //texture.maxFilter = THREE.NearestFilter;
        texture.magFilter = THREE.LinearFilter;
        //texture.magFilter = THREE.NearestFilter;
        texture.anisotropy = 256;
        //texture.anisotropy = 1;
        material.map = texture;

        //document.getElementById("mapTileContent").appendChild(canvasElement);
    },

    _createHotAreaPane: function(){
        this._graphicHotAreaTexture = new Z.HotAreaTexture();
    },

    _appendTilePane: function(){
        var added = false,
            container = this._container;

        for(var c = 0; c < container.children.length; c++){
            if(container.children[c] === this._tilePlane){
                added = true;
                break;
            }
        }

        if(!added){
            container.add(this._tilePlane);
            this._tilePlane._graphicObj = this;
        }
    },

    _removeTilePane: function(){
        var added = false,
        container = this._container;

        for(var c = 0; c < container.children.length; c++){
            if(container.children[c] === this._tilePlane){
                added = true;
                break;
            }
        }

        if(added){
            container.remove(this._tilePlane);
        }
    },

    _disposeTilePane: function(){
        if(!this._tilePlane){
            return;
        }

        if(this._tilePlane.material){
            if(this._tilePlane.material.map){
                this._tilePlane.material.map.dispose();
            }

            this._tilePlane.material.dispose();
        }

        this._tilePlane = null;
    },

    _applyEvents: function(onOff){
        var thisObj = this;
        this._scene[onOff]("viewreset", thisObj._onViewReset, thisObj);
        this._scene[onOff]("zoomlevelschange", thisObj._onZoomChange, thisObj);
        // this._scene[onOff]("dragstart", thisObj._onDragStart, thisObj);
        // this._scene[onOff]("drag", this._onDrag, thisObj);
        // this._scene[onOff]("dragend", thisObj._onDragEnd, thisObj);
    },

    _onViewReset: function(e){
        this._updateTilePane();
        //this.draw();
    },

    _onZoomChange: function(e){
        this._renderTileSize = null;
        this._updateTilePane();
        //this.draw();
    },

    _onDragStart: function(e){
        this._dragStartPoint = this._tilePlane.position.clone();
    },

    _onDrag: function(e){
        var sceneObj = this._scene;

        if(!e.startPoint || !e.newPoint){
            return;
        }

        var startPoint = sceneObj.screenPointToScenePoint(e.startPoint);
        var newPoint = sceneObj.screenPointToScenePoint(e.newPoint);

        if(!startPoint || !newPoint){
            return;
        }

        var delta = newPoint.subtract(startPoint);
        this._tilePlane.position.x = this._dragStartPoint.x + delta.x;
        this._tilePlane.position.y = this._dragStartPoint.y + delta.y;
        this._tilePlane.position.z = this._dragStartPoint.z + delta.z;

        this._scene.refresh();
    },

    _onDragEnd: function(e){
        this._tilePlane.position.x = this._dragStartPoint.x;
        this._tilePlane.position.y = this._dragStartPoint.y;
        this._tilePlane.position.z = this._dragStartPoint.z;

        this._dragStartPoint =null;
    },

    _updateTilePane: function(){
        var latLngContentBounds = this._scene.getContentBounds(),
            latLngOrthoBounds = this._scene.getBounds(),
            size = this._scene.getSize(),
            fitLevel = this._pyramidModel.fitZoomLevel(latLngOrthoBounds, size.x, size.y),
            zoom = fitLevel.level;

        //var tileBounds = this._pyramidModel.getTileBounds(latLngContentBounds, zoom);
        var tileBounds = null;

        if(!fitLevel.outOfScaleBounds){
            tileBounds = this._pyramidModel.getTileBounds(latLngContentBounds, zoom);
        }else{
            return;
        }

        this._currentZoom = zoom;
        this._currentGridZoom = tileBounds.min.z === undefined ? zoom : tileBounds.min.z;
        //this._updateTilePaneSize(tileBounds, zoom);
        //this._updateTileTexture(tileBounds, zoom);

        //this._updateHotAreaPaneSize(tileBounds, zoom);
        this._updateTilePaneGeometrySize(tileBounds, zoom);
        this._setTilePlaneGeometryPos(tileBounds, this._currentGridZoom);
        this._updateTileTexture(this._tileTexture, tileBounds, this._currentGridZoom);
        this._updateTileTexture(this._graphicHotAreaTexture, tileBounds, this._currentGridZoom);
    },

    //_updateTilePaneSize: function(tileBounds, level){
    //    this._updateTilePaneGeometrySize(tileBounds, level);
    //    this._updateTileTexture(tileBounds, level);
    //},

    _updateTilePaneGeometrySize: function(tileBounds, level){
        if(!this._renderTileSize){
            this._renderTileSize = this._getRenderTileSize(new Z.Point(tileBounds.min.x, tileBounds.min.y, level));
        }

        var tilesCountX = tileBounds.getSize().x + 1,
            tilesCountY = tileBounds.getSize().y + 1;
        var geom = new THREE.PlaneGeometry(this._renderTileSize.x * tilesCountX, this._renderTileSize.y * tilesCountY);
        this._tilePlane.geometry = geom;
    },

    _getRenderTileSize: function(tilePoint){
        //var tileLatLngBounds = this._pyramidModel.getLatLngBounds(tilePoint, this._scene.getZoom()),
        var tileLatLngBounds = this._pyramidModel.getLatLngBounds(tilePoint, tilePoint.z),
            southWest = this._scene.latLngToScenePoint(tileLatLngBounds.getSouthWest()),
            northEast = this._scene.latLngToScenePoint(tileLatLngBounds.getNorthEast());

        return new Z.Point(Math.abs(southWest.x - northEast.x), Math.abs(southWest.y - northEast.y));
    },

    _setTilePlaneGeometryPos: function(bounds, level){
        if(this._tilePlane){
            var pos = this._getTileBoundsCenter(bounds, level);
            this._tilePlane.position.set(pos.x, pos.y, pos.z);
        }
    },

    _getTileBoundsCenter: function(bounds, level){
        //var tileZoom = bounds.min.z === undefined ? level : bounds.min.z;
        var tileLatLngBounds_min = this._pyramidModel.getLatLngBounds(bounds.min, level),
            tileLatLngBounds_max = this._pyramidModel.getLatLngBounds(bounds.max, level);
        var north = tileLatLngBounds_min.getNorth(),
            west = tileLatLngBounds_min.getWest(),
            south = tileLatLngBounds_max.getSouth(),
            east = tileLatLngBounds_max.getEast();

        return this._scene.latLngToScenePoint(new Z.LatLng((south + north)/2, (east + west)/2));
    },

    _updateTileTexture: function(texture, tileBounds, level){
        var topLeftPixelPoint = this._pyramidModel.getTopLeftPixelPointOfBounds(tileBounds);
        //this._tileTexture.setTileAnchor(topLeftPixelPoint.x, topLeftPixelPoint.y);
        texture.setTileAnchor(topLeftPixelPoint.x, topLeftPixelPoint.y);
        var latLngBounds = this._getLatLngBounds(tileBounds, level);
        //this._tileTexture.setLatLngBounds(latLngBounds);
        texture.setLatLngBounds(latLngBounds);

        var tileSize = this._pyramidModel.getTileSize(),
            tilesCountX = tileBounds.getSize().x + 1,
            tilesCountY = tileBounds.getSize().y + 1;

        var textureSize = this._tileTexture.getSize(),
            newWidth = tilesCountX * tileSize.x,
            newHeight = tilesCountY * tileSize.y;

        if(textureSize.x === newWidth && textureSize.y === newHeight){
            return;
        }

        //this._tileTexture.setTextureSize(newWidth, newHeight);
        texture.setTextureSize(newWidth, newHeight);
    },

    _getLatLngBounds: function(tileBounds, zoom){
        //var tileZoom = tileBounds.min.z === undefined ? zoom : tileBounds.min.z;
        var minLatLngBounds = this._pyramidModel.getLatLngBounds(tileBounds.min, zoom),
            maxLatLngBounds = this._pyramidModel.getLatLngBounds(tileBounds.max, zoom),
            southWest = new Z.LatLng(0, 0),
            northEast = new Z.LatLng(0, 0);
        southWest.lat = maxLatLngBounds.getSouth();
        southWest.lng = minLatLngBounds.getWest();
        northEast.lat = minLatLngBounds.getNorth();
        northEast.lng = maxLatLngBounds.getEast();

        return new Z.LatLngBounds(southWest, northEast);
    },

    //_updateHotAreaPaneSize: function(tileBounds, level){
    //    var topLeftPixelPoint = this._pyramidModel.getTopLeftPixelPoint(tileBounds.min);
    //    this._graphicHotAreaTexture.setTileAnchor(topLeftPixelPoint.x, topLeftPixelPoint.y);
    //
    //    var latLngBounds = this._getLatLngBounds(tileBounds, level);
    //    this._graphicHotAreaTexture.setLatLngBounds(latLngBounds);
    //
    //    var tileTextureSize = this._tileTexture.getSize();
    //    this._graphicHotAreaTexture.setTextureSize(tileTextureSize.x, tileTextureSize.y);
    //},

    _disposeHotAreaPane: function(){
        if(!this._graphicHotAreaTexture){
            return;
        }

        if(this._graphicHotAreaTexture.material){
            if(this._graphicHotAreaTexture.material.map){
                this._graphicHotAreaTexture.material.map.dispose();
            }

            this._graphicHotAreaTexture.material.dispose();
        }

        this._graphicHotAreaTexture = null;
    },

    _getLayerOptions: function(rawOptions){
        if(!rawOptions){
            return;
        }

        if(!rawOptions.tileBounds || !rawOptions.pyramidModel){
            return;
        }

        var layerTopLeftPixelPoint = rawOptions.pyramidModel.getTopLeftPixelPointOfBounds(rawOptions.tileBounds),
            anchor = new Z.LatLng(60, 180),
            layerOrigin = rawOptions.pyramidModel.getOrigin();
        //var layerOriginPixelPoint = this._pyramidModel.latLngToPixelPoint(layerOrigin, this._currentZoom),
        //    curAnchorPixel = this._pyramidModel.latLngToPixelPoint(anchor, this._currentZoom),
        //    rawAnchorPixel = rawOptions.pyramidModel.latLngToPixelPoint(anchor, rawOptions.zoom);
        var layerOriginPixelPoint = this._pyramidModel.latLngToPixelPoint(layerOrigin, this._currentGridZoom),
            curAnchorPixel = this._pyramidModel.latLngToPixelPoint(anchor, this._currentGridZoom),
            rawAnchorPixel = rawOptions.pyramidModel.latLngToPixelPoint(anchor, rawOptions.tileZoom);
        var xScale = curAnchorPixel.x / rawAnchorPixel.x,
            yScale = curAnchorPixel.y / rawAnchorPixel.y;

        var topLeft = new Z.Point();
        topLeft.x = layerOriginPixelPoint.x + layerTopLeftPixelPoint.x * xScale;
        topLeft.y = layerOriginPixelPoint.y + layerTopLeftPixelPoint.y * yScale;

        var newLayerOptions = {
            width: rawOptions.width * xScale,
            height: rawOptions.height * yScale,
            tileBounds: rawOptions.tileBounds,
            topLeft: topLeft,
            pyramidModel: rawOptions.pyramidModel
        };

        return newLayerOptions;
    }
});