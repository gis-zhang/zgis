/**
 * Created by Administrator on 2015/10/31.
 */
Z.VectorTileRender3D = Z.GraphicLayerTileRender3D.extend({
    initialize: function(options){
        //this._super = Z.GraphicLayerTileRender3D;
        Z.GraphicLayerTileRender3D.prototype.initialize.apply(this, arguments);

        this._tileLoader = new Z.VectorTileLoader();

        //var paramid = new Z.PyramidModel(),
        //var paramid = new Z.FixedMultiplePyramidModel(),
        //var paramid =  Z.PyramidModelFactory.create({crs: Z.CRS.EPSG3857}),
        var paramid =  options.pyramidModel,
            levelMapping = [{start:15, end: 20, toLevel: 15}];
        //this._tileManager = new Z.VectorTileManager(paramid, levelMapping, this.options.idProp);
        this._tileManager = new Z.VectorTileManager(paramid, levelMapping);
        this._tileManager.tileLoader = this._tileLoader;
    },

    onAdd: function(graphicLayer, scene, index, containerPane, groupPane){
        Z.GraphicLayerTileRender3D.prototype.onAdd.apply(this, arguments);
        this._refreshTiles();
    },

    _refreshTiles: function(){
        var latlngContentBounds = this._scene.getContentBounds(),
            latlngOrchoBounds = this._scene.getBounds(),
            pixelOrchoSize = this._scene.getSize();
        var pixelContentXSize = pixelOrchoSize.x * (latlngContentBounds.getEast() - latlngContentBounds.getWest()) / (latlngOrchoBounds.getEast() - latlngOrchoBounds.getWest()),
            pixelContentYSize = pixelOrchoSize.y * (latlngContentBounds.getNorth() - latlngContentBounds.getSouth()) / (latlngOrchoBounds.getNorth() - latlngOrchoBounds.getSouth());

        this._tileManager.updateVisibleBBox(latlngContentBounds, new Z.Point(pixelContentXSize, pixelContentYSize));
    },

    _applyEvents: function(onOff){
        Z.GraphicLayerTileRender3D.prototype._applyEvents.call(this, onOff);

        this._tileManager[onOff]('tileload', this._fireTileLoadEvent, this);
        this._tileManager[onOff]('tileupdate', this._fireTileUpdateEvent, this);
        this._tileManager[onOff]('tileremove', this._fireTileRemoveEvent, this);
    },

    _fireTileLoadEvent: function(e){
        this.fire('tileload', {
            row: e.row,
            col: e.col,
            graphics: e.graphics
        });
    },

    _fireTileUpdateEvent: function(e){
        this.fire('tileupdate', {
            row: e.row,
            col: e.col
        });
    },

    _fireTileRemoveEvent: function(e){
        this.fire('tileremove', {
            row: e.row,
            col: e.col,
            graphics: e.graphics
        });
    }
});