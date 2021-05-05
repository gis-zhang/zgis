/**
 * Created by Administrator on 2016/8/21.
 */

Z.VectorTileManager = Z.Class.extend({
    includes: Z.EventManager,

    initialize: function(pyramidModel, levelMapping, idProp){
        this._graphicTiles = {};
        //this._graphicToIndexMap = {};
        this._visibleTileBounds = null;           //可视坐标范围（webgl坐标）
        this.tileLoader = null;

        this._pyramidModel = pyramidModel || new Z.PyramidModel();
        this._currentZoom = 1;

        this._levelMapping = levelMapping || [];       //[{start:1, end: 3, toLevel: 1}]

        this.root = new THREE.Object3D();

        this._ooMapping = new Z.ObjectOwnerMapping();
    },

    updateVisibleBBox : function(latLngBounds, screenBounds) {
        var tileBounds = this._getTileBounds(latLngBounds, screenBounds);

        if(!tileBounds){
            return;
        }

        this._currentZoom = tileBounds.min.z;

        var updateTiles = this._getTilesForUpdate(tileBounds);
        this._loadTiles(updateTiles.newTiles);
        this._updateTiles(updateTiles.updateTiles);
        this._removeTiles(updateTiles.invisibleTiles);

        this._visibleTileBounds = tileBounds;
    },

    _getTileBounds : function(latLngBounds, screenBounds){
        if(!latLngBounds || !screenBounds){
            return null;
        }

        var zoom = this._pyramidModel.fitZoomLevel(latLngBounds, screenBounds.x, screenBounds.y),
            level = zoom.level;

        for(var i = 0; i < this._levelMapping.length; i++){
            var mapping = this._levelMapping[i];
            var start = mapping.start,
                end = mapping.end,
                to = mapping.toLevel;

            if(level >= start && level <= end){
                level = to;
                break;
            }
        }

        return this._pyramidModel.getTileBounds(latLngBounds, level);
    },

    _getTilesForUpdate : function(tileBounds){
        tileBounds = tileBounds || this._visibleTileBounds;
        var invisibleTiles = [],
            updateTiles = [],
            newTiles = [],
            thisTiles = {};

        if(this._visibleTileBounds){
            var thisBottomLeft = this._visibleTileBounds.getBottomLeft(),
                thisTopRight = this._visibleTileBounds.getTopRight();

            for(var i = thisBottomLeft.x; i <= thisTopRight.x; i++){
                for(var j = thisBottomLeft.y; j >= thisTopRight.y; j--) {
                    if(i === 0 || j === 0){
                        continue;
                    }

                    var thisKey = this._getTileKey(j, i);
                    thisTiles[thisKey] = 1;
                }
            }
        }

        var newBottomLeft = tileBounds.getBottomLeft(),
            newTopRight = tileBounds.getTopRight()

        for(i = newBottomLeft.x; i <= newTopRight.x; i++){
            for(j = newBottomLeft.y; j >= newTopRight.y; j--) {
                if(i === 0 || j === 0){
                    continue;
                }

                var key = this._getTileKey(j, i);

                if(!thisTiles[key]){
                    newTiles.push(key);
                }else{
                    thisTiles[key] = 2;
                }
            }
        }

        for(key in thisTiles){
            if(thisTiles[key] === 1){
                invisibleTiles.push(key);
            }else if(thisTiles[key] === 2){
                updateTiles.push(key);
            }
        }

        return {
            newTiles: newTiles,
            updateTiles: updateTiles,
            invisibleTiles: invisibleTiles
        }
    },

    _getTileKey : function(row, col){
        return col + "," + row;
    },

    _loadTiles : function(tiles){
        for(var i = 0; i < tiles.length; i++){
            var thisObj = this,
                key = tiles[i];

            var tileObj = this._getTileByKey(key) || this._createTile(key);

            tileObj.load(function(graphic){
                return !thisObj._ooMapping.exist(graphic);
            },function(tile){
                thisObj._updateOneTile(tile);

                thisObj.fire("tileload", {
                    row: tile.row,
                    col: tile.col,
                    zoom: tile.zoom,
                    graphics: tile.graphicObjects
                });
            });
        }
    },

    _parseTileKey : function(key){
        var keyParts = (key || "").split(",");

        return {
            col: parseInt(keyParts[0]),
            row: parseInt(keyParts[1])
        }
    },

    _getTileByKey : function(key){
        if(typeof key !== "string" || key.length <= 0){
            return null;
        }

        if(!this._graphicTiles[key]){
            return null;
        }

        if(this._graphicTiles[key].key !== key){
            this._graphicTiles[key].key = key;
        }

        return this._graphicTiles[key];
    },

    _createTile : function(key){
        var colRow = this._parseTileKey(key);
        var tile = new Z.VectorTile(colRow.row, colRow.col, this._currentZoom);
        tile.tileLoader = this.tileLoader;

        this.root.add(tile.root);
        this._graphicTiles[key] = tile;

        return tile;
    },

    _updateOneTile : function(tile){
        if(!tile){
            return;
        }

        if(tile.needsUpdate) {
            //var objects = this._ooMapping.getUnregisteredObjects(tile.objects);
            //tile.updateTileContent(objects);
            //this._ooMapping.registerObjects(tile, tile.objects);
            var objects = this._ooMapping.getUnregisteredObjects(tile.graphicObjects);
            tile.updateTileContentByGraphic(objects);
            this._ooMapping.registerObjects(tile, tile.graphicObjects);
        }

        tile.updateTilePos();
    },

    _updateTiles : function(tilePoints){
        for(var i = 0; i < tilePoints.length; i++){
            var curTile = this._getTileByKey(tilePoints[i]);
            var needsUpdate = curTile.needsUpdate;
            this._updateOneTile(curTile);

            if(needsUpdate){
                this.fire("tileupdate", {
                    row: curTile.row,
                    col: curTile.col
                });
            }
        }
    },

    _removeTiles : function(tiles){
        var updateTiles = {},
            thisObj = this;

        for(var i = 0; i < tiles.length; i++){
            var curTile = this._getTileByKey(tiles[i]),
                graphicsForRemove = [];

            this.root.remove(curTile.root);

            //var unregisterResult = this._ooMapping.unregisterObjects(curTile, curTile.objects);
            var unregisterResult = this._ooMapping.unregisterObjects(curTile, curTile.graphicObjects);
            this._switchOwnerTile(unregisterResult.owneresNeedsUpdate);

            //curTile.dispose(unregisterResult.removed, function(tile, graphics){
            curTile.disposeByGraphic(unregisterResult.removed, function(tile, graphics){
                var key = thisObj._getTileKey(tile.row, tile.col);
                delete thisObj._graphicTiles[key];

                thisObj.fire("tileremove", {
                    row: tile.row,
                    col: tile.col,
                    graphics: graphics
                });
            });
        }
    },

    _switchOwnerTile: function(tiles){
        for(var i = 0; i < tiles.length; i++){
            var curTile = tiles[i];
            curTile.needsUpdate = true;
            this._updateOneTile(curTile);
        }
    }//,

    //_fireTileRemoveEvent: function(tile, meshesForRemove){
    //    var graphicsForRemove = [];
    //
    //    for(var j = 0; j < meshesForRemove.length; j++){
    //        graphicsForRemove.push(meshesForRemove[j]._graphicObj);
    //    }
    //
    //    this.fire("tileremove", {
    //        row: tile.row,
    //        col: tile.col,
    //        graphics: graphicsForRemove
    //    });
    //},
    //
    //_disposeTile : function(tile){
    //    tile.dispose();
    //
    //    var key = this._getTileKey(tile.row, tile.col);
    //    delete this._graphicTiles[key];
    //}
});


