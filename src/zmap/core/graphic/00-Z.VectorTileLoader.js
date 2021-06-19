/**
 * Created by Administrator on 2016/8/21.
 */
Z.VectorTileLoader = function(urls, loadContext){
    this._compositeGraphics = {};
    this._graphics = {};

    this._urls = urls || [];//"https://a.data.osmbuildings.org/0.2/ph2apjye/tile";

    if(!(this._urls instanceof Array)){
        this._urls = [this._urls];
    }

    //this._url = url || "/0.2/anonymous/tile";
    //{layer: null, container: null, scene: null}
    this._context = loadContext;

    this._loadMethodRuning = false;
}

Z.VectorTileLoader.prototype.setContext = function(loadContext){
    this._context = loadContext;
}

//Z.VectorTileLoader.prototype.addGraphics = function(graphics){
//    if(!graphics){
//        return;
//    }
//
//    var graphicsArray = (graphics instanceof Array) ? graphics : [graphics];
//
//    for(var i = 0; i < graphicsArray.length; i++){
//        //if(!(graphicsArray[i] instanceof Z.Graphic)){
//        //    continue;
//        //}
//
//        var stamp = Z.Util.stamp(graphicsArray[i], 'graphic');
//
//        if(graphicsArray[i] instanceof Z.Graphic){
//            this._graphics[stamp] = graphicsArray[i];
//        }else{
//            this._compositeGraphics[stamp] = graphicsArray[i];
//        }
//
//    }
//}

Z.VectorTileLoader.prototype.loadVectorTile = function(level, row, col, callback, scope){
    if(!this._context){
        return;
    }

    //var bottomLeft = sceneBounds.getBottomLeft(),
    //    topRight = sceneBounds.getTopRight(),
    //    latLngBL, latLngTR, latLngBounds;
    //
    //latLngBL = this._context.layer.layerScenePointToLatLng(bottomLeft);
    //latLngTR = this._context.layer.layerScenePointToLatLng(topRight);
    //latLngBounds = new Z.LatLngBounds(latLngBL, latLngTR);
    //
    //return this.loadGraphicsByLatLngBounds(latLngBounds);

    var url = this._getTileUrl(level, row, col);

    //Z.JSONPRequest.getJSON(url, callback, scope);
    // Z.AjaxRequest.getJSON(url, callback, scope, "application/json");
    Z.AjaxRequest.getJSON(url, callback, scope);
}

Z.VectorTileLoader.prototype.loadGraphicsByLatLngBounds = function(latLngBounds){
    if(this._loadMethodRuning){
        return [];
    }

    this._loadMethodRuning = true;

    var meshes = [];

    for(var key in this._compositeGraphics){
        var curGraphic = this._compositeGraphics[key];

        if(!curGraphic.isAdded()){
            var bbox = curGraphic.feature.shape.getBounds();

            if(latLngBounds.intersects(bbox)) {
                curGraphic.onAdd(this._context.layer, this._context.container, this._context.scene);
            }
        }
    }

    for(var key in this._graphics){
        var curGraphic = this._graphics[key];

        if(!curGraphic.isAdded()){
            var bbox = curGraphic.feature.shape.getBounds();

            if(latLngBounds.intersects(bbox)) {
                curGraphic.onAdd(this._context.layer, this._context.container, this._context.scene);
            }
        }

        if (curGraphic instanceof Z.Graphic) {
            var checkedMeshes = this._checkMeshes([curGraphic]);

            for(var i = 0; i < checkedMeshes.length; i++){
                meshes.push(checkedMeshes[i]);
            }
        }
    }

    this._loadMethodRuning = false;

    return meshes;
}

Z.VectorTileLoader.prototype._checkMeshes = function(graphics){
    var result = [];

    for(var i = 0; i < graphics.length; i++){
        if(!(graphics[i] instanceof Z.Graphic)){
            continue;
        }

        var curMeshes = this._getMeshes(graphics[i]._mainElement._render._renderedObject);

        for(var j = 0; j < curMeshes.length; j++){
            result.push(curMeshes[j]);
        }
    }

    return result;
}

Z.VectorTileLoader.prototype._getMeshes = function(mesh){
    var meshs = [];

    if(mesh instanceof THREE.Mesh || mesh instanceof THREE.Line){
        //var meshWorldPos = this._getWorldPosition(mesh);
        //meshs.push({position: meshWorldPos, mesh: mesh});
        meshs.push(mesh);
    }else if(mesh && mesh.children && mesh.children.length > 0){
        for(var i = 0; i < mesh.children.length; i++){
            var curMeshs = this._getMeshes(mesh.children[i]);

            for(var j = 0; j < curMeshs.length; j++){
                meshs.push(curMeshs[j]);
            }
        }
    }

    return meshs;
}

Z.VectorTileLoader.prototype._getTileUrl = function(level, row, col){
    if(!this._context || this._urls.length <= 0){
        return;
    }

    var urlLength = this._urls.length;
    var tileIndex = (row + col) % urlLength;
    var curUrl = this._urls[tileIndex];

    while(!curUrl && tileIndex < (urlLength - 1)){
        curUrl = this._urls[++tileIndex];
    }

    if(!curUrl){
        return null;
    }

    var tileUrl = null;

    if(curUrl.indexOf("{level}") > 0 || curUrl.indexOf("{col}") > 0 || curUrl.indexOf("{row}") > 0){
        tileUrl = curUrl.replace("{level}", level);
        tileUrl = tileUrl.replace("{col}", col);
        tileUrl = tileUrl.replace("{row}", row);
    }else{
        tileUrl = curUrl + "/" + level + "/" + col + "/" + row + ".json";
    }

    return tileUrl;
    //var bottomLeft = sceneBounds.getBottomLeft(),
    //    topRight = sceneBounds.getTopRight(),
    //    latLngBL, latLngTR, latLngBounds;
    //
    //latLngBL = this._context.layer.layerScenePointToLatLng(bottomLeft);
    //latLngTR = this._context.layer.layerScenePointToLatLng(topRight);
    //latLngBounds = new Z.LatLngBounds(latLngBL, latLngTR);
    //
    //return this.loadGraphicsByLatLngBounds(latLngBounds);

}



