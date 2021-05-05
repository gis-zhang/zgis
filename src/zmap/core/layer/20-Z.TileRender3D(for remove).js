/**
 * Created by Administrator on 2015/10/31.
 */
Z.TileRender3D = Z.ITileRender.extend({
    initialize: function(urls, options){
        this._scene = null;
            //_visible: true,
        this._tiles = {};
        this._options = {};
        this._renderTileSize = null;
        this._containerPane = null;
        this._tileMaterial = null;
        this._pyramidModel = null;
        this._dragStartPoint = null;
        this._zIndex = 0;

        var urlsType = typeof urls;
        this._urls = urlsType === "array" ? urls : (urlsType === "string" ? [urls] : []);
        this._options = Z.Util.applyOptions(this._options, options, true);
        this._tileRoot = new Z.SceneThreePaneItem();
        this._initPyramidModel(this._options);
        this._initTileMaterial();
    },

    getTileUrl: function(level, row, col){
        var url = this._urls[(row + col)%this._urls.length];

        return url + "/" + level + "/" + row + "/" + col;
    },

    onAdd: function(scene, index, containerPane){
        if(!(scene instanceof Z.Scene3D) || !(containerPane instanceof Z.SceneThreePaneItem)){
            return;
        }

        var tileIndex = index;

        if(!(typeof tileIndex === "number")){
            tileIndex = containerPane.getMaxChildIndex() + 1;
        }

        this._scene = scene;

        //if(containerPane instanceof Z.SceneThreePaneItem){
            //containerPane.root.add(this._tileRoot);
            this._tileRoot.index = tileIndex;
            containerPane.addChild(this._tileRoot, tileIndex);
            this._containerPane = containerPane;
        //}

        this._addEvents();
        this._reset();
        this._update();
        //this.setBaseIndex(containerPane.index);
        //this._zIndex = tileIndex;
        //this._setTileZIndex(containerPane.index + tileIndex);
        //this._setTileZIndex(tileIndex);
        this.setZIndex(tileIndex);

        this._scene.refresh();

        //return containerPane.index + tileIndex;
        return tileIndex;
    },

    onRemove: function(scene){
        //this._scene.off({"viewreset": this._reset(),
        //    "moveend": this._update()});
        this._reset();
        this._removeEvents();

        if(this._containerPane){
            //this._containerPane.root.remove(this._tileRoot);
            this._containerPane.removeChild(this._tileRoot);
            this._containerPane = null;
        }

        this._scene.refresh();
        this._scene = undefined;
    },

    show: function(){
        this._tileRoot.show();
    },

    hide: function(){
        this._tileRoot.hide();
    },

    setOpacity: function(opacity){
        if(typeof opacity !== "number"){
            return;
        }

        opacity = Math.min(1, Math.max(opacity, 0));
        this._tileMaterial.opacity = opacity;

        for (var key in this._tiles) {
            this._tiles[key].material.opacity = opacity;
        }
    },

    /*叠加次序控制分为两个层次：一个是对图层组层面的叠加顺序，包括baseBgPane、baseOverPane、layerPane等，通过设置polygonOffsetFactor实现。每个
    * 图层组内部的各个图层的polygonOffset都相同，他们之间的叠加顺序通过设置renderOrder来实现
    * setBaseIndex用于控制图层组的叠加顺序，setZIndex用于控制同一图层组内部各个图层间的叠加顺序，每个图层组内部的叠加顺序都以0开始，值大的叠加在上面*/
    //setBaseIndex: function(baseIndex){
    //    var factor = 1 - baseIndex, units = 1 - baseIndex;
    //    //this._tileMaterial.polygonOffset = true;
    //    this._tileMaterial.polygonOffsetFactor = factor;
    //    this._tileMaterial.polygonOffsetUnits = units;
    //
    //    for (var key in this._tiles) {
    //        //this._tiles[key].material.polygonOffset = true;
    //        this._tiles[key].material.polygonOffsetFactor = factor;
    //        this._tiles[key].material.polygonOffsetUnits = units;
    //    }
    //},

    setZIndex: function(zIndex){
        if(typeof zIndex !== "number" || !this._containerPane){
            return;
        }

        this._zIndex = zIndex;
        this._containerPane.setChildIndex(this._tileRoot, zIndex);

        //this._setTileZIndex(this._containerPane.index + zIndex);
        this._setTileZIndex(zIndex, this._containerPane.index);
    },

    _setTileZIndex: function(zIndex, containerPaneIndex){
        for (var key in this._tiles) {
            //this._tiles[key].renderOrder = this._containerPane.index * Z.Globe.Layer.layerGroupSize + zIndex;
            Z.ZIndexManager.setZIndex(this._tiles[key], zIndex, containerPaneIndex);
        }
    },

    refresh: function(tileOptions){
        //var leafTileOptions = this._getLeafletOptions(tileOptions);
        //
        //for(var opt in leafTileOptions){
        //    if(leafTileOptions[opt] !== undefined){
        //        this._leafletLayer[opt] = leafTileOptions[opt];
        //    }
        //}
    },

    _initPyramidModel: function(options){
        var pyramidOptions = {
            //latLngBounds: this._latLngBounds.clone(),
            origin: options.tileInfo.origin,
            tileSize: Z.Point.create(options.tileInfo.tileWidth, options.tileInfo.tileHeight),
            levelDefine: options.tileInfo.levelDefine
        };

        this._pyramidModel = new Z.PyramidModel(pyramidOptions);
    },

    _initTileMaterial: function(){
        //var mat = new THREE.MeshLambertMaterial({
        var mat = new THREE.MeshBasicMaterial({
            //polygonOffset: true,
            //polygonOffsetFactor: 1,
            //polygonOffsetUnits: 1,
            transparent: true,
            opacity: 1,
            fog: true
        });

        Z.ZIndexManager.enableZIndex(mat);
        this._tileMaterial = mat;
    },

    _addEvents: function(){
        var thisObj = this;
        //this._scene.on({"viewreset": thisObj._reset,
        //    "moveend": thisObj._update});
        this._scene.on("viewreset", thisObj._onViewReset, thisObj);
        this._scene.on("zoomlevelschange", thisObj._onZoomChange, thisObj);
        //this._scene.on("moveend", thisObj._update, thisObj);
        //this._scene.on("rotateend", thisObj._update, thisObj);
        this._scene.on("dragstart", thisObj._onDragStart, thisObj);
        this._scene.on("drag", this._onDrag, thisObj);
        this._scene.on("dragend", thisObj._onDragEnd, thisObj);
    },

    _removeEvents: function(){
        var thisObj = this;
        this._scene.off("viewreset", thisObj._onViewReset, thisObj);
        this._scene.off("zoomlevelschange", thisObj._onZoomChange, thisObj);
        //this._scene.off("moveend", thisObj._update, thisObj);
        //this._scene.off("rotateend", thisObj._update, thisObj);
        this._scene.off("dragstart", thisObj._onDragStart, thisObj);
        this._scene.off("drag", this._onDrag, thisObj);
        this._scene.off("dragend", thisObj._onDragEnd, thisObj);
    },

    _onViewReset: function(e){
        this._update();
        //this._setTileZIndex(this._containerPane.index + this._zIndex);
        //this._setTileZIndex(this._zIndex);
        this.setZIndex(this._zIndex);
        this._scene.refresh();
    },

    _onZoomChange: function(e){
        this._reset();
        this._update();
        //this.setBaseIndex(this._containerPane.index);
        //this._setTileZIndex(this._zIndex);
        this.setZIndex(this._zIndex);
        this._scene.refresh();
    },

    _onDragStart: function(e){
        this._dragStartPoint = this._tileRoot.root.position.clone();
    },

    _onDrag: function(e){
        //var sceneObj = this._scene;
        //var startPoint = sceneObj.screenPointToScenePoint(e.startPoint);
        //var newPoint = sceneObj.screenPointToScenePoint(e.newPoint);
        //var delta = newPoint.subtract(startPoint);
        //this._tileRoot.root.position.x = this._dragStartPoint.x + delta.x;
        //this._tileRoot.root.position.y = this._dragStartPoint.y + delta.y;
        //this._tileRoot.root.position.z = this._dragStartPoint.z + delta.z;
        //this._update();
        this._scene.refresh();
    },

    _onDragEnd: function(e){
        var sceneObj = this._scene;
        var startPoint = sceneObj.screenPointToScenePoint(e.startPoint);
        var newPoint = sceneObj.screenPointToScenePoint(e.newPoint);
        //var delta = newPoint.subtract(startPoint);
        this._tileRoot.root.position.x = this._dragStartPoint.x;
        this._tileRoot.root.position.y = this._dragStartPoint.y;
        this._tileRoot.root.position.z = this._dragStartPoint.z;
        //var key, tile;
        //
        //for (key in this._tiles) {
        //    tile = this._tiles[key];
        //    tile.position.x += delta.x;
        //    tile.position.y += delta.y;
        //    tile.position.z += delta.z;
        //}
        //this._translateByGL(startPoint, newPoint);

        this._dragStartPoint =null;
        //this._update();
    },

    //_translateByGL: function(startPoint, endPoint){
    //    var delta = endPoint.subtract(startPoint);
    //    var key, tile;
    //
    //    for (key in this._tiles) {
    //        tile = this._tiles[key];
    //        tile.position.x += delta.x;
    //        tile.position.y += delta.y;
    //        tile.position.z += delta.z;
    //    }
    //},

    _disposeTiles: function(){
        for (var key in this._tiles) {
            try{
                if(this._tiles[key].material){
                    if(this._tiles[key].material.map){
                        this._tiles[key].material.map.dispose();
                    }

                    this._tiles[key].material.dispose();
                }

                //delete this._tiles[key];
            }catch(e){}
        }

        this._tiles = {};
    },

    _reset: function (e) {
        for (var key in this._tiles) {
            this.fire('tileunload', { tile: this._tiles[key] });
        }

        //this._tiles = {};
        this._disposeTiles();
        this._renderTileSize = null;
        this._containerPane.removeChild(this._tileRoot);
        this._tileRoot.resetRoot();
        this._containerPane.addChild(this._tileRoot);
        //Z.ThreejsUtil.clearObject3D(this._tileRoot.root);
        //this._tilesToLoad = 0;
        //
        //if (this.options.reuseTiles) {
        //    this._unusedTiles = [];
        //}
        //
        //this._tileContainer.innerHTML = '';
        //
        //if (this._animated && e && e.hard) {
        //    this._clearBgBuffer();
        //}

        //this._initContainer();
        //this._tileRoot.root =this._tileRoot.createRootObject();
        this._initTileMaterial();
    },

    _update: function () {
        if (!this._scene || !this._pyramidModel) { return; }

        var latLngContentBounds = this._scene.getContentBounds(),
            latLngOrthoBounds = this._scene.getBounds(),
            size = this._scene.getSize(),
            sceneScale = this._scene.getScale(),
            fitLevel = this._pyramidModel.fitZoomLevel(latLngOrthoBounds, size.x, size.y);

        var tileBounds = this._pyramidModel.getTileBounds(latLngContentBounds, fitLevel.level);
        this._updateTiles(tileBounds, fitLevel.level);

        //if (!this._map) { return; }
        //
        //var map = this._map,
        //    bounds = map.getPixelBounds(),
        //    zoom = map.getZoom(),
        //    tileSize = this._getTileSize();
        //
        //if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
        //    return;
        //}
        //
        //var tileBounds = L.bounds(
        //    bounds.min.divideBy(tileSize)._floor(),
        //    bounds.max.divideBy(tileSize)._floor());
        //
        //this._addTilesFromCenterOut(tileBounds);
        //
        //if (this.options.unloadInvisibleTiles || this.options.reuseTiles) {
        //    this._removeOtherTiles(tileBounds);
        //}
    },

    _updateTiles: function(tileBounds, zoom){
        this._updateTilesPos();

        var queue = [];//,
            //center = tileBounds.getCenter(),
            //bottomCenterX = center.x,
            //bottomCenterY = center.y + Math.floor(tileBounds.getSize / 2);

        var j, i, point;

        for (j = tileBounds.min.y; j <= tileBounds.max.y; j++) {
            for (i = tileBounds.min.x; i <= tileBounds.max.x; i++) {
                point = new Z.Point(i, j, zoom);

                if (this._tileShouldBeLoaded(point)) {
                    queue.push(point);
                }
            }
        }

        var tilesToLoad = queue.length;

        if (tilesToLoad === 0) { return; }

        // load tiles in order of their distance to center
        queue.sort(function (a, b) {
            return b.y - a.y;
        });

        if(!this._renderTileSize){
            this._renderTileSize = this._getRenderTileSize(queue[0]);
        }

        var tileContainer = this._tileRoot.root;

        //// if its the first batch of tiles to load
        //if (!this._tilesToLoad) {
        //    this.fire('loading');
        //}

        //this._tilesToLoad += tilesToLoad;

        for (i = 0; i < tilesToLoad; i++) {
            this._addTile(queue[i], tileContainer);
        }

        this._removeInvisibleTiles(tileBounds);
    },

    _updateTilesPos: function(){
        //_getTilePos
        var delta = null, key, tile;

        for (key in this._tiles) {
            tile = this._tiles[key];

            if(!delta){
                var kArr = key.split(':'), x, y, newPos, oldPos;
                x = parseInt(kArr[0], 10);
                y = parseInt(kArr[1], 10);
                newPos = this._getTilePos(new Z.Point(x, y));
                oldPos = new Z.Point(tile.position.x, tile.position.y, tile.position.z);
                delta = newPos.subtract(oldPos);
            }

            tile.position.x += delta.x;
            tile.position.y += delta.y;
            tile.position.z += delta.z;
        }
    },

    _tileShouldBeLoaded: function (tilePoint) {
        //瓦片是否已加载
        if ((tilePoint.x + ':' + tilePoint.y) in this._tiles) {
            return false;
        }

        //瓦片是否超出最大地图范围
        var maxTileBounds = this._pyramidModel.getTileBounds(this._scene.options.maxBounds, this._scene.getZoom());

        if(tilePoint.x < maxTileBounds.min.x || tilePoint.x > maxTileBounds.max.x
            || tilePoint.y < maxTileBounds.min.y|| tilePoint.y > maxTileBounds.max.y){
            return false;
        }

        //var options = this.options;
        //
        //if (!options.continuousWorld) {
        //    var limit = this._getWrapTileNum();
        //
        //    // don't load if exceeds world bounds
        //    if ((options.noWrap && (tilePoint.x < 0 || tilePoint.x >= limit.x)) ||
        //        tilePoint.y < 0 || tilePoint.y >= limit.y) { return false; }
        //}
        //
        //if (options.bounds) {
        //    var tileSize = options.tileSize,
        //        nwPoint = tilePoint.multiplyBy(tileSize),
        //        sePoint = nwPoint.add([tileSize, tileSize]),
        //        nw = this._map.unproject(nwPoint),
        //        se = this._map.unproject(sePoint);
        //
        //    // TODO temporary hack, will be removed after refactoring projections
        //    // https://github.com/Leaflet/Leaflet/issues/1618
        //    if (!options.continuousWorld && !options.noWrap) {
        //        nw = nw.wrap();
        //        se = se.wrap();
        //    }
        //
        //    if (!options.bounds.intersects([nw, se])) { return false; }
        //}

        return true;
    },

    _getRenderTileSize: function(tilePoint){
        var tileLatLngBounds = this._pyramidModel.getLatLngBounds(tilePoint, this._scene.getZoom()),
            southWest = this._scene._latLngToGLPoint(tileLatLngBounds.getSouthWest()),
            northEast = this._scene._latLngToGLPoint(tileLatLngBounds.getNorthEast());

        return new Z.Point(Math.abs(southWest.x - northEast.x), Math.abs(southWest.y - northEast.y));
    },

    _addTile: function(tilePoint, container){
        var tilePos = this._getTilePos(tilePoint);
        var tile = this._getTile();
        this._setTilePos(tile, tilePos);

        this._tiles[tilePoint.x + ':' + tilePoint.y] = tile;

        this._loadTile(tile, tilePoint);

        if(tile.parent !== container){
            container.add(tile);
        }
    },

    _getTilePos: function(tilePoint){
        var tileLatLngBounds = this._pyramidModel.getLatLngBounds(tilePoint, this._scene.getZoom());
        var tileCenter = tileLatLngBounds.getCenter();

        return this._scene._latLngToGLPoint(tileCenter);
    },

    _getTile: function(){
        var geom = new THREE.PlaneBufferGeometry(this._renderTileSize.x, this._renderTileSize.y, 1, 1);
        var tileObj = new THREE.Mesh(geom, this._tileMaterial.clone());
        tileObj.receiveShadow = true;
        Z.ZIndexManager.setZIndex(tileObj, this._zIndex, this._containerPane.index);

        return tileObj;
    },

    _setTilePos: function(tile, pos){
        tile.position.x = pos.x;
        tile.position.y = pos.y;
        tile.position.z = pos.z;
    },

    _loadTile: function (tile, tilePoint) {
        var level = this._options.zoomOffset ? (tilePoint.z + this._options.zoomOffset) : tilePoint.z;
        var tileUrl = this.getTileUrl(level, tilePoint.y, tilePoint.x);
        var thisObj = this;

        var successFunc = function(){
            thisObj._scene.refresh();
        };

        var errorFunc = function(){
            thisObj._removeTile(tilePoint.x + ':' + tilePoint.y);
            //tile.material.map = THREE.ImageUtils.loadTexture(
            //    thisObj._options.errorTileUrl,
            //    {},
            //    function(){
            //        thisObj._scene.refresh();
            //    }
            //);
            tile.material.map = Z.ImageTextureManager.createTexture(
                thisObj._options.errorTileUrl,
                {},
                function(){thisObj._scene.refresh();}
            );
        };
        var texture = Z.ImageTextureManager.createTexture(tileUrl, {}, successFunc, errorFunc, thisObj);
            //var texture = THREE.ImageUtils.loadTexture(
        //    tileUrl,
        //    {},
        //    function(){
        //        thisObj._scene.refresh();
        //    },
        //    function(){
        //        thisObj._removeTile(tilePoint.x + ':' + tilePoint.y);
        //        tile.material.map = THREE.ImageUtils.loadTexture(
        //            thisObj._options.errorTileUrl,
        //            {},
        //            function(){
        //                thisObj._scene.refresh();
        //            });
        //    });
        texture.premultiplyAlpha = false;
        texture.anisotropy = this._scene.getMaxAnisotropy();
        //texture.minFilter = THREE.LinearFilter;
        tile.material.map = texture;
        tile._tileUrl = tileUrl;

        this.fire('tileloadstart', {
            tile: tile,
            url: tileUrl
        });
    },

    /*移除不可见瓦片*/
    _removeInvisibleTiles: function(tileBounds){
        var kArr, x, y, key, forMoved = [];

        for (key in this._tiles) {
            kArr = key.split(':');
            x = parseInt(kArr[0], 10);
            y = parseInt(kArr[1], 10);

            // remove tile if it's out of bounds
            if (x < tileBounds.min.x || x > tileBounds.max.x || y < tileBounds.min.y || y > tileBounds.max.y) {
                //this._removeTile(key);
                forMoved.push(key);
            }
        }

        for (key in forMoved) {
            this._removeTile(forMoved[key]);
        }
    },

    _removeTile: function (key) {
        var tile = this._tiles[key];

        if(tile){
            this.fire('tileunload', { tile: tile, url: tile._tileUrl });
            this._tileRoot.root.remove(tile);

            if(tile.material){
                if(tile.material.texture){
                    tile.material.texture.dispose();
                }

                tile.material.dispose();
            }
        }

        delete this._tiles[key];
    }
});