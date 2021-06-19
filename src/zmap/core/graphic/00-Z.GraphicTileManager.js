/**
 * Created by Administrator on 2016/8/21.
 */
Z.GraphicTileManager = function(center, gridWidth, gridHeight){
    this._center = center || new Z.Point(0, 0, 0);
    this._gridWidth = gridWidth || 100;         //单元格网宽度（webgl坐标）
    this._gridHeight = gridHeight || 100;       //单元格网高度（webgl坐标）
    this._graphicTiles = {};
    //this._indexCubeArray = [];
    this._graphicToIndexMap = {};
    this._visibleTileBounds = null;               //可视坐标范围（webgl坐标）
    this.tileLoader = null;

    this._visibleGraphics = {};

    this.root = new THREE.Object3D();
}

Z.GraphicTileManager.prototype.addGraphics = function(graphics){
    graphics = (graphics instanceof Array) ? graphics : [graphics];

    if(graphics.length <= 0){
        return;
    }

    for(var i = 0; i < graphics.length; i++){
        var clonedGraphic = this._cloneGraphic(graphics[i]);
        this._addOneGraphic(clonedGraphic);
    }
}

Z.GraphicTileManager.prototype.deleteGraphics = function(graphics){
    graphics = (graphics instanceof Array) ? graphics : [graphics];

    if(graphics.length <= 0){
        return;
    }

    for(var i = 0; i < graphics.length; i++){
        this._deleteOneGraphic(graphics[i]);
    }
}

Z.GraphicTileManager.prototype._deleteOneGraphic = function(graphic){
    var graphicId = (graphic._rawGraphic || graphic).id;
    var gridNum = this._graphicToIndexMap[graphicId],
        minGrid = gridNum.minGrid,
        maxGrid = gridNum.maxGrid;

    for(var i = minGrid.row; i <= maxGrid.row; i++){
        for(var j = minGrid.col; j <= maxGrid.col; j++){
            if(i === 0 || j === 0){
                continue;
            }

            var tile = this._getTile(j, i);

            if(!tile){
                continue;
            }

            var objects = tile.objects;

            for(var bLoop = 0; bLoop < objects.length; bLoop++){
                if(objects[bLoop]._rawGraphic === graphic){
                    objects.splice(bLoop, 1);
                    tile.needsUpdate = true;
                    break;
                }
            }

            //tile.needsUpdate = true;
        }
    }

    delete this._graphicToIndexMap[graphicId];
    delete this._visibleGraphics[graphicId];
}

Z.GraphicTileManager.prototype.updateGraphic = function(graphic){
    this.deleteGraphic(graphic);
    this.addGraphic(graphic);
}

Z.GraphicTileManager.prototype.updateMatrixWorld = function(matrixWorld){
    for(var key in this._graphicTiles){
        var tile = this._getTileByKey(key);

        if(!tile){
            continue;
        }

        //var cube = tile.cube;
        //cube.updateMatrix();
        //cube.matrixWorld.multiplyMatrices(matrixWorld, cube.matrix );
        tile.matrixWorldNeedsUpdate = true;
        tile.matrixWorld = matrixWorld;
    }
}

Z.GraphicTileManager.prototype._cloneGraphic = function(graphic){
    var newGraphic = graphic.clone();
    newGraphic._rawGraphic = graphic;
    newGraphic.geometry = this._recomputeVertices(graphic);

    return newGraphic;
}

Z.GraphicTileManager.prototype._recomputeVertices = function(mesh){
    var offset = mesh._z_posOffset || {},
        tolerence = 0.00000001,
        newGeometry = mesh.geometry;

    if(offset.x > tolerence || offset.y > tolerence || offset.z > tolerence){
        newGeometry = newGeometry.clone();
        var vertices = newGeometry.vertices;

        for(var i = 0; i < vertices.length; i++){
            vertices[i] = vertices[i].add(offset);
        }
    }

    return newGeometry;
}

Z.GraphicTileManager.prototype._addOneGraphic = function(graphic){
    var bbox = this._getGraphicBbox(graphic),
        minGrid = this._getGridNum(bbox.min),
        maxGrid = this._getGridNum(bbox.max);

    var graphicId = (graphic._rawGraphic || graphic).id;
    this._graphicToIndexMap[graphicId] = {minGrid: minGrid, maxGrid: maxGrid};

    for(var i = minGrid.col; i <= maxGrid.col; i++){
        for(var j = minGrid.row; j <= maxGrid.row; j++){
            if(i === 0 || j === 0){
                continue;
            }

            var tile = this._getTile(j, i);
            tile.objects.push(graphic);
            tile.needsUpdate = true;
        }
    }
}

Z.GraphicTileManager.prototype.refreshVisibleTiles = function(){
    if(this._visibleTileBounds){
        var thisBottomLeft = this._visibleTileBounds.getBottomLeft(),
            thisTopRight = this._visibleTileBounds.getTopRight();

        for(var i = thisBottomLeft.x; i <= thisTopRight.x; i++){
            for(var j = thisBottomLeft.y; j <= thisTopRight.y; j++) {
                if(i === 0 || j === 0){
                    continue;
                }

                var tile = this._getTile(j, i);

                if(!tile){
                    continue;
                }

                this._updateTile(tile);
            }
        }
    }
}

Z.GraphicTileManager.prototype._getGraphicBbox = function(graphics){
    graphics = (graphics instanceof Array) ? graphics : [graphics];
    var minx, miny, minz, maxx, maxy, maxz;

    if(graphics.length === 1){
        var geometry = graphics[0].geometry;

        if(!geometry.boundingBox){
            geometry.computeBoundingBox();
        }

        return geometry.boundingBox;
    }

    for(var buildingLoop = 0; buildingLoop < graphics.length; buildingLoop++){
        var geometry = graphics[buildingLoop].geometry;

        if(!geometry.boundingBox){
            geometry.computeBoundingBox();
        }

        var bbox = geometry.boundingBox;

        if(minx === undefined){
            minx = bbox.min.x;
            miny = bbox.min.y;
            minz = bbox.min.z;
            maxx = bbox.max.x;
            maxy = bbox.max.y;
            maxz = bbox.max.z;
        }else{
            minx = Math.min(minx, bbox.min.x);
            miny = Math.min(miny, bbox.min.y);
            minz = Math.min(minz, bbox.min.z);
            maxx = Math.max(maxx, bbox.max.x);
            maxy = Math.max(maxy, bbox.max.y);
            maxz = Math.max(maxz, bbox.max.z);
        }
    }

    return {min: new THREE.Vector3(minx, miny, minz), max: new THREE.Vector3(maxx, maxy, maxz)};
}

Z.GraphicTileManager.prototype._getTile = function(row, col){
    var key = col + "," + row;

    //if(!this._graphicIndex[key]){
    //    this._graphicIndex[key] = this._createTile();
    //}
    //
    //return this._graphicIndex[key];
    return this._getTileByKey(key);
}

Z.GraphicTileManager.prototype.updateVisibleBBox = function(bbox) {
    //_visibleTileBounds
    var tileBounds = this._getTileBounds(bbox);

    //if(tileBounds.equals(this._visibleTileBounds)){
    //    return;
    //}

    var updateTiles = this._getTilesForUpdate(tileBounds);
    //_tileShouldBeLoaded
    this._loadTiles(updateTiles.newTiles);
    //this._loadTiles(updateTiles.updateTiles);
    this._updateTiles(updateTiles.updateTiles);
    this._removeTiles(updateTiles.invisibleTiles);

    this._visibleTileBounds = tileBounds;
}

Z.GraphicTileManager.prototype._getTileBounds = function(bbox){
    if(!bbox){
        return null;
    }

    var minGrid = this._getGridNum(bbox.min),
        maxGrid = this._getGridNum(bbox.max);

    return Z.GLBounds.create(Z.Point.create(minGrid.col, minGrid.row), Z.Point.create(maxGrid.col, maxGrid.row));
}

Z.GraphicTileManager.prototype._getGridNum = function(vector){
    var colAbs = Math.ceil(Math.abs(vector.x) / this._gridWidth),
        rowAbs = Math.ceil(Math.abs(vector.y) / this._gridHeight);

    return {col: vector.x > 0 ? colAbs : -colAbs, row: vector.y > 0 ? rowAbs : -rowAbs}
}

Z.GraphicTileManager.prototype._getTilesForUpdate = function(tileBounds){
    tileBounds = tileBounds || this._visibleTileBounds;
    var invisibleTiles = [],
        updateTiles = [],
        newTiles = [],
        thisTiles = {};

    if(this._visibleTileBounds){
        var thisBottomLeft = this._visibleTileBounds.getBottomLeft(),
            thisTopRight = this._visibleTileBounds.getTopRight();

        for(var i = thisBottomLeft.x; i <= thisTopRight.x; i++){
            for(var j = thisBottomLeft.y; j <= thisTopRight.y; j++) {
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
        for(j = newBottomLeft.y; j <= newTopRight.y; j++) {
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
}

Z.GraphicTileManager.prototype._getTileKey = function(row, col){
    return col + "," + row;
}

Z.GraphicTileManager.prototype._loadTiles = function(tiles){
    for(var i = 0; i < tiles.length; i++){
        //var colRow = this._parseTileKey(tiles[i]);
        //var curTile = this._getTileByKey(tiles[i]);
        //
        //if(!curTile){
        //    curTile = this._loadOneTile(tiles[i]);
        //}
        var curTile = this._loadOneTile(tiles[i]);

        //if(curTile.tileGraphic){
        //    this.root.remove(curTile.tileGraphic.root);
        //}

        //var graphics = this._loadTileGraphics(colRow.row, colRow.col);
        //
        //if(graphics instanceof Array){
        //    curTile.objects = graphics;
        //    curTile.needsUpdate = true;
        //}

        this._updateOneTile(curTile);

        //if(curTile.tileGraphic){
        //    this.root.add(curTile.tileGraphic.root);
        //}

        Z.GraphicAnimation.animateZValueByStep(curTile.tileGraphic.root, 0.05, 0, 1);
    }
}

Z.GraphicTileManager.prototype._parseTileKey = function(key){
    var keyParts = (key || "").split(",");

    return {
        col: parseInt(keyParts[0]),
        row: parseInt(keyParts[1])
    }
}

//Z.GraphicTileManager.prototype._loadTileGraphics = function(row, col){
//    var graphics = this._tileLoader.load(row, col);
//
//    return graphics;
//}

Z.GraphicTileManager.prototype._getTileByKey = function(key){
    if(typeof key !== "string" || key.length <= 0){
        return null;
    }

    //if(!this._graphicTiles[key]){
    //    this._graphicTiles[key] = this._createTile();
    //}
    if(!this._graphicTiles[key]){
        return null;
    }

    if(this._graphicTiles[key].key !== key){
        this._graphicTiles[key].key = key;
    }

    return this._graphicTiles[key];
}

Z.GraphicTileManager.prototype._loadOneTile = function(key){
    var tileObj = this._getTileByKey(key) || this._createTile(key),
        meshes = this._loadTileMeshes(key);

    //tileObj.oldObjects = tileObj.objects;
    tileObj.objects = meshes;
    tileObj.needsUpdate = true;

    return tileObj;
}

Z.GraphicTileManager.prototype._createTile = function(key){
    var tile = {
        //cube: null,
        objects: [],
        //oldObjects: [],
        tileGraphic: null,
        tempTileGraphic: null,
        matrixWorldNeedsUpdate: false,
        matrixWorld: null,
        needsUpdate: false,
        loaded: false
    };

    this._graphicTiles[key] = tile;

    return tile;
}

Z.GraphicTileManager.prototype._loadTileMeshes = function(key){
    var colRow = this._parseTileKey(key),
        minx, miny, maxx, maxy;

    minx = colRow.col > 0 ? (this._gridWidth * (colRow.col - 1)) : (this._gridWidth * colRow.col);
    maxx = minx + this._gridWidth;
    miny = colRow.row > 0 ? (this._gridHeight * (colRow.row - 1)) : (this._gridHeight * colRow.row);
    maxy = miny + this._gridHeight;

    var sceneBounds = new Z.GLBounds(new Z.Point(minx, miny), new Z.Point(maxx, maxy));
    var meshes = this.tileLoader.loadGraphicsBySceneBounds(sceneBounds);

    return meshes;
}

Z.GraphicTileManager.prototype._updateOneTile = function(tile){
    if(tile && tile.needsUpdate){
       //var unloadedObjects = this._getUnloadedObjectsOfTile(tile);

        if(tile.tileGraphic){
            this.root.remove(tile.tileGraphic.root);
        }

        this._updateTileGraphic(tile);

        if(tile.tileGraphic){
            this.root.add(tile.tileGraphic.root);
        }

        //if(tile.tempTileGraphic){
        //    this.root.remove(tile.tempTileGraphic.root);
        //    tile.tempTileGraphic.clear();
        //}
    }
}

//Z.GraphicTileManager.prototype._getUnloadedObjectsOfTile = function(tile){
//    var newObjects = [];
//
//    for(var i = 0; i < tile.objects.length; i++){
//        var curObj = tile.objects[i],
//            id = (curObj._rawGraphic || curObj).id,
//            visibleGraphic = this._visibleGraphics[id];
//
//        if(!visibleGraphic){
//            newObjects.push(curObj);
//        }
//    }
//
//    return newObjects;
//}

Z.GraphicTileManager.prototype._updateTileGraphic = function(tile){
    if(!tile.tileGraphic){
        tile.tileGraphic = new Z.MergedMesh3D1();
    }
    //else{
    //    tile.tileGraphic.clear();
    //}

    var objects = []

    for(var i = 0; i < tile.objects.length; i++){
        var curObj = tile.objects[i],
            id = (curObj._rawGraphic || curObj).id,
            visibleGraphic = this._visibleGraphics[id];

        if(!visibleGraphic) {
            this._visibleGraphics[id] = {
                addedTile: null,
                owners: []
            };

            visibleGraphic = this._visibleGraphics[id];
        }

        if(!visibleGraphic.addedTile){
            objects.push(curObj);
            visibleGraphic.addedTile = tile;
            visibleGraphic.owners.push(tile);
        }
        //else if(visibleGraphic.addedTile === tile){
        //    objects.push(curObj);
        //}

        //visibleGraphic.owners.push(tile);
    }

    var objectsForAdd = [];

    for(var j = 0; j < objects.length; j++){
        if(tile.tileGraphic.hasMesh(objects[j])){
            continue;
        }

        objectsForAdd.push(objects[j]);
    }

    tile.tileGraphic.addMeshes(objectsForAdd);
}

Z.GraphicTileManager.prototype._updateTiles = function(tiles){
    for(var i = 0; i < tiles.length; i++){
        var curTile = this._loadOneTile(tiles[i]);
        this._updateOneTile(curTile);
    }
}

Z.GraphicTileManager.prototype._removeTiles = function(tiles){
    var updateTiles = {};

    for(var i = 0; i < tiles.length; i++){
        var curTile = this._getTileByKey(tiles[i]);

        if(curTile.tileGraphic){
            this.root.remove(curTile.tileGraphic.root);
        }

        for(var j = 0; j < curTile.objects; j++){
            var curObj = curTile.objects[j],
                nextAddedTile = this._removeObjectFromOneTile(curObj, curTile),
                nextId = (curObj._rawGraphic || curObj).id;

            if(!updateTiles[nextId]){
                updateTiles[nextId] = nextAddedTile;
            }
        }

        //curTile.objects = [];
        //curTile.tileGraphic = null;
    }

    for(var key in updateTiles){
        this._updateTile(updateTiles[key]);
    }
}

Z.GraphicTileManager.prototype._removeObjectFromOneTile = function(object, tile){
    var curObj = object,//curTile.objects[j],
        id = (curObj._rawGraphic || curObj).id,
        ownerTiles = this._visibleGraphics[id].owners || [],
        nextAddedTile = null;

    for(var k = ownerTiles.length - 1; k > 0; k--){
        if(ownerTiles[k] !== tile){
            continue;
        }

        ownerTiles.splice(k, 1);
        //break;
        if(this._visibleGraphics[id].addedTile === tile){
            this._visibleGraphics[id].addedTile = null;
            //break;
        }
    }

    if(!this._visibleGraphics[id].addedTile){
        if(ownerTiles.length <= 0){
            this._visibleGraphics[id] = null;
            delete this._visibleGraphics[id];
        }else{
            var firstTile = ownerTiles[0];
            firstTile.needsUpdate = true;
            //this._updateTile(firstTile);
            nextAddedTile = firstTile;
        }
    }

    return nextAddedTile;
}


