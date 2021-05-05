/**
 * Created by Administrator on 2015/12/2.
 */
//Z.AbstractBuilding = Z.ComposeGraphic.extend({
Z.AbstractBuilding = Z.ComposeGraphic1.extend({
    initialize: function(feature, symbol, options){
        feature = feature || {};

        if(!(feature.shape instanceof Z.Extrude)){
            throw error("几何类型应为Z.Extrude");
        }

        //Z.ComposeGraphic.prototype.initialize.apply(this, arguments);
        Z.ComposeGraphic1.prototype.initialize.apply(this, arguments);

        //this.options = Z.Util.applyOptions(this.options, {
        //    selectSymbol: new Z.ExtrudeSymbol(),
        //    mouseoverSymbol: new Z.ExtrudeSymbol()
        //}, true);
        //
        //Z.Util.applyOptions(this.options, options);

        this._parts = {};
        this._basePlane = null;
        this._curPartIds = [];
        this._partsLoaded = false;
        this.partsLoader = null;

        this.id = "";
        this.name = "";
        this.desc = "";
        //this.baseHeight = 0;
    },

    loadParts: function(){
        if(this._partsLoaded || !this.partsLoader){
            return;
        }

        var thisObj = this;
        this.partsLoader.load(function(buildingData){
            var parts = thisObj._buildParts(thisObj, buildingData, thisObj.options.partsOptions);

            for(var i = 0; i < parts.length; i++){
                thisObj.addMember(parts[i]);
                thisObj._parts[parts[i]._id] = parts[i];
            }

            thisObj._partsLoaded = true;
        });
    },

    getAllParts: function(){
        //var parts = this.getAllMembers();
        var parts = [];

        for(var p in this._parts){
            parts.push(this._parts[p]);
        }

        return parts;
    },

    getParts: function(partIds){
        if(!(partIds instanceof Array)){
            partIds = [partIds];
        }

        var parts = [];

        for(var i = 0; i < partIds.length; i++){
            var curPart = this._parts[partIds[i]];

            if(curPart){
                parts.push(curPart);
            }
        }

        return parts;
    },

    getCurParts: function(){
        return this.getParts(this._curPartIds);
    },

    getCurPartIds: function(){
        var ids = [];

        for(var i = 0; i < this._curPartIds.length; i++){
            ids.push(this._curPartIds[i]);
        }

        return ids;
    },

    showParts: function(partIds, options){
       if(!partIds){
           return;
       }

        if(!(partIds instanceof Array)){
            partIds = [partIds];
        }

        this.loadParts();

        this._curPartIds = [];

        for(var i = 0; i < partIds.length; i++){
            this._curPartIds.push(partIds[i]);
        }

        this._showParts(this._curPartIds, options);
    },

    showAllParts: function(options){
        this.loadParts();

        this._curPartIds = [];

        for(var p in this._parts){
            this._curPartIds.push(p);
        }

        this._showParts(this._curPartIds, options);
    },

    showSelf: function(){
        this.disableMembers();
        this.enableSelf();
        //this.show();
        //options = options || {};

        //if(typeof options.margin === "number"){
        //    var margin = 1 - Math.max(0, Math.min(1, options.margin));
        //    //    pos = this._mainElementRoot.getPosition();
        //    //this._mainElementRoot.setScale({x: margin, y: margin, z: 1});
        //    //this._mainElementRoot.setPosition(pos);
        //    this.setScale({x: margin, y: margin, z: 1});
        //}

        this._curPartIds = [];
    },

    showStructure: function(){
        this._showBasePlane();
    },

    hideStructure: function(){
        this._hideBasePlane();
    },

    onAdd: function(graphicLayer, container, scene){
        //Z.ComposeGraphic.prototype.onAdd.apply(this, arguments);
        Z.ComposeGraphic1.prototype.onAdd.apply(this, arguments);

        ////this._setMembersBaseHeight();
        //this._setBuildingBaseHeight();
        //
        //this.updateFeature(this.feature);
    },

    updateFeature: function(feature){
        //Z.ComposeGraphic.prototype.updateFeature.apply(this, arguments);
        Z.ComposeGraphic1.prototype.updateFeature.apply(this, arguments);
        //this._setMembersBaseHeight();
        //this._setBuildingBaseHeight();
    },

    updateSymbol: function(symbol){
        //Z.ComposeGraphic.prototype.updateSymbol.apply(this, arguments);
        Z.ComposeGraphic1.prototype.updateSymbol.apply(this, arguments);
        //this._setMembersBaseHeight();
        //this._setBuildingBaseHeight();
    },

    //getWorldBaseHeight: function(){
    //    var baseHeight = this.getBaseHeight();
    //
    //    if(this._parent && this._parent.getBaseHeight){
    //        baseHeight += this._parent.getBaseHeight();
    //    }
    //
    //    return baseHeight;
    //},
    //
    //getBaseHeight: function(global){
    //    return this.baseHeight || 0;
    //},
    //
    //setBaseHeight: function(baseHeight){
    //    if(isNaN(baseHeight)){
    //        return;
    //    }
    //
    //    this.baseHeight = baseHeight;
    //    this._setBuildingBaseHeight();
    //},

    _showParts: function(partIds, options){
        this.disableSelf();
        this.enableMembers();
        //this.show();

        //this._showBasePlane();

        var parts = this.getParts(partIds) || [];

        for(var key in this._parts){
            this._parts[key].hide();
        }

        for(var i = 0; i < parts.length; i++){
            this._showOnePart(parts[i], options);
        }
    },

    _showOnePart: function(part, options){
        options = options || {};

        if(options.showInner){
            part.showAllParts();
        }else{
            part.showSelf();
        }
    },

    _buildParts: function(ownerGraphic, partsData, partsOptions){
        throw error("_buildParts(loader)是抽象方法，请在子类中覆盖");
    },

    _createBasePlane: function(){
        var geometry = new Z.Polygon(this.feature.shape.paths);
        var feature = new Z.Feature({}, geometry);
        //var plane = new Z.Graphic(feature, new Z.PolygonSymbol());
        var plane = new Z.ComposeGraphic1(feature, new Z.PolygonSymbol());
        plane.eventCapturable = true;
        plane.eventFirable = false;

        return plane;
    },

    _showBasePlane: function(){
        if(!this._basePlane){
            this._basePlane = this._createBasePlane();
            this.addMember(this._basePlane);
        }

        this._basePlane.show();
    },

    _hideBasePlane: function(){
        if(this._basePlane){
            this._basePlane.hide();
        }
    }//,

    //_setMembersBaseHeight: function(){
    //    var baseHeight = this.feature.shape.baseHeight;
    //
    //    if(isNaN(parseFloat(baseHeight))){
    //        return;
    //    }
    //
    //    //if(!Z.Util.numberEquals(this.baseHeight, baseHeight)){
    //        this.baseHeight = baseHeight;
    //        //this.feature.shape.baseHeight = baseHeight;
    //        var sceneHeight = this._layer.getSceneHeight(baseHeight);
    //
    //        if(this._membersRoot){
    //            var meshPos = this._membersRoot.getPosition();
    //            this._membersRoot.setPosition({x: meshPos.x, y: meshPos.y, z: sceneHeight});
    //            //this._membersRoot.root.updateMatrix();
    //        }
    //    //}
    //
    //},

    //_setBuildingBaseHeight: function(){
    //    var baseHeight = this.baseHeight;
    //
    //    if(isNaN(parseFloat(baseHeight))){
    //        return;
    //    }
    //
    //    var sceneHeight = this._layer.getSceneHeight(baseHeight);
    //
    //    if(this._graphicRoot){
    //        var meshPos = this._graphicRoot.getPosition();
    //        this._graphicRoot.setPosition({x: meshPos.x, y: meshPos.y, z: sceneHeight});
    //    }
    //},

    ////override
    //_getTitlePos:function(){
    //    //var pos = Z.ComposeGraphic.prototype._getTitlePos.apply(this);
    //    var pos = Z.ComposeGraphic1.prototype._getTitlePos.apply(this);
    //    pos.alt = this.getBaseHeight() + this.feature.shape.height;
    //
    //    return pos;
    //}
});