/**
 * Created by Administrator on 2016/8/21.
 */
Z.MergedMesh3D = function(){
    //this.root = new THREE.Object3D();
    this._mergedGraphic = null;
    //this._materialOrderedMergedGraphic = null;
    this._meshesArray = [];
    this._meshesMap = {};

    this._graphicGrid = new Z.GraphicGrid(50, 50);
}

Z.MergedMesh3D.prototype.addMesh = function(mesh){
    if(!mesh){
        return;
    }

    this._addOneMesh(mesh);
    this._graphicGrid.addGraphic(mesh);
}

Z.MergedMesh3D.prototype.addMeshes = function(meshes){
    meshes = (meshes instanceof Array) ? meshes : [meshes];

    if(meshes.length <= 0){
        return;
    }

    for(var i = 0; i < meshes.length; i++){
        this._addOneMesh(meshes[i]);
    }

    this._graphicGrid.addGraphics(meshes);
}

Z.MergedMesh3D.prototype.deleteMesh = function(mesh){
    if(!mesh){
        return;
    }

    var graphicId = mesh.userData.graphicId || mesh.id;

    if(!this._meshesMap[graphicId]){
        return;
    }

    var meshObject = this._meshesMap[graphicId],
        meshForDelete = meshObject.mesh;

    var indexesBuffer = meshForDelete.buildingIndexesBuffer,
        verticesOffset = -(indexesBuffer.verticesMax - indexesBuffer.verticesMin + 1),
        facesOffset = -(indexesBuffer.facesMax - indexesBuffer.facesMin + 1),
        uvsOffset = -(indexesBuffer.uvsMax - indexesBuffer.uvsMin + 1);

    if(verticesOffset === 0 && facesOffset === 0 && uvsOffset === 0){
        return;
    }

    var beginIndex = meshObject.index + 1;
    var indexOffset = -1;
    this._offsetMeshs(beginIndex, indexOffset, verticesOffset, facesOffset, uvsOffset);

    this._deleteFromGeometry(meshForDelete);
    this._meshesArray.splice(meshObject.index, 1);
    delete this._meshesMap[graphicId];

    this._graphicGrid.deleteGraphic(meshForDelete);
}

Z.MergedMesh3D.prototype.reorderFacesByMaterial = function(){
    if(!this._mergedGraphic){
        return;
    }
    //console.info("this._mergedGraphic.geometry.faces.sort:" + this._mergedGraphic.geometry.faces.length);
    this._mergedGraphic.geometry.faces.sort(function(a, b){
        return a.materialIndex - b.materialIndex;
    });
}

Z.MergedMesh3D.prototype.updateRasterIndex = function(){
    var parent = this._mergedGraphic ? this._mergedGraphic.parent : null;

    if(parent){
        parent.updateMatrix();
        parent.updateMatrixWorld();

        this._graphicGrid.updateMatrixWorld(parent.matrixWorld);
    }
}

Z.MergedMesh3D.prototype._addOneMesh = function(mesh){
    var insertIndex = this._meshesArray.length;
    this._meshesArray[insertIndex] = mesh;
    var graphicId = mesh.userData.graphicId || mesh.id;
    this._meshesMap[graphicId] = {index: insertIndex, mesh: mesh};

    if(!this._mergedGraphic){
        //this._mergedGraphic = this._createMesh(mesh);
        this._createMesh(mesh);
        this._mergedGraphic.raycastIndex = this._graphicGrid;
        //this._mergedGraphic._graphicObj = this;
    }else{
        this._mergeMeshes(this._mergedGraphic, mesh);
    }
}

Z.MergedMesh3D.prototype._deleteFromGeometry = function(mesh){
    var allVertices = this._mergedGraphic.geometry.vertices,
        allFaces = this._mergedGraphic.geometry.faces,
        allUvs = this._mergedGraphic.geometry.faceVertexUvs[0],
        indexesBuffer = this._getIndexBuffer(mesh);

    allVertices.splice(indexesBuffer.verticesMin, (indexesBuffer.verticesMax - indexesBuffer.verticesMin + 1));
    allFaces.splice(indexesBuffer.facesMin, (indexesBuffer.facesMax - indexesBuffer.facesMin + 1));
    allUvs.splice(indexesBuffer.uvsMin, (indexesBuffer.uvsMax - indexesBuffer.uvsMin + 1));

    this._mergedGraphic.geometry.verticesNeedUpdate = true;
    this._mergedGraphic.geometry.uvsNeedUpdate = true;
    this._mergedGraphic.geometry.elementsNeedUpdate = true;
    this._mergedGraphic.geometry.groupsNeedUpdate = true;
}

//Z.MergedMesh3D.prototype.updateMesh = function(mesh, ownerBuilding){
Z.MergedMesh3D.prototype.updateMesh = function(mesh){
    var graphicId = mesh.userData.graphicId || mesh.id;

    if(!this._meshesMap[graphicId]){
        this.addMesh(mesh);

        return;
    }

    this.deleteMesh(mesh);
    this.addMesh(mesh);
}

Z.MergedMesh3D.prototype.clear = function(){
    this._mergedGraphic = null;
    this._buildingsArray = [];
    this._buildingsMap = {};

    this._graphicGrid.clear();
}

Z.MergedMesh3D.prototype._createMesh = function(mesh){
    var geometry = this._recomputeVertices(mesh);
    var mtl = mesh.material.clone();
    var newMesh = new Z.Mesh(geometry, mtl);

    var mergedFaces = geometry.faces;
    var startFaceIndex = 0,
        endFaceIndex = mergedFaces.length > 0 ? (mergedFaces.length - 1) : 0;

    this._attacthOwnerObject(newMesh, startFaceIndex, endFaceIndex, mesh);
    this._mergedGraphic = newMesh;
    this._createIndexBuffer(this._mergedGraphic, mesh);

    return newMesh;
}

Z.MergedMesh3D.prototype._recomputeVertices = function(mesh){
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

Z.MergedMesh3D.prototype._mergeMeshes = function(mesh1, mesh2){
    var materials1 = mesh1.material,
        materials2 = mesh2.material,
        geometry2 = this._recomputeVertices(mesh2),
        faces2 = geometry2.faces;
    var isDifferent = false;

    if(materials1 instanceof THREE.MultiMaterial && materials2 instanceof THREE.MultiMaterial){
        for(var i = 0; i < materials2.materials.length; i++){
            if(materials2.materials[i] !== materials1.materials[i]){
                isDifferent = true;
                break;
            }
        }

        if(isDifferent){
            var newIndex = this._getMaterialMapping(mesh1, mesh2);

            for (var faceLoop = 0, il = faces2.length; faceLoop < il; faceLoop++) {
                var curIndex = faces2[faceLoop].rawMaterialIndex !== undefined ? faces2[faceLoop].rawMaterialIndex : faces2[faceLoop].materialIndex;
                faces2[faceLoop].rawMaterialIndex = curIndex;
                faces2[faceLoop].materialIndex = newIndex[curIndex];
            }
        }
    }

    mesh1.geometry.merge(geometry2);

    if(isDifferent){
        for (var faceLoop = 0, il = faces2.length; faceLoop < il; faceLoop++) {
            if(faces2[faceLoop].rawMaterialIndex === undefined){
                continue;
            }

            faces2[faceLoop].materialIndex = faces2[faceLoop].rawMaterialIndex;
            faces2[faceLoop].rawMaterialIndex = undefined;

        }
    }

    var mergedFaces = mesh1.geometry.faces;
    var startFaceIndex = mergedFaces.length - faces2.length,
        endFaceIndex = mergedFaces.length - 1;
    this._attacthOwnerObject(mesh1, startFaceIndex, endFaceIndex, mesh2);
    this._createIndexBuffer(mesh1, mesh2);
}

Z.MergedMesh3D.prototype._getMaterialMapping = function(mergedMesh, inputMesh){
    var materials1 = mergedMesh.material,
        materials2 = inputMesh.material,
        newIndex = [];

    for(var i = 0; i < materials2.materials.length; i++){
        for(var j = 0; j < materials1.materials.length; j++){
            if(materials2.materials[i] == materials1.materials[j]){
                newIndex[i] = j;
                break;
            }
        }

        if(j >= materials1.materials.length){
            materials1.materials.push(materials2.materials[i]);
            newIndex[i] = materials1.materials.length - 1;
        }
    }

    return newIndex;
}

Z.MergedMesh3D.prototype._createIndexBuffer = function(mergedMesh, inputMesh){
    if(mergedMesh){
        inputMesh.buildingIndexesBuffer = {
            verticesMin: mergedMesh.geometry.vertices.length - inputMesh.geometry.vertices.length,
            verticesMax: mergedMesh.geometry.vertices.length - 1,
            facesMin: mergedMesh.geometry.faces.length - inputMesh.geometry.faces.length,
            facesMax: mergedMesh.geometry.faces.length - 1,
            uvsMin:mergedMesh.geometry.faceVertexUvs[0].length - inputMesh.geometry.faceVertexUvs[0].length,
            uvsMax: mergedMesh.geometry.faceVertexUvs[0].length - 1//,
            //vertices: inputMesh.geometry.vertices,
            //faces: inputMesh.geometry.faces,
            //uvs: inputMesh.geometry.faceVertexUvs[0],
            //material: inputMesh.material,
            //materialMapping:[0, 1]
        };
    }else{
        inputMesh.buildingIndexesBuffer = {
            verticesMin: 0,
            verticesMax: inputMesh.geometry.vertices.length - 1,
            facesMin: 0,
            facesMax: inputMesh.geometry.faces.length - 1,
            uvsMin:0,
            uvsMax: inputMesh.geometry.faceVertexUvs[0].length - 1//,
            //material: inputMesh.material,
            //materialMapping:[0, 1]
        };
    }

}

Z.MergedMesh3D.prototype._getIndexBuffer = function(mesh){
    return mesh.buildingIndexesBuffer;
}

//Z.MergedMesh3D.prototype._attacthBuildingObject = function(mesh, startFaceIndex, endFaceIndex, building){
Z.MergedMesh3D.prototype._attacthOwnerObject = function(mesh, startFaceIndex, endFaceIndex, ownerMesh){
    var mergedFaces = mesh.geometry.faces;

    if(mergedFaces.length > 0) {
        for (var faceLoop = startFaceIndex; faceLoop <= endFaceIndex; faceLoop++) {
            //mergedFaces[faceLoop].ownerBuilding = building;
            mergedFaces[faceLoop].ownerMesh = ownerMesh;
        }
    }
}

Z.MergedMesh3D.prototype._offsetMeshs = function(beginIndex, indexOffset, verticesOffset, facesOffset, uvsOffset){
    if(beginIndex >= this._meshesArray.length){
        return;
    }

    var endIndex = this._meshesArray.length - 1,
        faces = this._mergedGraphic.geometry.faces;

    for(var i = beginIndex; i <= endIndex; i++){
        //var curMesh = this._meshesArray[i];
        var curMesh = this._meshesArray[i],
            curIndexBuffer = curMesh.buildingIndexesBuffer,
            facesMin = curIndexBuffer.facesMin,
            facesMax = curIndexBuffer.facesMax;

        for(var j = facesMin; j <= facesMax; j++){
            var curFace = faces[j];
            curFace.a += verticesOffset;
            curFace.b += verticesOffset;
            curFace.c += verticesOffset;
        }

        curIndexBuffer.verticesMin += verticesOffset;
        curIndexBuffer.verticesMax += verticesOffset;
        curIndexBuffer.facesMin += facesOffset;
        curIndexBuffer.facesMax += facesOffset;
        curIndexBuffer.uvsMin += uvsOffset;
        curIndexBuffer.uvsMax += uvsOffset;

        var graphicId = curMesh.userData.graphicId || curMesh.id;
        this._meshesMap[graphicId].index += indexOffset;
    }
}
