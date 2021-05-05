/**
 * Created by Administrator on 2015/10/30.
 */
Z.TiledGraphicLayer = Z.ILayer.extend({
    initialize: function( options){
        this.options = {
            idProp: '',
            nameProp: '',
            opacity: 1,
            zIndex: 0,
            minZoom: null,
            maxZoom: null,
            enableInfoWindow: false,
            infoWindowOptions: null,
            enableTip: false,
            enableTitle: false,
            enableIcon: false
        };

        this._graphics = {};
        this._scene = null;
        this._render = null;
        this._containerPane = null;
        this._visible = true;
        this._pyramidModel = null;

        options = options || {};
        this.options = Z.Util.applyOptions(this.options, options, false);
    },

    onAdd: function(scene, index, containerPane, groupPane){
        this.fire("loading");

        if(this._render){
            this._render.onRemove(this._scene);
        }

        var newRender = this._getGraphicLayerRender(scene, this.options);
        this._render = newRender;
        this._scene = scene;
        this._containerPane = containerPane;
        var layerIndex = this._render.onAdd(this, this._scene, index, containerPane, groupPane);

        for(var key in this._graphics){
            if(this._graphics[key]){
                this._render.addGraphic(this, this._graphics[key]);

                //if(this.options.enableTitle){
                //    this._graphics[key].showTitle();
                //}
            }
        }

        this._scene.refresh();
        this._applyEvents("on");
        this.fire("load");

        return layerIndex;
    },

    onRemove: function(scene){
        this._render.onRemove(this._scene);
        //this._scene.refresh();
        this._scene = null;
        this._render = null;
        this._applyEvents("off");
    },

    show: function(){
        this._render.show();

        //if(this.options.enableTitle){
        //    for(var key in this._graphics){
        //        if(this._graphics[key]){
        //            this._graphics[key].showTitle();
        //        }
        //    }
        //}
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

    getZIndex: function(){
        return this._render.getZIndex();
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

    //addGraphic: function(graphic){
    //    //this._addOneGraphic(graphic);
    //    var graphics = graphic instanceof Array ? graphic : [graphic];
    //    this._addGraphics(graphics);
    //
    //    if(this._scene) {
    //        this._scene.refresh();
    //    }
    //},
    //
    //addGraphics: function(graphics){
    //    graphics = graphics instanceof Array ? graphics : [graphics];
    //
    //    //for(var i = 0; i < graphics.length; i++){
    //    //    this._addOneGraphic(graphics[i]);
    //    //}
    //
    //    this._addGraphics(graphics);
    //
    //    if(this._scene) {
    //        this._scene.refresh();
    //    }
    //},

    getGraphics: function(){
        var graphics = [];

        for(var key in this._graphics){
            graphics.push(this._graphics[key]);
        }

        return graphics;
    },

    hasGraphic: function(graphic){
        if(!graphic){
            return false;
        }

        var stamp = Z.Util.stamp(graphic, 'graphic');

        if(this._graphics[stamp]){
            return true;
        }else{
            return false;
        }
    },

    //removeGraphic: function(graphic){
    //    //if(graphic instanceof Z.Graphic) {
    //    //    var stamp = Z.Util.stamp(graphic, 'graphic');
    //    //
    //    //    if(!this._graphics[stamp]){
    //    //        return;
    //    //    }
    //    //
    //    //    if(this._render){
    //    //        this._render.removeGraphic(this, graphic);
    //    //    }
    //    //
    //    //    delete this._graphics[stamp];
    //    //    this._applyGraphicEvents(graphic, 'off');
    //    //    this._scene.refresh();
    //    //    this.fire("graphicremove", {graphic: graphic});
    //    //}
    //    var graphics = graphic instanceof Array ? graphic : [graphic];
    //    this._removeGraphics(graphics)
    //
    //    if(this._scene) {
    //        this._scene.refresh();
    //    }
    //},
    //
    //removeGraphics: function(graphics){
    //    //if(graphic instanceof Z.Graphic) {
    //    //    var stamp = Z.Util.stamp(graphic, 'graphic');
    //    //
    //    //    if(!this._graphics[stamp]){
    //    //        return;
    //    //    }
    //    //
    //    //    if(this._render){
    //    //        this._render.removeGraphic(this, graphic);
    //    //    }
    //    //
    //    //    delete this._graphics[stamp];
    //    //    this._applyGraphicEvents(graphic, 'off');
    //    //    this._scene.refresh();
    //    //    this.fire("graphicremove", {graphic: graphic});
    //    //}
    //
    //    graphics = graphics instanceof Array ? graphics : [graphics];
    //    this._removeGraphics(graphics);
    //
    //    if(this._scene){
    //        this._scene.refresh();
    //    }
    //},

    //clear: function(){
    //    //this._containerPane.removeChild(this._graphicRoot);
    //    //this._graphicRoot.resetRoot();
    //    //this._containerPane.addChild(this._graphicRoot);
    //    //
    //    //for(var key in this._graphics){
    //    //    if(this._graphics[key]){
    //    //        var gra = this._graphics[key];
    //    //        this._applyGraphicEvents(gra, 'off');
    //    //        delete this._graphics[key];
    //    //        this.fire("graphicremove", {graphic: gra});
    //    //    }
    //    //}
    //    //
    //    //this._graphics = {};
    //    //this._scene.refresh();
    //
    //    var graphics = [];
    //
    //    for(var key in this._graphics){
    //        graphics.push(this._graphics[key]);
    //    }
    //
    //    this.removeGraphics(graphics);
    //    this.fire("graphicsclear");
    //},

    latLngToLayerScenePoint: function(latLng){
        if(this._render){
            return this._render.latLngToLayerScenePoint(latLng);
        }else{
            return null;
        }
    },

    layerScenePointToLatLng: function(latLng){
        if(this._render){
            return this._render.layerScenePointToLatLng(latLng);
        }else{
            return null;
        }
    },

    getLayerSceneBounds: function(){
        var latLngBounds = this._scene.getContentBounds(),
            southWest = latLngBounds.getSouthWest(),
            northEast = latLngBounds.getNorthEast(),
            southWestScene, northEastScene;

        southWestScene = this.latLngToLayerScenePoint(southWest);
        northEastScene = this.latLngToLayerScenePoint(northEast);

        return Z.GLBounds.create(southWestScene, northEastScene);
    },

    getSceneHeight: function(height){
        //return this._scene.getSceneDistance(height);
        if(this._render){
            return this._render.getSceneHeight(height);
        }else{
            return null;
        }
    },

    _getGraphicLayerRender: function(scene, options){
        var render;

        if(!this._pyramidModel){
            this._pyramidModel = this._initPyramidModel(options);
        }

        options.pyramidModel = this._pyramidModel;

        if(scene instanceof Z.Scene2D){
            render = this._getGraphicLayerRender2D(options);
        }else if(scene instanceof Z.Scene3D){
            render = this._getGraphicLayerRender3D(options);
        }

        return render;
    },

    _getGraphicLayerRender2D: function(options){
        return new Z.GraphicLayerRender2D(options);
    },

    _getGraphicLayerRender3D: function(options){
        //return new Z.GraphicLayerRender3D(options);
        return new Z.VectorTileRender3D(options);
    },

    _applyEvents: function(onOff){
        if (!Z.DomEvent || !this._render) { return; }

        onOff = onOff || 'on';

        this._applyLayerEvents(onOff);

        var graphics = this.getGraphics();

        for(j = 0; j < graphics.length; j++){
            this._applyGraphicEvents(graphics[j], onOff);
        }

        this._applyTileEvents(onOff);
    },

    _applyLayerEvents: function(onOff){
        var events = ['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover',
                'mouseout', 'mousemove', 'contextmenu'],
            i, j, len;

        for (i = 0, len = events.length; i < len; i++) {
            this._render[onOff](events[i], this._fireLayerEvent, this);
        }

        if(this.options.enableInfoWindow){
            this._enableInfoWindowEvent(onOff);
        }

        if(this.options.enableTip){
            this._enableTipEvent(onOff);
        }
    },

    _fireLayerEvent: function(e){//console.info(e.type);
        this.fire(e.type, e);
    },

    _applyGraphicEvents: function(graphic, onOff){
        var events = ['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover',
                'mouseout', 'mousemove', 'contextmenu', 'select', 'unselect'];

        for (var i = 0, len = events.length; i < len; i++) {
            graphic[onOff](events[i], this._fireGraphicEvent, this);
        }

        var reactEvents = ['select', 'unselect',  'mouseover',  'mouseout'];

        for (var j = 0, len = reactEvents.length; j < len; j++) {
            graphic[onOff](reactEvents[j], this._enableGraphicAutoReact, this);
        }
    },

    _fireGraphicEvent: function(graphicEvent){//console.info(e.type);
        this.fire("graphic" + graphicEvent.type, {
            latlng: graphicEvent.latlng,
            scenePoint: graphicEvent.scenePoint,
            containerPoint: graphicEvent.containerPoint,
            originalEvent: graphicEvent.originalEvent,
            objects: graphicEvent.object ? [graphicEvent.object] : []
        });
    },

    _enableGraphicAutoReact: function(graphicEvent){
        var type = graphicEvent.type,
            graphic = graphicEvent.object;

        if(!graphic){
            return;
        }

        if(type === "select"){
            graphic.doSelect();
        }else if(type === "unselect"){
            graphic.doUnselect();
        }else if(type === "mouseover"){
            graphic.doMouseOver();
        }else if(type === "mouseout"){
            graphic.doMouseOut();
        }
    },

//    _addGraphics: function(graphics){
//        var newGraphics = this._checkGraphics(graphics);
//        var graphicsLength = newGraphics.length;
//
//        if(graphicsLength === 0){
//            return;
//        }
//
//        for(var i = 0; i < graphicsLength; i++) {
//            var graphic = newGraphics[i];
//
//            if(this.options.enableTitle){
//                graphic.enableTitle();
//            }
//
//            if(this.options.enableIcon){
//                graphic.enableIcon();
//            }
//        }
////console.info("Z.Graphic:render begin addGraphics");
//        if(this._render) {
//            this._render.addGraphics(this, newGraphics);
//        }
////console.info("Z.Graphic:begin apply graphic event: " + graphicsLength);
//        for(var i = 0; i < graphicsLength; i++){
//            var graphic = newGraphics[i];
//
//            //if(this.options.enableTitle){
//            //    graphic.enableTitle();
//            //}
//            //
//            //if(this.options.enableIcon){
//            //    graphic.enableIcon();
//            //}
//
//            var stamp = Z.Util.stamp(graphic, 'graphic');
//            this._graphics[stamp] = graphic;
//
//            this._applyGraphicEvents(graphic, 'on');
//
//            this.fire("graphicadd", {graphic: graphic});
//            //console.info("fire graphicadd event:" + i);
//        }
//        //console.info("Z.Graphic:apply graphic event end");
//    },
//
//    _removeGraphics: function(graphics){
//        var newGraphics = this._checkGraphics(graphics, "exist");
//        var graphicsLength = newGraphics.length;
//
//        if(graphicsLength === 0){
//            return;
//        }
//
//        if(this._render) {
//            this._render.removeGraphics(this, newGraphics);
//        }
//
//        for(var i = 0; i < graphicsLength; i++){
//            var graphic = newGraphics[i];
//            var stamp = Z.Util.stamp(graphic, 'graphic');
//
//            delete this._graphics[stamp];
//            this._applyGraphicEvents(graphic, 'off');
//            this.fire("graphicremove", {graphic: graphic});
//        }
//    },

    //_checkGraphics: function(graphics, type){      //type: "exist" | "new"
    //    var newGraphics = [],
    //        graphicsLength = graphics.length,
    //        type = type || "new";
    //
    //    for(var i = 0; i < graphicsLength; i++) {
    //        var graphic = graphics[i];
    //
    //        if (graphic instanceof Z.Graphic || graphic instanceof Z.ComposeGraphic1) {
    //            var stamp = Z.Util.stamp(graphic, 'graphic');
    //
    //            if (!this._graphics[stamp] && type === "new") {
    //                newGraphics.push(graphic);
    //            }else if(this._graphics[stamp] && type === "exist"){
    //                newGraphics.push(graphic);
    //            }
    //        }
    //    }
    //
    //    return newGraphics;
    //},

    _enableInfoWindowEvent: function(onOff){
        this[onOff]("graphicclick", this._showGraphicInfoWindow, this);
    },

    _showGraphicInfoWindow: function(e){
        var obj = e.objects;

        if(obj && obj.length > 0){
            obj[0].showInfoWindow(this.options.infoWindowOptions);
        }
    },

    _enableTipEvent: function(onOff){
        this[onOff]("graphicmouseover", this._showGraphicTip, this);
        this[onOff]("graphicmouseout", this._hideGraphicTip, this);
    },

    _showGraphicTip: function(e){
        var obj = e.objects;

        if(obj && obj.length > 0){
            obj[0].showTip();
        }
    },

    _hideGraphicTip: function(e){
        var obj = e.objects;

        if(obj && obj.length > 0){
            obj[0].hideTip();
        }
    },

    _applyTileEvents: function(onOff){
        this._render[onOff]('tileload', this._onTileLoad, this);
        this._render[onOff]('tileupdate', this._onTileUpdate, this);
        this._render[onOff]('tileremove', this._onTileRemove, this);
    },

    _onTileLoad: function(e){
        var graphics = e.graphics;
        this._addGraphics(graphics);
    },

    _onTileUpdate: function(e){},

    _onTileRemove: function(e){
        var graphics = e.graphics;
        this._removeGraphics(graphics);
    },

    _addGraphics: function(graphics){
        var newGraphics = this._checkGraphics(graphics);
        var graphicsLength = newGraphics.length;

        if(graphicsLength === 0){
            return;
        }

        for(var i = 0; i < graphicsLength; i++) {
            var graphic = newGraphics[i];

            if(this.options.enableTitle){
                graphic.enableTitle();
            }

            if(this.options.enableIcon){
                graphic.enableIcon();
            }
        }

        for(var i = 0; i < graphicsLength; i++){
            var graphic = newGraphics[i];

            var stamp = Z.Util.stamp(graphic, 'graphic');
            this._graphics[stamp] = graphic;

            this._applyGraphicEvents(graphic, 'on');

            this.fire("graphicadd", {graphic: graphic});
            //console.info("fire graphicadd event:" + i);
        }
        //console.info("Z.Graphic:apply graphic event end");
    },

    _removeGraphics: function(graphics){
        var newGraphics = this._checkGraphics(graphics, "exist");
        var graphicsLength = newGraphics.length;

        if(graphicsLength === 0){
            return;
        }

        for(var i = 0; i < graphicsLength; i++){
            var graphic = newGraphics[i];
            var stamp = Z.Util.stamp(graphic, 'graphic');

            delete this._graphics[stamp];
            this._applyGraphicEvents(graphic, 'off');
            this.fire("graphicremove", {graphic: graphic});
        }
    },

    _checkGraphics: function(graphics, type){      //type: "exist" | "new"
        var newGraphics = [],
            graphicsLength = graphics.length,
            type = type || "new";

        for(var i = 0; i < graphicsLength; i++) {
            var graphic = graphics[i];

            if (graphic instanceof Z.Graphic || graphic instanceof Z.ComposeGraphic1) {
                var stamp = Z.Util.stamp(graphic, 'graphic');

                if (!this._graphics[stamp] && type === "new") {
                    newGraphics.push(graphic);
                }else if(this._graphics[stamp] && type === "exist"){
                    newGraphics.push(graphic);
                }
            }
        }

        return newGraphics;
    },

    _initPyramidModel: function(options){
        //var pyramidOptions = {
        //    //latLngBounds: this._latLngBounds.clone(),
        //    origin: options.tileInfo.origin,
        //    tileSize: Z.Point.create(options.tileInfo.tileWidth, options.tileInfo.tileHeight),
        //    levelDefine: options.tileInfo.levelDefine
        //};

        //if(this._scene){
        //    pyramidOptions.crs = this._scene.options.crs;
        //}
        //pyramidOptions.crs = Z.CRS[options.crs] || (this._scene ? this._scene.options.crs : null) || Z.CRS[ZMapConfig.crs];
        //var pyramidOptions = {
        //    //latLngBounds: this._latLngBounds.clone(),
        //    //origin: options.tileInfo.origin,
        //    //tileSize: Z.Point.create(options.tileInfo.tileWidth, options.tileInfo.tileHeight),
        //    //levelDefine: options.tileInfo.levelDefine
        //};
        //pyramidOptions.crs = Z.CRS["EPSG3857"];
        //
        //////this._pyramidModel = new Z.PyramidModel(pyramidOptions);
        ////this._pyramidModel = new Z.CustomPyramidModel(pyramidOptions);
        //return Z.PyramidModelFactory.create(pyramidOptions);

        return new Z.PyramidModel.OSM();
    }
});