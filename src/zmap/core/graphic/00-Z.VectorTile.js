/**
 * Created by Administrator on 2016/8/21.
 */

Z.VectorTile = Z.Class.extend({
    includes: Z.EventManager,

    initialize: function(row, col, zoom, objects, graphicObjects){
        this.root = new THREE.Object3D();
        this.row = row;
        this.col= col;
        this.zoom = zoom;
        this.objects = objects || [];                    //mesh objects
        this.graphicObjects = graphicObjects || [];            //Z.Graphic[]
        this.tileGraphic = null;             //Z.MergedMesh3D1
        //this.tempTileGraphic = null;        //Z.MergedMesh3D1
        this.matrixWorldNeedsUpdate = false,    //bool
        this.matrixWorld = null,            //THREE.Matrix4
        this.needsUpdate = false,         //bool
        this.loaded = false                //bool

        this.tileLoader = null;
        this.context = null;
    },

    load: function(filter, callback){    //filter: function    true：加载；false：不加载
        var thisObj = this;

        this.tileLoader.loadVectorTile(this.zoom, this.row, this.col, function(jsonObj){
            jsonObj = jsonObj || {};
            jsonObj.features = jsonObj.features || [];
            var tileGraphics = [],
                dataArray = Array.isArray(jsonObj.features) ? jsonObj.features : [jsonObj.features];

            for(var i = 0; i < dataArray.length; i++){
                var curData = dataArray[i];
                //var id = curData.id || curData.id;
                //var graphic = thisObj._createGraphic(curData);
                var graphic = Z.OSMBuildingBuilder.buildGraphic(curData);

                if((typeof filter === "Function") && !filter(graphic)){
                    continue;
                }

                tileGraphics.push(graphic);
            }

            thisObj.graphicObjects = tileGraphics;
            thisObj._renderGraphics(tileGraphics);

            callback(thisObj);
        });
    },

    _updateTileContent : function(meshes){
        if(this.needsUpdate){
            //var unloadedObjects = this._getUnloadedObjectsOfTile(tile);

            if(this.tileGraphic){
                this.root.remove(this.tileGraphic.root);
            }

            //var objects = this._removeDuplicateMeshes(tile, tile.objects);
            this._addMeshes(meshes);
            //this._registerMeshes(tile, tile.objects);

            if(this.tileGraphic){
                this.root.add(this.tileGraphic.root);
            }

            //if(tile.tempTileGraphic){
            //    this.root.remove(tile.tempTileGraphic.root);
            //    tile.tempTileGraphic.clear();
            //}

            this.needsUpdate = false;
        }
    },

    updateTileContentByGraphic : function(graphics){
        var tileMeshes = this._getGraphicMeshes(graphics);
        this._updateTileContent(tileMeshes);
    },

    updateTilePos: function(){
        if(this.tileGraphic) {
            this.tileGraphic.updateRasterIndex();
        }
    },

    ////_dispose: function(meshesForRemove, callback){
    //_dispose: function(meshesForRemove){
    //    //var //graphicsForRemove = [],
    //    //    context = this.tileLoader._context;
    //
    //    for(var j = 0; j < meshesForRemove.length; j++){
    //        //var graphic = meshesForRemove[j]._graphicObj;
    //        //graphic.onRemove(context.layer);
    //        //graphic.dispose();
    //        //graphicsForRemove.push(graphic);
    //        //meshesForRemove[j]._graphicObj = null;
    //        if(meshesForRemove[j].dispose){
    //            meshesForRemove[j].dispose();
    //        }
    //    }
    //
    //    //需要释放objects和graphicObjects的资源占用，待完善
    //    this.objects = [];
    //    this.graphicObjects = [];
    //
    //    if(this.tileGraphic){
    //        this.root.remove(this.tileGraphic.root);
    //        this.tileGraphic.dispose();
    //        this.tileGraphic = null;
    //    }
    //
    //    //if(this.tempTileGraphic){
    //    //    this.tempTileGraphic.dispose();
    //    //    this.tempTileGraphic = null;
    //    //}
    //
    //    //var key = this._getTileKey(tile.row, tile.col);
    //    //delete this._graphicTiles[key];
    //    //
    //    //if(callback){
    //    //    callback(this, graphicsForRemove);
    //    //}
    //},

    disposeByGraphic: function(graphicsForRemove, callback){
        if(!graphicsForRemove){
            return;
        }

        graphicsForRemove = Array.isArray(graphicsForRemove) ? graphicsForRemove : [graphicsForRemove];

        //var meshes = this._getGraphicMeshes(graphicsForRemove);
        //this._dispose(meshes);

        //需要释放objects和graphicObjects的资源占用，待完善
        this.objects = [];
        this.graphicObjects = [];

        if(this.tileGraphic){
            this.root.remove(this.tileGraphic.root);
            this.tileGraphic.dispose();
            this.tileGraphic = null;
        }

        //dispose graphics
        var context = this.tileLoader._context;

        for(var j = 0; j < graphicsForRemove.length; j++){
            var graphic = graphicsForRemove[j];
            graphic.onRemove(context.layer);
            graphic.dispose();
            //graphicsForRemove.push(graphic);
            //meshesForRemove[j]._graphicObj = null;
        }

        if(callback){
            callback(this, graphicsForRemove);
        }
    },

    _renderGraphics: function(graphics){
        var context = this.tileLoader._context,
            tileMeshes = [];

        for(var i = 0; i < graphics.length; i++){
            var graphic = graphics[i];
            graphic.onAdd(context.layer, context.container, context.scene);
            var meshes = this._getMeshes(graphic._mainElement._render._renderedObject);

            for(var j = 0; j < meshes.length; j++){
                tileMeshes.push(meshes[j]);
            }
        }

        this.objects = tileMeshes;
        this.needsUpdate = true;
        //this.graphicObjects = tileGraphics;
    },

    _getGraphicMeshes : function(graphic){
        var tileMeshes = [],
            graphics = Array.isArray(graphic) ? graphic : [graphic];

        for(var i = 0; i < graphics.length; i++){
            var graphic = graphics[i];
            var meshes = this._getMeshes(graphic._mainElement._render._renderedObject);

            for(var j = 0; j < meshes.length; j++){
                tileMeshes.push(meshes[j]);
            }
        }

        return tileMeshes;
    },

    _getMeshes : function(mesh){
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
    },

    _addMeshes: function(meshes){
        if(!this.tileGraphic){
            this.tileGraphic = new Z.MergedMesh3D1();
        }

        var objectsForAdd = [];

        for(var j = 0; j < meshes.length; j++){
            if(this.tileGraphic.hasMesh(meshes[j])){
                continue;
            }

            objectsForAdd.push(meshes[j]);
        }

        this.tileGraphic.addMeshes(objectsForAdd);
    }
});


