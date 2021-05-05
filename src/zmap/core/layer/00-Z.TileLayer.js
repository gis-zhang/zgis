/**
 * Created by Administrator on 2015/10/30.
 */
Z.TileLayer = Z.ILayer.extend({
    //options:{
    //    minZoom: 1,
    //    maxZoom:20,
    //    zoomOffset: 0,
    //    extent: Z.LatLngBounds.create(Z.LatLng.create(-90, -180), Z.LatLng.create(90, 180)),
    //    zIndex: 1,
    //    opacity: 1,
    //    errorTileUrl: '',
    //    attribution:'',
    //    params:{},
    //    tileInfo:{
    //        format:'image/png',
    //        tileWidth:256,
    //        tileHeight:256,
    //        dpi:96,
    //        origin: Z.LatLng(90, -180),
    //        levelDefine:[]
    //    }
    //},

    initialize: function(urls, options){
        this.options = {
            minZoom: 1,
            maxZoom:20,
            zoomOffset: 0,
            extent: Z.LatLngBounds.create(Z.LatLng.create(-90, -180), Z.LatLng.create(90, 180)),
            zIndex: 1,
            opacity: 1,
            errorTileUrl: '',
            attribution:'',
            crs: '',             //string
            params:{},
            pyramidId: "OSM",
            pyramidDefine: {
                type: "FixedMultiple",
                crsId: "EPSG3857",
                params: {}
            }
            //tileInfo:{
            //    format:'image/png',
            //    tileWidth:256,
            //    tileHeight:256,
            //    dpi:96,
            //    origin: Z.LatLng(90, -180),
            //    levelDefine:[]
            //}
        }

        urls = urls || [];

        if(!(urls instanceof Array)){
            urls = [urls + ""];
        }

        this._urls = urls;
        this._scene = null;
        this._render = null;
        this._containerPane = null;
        this._visible = true;

        this._pyramidModel = null;

        options = options || {};
        this.options = Z.Util.applyOptions(this.options, options, false, ['tileInfo']);
        this.options.tileInfo = Z.Util.applyOptions(this.options.tileInfo, options.tileInfo, false);
    },

    onAdd: function(scene, index, containerPane, groupPane){
        this.fire("loading");
        //var allAre2D = (scene instanceof Z.Scene2D) && (this._render instanceof Z.TileRender2D),
        //    allAre3D = (scene instanceof Z.Scene3D) && (this._render instanceof Z.TileRender3D);
        //
        //if(!(allAre2D|| allAre3D)){
            var newRender = this.getTileRender(scene, this._urls, this.options);

            if(this._render){
                this._render.onRemove(this._scene);
            }

            this._render = newRender;
        //}

        this._scene = scene;
        this._containerPane = containerPane;



        var retureIndex = this._render.onAdd(this._scene, index, containerPane, groupPane);
        this.fire("load");

        return retureIndex;
    },

    getTileRender: function(scene, urls, options){
        var render;

        //if(scene instanceof Z.Scene2D){
        //    render = new Z.TileRender2D(urls, options);
        //}else if(scene instanceof Z.Scene3D){
        //    render = new Z.TileRender3D(urls, options);
        //}

        if(!this._pyramidModel){
            this._pyramidModel = this._initPyramidModel(options);

            var sceneCRS = scene.getCRS(),
                layerCRS = this._pyramidModel.crs || sceneCRS;
            this._pyramidModel.projModel = new Z.ProjModel(sceneCRS, layerCRS);
        }

        options.pyramidModel = this._pyramidModel;

        if(scene instanceof Z.Scene2D){
            render = this.getTileRender2D(urls, options);
        }else if(scene instanceof Z.Scene3D){
            render = this.getTileRender3D(urls, options);
        }

        return render;
    },

    getTileRender2D: function(urls, options){
        return new Z.TileRender2D(urls, options);
    },

    getTileRender3D: function(urls, options){
        //return new Z.TileRender3D(urls, options);
        return new Z.TileAggregatedRender3D(urls, options);
    },

    onRemove: function(scene){
        if(this._render){
            this._render.onRemove(this._scene);
            this._render = null;
        }
    },

    show: function(){
        this._render.show();
    },

    hide: function(){
        this._render.hide();
    },

    setOpacity: function(opacity){
        this.options.opacity = opacity;
        this._render.setOpacity(opacity);
    },

    setZIndex: function(zIndex){
        this.options.zIndex = zIndex;
        this._render.setZIndex(zIndex);
    },

    getContainerPane: function(){
        return this._containerPane;
    },

    setZoomRange: function(minZoom, maxZoom){
        this.options.minZoom = ((typeof minZoom) === 'number') ? minZoom : this.options.minZoom;
        this.options.maxZoom = ((typeof maxZoom) === 'number') ? maxZoom : this.options.maxZoom;
        this.refresh();
    },

    refresh: function(){
        this._render.refresh(this.options);
    },

    _initPyramidModel: function(options){
        //var pyramidOptions = {
        //    //latLngBounds: this._latLngBounds.clone(),
        //    origin: options.tileInfo.origin,
        //    tileSize: Z.Point.create(options.tileInfo.tileWidth, options.tileInfo.tileHeight),
        //    levelDefine: options.tileInfo.levelDefine
        //};
        //
        ////if(this._scene){
        ////    pyramidOptions.crs = this._scene.options.crs;
        ////}
        //pyramidOptions.crs = Z.CRS[options.crs] || (this._scene ? this._scene.options.crs : null) || Z.CRS[ZMapConfig.crs];
        //
        //////this._pyramidModel = new Z.PyramidModel(pyramidOptions);
        ////this._pyramidModel = new Z.CustomPyramidModel(pyramidOptions);
        //return Z.PyramidModelFactory.create(pyramidOptions);

        var pyramidOptions = {
            pyramidId: options.pyramidId,
            pyramidDefine: options.pyramidDefine
        };

        return Z.PyramidModelFactory.create(pyramidOptions);
    }
});