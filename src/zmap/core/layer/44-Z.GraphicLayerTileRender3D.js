/**
 * Created by Administrator on 2015/10/31.
 */
Z.GraphicLayerTileRender3D = Z.GraphicLayerRender3D.extend({
    initialize: function(options){
        //this._super = Z.GraphicLayerRender3D;
        Z.GraphicLayerRender3D.prototype.initialize.apply(this, arguments);

        this._graphicContainer = new Z.SceneThreePaneItem();

        this._tileLoader = new Z.GraphicTileLoader();
        this._tileManager = new Z.GraphicTileManager(null, 150, 150);
        this._tileManager.tileLoader = this._tileLoader;

        this._tilesInit = false;
    },

    onAdd: function(graphicLayer, scene, index, containerPane, groupPane){
        Z.GraphicLayerRender3D.prototype.onAdd.apply(this, arguments);
        this._graphicRoot.root.add(this._tileManager.root);

        this._tileLoader.setContext({
            layer: graphicLayer,
            //container: containerPane,
            container: this._graphicContainer,
            scene: scene
        });
    },

    onRemove: function(scene){
        Z.GraphicLayerRender3D.prototype.onRemove.apply(this, arguments);
        this._graphicRoot.root.remove(this._tileManager.root);
    },

    addGraphics: function(graphicLayer, graphics){
        if(!this._tilesInit){
            this._refreshTiles();
            this._tilesInit = true;
        }

        var inputGraphics = (graphics instanceof Array) ? graphics : (graphics ? [graphics] : []);

        if(inputGraphics.length <= 0){
            return;
        }

        //for(var i = 0; i < inputGraphics.length; i++) {
        //    var graphic = inputGraphics[i];
        //    console.info("graphicAdded:" + i);
        //    if (graphic instanceof Z.Graphic || graphic instanceof Z.ComposeGraphic1) {
        //        graphic.onAdd(graphicLayer, this._graphicContainer, this._scene);
        //
        //        if (graphic instanceof Z.Graphic) {
        //            var checkedGraphics = this._checkGraphics([graphic]);
        //            this._tileManager.addGraphics(checkedGraphics);
        //        }
        //    }
        //}

        //var checkedGraphics = this._checkGraphics(graphics);
        //this._tileManager.addGraphics(checkedGraphics);
        //this._tileManager.refreshVisibleTiles();
        this._tileLoader.addGraphics(inputGraphics);
        this._refreshTiles();
    },

    removeGraphics: function(graphicLayer, graphics){
        var inputGraphics = (graphics instanceof Array) ? graphics : (graphics ? [graphics] : []);

        if(inputGraphics.length <= 0){
            return;
        }

        for(var i = 0; i < inputGraphics.length; i++) {
            var graphic = inputGraphics[i];

            if (graphic instanceof Z.Graphic || graphic instanceof Z.ComposeGraphic1) {
                graphic.onRemove(graphicLayer, this._graphicContainer, this._scene);

                if (graphic instanceof Z.Graphic){
                    var checkedGraphics = this._checkGraphics([graphic]);
                    this._tileManager.removeGraphics(checkedGraphics);
                }
            }
        }

        //var checkedGraphics = this._checkGraphics(graphics);
        //this._tileManager.removeGraphics(checkedGraphics);
        this._tileManager.refreshVisibleTiles();
    },

    _onViewReset: function(){
        Z.GraphicLayerRender3D.prototype._onViewReset.apply(this, arguments);
        this._refreshTiles();
    },

    _onMoveEnd: function(){
        Z.GraphicLayerRender3D.prototype._onMoveEnd.apply(this, arguments);
        this._refreshTiles();
    },

    _onZoomLevelsChange: function(){
        Z.GraphicLayerRender3D.prototype._onZoomLevelsChange.apply(this, arguments);
        this._refreshTiles();
    },

    //_checkGraphics: function(graphics){
    //    var result = [];
    //
    //    for(var i = 0; i < graphics.length; i++){
    //        if(!(graphics[i] instanceof Z.Graphic)){
    //            continue;
    //        }
    //
    //        var curMeshes = this._getMeshes(graphics[i]._mainElement._render._renderedObject);
    //
    //        for(var j = 0; j < curMeshes.length; j++){
    //            result.push(curMeshes[j]);
    //        }
    //    }
    //
    //    return result;
    //},
    //
    //_getMeshes: function(mesh){
    //    var meshs = [];
    //
    //    if(mesh instanceof THREE.Mesh || mesh instanceof THREE.Line){
    //        //var meshWorldPos = this._getWorldPosition(mesh);
    //        //meshs.push({position: meshWorldPos, mesh: mesh});
    //        meshs.push(mesh);
    //    }else if(mesh && mesh.children && mesh.children.length > 0){
    //        for(var i = 0; i < mesh.children.length; i++){
    //            var curMeshs = this._getMeshes(mesh.children[i]);
    //
    //            for(var j = 0; j < curMeshs.length; j++){
    //                meshs.push(curMeshs[j]);
    //            }
    //        }
    //    }
    //
    //    return meshs;
    //},

    _refreshTiles: function(){
        var secneBounds = this._graphicLayer.getLayerSceneBounds();
        this._tileManager.updateVisibleBBox(secneBounds);
    },

    _refreshGraphics: function(){
        var graphics = this._graphicLayer.getGraphics();

        for(var i = 0; i < graphics.length; i++){
            if(!graphics[i].isAdded()){
                continue;
            }

            graphics[i].refresh();
        }
    },
});