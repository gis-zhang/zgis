/**
 * Created by Administrator on 2016/8/21.
 */
Z.MergedMesh3D1 = function(){
    //this.root = new THREE.Object3D();
    this.root = new Z.Object3D();
    var thisObj = this;

    this.root.setPropertyListener("children", {
        preGet: function(obj, prop){
            if(thisObj._mergedMeshNeedsUpdate){
                //thisObj._updateMergedMesh();
                if(thisObj._mergedGraphic){
                    obj.remove(thisObj._mergedGraphic);
                }

                thisObj._mergedGraphic = thisObj._createMeshFromDataBuffer(thisObj._dataBuffer);

                obj.add(thisObj._mergedGraphic);

                thisObj._mergedMeshNeedsUpdate = false;

                if(thisObj._graphicGrid){
                    thisObj._graphicGrid.updateGridCubes();
                }

                //var parent = obj.parent || null;
                //
                //if(parent){
                //    parent.updateMatrix();
                //    parent.updateMatrixWorld();
                //
                //    thisObj._graphicGrid.updateMatrixWorld(parent.matrixWorld);
                //}
            }
        }
    });

    //this._mergedGraphic = null;
    //this._meshesArray = [];
    //this._meshesMap = {};
    //this._mergedMeshNeedsUpdate = false;
    ////this._mergedLineNeedsUpdate = false;
    //
    //this._dataBuffer = {
    //    vertices:[],
    //    faces:[],
    //    uvs:[],
    //    materials:[]
    //};

    this._reset();
    this._mergedMeshNeedsUpdate = false;

    this._mergedLine = new Z.MergedLine();
    this.root.add(this._mergedLine.root);

    this._graphicGrid = new Z.GraphicGridIndex(50, 50);
}

Z.MergedMesh3D1.prototype._reset = function(){
    //this._mergedGraphic = null;
    this._meshesArray = [];
    this._meshesMap = {};

    if(this._dataBuffer){
        var faces = this._dataBuffer.faces,
            faceLength = faces.length;

        for(var i = 0; i < faceLength; i++){
            faces[i].ownerMesh = null;
            faces[i] = null;
        }

        this._dataBuffer.vertices = [];
        this._dataBuffer.faces = [];
        this._dataBuffer.uvs = [];
        this._dataBuffer.materials = [];
    }else{
        this._dataBuffer = {
            vertices:[],
            faces:[],
            uvs:[],
            materials:[]
        };
    }

    this._linesDataBuffer = {};
}

Z.MergedMesh3D1.prototype.addMesh = function(mesh){
    if(!mesh){
        return;
    }

    if(mesh instanceof THREE.Mesh){
        this._addMeshes([mesh]);
    }else if(mesh instanceof THREE.Line){
        if(this._mergedLine){
            this._mergedLine.addMeshes([mesh]);
        }
    }

    if(this._graphicGrid){
        this._graphicGrid.addGraphic(mesh);
        //this.updateRasterIndex();
    }
}

Z.MergedMesh3D1.prototype.addMeshes = function(meshes){
    meshes = (meshes instanceof Array) ? meshes : [meshes];

    if(meshes.length <= 0){
        return;
    }

    var meshObjects = [], lineObjects = [];

    for(var i = 0; i < meshes.length; i++){
        //this._addOneMesh(meshes[i]);
        if(meshes[i] instanceof THREE.Mesh){
            //this._addOneMesh(meshes[i]);
            meshObjects.push(meshes[i]);
        }else if(meshes[i] instanceof THREE.Line){
            //this._mergedLine.addMesh(meshes[i]);
            lineObjects.push(meshes[i]);
        }
    }

    this._addMeshes(meshObjects);

    if(this._mergedLine) {
        this._mergedLine.addMeshes(lineObjects);
    }

    if(this._graphicGrid){
        this._graphicGrid.addGraphics(meshes);
        //this.updateRasterIndex();
    }
}

Z.MergedMesh3D1.prototype.deleteMesh = function(mesh){
    if(!mesh){
        return;
    }

    if(mesh instanceof THREE.Mesh){
        this._deleteOneMesh(mesh);
    }else if(mesh instanceof THREE.Line){
        if(this._mergedLine) {
            this._mergedLine.deleteMesh(mesh);
        }
    }
}

Z.MergedMesh3D1.prototype._deleteOneMesh = function(mesh){
    var graphicId = mesh.userData.graphicId || mesh.id;

    if(!this._meshesMap[graphicId]){
        return;
    }

    var meshObject = this._meshesMap[graphicId],
        meshForDelete = meshObject.mesh,
        index = meshObject.index + 1;

    this._deleteMeshFromBuffer(meshForDelete, index);

    //this.root.remove(this._mergedGraphic);
    //this._mergedGraphic = this._createMeshFromDataBuffer(this._dataBuffer);
    //this.root.add(this._mergedGraphic);

    this._mergedMeshNeedsUpdate = true;

    var indexOffset = -1;
    var meshesForOffset = this._getMeshesForOffset(index);
    this._offsetMeshesIndex(meshesForOffset, indexOffset);

    this._meshesArray.splice(meshObject.index, 1);
    delete this._meshesMap[graphicId];

    if(this._graphicGrid){
        this._graphicGrid.deleteGraphic(meshForDelete);
        //this.updateRasterIndex();
    }
}

Z.MergedMesh3D1.prototype._getMeshOffsetForDelete = function(meshObject){
    //var mesh = meshObject.mesh;
    var mesh = meshObject;
    var indexesBuffer = mesh.buildingIndexesBuffer;

    return {
        verticesOffset : -(indexesBuffer.verticesMax - indexesBuffer.verticesMin + 1),
        facesOffset : -(indexesBuffer.facesMax - indexesBuffer.facesMin + 1),
        uvsOffset : -(indexesBuffer.uvsMax - indexesBuffer.uvsMin + 1)
    }
}

Z.MergedMesh3D1.prototype.reorderFacesByMaterial = function(mesh){
    var targetMesh = mesh || this._mergedGraphic;

    if(!targetMesh){
        return;
    }

    var geometry = targetMesh.geometry;

    //if(geometry.sortFacesByMaterialIndex){
    //    geometry.sortFacesByMaterialIndex();
    //}else{
        geometry.faces.sort(function(a, b){
            return a.materialIndex - b.materialIndex;
        });
    //}
}

Z.MergedMesh3D1.prototype.hasMesh = function(mesh){
    var graphicId = mesh.userData.graphicId || mesh.id,
        curMeshItem = this._meshesMap[graphicId];

    if(curMeshItem && curMeshItem.mesh === mesh){
        return true;
    }else{
        return false;
    }
}

Z.MergedMesh3D1.prototype.updateRasterIndex = function(){
    var parent = this.root ? this.root.parent : null;

    if(parent){
        parent.updateMatrix();
        parent.updateMatrixWorld();

        if(this._graphicGrid){
            this._graphicGrid.updateMatrixWorld(parent.matrixWorld);
        }
    }
}

Z.MergedMesh3D1.prototype._addMeshes = function(meshes){
    for(var i = 0; i < meshes.length; i++){
        if(this.hasMesh(meshes[i])){
            continue;
        }
        //this._meshesMap[graphicId] = {index: insertIndex, mesh: mesh};

        this._addOneMesh(meshes[i]);
    }

    //this._updateMergedMesh();
}

Z.MergedMesh3D1.prototype._updateMergedMesh = function(){
    if(this._mergedGraphic){
        this.root.remove(this._mergedGraphic);
    }

    //this._addMeshToBuffer(mesh2);
    this._mergedGraphic = this._createMeshFromDataBuffer(this._dataBuffer);
    //this._createIndexBuffer(this._mergedGraphic, mesh2);

    this.root.add(this._mergedGraphic);
}

Z.MergedMesh3D1.prototype._addOneMesh = function(mesh){
    var insertIndex = this._meshesArray.length;
    this._meshesArray[insertIndex] = mesh;
    var graphicId = mesh.userData.graphicId || mesh.id;
    this._meshesMap[graphicId] = {index: insertIndex, mesh: mesh};

    //if(this._mergedGraphic){
    //    this.root.remove(this._mergedGraphic);
    //}

    this._mergeMeshes(mesh);
    //this.root.add(this._mergedGraphic);

    this._mergedMeshNeedsUpdate = true;
}

Z.MergedMesh3D1.prototype._deleteMeshFromBuffer = function(meshObject, beginIndex){
    var offset = this._getMeshOffsetForDelete(meshObject);

    if(offset.verticesOffset === 0 && offset.facesOffset === 0 && offset.uvsOffset === 0){
        return;
    }

    var allVertices = this._dataBuffer.vertices,
        allFaces = this._dataBuffer.faces,
        allUvs = this._dataBuffer.uvs,
        indexesBuffer = this._getIndexBuffer(meshObject);

    var meshesForOffset = this._getMeshesForOffset(beginIndex);
    this._offsetMeshesFromBuffer(meshesForOffset, offset.verticesOffset, offset.facesOffset, offset.uvsOffset);

    allVertices.splice(indexesBuffer.verticesMin, (indexesBuffer.verticesMax - indexesBuffer.verticesMin + 1));
    allFaces.splice(indexesBuffer.facesMin, (indexesBuffer.facesMax - indexesBuffer.facesMin + 1));
    allUvs.splice(indexesBuffer.uvsMin, (indexesBuffer.uvsMax - indexesBuffer.uvsMin + 1));
}

Z.MergedMesh3D1.prototype.updateMesh = function(mesh){
    var graphicId = mesh.userData.graphicId || mesh.id;

    if(this._meshesMap[graphicId]){
        this.deleteMesh(mesh);
    }

    this.addMesh(mesh);
}

Z.MergedMesh3D1.prototype.clear = function(){
    //this._mergedGraphic = null;
    //this._buildingsArray = [];
    //this._buildingsMap = {};

    this._reset();
    //this.root.remove(this._mergedGraphic);

    if(this._mergedLine) {
        this._mergedLine.clear();
    }

    if(this._graphicGrid){
        this._graphicGrid.clear();
    }

    this._mergedMeshNeedsUpdate = true;
}

Z.MergedMesh3D1.prototype.dispose = function(){
    this.clear();

    if(this._mergedGraphic){
        this.root.remove(this._mergedGraphic);
        this._mergedGraphic.dispose();
    }

    if(this._mergedLine) {
        this._mergedLine.dispose();
    }

    if(this._graphicGrid){
        this._graphicGrid.dispose();
    }

    this._mergedGraphic = null;
    this._mergedLine = null;
    this._graphicGrid = null;

    if(this.root.parent){
        this.root.parent.remove(this.root);
    }

    this.root = null;
}

Z.MergedMesh3D1.prototype._recomputeVertices = function(mesh){
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

Z.MergedMesh3D1.prototype._addMeshToBuffer = function(mesh){
    var geometry = this._recomputeVertices(mesh),
        inputGeom = geometry;

    if(geometry instanceof THREE.BufferGeometry){
        inputGeom = new THREE.Geometry();
        inputGeom.fromBufferGeometry(geometry);
    }

    var vertices = inputGeom.vertices,
        faces = [],
        uvs = inputGeom.faceVertexUvs[0],
        db = this._dataBuffer,
        faceOffset = db.vertices.length;

    var materials1 = db.materials,//materials1 = mesh1.material,
        materials2 = (mesh.material instanceof THREE.MultiMaterial) ? mesh.material.materials : [mesh.material],
        materialMapping = this._mergeMaterial(materials1, materials2);
    /****************************************为了防止faces数组过大导致栈溢出，实行分段复制*****************************************/
    //for(var i = 0, faceLength = geometry.faces.length; i < faceLength; i++){
    //    var newFace = geometry.faces[i].clone();
    //    newFace.a += faceOffset;
    //    newFace.b += faceOffset;
    //    newFace.c += faceOffset;
    //    newFace.materialIndex = materialMapping[newFace.materialIndex || 0] || 0;//if(newFace.materialIndex === undefined){debugger;}
    //    newFace.ownerMesh = mesh;
    //    faces.push(newFace);
    //}

    var partsCount = 2000,
        facesLength = inputGeom.faces.length,
        faceParts = Math.ceil(facesLength / partsCount);

    for(var i = 0; i < faceParts; i++){
        var start = partsCount * i,
            end = Math.min(facesLength, start + partsCount) - 1;

        this._copyFaces(faces, inputGeom.faces, start, end, faceOffset, materialMapping, mesh);
    }
    /*************************************************************************************/

    //this._dataBuffer.vertices = this._dataBuffer.vertices.concat(vertices);
    //this._dataBuffer.faces = this._dataBuffer.faces.concat(faces);
    //this._dataBuffer.uvs = this._dataBuffer.uvs.concat(uvs);
    for(var j = 0; j < vertices.length; j++){
        db.vertices.push(vertices[j]);
    }

    for(j = 0; j < faces.length; j++){
        db.faces.push(faces[j]);
    }

    for(j = 0; j < uvs.length; j++){
        db.uvs.push(uvs[j]);
    }
}

Z.MergedMesh3D1.prototype._copyFaces = function(target, source, startIndex, endIndex, faceOffset, materialMapping, ownerMesh){
    for(var i = startIndex; i <= endIndex; i++){
        var newFace = source[i].clone();

        if(faceOffset){
            newFace.a += faceOffset;
            newFace.b += faceOffset;
            newFace.c += faceOffset;
        }

        if(materialMapping){
            newFace.materialIndex = materialMapping[newFace.materialIndex || 0] || 0;//if(newFace.materialIndex === undefined){debugger;}
        }

        newFace.ownerMesh = ownerMesh || source[i].ownerMesh;
        target.push(newFace);
    }
}

Z.MergedMesh3D1.prototype._createMeshFromDataBuffer = function(dataBuffer){
    var geometry = new THREE.Geometry(),
        faces = [];
    geometry.vertices = dataBuffer.vertices;
    //geometry.faces = dataBuffer.faces;
    geometry.faceVertexUvs[0] = dataBuffer.uvs;

    //for(var i = 0, faceLength = dataBuffer.faces.length; i < faceLength; i++){
    //    var newFace = dataBuffer.faces[i].clone();
    //    newFace.ownerMesh = dataBuffer.faces[i].ownerMesh;
    //    faces.push(newFace);
    //}

    //var partsCount = 10000,
    //    facesLength = dataBuffer.faces.length,
    //    faceParts = Math.ceil(facesLength / partsCount);
    //
    //for(var i = 0; i < faceParts; i++){
    //    var start = partsCount * i,
    //        end = Math.min(facesLength, start + partsCount) - 1;
    //
    //    this._copyFaces(faces, dataBuffer.faces, start, end);
    //}

    for(var i = 0, faceLength = dataBuffer.faces.length; i < faceLength; i++){
        var newFace = dataBuffer.faces[i];
        faces.push(newFace);
    }

    geometry.faces = faces;

    //geometry.verticesNeedUpdate = true;
    //geometry.uvsNeedUpdate = true;
    //geometry.elementsNeedUpdate = true;
    //geometry.groupsNeedUpdate = true;

    var mtl = new THREE.MultiMaterial(dataBuffer.materials);
    var newMesh = new Z.Mesh(geometry, mtl);

    if(this._graphicGrid){
        newMesh.raycastIndex = this._graphicGrid;
    }

    this.reorderFacesByMaterial(newMesh);

    return newMesh;
}

Z.MergedMesh3D1.prototype._mergeMeshes = function(mesh2){
    this._addMeshToBuffer(mesh2);
    //this._mergedGraphic = this._createMeshFromDataBuffer(this._dataBuffer);
    this._createIndexBuffer(this._dataBuffer, mesh2);
}

Z.MergedMesh3D1.prototype._mergeMaterial = function(materials1, materials2){
    var newIndex = [];

    for(var i = 0; i < materials2.length; i++){
        for(var j = 0; j < materials1.length; j++){
            if(materials2[i] == materials1[j]){
                newIndex[i] = j;
                break;
            }
        }

        if(j >= materials1.length){
            materials1.push(materials2[i]);
            newIndex[i] = materials1.length - 1;
        }
    }

    return newIndex;
}

Z.MergedMesh3D1.prototype._createIndexBuffer = function(dataBuffer, inputMesh){
    var inputGeom = inputMesh.geometry;

    if(inputGeom instanceof THREE.BufferGeometry){
        inputGeom = new THREE.Geometry();
        inputGeom.fromBufferGeometry(inputMesh.geometry);
    }

    if(dataBuffer){
        inputMesh.buildingIndexesBuffer = {
            verticesMin: dataBuffer.vertices.length - inputGeom.vertices.length,
            verticesMax: Math.max(dataBuffer.vertices.length - 1, 0),
            facesMin: dataBuffer.faces.length - inputGeom.faces.length,
            facesMax: Math.max(dataBuffer.faces.length - 1, 0),
            uvsMin:dataBuffer.uvs.length - inputGeom.faceVertexUvs[0].length,
            uvsMax: Math.max(dataBuffer.uvs.length - 1, 0)
        };
    }else{
        inputMesh.buildingIndexesBuffer = {
            verticesMin: 0,
            verticesMax: Math.max(inputGeom.vertices.length - 1, 0),
            facesMin: 0,
            facesMax: Math.max(inputGeom.faces.length - 1, 0),
            uvsMin:0,
            uvsMax: Math.max(inputGeom.faceVertexUvs[0].length - 1, 0)
        };
    }
}

Z.MergedMesh3D1.prototype._getIndexBuffer = function(mesh){
    return mesh.buildingIndexesBuffer;
}

Z.MergedMesh3D1.prototype._getMeshesForOffset = function(beginIndex){
    var endIndex = this._meshesArray.length - 1,
        meshesForOffset = [];

    for(var len = beginIndex; len <= endIndex; len++){
        meshesForOffset.push(this._meshesArray[len]);
    }

    return meshesForOffset;
}

Z.MergedMesh3D1.prototype._offsetMeshesIndex = function(meshes, indexOffset){
    for(var i = 0; i < meshes.length; i++){
        var curMesh = meshes[i];
        var graphicId = curMesh.userData.graphicId || curMesh.id;
        this._meshesMap[graphicId].index += indexOffset;
    }
}

Z.MergedMesh3D1.prototype._offsetMeshesFromBuffer = function(meshes, verticesOffset, facesOffset, uvsOffset){
    //var faces = this._dataBuffer.faces;
    //
    //for(var i = 0; i < meshes.length; i++){
    //    var curMesh = meshes[i],
    //        curIndexBuffer = curMesh.buildingIndexesBuffer,
    //        facesMin = curIndexBuffer.facesMin,
    //        facesMax = curIndexBuffer.facesMax;
    //
    //    for(var j = facesMin; j <= facesMax; j++){
    //        var curFace = faces[j];
    //        curFace.a += verticesOffset;
    //        curFace.b += verticesOffset;
    //        curFace.c += verticesOffset;
    //    }
    //
    //    curIndexBuffer.verticesMin += verticesOffset;
    //    curIndexBuffer.verticesMax += verticesOffset;
    //    curIndexBuffer.facesMin += facesOffset;
    //    curIndexBuffer.facesMax += facesOffset;
    //    curIndexBuffer.uvsMin += uvsOffset;
    //    curIndexBuffer.uvsMax += uvsOffset;
    //    //
    //    ////var graphicId = curMesh.userData.graphicId || curMesh.id;
    //    ////this._meshesMap[graphicId].index += indexOffset;
    //}

    this._offsetFaces(meshes, verticesOffset, facesOffset, uvsOffset);
    this._offsetIndexBuffer(meshes, verticesOffset, facesOffset, uvsOffset);
}

Z.MergedMesh3D1.prototype._offsetFaces = function(meshes, verticesOffset, facesOffset, uvsOffset){
    var faces = this._dataBuffer.faces;

    for(var i = 0; i < meshes.length; i++){
        var curMesh = meshes[i],
            curIndexBuffer = curMesh.buildingIndexesBuffer,
            facesMin = curIndexBuffer.facesMin,
            facesMax = curIndexBuffer.facesMax;

        for(var j = facesMin; j <= facesMax; j++){
            var curFace = faces[j];
            curFace.a += verticesOffset;
            curFace.b += verticesOffset;
            curFace.c += verticesOffset;
        }
    }
}

Z.MergedMesh3D1.prototype._offsetIndexBuffer = function(meshes, verticesOffset, facesOffset, uvsOffset){
    for(var i = 0; i < meshes.length; i++){
        var curMesh = meshes[i],
            curIndexBuffer = curMesh.buildingIndexesBuffer;

        curIndexBuffer.verticesMin += verticesOffset;
        curIndexBuffer.verticesMax += verticesOffset;
        curIndexBuffer.facesMin += facesOffset;
        curIndexBuffer.facesMax += facesOffset;
        curIndexBuffer.uvsMin += uvsOffset;
        curIndexBuffer.uvsMax += uvsOffset;
    }
}
