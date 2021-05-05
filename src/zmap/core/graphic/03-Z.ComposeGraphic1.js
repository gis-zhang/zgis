/**
 * Created by Administrator on 2015/12/2.
 */
//Z.ComposeGraphic1 = Z.Graphic.extend({
Z.ComposeGraphic1 = Z.Class.extend({
    includes: Z.EventManager,

    initialize: function(feature, symbol, options){
        //Z.Graphic.prototype.initialize.apply(this, arguments);
        this._container = null;
        this._layer = null;

        this._self = new Z.Graphic(feature, symbol, options);
        this._members = [];
        this._membersShowing = false;
        this._selfShowing = true;
        this._membersRoot = null;
        this._graphicRoot = null;
        //this._scene = null;
        this._parent = null;
        this._show = true;
        this._added = false;

        this._baseHeight = 0;

        this._feature = feature;

        this._graphicEvents = ['symbolupdated', 'featureupdated', 'show', 'hide'];
        this._mouseEvents = ['dblclick', 'click', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'mousemove', 'contextmenu', 'select', 'unselect'];

        var thisObj = this;

        Object.defineProperty(this, "baseHeight", {
            get: function () { return thisObj._baseHeight; },
            set: function (value) {
                if(isNaN(value)){
                    return;
                }

                thisObj._baseHeight = value;
                thisObj.updateFeature(thisObj.feature);
            }
        });

        Object.defineProperty(this, "options", {
            get: function () { return thisObj._self.options; },
            set: function (value) { thisObj._self.options = value; }
        });

        Object.defineProperty(this, "feature", {
            get: function () { return thisObj._feature; },
            set: function (value) {
                if(!(value instanceof Z.Feature)){
                    return;
                }

                thisObj._feature = value;
                thisObj.updateFeature(value);
            }
        });

        Object.defineProperty(this, "symbol", {
            get: function () { return thisObj._self.symbol; },
            set: function (value) { thisObj._self.symbol = value; }
        });

        Object.defineProperty(this, "eventCapturable", {
            get: function () { return thisObj._self.eventCapturable; },
            set: function (value) { thisObj._self.eventCapturable = value; }
        });

        Object.defineProperty(this, "eventFirable", {
            get: function () { return thisObj._self.eventFirable; },
            set: function (value) { thisObj._self.eventFirable = value; }
        });

        //Object.defineProperty(this, "_layer", {
        //    get: function () { return thisObj._self._layer; },
        //    set: function (value) { thisObj._self._layer = value; }
        //});

        //Object.defineProperty(this, "_container", {
        //    get: function () { return thisObj._self._container; },
        //    set: function (value) { thisObj._self._container = value; }
        //});

        //Object.defineProperty(this, "_titleElement", {
        //    get: function () { return thisObj._self._titleElement; },
        //    set: function (value) { thisObj._self._titleElement = value; }
        //});

        //Object.defineProperty(this, "_scene", {
        //    get: function () { return thisObj._self._scene; },
        //    set: function (value) { thisObj._self._scene = value; }
        //});
        //
        //Object.defineProperty(this, "_mainElementRoot", {
        //    get: function () { return thisObj._self._mainElementRoot; },
        //    set: function (value) { thisObj._self._mainElementRoot = value; }
        //});
        //
        //Object.defineProperty(this, "_mainElement", {
        //    get: function () { return thisObj._self._mainElement; },
        //    set: function (value) { thisObj._self._mainElement = value; }
        //});
        //
        //Object.defineProperty(this, "_infoTemplate", {
        //    get: function () { return thisObj._self._infoTemplate; },
        //    set: function (value) { thisObj._self._infoTemplate = value; }
        //});

        //Object.defineProperty(this, "_added", {
        //    get: function () { return thisObj._self._added; },
        //    set: function (value) { thisObj._self._added = value; }
        //});
        //
        //Object.defineProperty(this, "_show", {
        //    get: function () { return thisObj._self._show; },
        //    set: function (value) { thisObj._self._show = value; }
        //});
        //
        //Object.defineProperty(this, "_titleShowing", {
        //    get: function () { return thisObj._self._titleShowing; },
        //    set: function (value) { thisObj._self._titleShowing = value; }
        //});
        //
        //Object.defineProperty(this, "_tipShowing", {
        //    get: function () { return thisObj._self._tipShowing; },
        //    set: function (value) { thisObj._self._tipShowing = value; }
        //});
        //
        //Object.defineProperty(this, "_infoWindowShowing", {
        //    get: function () { return thisObj._self._infoWindowShowing; },
        //    set: function (value) { thisObj._self._infoWindowShowing = value; }
        //});
        //
        //Object.defineProperty(this, "_currentSymbol", {
        //    get: function () { return thisObj._self._currentSymbol; },
        //    set: function (value) { thisObj._self._currentSymbol = value; }
        //});
    },

    onAdd: function(graphicLayer, container, scene){
        if(!this._graphicRoot && container){
            this._graphicRoot = container.newInstance();
            container.addChild(this._graphicRoot);

            this._membersRoot = container.newInstance();
            this._graphicRoot.addChild(this._membersRoot);
        }

        this._layer = graphicLayer;

        ////Z.Graphic.prototype.onAdd.apply(this, [graphicLayer, this._graphicRoot, scene]);
        //this._self.onAdd(graphicLayer, this._graphicRoot, scene);
        //this._layer.addGraphic(this._self);

        var newFeature = this._getGraphicFeature(this.feature);
        this._self.updateFeature(newFeature);

        this._addOneGraphic(this._self, this._graphicRoot);

        //if(!this._membersRoot && this._mainElementRoot){
        //    this._membersRoot = this._mainElementRoot.newInstance();
        //
        //    if(this._graphicRoot){
        //        this._graphicRoot.addChild(this._membersRoot);
        //    }
        //}

        this._container = container;
        this._added = true;

        this._applyEvents("on");
        //this.show();
    },

    onRemove: function(graphicLayer){
        this.clearMembers();
        this._removeOneGraphic(this._self);
        this._graphicRoot.removeChild(this._membersRoot);
        this._container.removeChild(this._graphicRoot);
        this._membersRoot = null;
        this._graphicRoot = null;
        this._layer = null;
        this._container = null;
        this._added = false;

        this._applyEvents("off");
    },

    updateFeature: function(feature){
        if(this._self){
            var newFeature = this._getGraphicFeature(this.feature);
            this._self.updateFeature(newFeature);
        }

        for(var i = 0; i < this._members.length; i++){
            this._members[i].updateFeature(this._members[i].feature);
        }
    },

    updateSymbol: function(symbol){
        if(this._self) {
            this._self.updateSymbol(symbol);
        }

        for(var i = 0; i < this._members.length; i++){
            this._members[i].updateSymbol(this._members[i].symbol);
        }
    },

    dispose: function(){
        if(this._self) {
            this._self.dispose();
        }
    },

    refresh: function(){
        if(this._self) {
            this._self.refresh();
        }

        for(var i = 0; i < this._members.length; i++){
            this._members[i].refresh();
        }
    },

    showTitle: function(){
        if(this._self) {
            this._self.showTitle();
        }
    },

    hideTitle: function(){
        if(this._self) {
            this._self.hideTitle();
        }
    },

    showMarker: function(){
        if(this._self) {
            this._self.showMarker();
        }
    },

    hideMarker: function(){
        if(this._self) {
            this._self.hideMarker();
        }
    },

    showInfoWindow: function(){
        if(this._self) {
            this._self.showInfoWindow();
        }
    },

    hideInfoWindow: function(){
        if(this._self) {
            this._self.hideInfoWindow();
        }
    },

    showTip: function(){
        if(this._self) {
            this._self.showTip();
        }
    },

    hideTip: function(){
        if(this._self) {
            this._self.hideTip();
        }
    },

    show: function(){
        if(!this._selfShowing && !this._membersShowing){
            this._selfShowing = true;
        }

        if(this._selfShowing){
            this._showSelf();
        }else{
            this._hideSelf();
        }

        if(this._membersShowing) {
            this._showMembers();
        }else{
            this._hideMembers();
        }

        //if(this._scene){
        //    this._scene.refresh();
        //}
    },

    hide: function(){
        this.disableSelf();
        this.disableMembers();

        //if(this._scene){
        //    this._scene.refresh();
        //}
    },

    isShowing: function(){
        //if(this._self) {
        //    this._self.isShowing();
        //}

        return this._selfShowing || this._membersShowing;
    },

    isAdded: function(){
        return this._added;
    },

    enableTitle: function(){
        if(this._self) {
            this._self.enableTitle();
        }
    },

    disableTitle: function(){
        if(this._self) {
            this._self.disableTitle();
        }
    },

    doMouseOver: function(){
        if(this._self) {
            this._self.doMouseOver();
        }
    },

    doMouseOut: function(){
        if(this._self) {
            this._self.doMouseOut();
        }
    },

    doSelect: function(){
        if(this._self) {
            this._self.doSelect();
        }
    },

    doUnselect: function(){
        if(this._self) {
            this._self.doUnselect();
        }
    },

    enableMembers: function(){
        if(this._membersShowing){
            return;
        }

        this._showMembers();
        this._membersShowing = true;
    },

    disableMembers: function(){
        if(!this._membersShowing){
            return;
        }

        this._hideMembers();
        this._membersShowing = false;
    },

    enableSelf: function(){
        if(this._selfShowing){
            return;
        }

        this._showSelf();
        this._selfShowing = true;
        //this._scene.refresh();
    },

    disableSelf: function(){
        if(!this._selfShowing){
            return;
        }

        this._hideSelf();
        this._selfShowing = false;
        //this._scene.refresh();
    },

    addMember: function(graphic){
        if(!graphic){
            return;
        }

        var graphics = (graphic instanceof Array) ? graphic : [graphic];

        for(var i = 0; i < graphics.length; i++){
            this._addOneMember(graphics[i]);
        }
    },

    removeMember: function(graphic){
        if(!graphic){
            return;
        }

        var graphics = (graphic instanceof Array) ? graphic : [graphic];

        for(var i = 0; i < graphics.length; i++){
            for(var j = this._members.length - 1; j >= 0; j--){
                this._removeOneMember(this._members[j], j);
            }
        }

    },

    clearMembers: function(){
        //this._members = [];
        for(var i = this._members.length - 1; i >= 0; i--){
            this._removeOneMember(this._members[i], i);
        }
    },

    getAllMembers: function(){
        return this._members;
    },

    getWorldBaseHeight: function(){
        //var baseHeight = this.getBaseHeight();
        var baseHeight = this.baseHeight || 0;

        if(this._parent && this._parent.baseHeight){
            baseHeight += (this._parent.baseHeight || 0);
        }

        return baseHeight;
    },

    //getBaseHeight: function(global){
    //    return this.baseHeight || 0;
    //},

    //setBaseHeight: function(baseHeight){
    //    if(isNaN(baseHeight)){
    //        return;
    //    }
    //
    //    this.baseHeight = baseHeight;
    //    this._setGraphicBaseHeight();
    //},

    //_setGraphicBaseHeight: function(){
    //    var baseHeight = this.baseHeight;
    //
    //    if(isNaN(parseFloat(baseHeight))){
    //        return;
    //    }
    //
    //    if(this._layer){
    //        var sceneHeight = this._layer.getSceneHeight(baseHeight);
    //
    //        if(this._graphicRoot){
    //            var meshPos = this._graphicRoot.getPosition();
    //            this._graphicRoot.setPosition({x: meshPos.x, y: meshPos.y, z: sceneHeight});
    //        }
    //    }
    //},

    _getGraphicFeature: function(feature){
        var worldBaseHeight = this.getWorldBaseHeight(),
            newFeature = feature.clone();

        newFeature.shape.baseHeight += worldBaseHeight;

        return newFeature;
    },

    _hideSelf: function(){
        ////this._mainElementRoot.hide();
        //Z.Graphic.prototype.hide.apply(this);
        //this._self.hide();
        if(this._self && this._layer && this._layer.hasGraphic(this._self)) {
            this._removeOneGraphic(this._self);
            //this._applyObjectEvents('off', this._self, this._graphicEvents);
            //this._applyObjectEvents('off', this._self, this._mouseEvents);
        }
    },

    _showSelf: function(){
        ////this._mainElementRoot.show();
        //Z.Graphic.prototype.show.apply(this);
        //this._self.show();

        if(this._self && this._layer && !this._layer.hasGraphic(this._self)){
            this._addOneGraphic(this._self, this._graphicRoot);
            //this._applyObjectEvents('on', this._self, this._graphicEvents);
            //this._applyObjectEvents('on', this._self, this._mouseEvents);
        }
    },

    _hideMembers: function(){
        for(var i = 0; i < this._members.length; i++){
            this._hideOneMember(this._members[i]);
        }
    },

    _showMembers: function(){
        for(var i = 0; i < this._members.length; i++){
            this._showOneMember(this._members[i]);
        }
    },

    _addOneMember: function(member){
        //if(member instanceof Z.Graphic || member instanceof Z.ComposeGraphic1){
        if( member instanceof Z.ComposeGraphic1){
            this._members.push(member);
            member._parent = this;

            if(this._membersShowing){
                //graphics[i].onAdd(this._layer, this._container, this._scene);
                this._addOneGraphic(member, this._membersRoot);
                this._applyObjectEvents('on', member, this._mouseEvents);
            }
        }else{
            console.info("只允许添加Z.ComposeGraphic1类型的对象");
        }
    },

    _removeOneMember: function(member, memberIndex){
        if(member instanceof Z.Graphic || member instanceof Z.ComposeGraphic1){
            if(this._membersShowing){
                this._removeOneGraphic(member);
                this._applyObjectEvents('off', member, this._mouseEvents);
            }

            member._parent = null;
            this._members.splice(memberIndex, 1);
        }
    },

    _showOneMember: function(member){
        if(!this._layer.hasGraphic(member)) {
            this._addOneGraphic(member, this._membersRoot);
            //this._applyObjectEvents('on', member, this._mouseEvents);
        }

        member.show();
    },

    _hideOneMember: function(member){
        if(this._layer.hasGraphic(member)) {
            this._removeOneGraphic(member);
            //this._applyObjectEvents('off', member, this._mouseEvents);
        }
    },

    _addOneGraphic: function(graphic, root){
        if(graphic._container === root){
            return;
        }

        graphic.on("added", function(){
            if(graphic instanceof Z.ComposeGraphic1){      //ComposeGraphic
                graphic._container.removeChild(graphic._graphicRoot);
                //this._membersRoot.addChild(graphic._graphicRoot);
                root.addChild(graphic._graphicRoot);
            }else{                           //Graphic
                graphic._container.removeChild(graphic._mainElementRoot);
                //this._membersRoot.addChild(graphic._mainElementRoot);
                root.addChild(graphic._mainElementRoot);
            }

            graphic._container = root;
        });

        this._layer.addGraphic(graphic);

        //if(graphic._graphicRoot){      //ComposeGraphic
        //    graphic._container.removeChild(graphic._graphicRoot);
        //    //this._membersRoot.addChild(graphic._graphicRoot);
        //    root.addChild(graphic._graphicRoot);
        //}else{                           //Graphic
        //    graphic._container.removeChild(graphic._mainElementRoot);
        //    //this._membersRoot.addChild(graphic._mainElementRoot);
        //    root.addChild(graphic._mainElementRoot);
        //}

        //if(graphic instanceof Z.ComposeGraphic1){      //ComposeGraphic
        //    graphic._container.removeChild(graphic._graphicRoot);
        //    //this._membersRoot.addChild(graphic._graphicRoot);
        //    root.addChild(graphic._graphicRoot);
        //}else{                           //Graphic
        //    graphic._container.removeChild(graphic._mainElementRoot);
        //    //this._membersRoot.addChild(graphic._mainElementRoot);
        //    root.addChild(graphic._mainElementRoot);
        //}

        //graphic._container = this._membersRoot;
        //graphic._container = root;
    },

    _removeOneGraphic: function(graphic){
        this._layer.removeGraphic(graphic);
    },

    _getTitlePos:function(){
        var pos = this._self._getTitlePos();
        pos.alt = this.getWorldBaseHeight() + this.feature.shape.height;

        return pos;
    },

    _applyEvents: function(onOff){
        this._applyObjectEvents(onOff, this._self, this._graphicEvents);
        this._applyObjectEvents(onOff, this._self, this._mouseEvents);
        this._applyObjectEvents(onOff, this._members, this._mouseEvents);
    },

    _applyObjectEvents: function(onOff, objects, events){
        var objs = (objects instanceof Array) ? objects : [objects];

        for (var i = 0, len = events.length; i < len; i++) {
            for(var j = 0, objCount = objs.length; j < objCount; j++){
                objs[j][onOff](events[i], this._fireEvents, this);
            }
        }
    },

    _fireEvents: function(e){
        var type = e.type,
            eventObject = {};

        for(var key in e){
            if(key === "prototype"){
                continue;
            }else if(key === "object"){
                eventObject[key] = this;
            }else{
                eventObject[key] = e[key];
            }
        }

        this.fire(type, eventObject);
    }
});