/**
 * Created by Administrator on 2016/8/21.
 */
Z.MergedLine = function(){
    this.root = new THREE.Object3D();
    this._linesDataBuffer = {};
    //this._graphicGrid = new Z.GraphicGrid(50, 50);
}

Z.MergedLine.prototype.addMesh = function(mesh){
    if(!mesh){
        return;
    }

    this._addOneLine(mesh);
    //this._graphicGrid.addGraphic(mesh);
    //this.updateRasterIndex();
}

Z.MergedLine.prototype.addMeshes = function(meshes){
    meshes = (meshes instanceof Array) ? meshes : [meshes];

    if(meshes.length <= 0){
        return;
    }

    for(var i = 0; i < meshes.length; i++){
        this._addOneLine(meshes[i]);
    }

    //this._graphicGrid.addGraphics(meshes);
    //this.updateRasterIndex();
}

//Z.MergedLine.prototype.updateRasterIndex = function(){
//    var parent = this.root ? this.root.parent : null;
//
//    if(parent){
//        parent.updateMatrix();
//        parent.updateMatrixWorld();
//
//        this._graphicGrid.updateMatrixWorld(parent.matrixWorld);
//    }
//}

Z.MergedLine.prototype.deleteMesh = function(mesh){
    if(!mesh){
        return;
    }

    this._deleteOneLine(mesh);
}

Z.MergedLine.prototype.updateMesh = function(mesh){
    //var graphicId = mesh.userData.graphicId || mesh.id;
    //
    //if(this._meshesMap[graphicId]){
    //    this.deleteMesh(mesh);
    //}

    this.deleteMesh(mesh);
    this.addMesh(mesh);
}

Z.MergedLine.prototype.clear = function(){
    for(var key in this._linesDataBuffer){
        var buffer = this._linesDataBuffer[key];
        this.root.remove(buffer.mergedLine);
        buffer.mergedLine.dispose();
        buffer.mergedLine = null;
        buffer.linesArray = [];
        buffer.linesMap = {};

        delete this._linesDataBuffer[key];
    }

    //this._graphicGrid.clear();
}

Z.MergedLine.prototype.dispose = function(){
    this.clear();

    if(this.root.parent){
        this.root.parent.remove(this.root);
    }

    this.root = null;
}

Z.MergedLine.prototype._addOneLine = function(mesh){
    var materialId = mesh.material.id;

    if(!this._linesDataBuffer[materialId]){
        this._linesDataBuffer[materialId] = {
            material: mesh.material,
            linesArray: [],
            linesMap: [],
            vertices: [],
            mergedLine : null
        };
    }

    var buffer = this._linesDataBuffer[materialId];
    var insertIndex = buffer.linesArray.length;
    buffer.linesArray[insertIndex] = mesh;
    var graphicId = mesh.userData.graphicId || mesh.id;
    buffer.linesMap[graphicId] = {index: insertIndex, mesh: mesh};

    if(buffer.mergedLine){
        this.root.remove(buffer.mergedLine);
    }

    this._mergeLines(mesh, buffer);
    this.root.add(buffer.mergedLine);
}

Z.MergedLine.prototype._mergeLines = function(mesh2, buffer){
    this._addLineToBuffer(mesh2, buffer);
    buffer.mergedLine = this._createLineFromDataBuffer(buffer);
    this._createIndexBuffer(buffer.mergedLine, mesh2);
}

Z.MergedLine.prototype._addLineToBuffer = function(mesh, buffer){
    var geometry = this._recomputeVertices(mesh);
    var vertices = geometry.vertices;
    buffer.vertices = buffer.vertices.concat(vertices);
}

Z.MergedLine.prototype._recomputeVertices = function(mesh){
    var offset = mesh._z_posOffset,
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

Z.MergedLine.prototype._createLineFromDataBuffer = function(dataBuffer){
    if(dataBuffer.vertices.length > 0){
        var geometry = new THREE.Geometry();
        geometry.vertices = dataBuffer.vertices;
        var newMesh = new Z.THREELine(geometry, dataBuffer.material);
        //newMesh.raycastIndex = this._graphicGrid;

        return newMesh;
    }else{
        return null;
    }
}

Z.MergedLine.prototype._createIndexBuffer = function(mergedMesh, inputMesh){
    if(mergedMesh){
        inputMesh.buildingIndexesBuffer = {
            verticesMin: mergedMesh.geometry.vertices.length - inputMesh.geometry.vertices.length,
            verticesMax: Math.max(mergedMesh.geometry.vertices.length - 1, 0)
            //facesMin: mergedMesh.geometry.faces.length - inputMesh.geometry.faces.length,
            //facesMax: Math.max(mergedMesh.geometry.faces.length - 1, 0),
            //uvsMin:mergedMesh.geometry.faceVertexUvs[0].length - inputMesh.geometry.faceVertexUvs[0].length,
            //uvsMax: Math.max(mergedMesh.geometry.faceVertexUvs[0].length - 1, 0)
        };
    }else{
        inputMesh.buildingIndexesBuffer = {
            verticesMin: 0,
            verticesMax: Math.max(inputMesh.geometry.vertices.length - 1, 0)
            //facesMin: 0,
            //facesMax: Math.max(inputMesh.geometry.faces.length - 1, 0),
            //uvsMin:0,
            //uvsMax: Math.max(inputMesh.geometry.faceVertexUvs[0].length - 1, 0)
        };
    }
}

Z.MergedLine.prototype._deleteOneLine = function(mesh){
    var materialId = mesh.material.id,
        buffer = this._linesDataBuffer[materialId],
        graphicId = mesh.userData.graphicId || mesh.id;

    if(!buffer || !buffer.linesMap[graphicId]){
        return;
    }

    var meshObject = buffer.linesMap[graphicId],
        meshForDelete = meshObject.mesh,
        index = meshObject.index + 1;

    this._deleteLineFromBuffer(meshForDelete, index, buffer);

    this.root.remove(buffer.mergedLine);

    if(!this._bufferIsNull(buffer)){
        buffer.mergedLine = this._createLineFromDataBuffer(buffer);
        this.root.add(buffer.mergedLine);
    }


    var indexOffset = -1;
    var meshesForOffset = this._getMeshesForOffset(index, buffer);
    this._offsetMeshesIndex(meshesForOffset, indexOffset, buffer);

    buffer.linesArray.splice(meshObject.index, 1);
    delete buffer.linesMap[graphicId];

    if(this._bufferIsNull(buffer)){
        delete this._linesDataBuffer[materialId];
    }

    //this._graphicGrid.deleteGraphic(meshForDelete);
    //this.updateRasterIndex();
}

Z.MergedLine.prototype._deleteLineFromBuffer = function(meshObject, beginIndex, buffer){
    var offset = this._getMeshOffsetForDelete(meshObject);

    if(offset.verticesOffset === 0){
        return;
    }

    var allVertices = buffer.vertices,
        //allFaces = this._dataBuffer.faces,
        //allUvs = this._dataBuffer.uvs,
        indexesBuffer = this._getIndexBuffer(meshObject);

    var meshesForOffset = this._getMeshesForOffset(beginIndex, buffer);
    this._offsetMeshesFromBuffer(meshesForOffset, offset.verticesOffset, offset.facesOffset, offset.uvsOffset);

    allVertices.splice(indexesBuffer.verticesMin, (indexesBuffer.verticesMax - indexesBuffer.verticesMin + 1));
    //allFaces.splice(indexesBuffer.facesMin, (indexesBuffer.facesMax - indexesBuffer.facesMin + 1));
    //allUvs.splice(indexesBuffer.uvsMin, (indexesBuffer.uvsMax - indexesBuffer.uvsMin + 1));
}

Z.MergedLine.prototype._getMeshOffsetForDelete = function(meshObject){
    //var mesh = meshObject.mesh;
    var mesh = meshObject;
    var indexesBuffer = mesh.buildingIndexesBuffer;

    return {
        verticesOffset : -(indexesBuffer.verticesMax - indexesBuffer.verticesMin + 1)
        //facesOffset : -(indexesBuffer.facesMax - indexesBuffer.facesMin + 1),
        //uvsOffset : -(indexesBuffer.uvsMax - indexesBuffer.uvsMin + 1)
    }
}

Z.MergedLine.prototype._getIndexBuffer = function(mesh){
    return mesh.buildingIndexesBuffer;
}

Z.MergedLine.prototype._getMeshesForOffset = function(beginIndex, buffer){
    var endIndex = buffer.linesArray.length - 1,
        meshesForOffset = [];

    for(var len = beginIndex; len <= endIndex; len++){
        meshesForOffset.push(buffer.linesArray[len]);
    }

    return meshesForOffset;
}

Z.MergedLine.prototype._offsetMeshesIndex = function(meshes, indexOffset, buffer){
    for(var i = 0; i < meshes.length; i++){
        var curMesh = meshes[i];
        var graphicId = curMesh.userData.graphicId || curMesh.id;
        buffer.linesMap[graphicId].index += indexOffset;
    }
}

Z.MergedLine.prototype._offsetMeshesFromBuffer = function(meshes, verticesOffset, facesOffset, uvsOffset){
    //this._offsetFaces(meshes, verticesOffset, facesOffset, uvsOffset);
    this._offsetIndexBuffer(meshes, verticesOffset, facesOffset, uvsOffset);
}

Z.MergedLine.prototype._offsetIndexBuffer = function(meshes, verticesOffset, facesOffset, uvsOffset){
    for(var i = 0; i < meshes.length; i++){
        var curMesh = meshes[i],
            curIndexBuffer = curMesh.buildingIndexesBuffer;

        curIndexBuffer.verticesMin += verticesOffset;
        curIndexBuffer.verticesMax += verticesOffset;
        //curIndexBuffer.facesMin += facesOffset;
        //curIndexBuffer.facesMax += facesOffset;
        //curIndexBuffer.uvsMin += uvsOffset;
        //curIndexBuffer.uvsMax += uvsOffset;
    }
}

Z.MergedLine.prototype._bufferIsNull = function(buffer){
    if(buffer.vertices.length > 0){
        return false;
    }else{
        return true;
    }
}
