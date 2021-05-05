/**
 * Created by Administrator on 2015/10/31.
 */
Z.TileAggregatedRender3D = Z.ITileRender.extend({
    initialize: function(urls, options){
        this._scene = null;
            //_visible: true,
        this._tiles = {};
        this._options = {};
        this._renderTileSize = null;
        this._containerPane = null;
        //this._tileMaterial = null;
        /**************************************************/
        //this._tilePlane = null;
        //this._tileTexture = new Z.TileCanvasTexture({
        //    padding: 0,
        //    autoWidth: false,
        //    autoHeight: false,
        //    fill: false,
        //    border: false
        //});
        //this._tileTexture = new Z.CommonCanvasTexture({
        //    padding: 0,
        //    autoWidth: false,
        //    autoHeight: false,
        //    fill: false,
        //    border: false
        //});
        //this._tileTexture = Z.AggragatedSurfaceTexture;
        //this._tileTexture = new Z.TextCanvasTexture({
        //    padding: 5,                //内边距，单位为像素
        //    autoWidth: true,         //是否根据内容自动计算宽度
        //    autoHeight: true,        //是否根据内容自动计算高度
        //    //bgColor: 0xffffff,
        //    //bgOpacity: 1,            //默认背景不透明
        //    opacity: 1
        //});
        this._tileImages = [];
        /**************************************************/
        //this._pyramidModel = null;
        this._dragStartPoint = null;
        this._zIndex = 0;

        this._urls = (urls instanceof Array) ? urls : (typeof urls === "string" ? [urls] : []);
        this._options = Z.Util.applyOptions(this._options, options, true);
        this._tileRoot = new Z.SceneThreePaneItem();
        //this._initPyramidModel(this._options);
        this._pyramidModel = this._options.pyramidModel;
        //this._initTileMaterial();

        this._renderId = Z.Util.stamp(this, "layerRender");
        //this._tileTexture.addSurfaceLayer(this._renderId);

        this._scaleTolerance = 0.000001;
    },

    getTileUrl: function(level, row, col){
        var url = this._urls[(row + col)%this._urls.length];

        return url + "/" + level + "/" + row + "/" + col;
    },

    onAdd: function(scene, index, containerPane, groupPane){
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

        Z.SingleTerrainPlane.getInstance().addSurfaceLayer(this._renderId, "image");

        //if(!this._pyramidModel){
        //    this._initPyramidModel(this._options);
        //}

        this._addEvents();
        this._reset();
        this._update();
        this.setZIndex(tileIndex);

        this._scene.refresh();

        //return containerPane.index + tileIndex;
        return tileIndex;
    },

    onRemove: function(scene){
        this._reset();
        this._removeEvents();

        if(this._containerPane){
            this._containerPane.removeChild(this._tileRoot);
            this._containerPane = null;
        }

        Z.SingleTerrainPlane.getInstance().removeSurfaceLayer(this._renderId);

        this._scene.refresh();
        this._scene = undefined;
    },

    show: function(){
        //this._tileRoot.show();
        Z.SingleTerrainPlane.getInstance().addSurfaceLayer(this._renderId, "image");
    },

    hide: function(){
        //this._tileRoot.hide();
        Z.SingleTerrainPlane.getInstance().removeSurfaceLayer(this._renderId);
    },

    setOpacity: function(opacity){
        //if(typeof opacity !== "number"){
        //    return;
        //}
        //
        //opacity = Math.min(1, Math.max(opacity, 0));
        //this._tileMaterial.opacity = opacity;
        //
        ////for (var key in this._tiles) {
        ////    this._tiles[key].material.opacity = opacity;
        ////}
    },

    setZIndex: function(zIndex){
        if(typeof zIndex !== "number" || !this._containerPane){
            return;
        }

        this._zIndex = zIndex;
        //this._containerPane.setChildIndex(this._tileRoot, zIndex);
        Z.SingleTerrainPlane.getInstance().updateLayerIndex(
            this._renderId,
            zIndex
        );

        //this._setTileZIndex(zIndex, this._containerPane.index);
    },

    //_setTileZIndex: function(zIndex, containerPaneIndex){
    //    for (var key in this._tiles) {
    //        //this._tiles[key].renderOrder = this._containerPane.index * Z.Globe.Layer.layerGroupSize + zIndex;
    //        Z.ZIndexManager.setZIndex(this._tiles[key], zIndex, containerPaneIndex);
    //    }
    //},

    refresh: function(tileOptions){

    },

    //_initPyramidModel: function(options){
    //    var pyramidOptions = {
    //        //latLngBounds: this._latLngBounds.clone(),
    //        origin: options.tileInfo.origin,
    //        tileSize: Z.Point.create(options.tileInfo.tileWidth, options.tileInfo.tileHeight),
    //        levelDefine: options.tileInfo.levelDefine
    //    };
    //
    //    if(this._scene){
    //        pyramidOptions.crs = this._scene.options.crs;
    //    }
    //
    //    ////this._pyramidModel = new Z.PyramidModel(pyramidOptions);
    //    //this._pyramidModel = new Z.CustomPyramidModel(pyramidOptions);
    //    this._pyramidModel = Z.PyramidModelFactory.create(pyramidOptions);
    //},

    _addEvents: function(){
        var thisObj = this;
        //this._scene.on({"viewreset": thisObj._reset,
        //    "moveend": thisObj._update});
        this._scene.on("viewreset", thisObj._onViewReset, thisObj);
        this._scene.on("zoomlevelschange", thisObj._onZoomChange, thisObj);
        //this._scene.on("moveend", thisObj._update, thisObj);
        //this._scene.on("rotateend", thisObj._update, thisObj);
        //this._scene.on("dragstart", thisObj._onDragStart, thisObj);
        //this._scene.on("drag", this._onDrag, thisObj);
        //this._scene.on("dragend", thisObj._onDragEnd, thisObj);
    },

    _removeEvents: function(){
        var thisObj = this;
        this._scene.off("viewreset", thisObj._onViewReset, thisObj);
        this._scene.off("zoomlevelschange", thisObj._onZoomChange, thisObj);
        //this._scene.off("moveend", thisObj._update, thisObj);
        //this._scene.off("rotateend", thisObj._update, thisObj);
        //this._scene.off("dragstart", thisObj._onDragStart, thisObj);
        //this._scene.off("drag", this._onDrag, thisObj);
        //this._scene.off("dragend", thisObj._onDragEnd, thisObj);
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

    _disposeTiles: function(){
        for (var key in this._tiles) {
            this._removeTile(key);
        }

        this._tiles = {};
    },

    _reset: function (e) {
        for (var key in this._tiles) {
            this.fire('tileunload', { tile: this._tiles[key] });
        }

        this._disposeTiles();
        this._renderTileSize = null;
        this._containerPane.removeChild(this._tileRoot);
        this._tileRoot.resetRoot();
        this._containerPane.addChild(this._tileRoot);
        //this._initTileMaterial();
        //Z.TileManager.clear();
    },

    _update: function () {
        if (!this._scene || !this._pyramidModel) { return; }

        var latLngContentBounds = this._scene.getContentBounds(),
            latLngOrthoBounds = this._scene.getBounds(),
            size = this._scene.getSize(),
            sceneScale = this._scene.getScale(),
            fitLevel = this._pyramidModel.fitZoomLevel(latLngOrthoBounds, size.x, size.y);

        var tileBounds = null;

        if(!fitLevel.outOfScaleBounds){
            tileBounds = this._pyramidModel.getTileBounds(latLngContentBounds, fitLevel.level);
        }

        this._updateTiles(tileBounds, fitLevel.level);
    },

    _updateTiles: function(tileBounds, zoom){
        this._updateTilesPos(tileBounds, zoom);
        this._addNewTiles(tileBounds, zoom);
        this._removeInvisibleTiles(tileBounds);
    },

    _updateTilesPos: function(tileBounds, zoom){
        this._tileImages = [];

        for (var key in this._tiles) {
            var tile = this._tiles[key];
            var kArr = key.split(':');
            var x = parseInt(kArr[0], 10);
            var y = parseInt(kArr[1], 10);

            if(tileBounds &&
                x >= tileBounds.min.x && x <= tileBounds.max.x &&
                y >= tileBounds.min.y && y <= tileBounds.max.y &&
                tile._loaded){
                //var newX = x - tileBounds.min.x;
                //var newY = y - tileBounds.min.y;

                this._tileImages.push({
                    image: tile,
                    //point: new Z.Point(newX, newY)
                    point: new Z.Point(x, y)
                });
            }else{
                this._removeTile(key);
            }
        }

        this._drawTileTexture(tileBounds, zoom);
    },

    _drawTileTexture: function(tileBounds, zoom){
        var options = this._getTextureOptions(tileBounds, zoom);
        Z.SingleTerrainPlane.getInstance().updateLayerContent(
            this._renderId,
            this._tileImages,
            options
        );
        //Z.SingleTerrainPlane.getInstance().draw();
    },

    _getTextureOptions: function(tileBounds, zoom){
        var tileSize = this._pyramidModel.getTileSize();

        if(!tileBounds){
            return null;
        }

        var options = {
            width: tileSize.x,
            height: tileSize.y,
            zoom: zoom,                                                             //真实比例尺
            tileZoom: tileBounds.min.z === undefined ? zoom : tileBounds.min.z,   //瓦片的比例尺
            tileBounds: tileBounds,
            pyramidModel: this._pyramidModel
        };

        return options;
    },

    _addNewTiles: function(tileBounds, zoom){
        if(!tileBounds){
            return;
        }

        var queue = [];
        var j, i, point;
        var tileZoom = tileBounds.min.z === undefined ? zoom : tileBounds.min.z;

        for (j = tileBounds.min.y; j <= tileBounds.max.y; j++) {
            for (i = tileBounds.min.x; i <= tileBounds.max.x; i++) {
                point = new Z.Point(i, j, tileZoom);

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

        for (i = 0; i < tilesToLoad; i++) {
            this._addTile(queue[i], tileBounds);
        }

        var anchorTilePoint = new Z.Point((tileBounds.min.x + tileBounds.max.x)/2, tileBounds.max.y);
        Z.TileManager.resort(anchorTilePoint);
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

        return true;
    },

    _getRenderTileSize: function(tilePoint){
        //var tileLatLngBounds = this._pyramidModel.getLatLngBounds(tilePoint, this._scene.getZoom()),
        var tileLatLngBounds = this._pyramidModel.getLatLngBounds(tilePoint, tilePoint.z),
            southWest = this._scene._latLngToGLPoint(tileLatLngBounds.getSouthWest()),
            northEast = this._scene._latLngToGLPoint(tileLatLngBounds.getNorthEast());

        return new Z.Point(Math.abs(southWest.x - northEast.x), Math.abs(southWest.y - northEast.y));
    },

    _addTile: function(tilePoint, tileBounds){
        var tile = this._getTile();
        this._tiles[tilePoint.x + ':' + tilePoint.y] = tile;
        tile._tilePoint = tilePoint;
        this._loadTile(tile, tilePoint, tileBounds);
    },

    _loadTile: function(tile, tilePoint, tileBounds){
        var thisObj = this;
        //var newX = tilePoint.x - tileBounds.min.x;
        //var newY = tilePoint.y - tileBounds.min.y;
        var zoom = tilePoint.z;

        var onSuccess = function(image){
            tile._loaded = true;

            thisObj._tileImages.push({
                image: tile,
                //point: new Z.Point(newX, newY)
                point: tilePoint
            });

            thisObj._drawTileTexture();
        };

        var onError = function(image){};

        //var url = this.getTileUrl(tilePoint.z, tilePoint.y, tilePoint.x);
        var level = this._options.zoomOffset ? (tilePoint.z + this._options.zoomOffset) : tilePoint.z;
        var url = this.getTileUrl(level, tilePoint.y, tilePoint.x);
        tile._src = url;

        Z.TileManager.pushImageObject(tile, onSuccess, onError, thisObj);
    },

    _getTile: function(){
        var image = new Image();
        //var tileSize = this._pyramidModel._tileSize;
        var tileSize = this._pyramidModel.getTileSize();
        image.width = tileSize.x;
        image.height = tileSize.y;

        return image;
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
                this._removeTile(key);
            }
        }
    },

    _removeTile: function (key) {
        var tile = this._tiles[key];

        if(tile){
            this.fire('tileunload', { tile: tile, url: tile._tileUrl });
            Z.TileManager.cancelImageLoad(tile);
        }

        delete this._tiles[key];
    }
});