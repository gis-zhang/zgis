/**
 * Created by Administrator on 2016/8/21.
 */
Z.GraphicGridIndex = function(center, gridWidth, gridHeight){
    this._center = center || new L.point(0, 0, 0);
    this._gridWidth = gridWidth || 100;
    this._gridHeight = gridHeight || 100;
    this._graphicIndex = {};
    this._indexCubeArray = [];
    this._graphicToIndexMap = {};
}

Z.GraphicGridIndex.prototype.addGraphic = function(graphic){
    var clonedGraphic = this._cloneGraphic(graphic);
    this._addOneGraphic(clonedGraphic);
    //this._updateIntersectGridCube(clonedGraphic);
    //this.updateGridCubes();
}

Z.GraphicGridIndex.prototype.addGraphics = function(graphics){
    graphics = (graphics instanceof Array) ? graphics : [graphics];

    if(graphics.length <= 0){
        return;
    }

    for(var i = 0; i < graphics.length; i++){
        var clonedGraphic = this._cloneGraphic(graphics[i]);
        this._addOneGraphic(clonedGraphic);
    }

    //for(var key in this._graphicIndex){
    //    if(!this._graphicIndex[key].needsUpdate){
    //        continue;
    //    }
    //
    //    var keyParts = key.split(",");
    //    this._updateGridCube(parseInt(keyParts[1]), parseInt(keyParts[0]));
    //}
    //this.updateGridCubes();
}

Z.GraphicGridIndex.prototype.updateGridCubes = function(force){
    for(var key in this._graphicIndex){
        if(!this._graphicIndex[key].needsUpdate && !force){
            continue;
        }

        var keyParts = key.split(",");
        this._updateGridCube(parseInt(keyParts[1]), parseInt(keyParts[0]));
        this._graphicIndex[key].needsUpdate = false;
    }
}

Z.GraphicGridIndex.prototype.deleteGraphic = function(graphic){
    var graphicId = (graphic._rawGraphic || graphic).id;
    var gridNum = this._graphicToIndexMap[graphicId],
        minGrid = gridNum.minGrid,
        maxGrid = gridNum.maxGrid;

    for(var i = minGrid.row; i <= maxGrid.row; i++){
        for(var j = minGrid.col; j <= maxGrid.col; j++){
            var key = j + "," + i,
                objects = this._graphicIndex[key].objects;

            if(!this._graphicIndex[key]){
                continue;
            }

            for(var bLoop = 0; bLoop < objects.length; bLoop++){
                if(objects[bLoop]._rawGraphic === graphic){
                    objects.splice(bLoop, 1);
                    break;
                }
            }

            //this._graphicIndex[key].cube = this._recomputeGridCube(i, j, objects);
            this._graphicIndex[key].needsUpdate = true;
        }
    }

    delete this._graphicToIndexMap[graphicId];
}

Z.GraphicGridIndex.prototype.updateGraphic = function(graphic){
    this.deleteGraphic(graphic);
    this.addGraphic(graphic);
}

Z.GraphicGridIndex.prototype.updateMatrixWorld = function(matrixWorld){
    for(var key in this._graphicIndex){
        if(!this._graphicIndex[key]){
            continue;
        }

        var cube = this._graphicIndex[key].cube;

        if(cube){
            cube.updateMatrix();
            cube.matrixWorld.multiplyMatrices(matrixWorld, cube.matrix );
        }

        this._graphicIndex[key].matrixWorldNeedsUpdate = true;
        this._graphicIndex[key].matrixWorld = matrixWorld;
    }
}

Z.GraphicGridIndex.prototype.clear = function() {
    for(var key in this._graphicIndex){
        var item = this._graphicIndex[key];
        var cube = item.cube;

        if(cube){
            cube.dispose();
            item.cube = null;
        }

        item.objects = [];
    }

    this._graphicIndex = {};
    this._indexCubeArray = [];
    this._graphicToIndexMap = {};
}

Z.GraphicGridIndex.prototype.dispose = function() {
    this.clear();
}

Z.GraphicGridIndex.prototype.getIntersectMeshes = function(raycaster) {
    var keySet = this._getIntersectCube(raycaster);

    if(keySet){
        return this._getIntersectMeshes(raycaster, keySet);
    }else{
        return [];
    }
}

Z.GraphicGridIndex.prototype._cloneGraphic = function(graphic){
    var newGraphic = graphic.clone();
    newGraphic._rawGraphic = graphic;
    newGraphic.geometry = this._recomputeVertices(graphic);

    return newGraphic;
}

Z.GraphicGridIndex.prototype._recomputeVertices = function(mesh){
    var offset = mesh._z_posOffset || {},
        tolerence = 0.00000001,
    //meshObj = mesh;
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

Z.GraphicGridIndex.prototype._addOneGraphic = function(graphic){
    var bbox = this._getGraphicBbox(graphic),
        minGrid = this._getGridNum(bbox.min),
        maxGrid = this._getGridNum(bbox.max);

    var graphicId = (graphic._rawGraphic || graphic).id;
    this._graphicToIndexMap[graphicId] = {minGrid: minGrid, maxGrid: maxGrid};

    for(var i = minGrid.col; i <= maxGrid.col; i++){
        for(var j = minGrid.row; j <= maxGrid.row; j++){
            var key = i + "," + j;

            if(!this._graphicIndex[key]){
                //cube = this._createGridCube(j, i, bbox);
                //cube.indexKey = key;

                this._graphicIndex[key] = {
                    cube: null,
                    objects: [],
                    matrixWorldNeedsUpdate: false,
                    matrixWorld: null,
                    needsUpdate: false
                };

                //this._indexCubeArray.push(cube);
            }

            this._graphicIndex[key].objects.push(graphic);
            this._graphicIndex[key].needsUpdate = true;
        }
    }
}

Z.GraphicGridIndex.prototype._updateIntersectGridCube = function(graphic){
    var bbox = this._getGraphicBbox(graphic),
        minGrid = this._getGridNum(bbox.min),
        maxGrid = this._getGridNum(bbox.max);

    //this._graphicToIndexMap[graphic.id] = {minGrid: minGrid, maxGrid: maxGrid};

    for(var i = minGrid.col; i <= maxGrid.col; i++){
        for(var j = minGrid.row; j <= maxGrid.row; j++){
            this._updateGridCube(j, i);
            //this._updateGridCube(i + "," + j);

            //this._graphicIndex[key].objects.push(graphic);
        }
    }
}

Z.GraphicGridIndex.prototype._getIntersectCube = function(raycaster){
    var intersects = raycaster.intersectObjects(this._indexCubeArray);
    //console.info("indexCount:" + intersects.length);

    if(intersects.length > 0){
        var keySet = {};

        for (var i = 0; i < intersects.length; i++) {
            if (!intersects[i].object.indexKey) {
                continue;
            }

            keySet[intersects[i].object.indexKey] = 1;
        }

        return keySet;
    }else{
        return null;
    }
}

Z.GraphicGridIndex.prototype._getIntersectMeshes = function(raycaster, keySet){
    keySet = keySet || {};
    var graphicSet = [];

    for (var key in keySet) {
        if (!key || !this._graphicIndex[key]) {
            continue;
        }

        if(this._graphicIndex[key].matrixWorldNeedsUpdate){
            this._updateIndexMatrixWorld(this._graphicIndex[key]);
        }

        var objects = this._graphicIndex[key].objects;

        for(var j = 0; j < objects.length; j++){
            //var curGraphics = objects[j]._root.children;

            //for(var k = 0; k < curGraphics.length; k++) {
            //    graphicSet.push(curGraphics[k]);
            //}
            graphicSet.push(objects[j]);
        }
    }

    if(graphicSet.length > 0){
        var meshes = raycaster.intersectObjects(graphicSet);

        for(var k = 0; k < meshes.length; k++){
            var rawMesh = meshes[k].object._rawGraphic || meshes[k].object;
            meshes[k].object = rawMesh;
        }

        return meshes;
    }else{
        return [];
    }
}

Z.GraphicGridIndex.prototype._updateIndexMatrixWorld = function(buildingIndex){
    var objects = buildingIndex.objects,
        matrixWorld = buildingIndex.matrixWorld;

    for(var i = 0; i < objects.length; i++){
        //var graphics = objects[i]._root.children;
        //
        //for(var j = 0; j < graphics.length; j++){
        //    var curGraphic = graphics[j];
            var curGraphic = objects[i];

            curGraphic.matrixWorld.multiplyMatrices(matrixWorld, curGraphic.matrix );
        //}
    }

    buildingIndex.matrixWorldNeedsUpdate = false;
    buildingIndex.matrixWorld = null;
}

Z.GraphicGridIndex.prototype._getGraphicBbox = function(graphics){
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
        //var graphic = graphics[buildingLoop],
        //    meshs = building._root.children;
        //
        //for(var i = 0; i < meshs.length; i++){
        //    var geometry = meshs[i].geometry;
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
        //}
    }

    return {min: new THREE.Vector3(minx, miny, minz), max: new THREE.Vector3(maxx, maxy, maxz)};
}

Z.GraphicGridIndex.prototype._getGridNum = function(vector){
    var colAbs = Math.ceil(Math.abs(vector.x) / this._gridWidth),
        rowAbs = Math.ceil(Math.abs(vector.y) / this._gridHeight);

    return {col: vector.x > 0 ? colAbs : -colAbs, row: vector.y > 0 ? rowAbs : -rowAbs}
}

Z.GraphicGridIndex.prototype._createGridCube = function(gridRow, gridCol, bbox){
    var depth = Math.abs(bbox.max.z - bbox.min.z);
    var geometry = new THREE.BoxGeometry(this._gridWidth, this._gridHeight, depth);
    var material = new THREE.MeshBasicMaterial();
    //var cube = new THREE.Mesh( geometry, material );
    var cube = new Z.Mesh( geometry, material );

    var positionX = gridCol >= 0 ? (this._gridWidth * (gridCol - 1) + this._gridWidth / 2) : (this._gridWidth * (gridCol + 1) - this._gridWidth / 2),
        positionY = gridRow >= 0 ? (this._gridHeight * (gridRow - 1) + this._gridHeight / 2) : (this._gridHeight * (gridRow + 1) - this._gridHeight / 2),
        positionZ = (bbox.min.z + bbox.max.z) / 2;

    cube.position.set(positionX, positionY, positionZ);

    return cube;
}

Z.GraphicGridIndex.prototype._updateGridCube = function(gridRow, gridCol) {
//Z.GraphicGrid.prototype._updateGridCube = function(gridKey) {
    var key = gridCol + "," + gridRow,
    //var key = gridKey,
    cube = this._graphicIndex[key].cube;

    ////if(!this._graphicIndex[key]){
    //if(!cube){
    //    cube = this._createGridCube(j, i, bbox);
    //    cube.indexKey = key;
    //
    //    this._graphicIndex[key] = {
    //        cube: cube,
    //        objects: []
    //    };
    //
    //    this._indexCubeArray.push(cube);
    //}else {
    if(cube){
        for (var indexLoop = 0; indexLoop < this._indexCubeArray.length; indexLoop++) {
            if (cube === this._indexCubeArray[indexLoop]) {
                this._indexCubeArray.splice(indexLoop, 1);
                break;
            }
        }

        cube.dispose();
    }

        var newCube = this._recomputeGridCube(gridRow, gridCol, this._graphicIndex[key].objects);
        newCube.indexKey = key;
        this._graphicIndex[key].cube = newCube;
        //if(!newCube){debugger;}
        this._indexCubeArray.push(newCube);
    //}
}

Z.GraphicGridIndex.prototype._recomputeGridCube = function(gridRow, gridCol, buildings) {
    var bbox = this._getGraphicBbox(buildings);

    return this._createGridCube(gridRow, gridCol, bbox);
}
