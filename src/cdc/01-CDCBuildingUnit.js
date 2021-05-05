/**
 * Created by Administrator on 2015/12/2.
 */
var CDCBuildingUnit = Z.Class.extend({
    includes: Z.EventManager,

    initialize: function(hull){
        this._hull = hull;
        this.uid = this.getUID();
        this._components = [];
        this._mode = BuildingMode.HULL;
        this._layer = null;
        this._added = false;
        this._isShowing = true;
        this._enableTitle = false;
        this._enableIcon = false;

        this._hullVisionUnit = null;
        this._innerVisionUnit = null;

        this._applyGraphicEvent("on");
    },

    getUID: function(){
        return IDGenerator.getUUID();
    },

    updateHull: function(graphic){
        if(!graphic|| graphic === this._hull){
            return;
        }

        this._applyGraphicEvent("off");

        if(this._mode === BuildingMode.HULL){
            this._removeHullVisionUnit();
            this._hull = graphic;

            if(this._enableTitle){
                this._hull.enableTitle();
            }

            if(this._enableIcon){
                this._hull.enableIcon();
            }

            this._addHullVisionUnit();
        }else{
            this._hull = graphic;
        }

        this._applyGraphicEvent("on");
    },

    addComponents: function(components){
        var comps = Array.isArray(components) ? components : [components];

        if(comps.length <= 0){
            return;
        }

        if(this._mode === BuildingMode.INNER){
            this._removeInnerVisionUnit();
        }

        var addedComponents = [];

        for(var i = 0; i < comps.length; i++){
            var currentLength = this._components.length,
                exist = false,
                inputComp = comps[i];

            if(!(inputComp instanceof CDCBuildingUnit)){
                continue;
            }

            for(var j = 0; j < currentLength; j++){
                if(inputComp === this._components[j]){
                    exist = true;
                    break;
                }
            }

            if(exist){
                continue;
            }

            this._components.push(inputComp);
            addedComponents.push(inputComp);
        }

        if(this._mode === BuildingMode.INNER){
            this._addInnerVisionUnit();
        }

        this.fire("componentsadd", {components: addedComponents});
    },

    removeComponents: function(components){
        var comps = Array.isArray(components) ? components : [components],
            removedComponents = [];

        if(comps.length <= 0){
            return;
        }

        if(this._mode === BuildingMode.INNER){
            this._removeInnerVisionUnit();
        }

        for(var i = 0; i < comps.length; i++){
            var currentLength = this._components.length,
                inputComp = comps[i];

            for(var j = currentLength - 1; j >= 0; j--){
                if(inputComp === this._components[j]){
                    this._components.splice(j, 1);
                    removedComponents.push(inputComp);
                }
            }
        }

        if(this._mode === BuildingMode.INNER){
            this._addInnerVisionUnit();
        }

        //this._refreshInnerVisionUnit();
        this.fire("componentsremove", {components: removedComponents});
    },

    getHull: function(){
        return this._hull;
    },

    getComponents: function(){
        return this._components;
    },

    show: function(){
        if(this._isShowing){
            return;
        }

        //if(this._mode === BuildingMode.HULL){
        //    this._showHullVisionUnit();
        //}else{
        //    this._showInnerVisionUnit();
        //}
        this._doShow();

        this._isShowing = true;
        this.fire("show");
    },

    hide: function(){
        if(!this._isShowing){
            return;
        }

        //if(this._mode === BuildingMode.HULL){
        //    this._hideHullVisionUnit();
        //}else{
        //    this._hideInnerVisionUnit();
        //}
        this._doHide();

        this._isShowing = false;
        this.fire("hide");
    },

    setMode: function(mode){
        if(mode === this._mode){
            return;
        }else if(mode === BuildingMode.HULL && this._mode === BuildingMode.INNER){
            this._removeInnerVisionUnit();
            //this._showHullVisionUnit();
            this._addHullVisionUnit();
            this._mode = mode;
            this.fire("modechange", {newMode: mode});
        }else if(mode === BuildingMode.INNER && this._mode === BuildingMode.HULL){
            this._removeHullVisionUnit();
            //this._showInnerVisionUnit();
            this._addInnerVisionUnit();
            this._mode = mode;
            this.fire("modechange", {newMode: mode});
        }
    },

    getMode: function(){
        return this._mode;
    },

    enableTitle: function(){
        if(this._hull){
            this._hull.enableTitle();
        }

        this._enableTitle = true;
    },

    enableIcon: function(){
        if(this._hull){
            this._hull.enableIcon();
        }

        this._enableIcon = true;
    },

    updateTitle: function(titleContent, style, mouseoverSymbol, selectSymbol){
        if(this._hull){
            this._hull.updateTitleContent(titleContent);
            this._hull.updateTitleSymbol(style, mouseoverSymbol, selectSymbol);
        }
    },

    showTitle: function(title){
        if(this._hull){
            this._hull.showTitle(title);
        }
    },

    hideTitle: function(){
        if(this._hull){
            this._hull.hideTitle();
        }
    },

    showIcon: function(){
        if(this._hull){
            this._hull.showIcon();
        }
    },

    hideIcon: function(){
        if(this._hull){
            this._hull.hideIcon();
        }
    },

    showInfoWindow: function(){},

    hideInfoWindow: function(){},

    addToLayer: function(layer){
        if(this._added){
            if(this._layer === layer){
                return;
            }else{
                this._removeHullVisionUnit();
                this._removeInnerVisionUnit();
                this._isShowing = false;
            }
        }

        this._layer = layer;
        //this.show();
        this._refreshVisionUnit();
        this._added = true;

        this.fire("add");
    },

    removeFromLayer: function(){
        this._removeHullVisionUnit();
        this._removeInnerVisionUnit();
        this._layer = null;
        this._added = false;

        this.fire("remove");
    },

    select: function(){
        if(this._hull){
            this._hull.doSelect();
            this.showInfoWindow();
        }

        this.fire("select", {object: this});
    },

    unselect: function(){
        if(this._hull){
            this._hull.doUnselect();
            this.hideInfoWindow();
        }

        this.fire("unselect", {object: this});
    },

    //_refreshHullVisionUnit: function(){
    //    if(this._mode === BuildingMode.HULL){
    //        this._removeHullVisionUnit();
    //        this._showHullVisionUnit();
    //    }
    //},
    //
    //_refreshInnerVisionUnit: function(){
    //    if(this._mode === BuildingMode.INNER){
    //        this._removeInnerVisionUnit();
    //        this._showInnerVisionUnit();
    //    }
    //},

    _refreshVisionUnit: function(){
        this._removeHullVisionUnit();
        this._removeInnerVisionUnit();

        if(this._mode === BuildingMode.INNER){
            this._addInnerVisionUnit();
        }else{
            this._addHullVisionUnit();
        }

        if(this._isShowing){
            this._doShow();
        }else{
            this._doHide();
        }
    },

    _applyGraphicEvent: function(onOff){
        var target = this._hull;

        if(!target){
            return;
        }

        var graphicEvents = ['dblclick', 'click', 'mousedown', 'mouseup', 'mouseover',
                'mouseout', 'mousemove', 'contextmenu','select', 'unselect'],
            i, len;

        for (i = 0, len = graphicEvents.length; i < len; i++) {
            target[onOff](graphicEvents[i], this._onGraphicEvent, this);
        }
    },

    _onGraphicEvent: function(event){
        this.fire(event.type, {
            latlng: event.latlng,
            containerPoint: event.containerPoint,
            object: this
        });
    },

    _addHullVisionUnit: function(){
        if(!this._layer){
            return;
        }

        var hullUnit = this._getHullVisionUnit();
        this._addGraphicsToLayer(hullUnit.bgGraphics, this._layer);
        this._addGraphicsToLayer(hullUnit.contentGraphics, this._layer);

        //this._addBuildingUnitsToLayer([this._hull], this._layer);
        this._addGraphicsToLayer([this._hull], this._layer);
    },

    _addGraphicsToLayer: function(graphics, layer){
        var gLength = graphics.length;

        for(var i = 0; i < gLength; i++){
            if(!this._layer.hasGraphic(graphics[i])){
                this._layer.addGraphic(graphics[i]);
            }
        }
    },

    _addInnerVisionUnit: function(){
        if(!this._layer){
            return;
        }

        var hullUnit = this._getInnerVisionUnit();
        this._addGraphicsToLayer(hullUnit.bgGraphics, this._layer);
        this._addGraphicsToLayer(hullUnit.contentGraphics, this._layer);

        this._addBuildingUnitsToLayer(this._components, this._layer);
        this._showBuildingUnits(this._components);
    },

    _doShow: function(){
        if(this._mode === BuildingMode.HULL){
            this._showHullVisionUnit();
        }else{
            this._showInnerVisionUnit();
        }
    },

    _doHide: function(){
        if(this._mode === BuildingMode.HULL){
            this._hideHullVisionUnit();
        }else{
            this._hideInnerVisionUnit();
        }
    },

    _addBuildingUnitsToLayer: function(units, layer){
        var gLength = units.length;

        for(var i = 0; i < gLength; i++){
            units[i].addToLayer(layer);
        }
    },

    _showBuildingUnits: function(components){
        for(var i = 0; i < components.length; i++){
            components[i].show();
        }
    },

    _getHullVisionUnit: function(){
        if(!this._hullVisionUnit){
            this._hullVisionUnit = this._createHullVisionUnit();
        }

        return this._hullVisionUnit;
    },

    _getInnerVisionUnit: function(){
        if(!this._innerVisionUnit){
            this._innerVisionUnit = this._createInnerVisionUnit();
        }

        return this._innerVisionUnit;
    },

    _createHullVisionUnit: function(){
        var unit = new VisionUnit();

        return unit;
    },

    _createInnerVisionUnit: function(){
        var unit = new VisionUnit();

        return unit;
    },

    _showHullVisionUnit: function(){
        if(!this._layer){
            return;
        }

        var hullUnit = this._getHullVisionUnit();
        this._showGraphics(hullUnit.bgGraphics);
        this._showGraphics(hullUnit.contentGraphics);

        this._showGraphics([this._hull]);
    },

    _showGraphics: function(graphics){
        var gLength = graphics.length;

        for(var i = 0; i < gLength; i++){
            graphics[i].show();
        }
    },

    _showInnerVisionUnit: function(){
        if(!this._layer){
            return;
        }

        var innerUnit = this._getInnerVisionUnit();
        this._showGraphics(innerUnit.bgGraphics);
        this._showGraphics(innerUnit.contentGraphics);

        this._showGraphics(this._components);
    },

    _hideHullVisionUnit: function(){
        if(!this._layer){
            return;
        }

        var hullUnit = this._getHullVisionUnit();
        this._hideGraphics(hullUnit.bgGraphics);
        this._hideGraphics(hullUnit.contentGraphics);

        this._hideGraphics([this._hull]);
    },

    _hideGraphics: function(graphics){
        var gLength = graphics.length;

        for(var i = 0; i < gLength; i++){
            graphics[i].hide();
        }
    },

    _hideInnerVisionUnit: function(){
        if(!this._layer){
            return;
        }

        var innerUnit = this._getInnerVisionUnit();
        this._hideGraphics(innerUnit.bgGraphics);
        this._hideGraphics(innerUnit.contentGraphics);

        this._hideGraphics(this._components);
    },

    _removeHullVisionUnit: function(){
        if(!this._layer){
            return;
        }

        var hullUnit = this._getHullVisionUnit();
        this._removeGraphics(hullUnit.bgGraphics);
        this._removeGraphics(hullUnit.contentGraphics);

        this._removeGraphics([this._hull]);
    },

    _removeGraphics: function(graphics){
        var gLength = graphics.length;

        for(var i = 0; i < gLength; i++){
            if(this._layer.hasGraphic(graphics[i])){
                this._layer.removeGraphic(graphics[i]);
            }
        }
    },

    _removeInnerVisionUnit: function(){
        if(!this._layer){
            return;
        }

        var innerUnit = this._getInnerVisionUnit();
        this._removeGraphics(innerUnit.bgGraphics);
        this._removeGraphics(innerUnit.contentGraphics);

        this._removeBuildingUnits(this._components);
    },

    _removeBuildingUnits: function(units){
        var gLength = units.length;

        for(var i = 0; i < gLength; i++){
            units[i].removeFromLayer(this._layer);
        }
    }
});