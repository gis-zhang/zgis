/**
 * Created by Administrator on 2015/12/2.
 */
Z.Graphic = Z.Class.extend({
    includes: Z.EventManager,

    initialize: function(feature, symbol, options){
        this.options = {
            //enableTip: true,
            //side: 'front',  //'back', 'double'
            enableTitle: false,
            enableIcon: false,
            tip:'',
            tipSymbol: null,
            title: '',
            titleSymbol: new Z.TextSymbol(),
            titleMouseoverSymbol: null,
            titleSelectSymbol: null,
            iconSymbol: null,
            iconMouseoverSymbol: null,
            iconSelectSymbol: null,
            markerSymbol: null,
            markerMouseoverSymbol: null,
            markerSelctSymbol: null,
            infoTemplate: null,
            mouseoverSymbol: null,
            selectSymbol: null
        };
        Z.Util.applyOptions(this.options, options, true);

        this.feature = feature;
        this.symbol = symbol || this._getDefaultSymbol(feature);
        //this.disableEvents = false;
        this.eventCapturable = true;     //是否可捕获事件
        this.eventFirable = true;        //捕获后是否在当前Graphic对象上触发对事件的响应
        this._layer = null;
        this._container = null;
        this._titleElement = null;
        this._scene = null;
        this._mainElementRoot = null;
        this._mainElement = null;
        this._iconElement = null;
        this._infoTemplate = this.options.infoTemplate;
        this._added = false;
        this._show = true;

        this._titleShowing = false;
        this._tipShowing = false;
        this._iconShowing = false;
        this._infoWindowShowing = false;

        this._titleContent = null;
        this._titleSymbol = null;
        this._titleMouseoverSymbol = null;
        this._titleSelectSymbol = null;
        this._tipContent = null;
        this._tipSymbol = null;

        this._currentSymbol = this.symbol;
        this._currentTitleSymbol = null;

        this.needsUpdate = true;
    },

    updateFeature: function(feature){
        if(feature instanceof Z.Feature){
            this.feature = feature;

            this._updateFeature(feature);
            this.refresh();

            this.needsUpdate = true;
            this.fire("featureupdated");
        }
    },

    updateSymbol: function(symbol){
        if(symbol){
            this.symbol = symbol;

            this._updateSymbol(symbol);
            this._currentSymbol = symbol;
            this.needsUpdate = true;

            this.fire("symbolupdated");
        }
    },

    updateTitleSymbol: function(titleSymbol, titleMouseoverSymbol, titleSelectSymbol){
        this._titleSymbol = titleSymbol;
        this._titleMouseoverSymbol = titleMouseoverSymbol;
        this._titleSelectSymbol = titleSelectSymbol;

        //if(this._titleElement){
        //    this._titleElement.updateSymbol(titleSymbol);
        //}
        this._updateTitleSymbol(titleSymbol);

        this._currentTitleSymbol = titleSymbol;
        this.needsUpdate = true;
    },

    getTitleSymbol: function(){
        return {
            titleSymbol: this._titleSymbol,
            mouseoverSymbol: this._titleMouseoverSymbol,
            selectSymbol: this._titleSelectSymbol
        };
    },

    updateTitleContent: function(content){
        this._titleContent = content;
    },

    getTitleContent: function(){
        return this._titleContent;
    },

    resetTitleContent: function(){
        this._titleContent = null;
    },

    updateTipSymbol: function(symbol){
        this._tipSymbol = symbol;
    },

    getTipSymbol: function(){
        return this._getTipSymbol();
    },

    updateTipContent: function(content){
        this._tipContent = content;
    },

    getTipContent: function(){
        return this._tipContent;
    },

    resetTipContent: function(){
        this._tipContent = null;
    },

    //onAdd: function(graphicLayer, container, scene, anchor, baseIndex, layerIndex){
    onAdd: function(graphicLayer, container, scene){
        if(!(this.feature instanceof Z.Feature) || !(this.symbol instanceof Z.Symbol || this.symbol instanceof Z.GroupSymbol)){
            console.info("feature或者symbol属性不合法");
            return;
        }

        //if(!(graphicLayer instanceof Z.GraphicLayer)||
        //    //!(container instanceof Z.ScenePaneItem)||
        //    !(scene instanceof Z.IScene)){
        //    console.error("参数不合法");
        //}

        if(this._layer && this._layer !== graphicLayer){
            this.onRemove(this._layer);
        }

        if(!this._mainElement){
            this._mainElement = new Z.GraphicElement(this.feature, this.symbol);
        }

        if(this._mainElement.ownerGraphic !== this){
            this._mainElement.ownerGraphic = this;
        }

        if(!this.feature.shape.crs){
            this.feature.shape.crs = scene.options.crs;
        }

        if(!this._mainElementRoot && container){
            this._mainElementRoot = container.newInstance();
            container.addChild(this._mainElementRoot);
        }

        //var containerRoot = container.root,
        //    baseIndex = graphicLayer.getContainerPane().index,
        //    layerIndex = graphicLayer.getZIndex();
        //this._mainElement.onAdd(graphicLayer, containerRoot, scene, baseIndex, layerIndex);
        this._mainElement.onAdd(graphicLayer, this._mainElementRoot, scene);

        this._layer = graphicLayer;
        this._container = container;
        this._scene = scene;

        if(this.options.enableTitle && this._titleShowing){
            this.showTitle();
        }

        if(this.options.enableIcon && this._iconShowing){
            this.showIcon();
        }

        this._added = true;

        if(this._show){
            this._doShow();
        }else{
            this._doHide();
        }

        this.needsUpdate = true;
        this.fire("added");
    },

    onRemove: function(graphicLayer){
        if(this._mainElement){
            this._mainElement.onRemove(graphicLayer);
            this._mainElement.ownerGraphic = null;
            //this._mainElement = null;
        }

        if(this._titleElement){
            this._titleElement.onRemove(graphicLayer);
            this._titleElement = null;
        }

        if(this._mainElementRoot && this._container){
            this._container.removeChild(this._mainElementRoot);
            this._mainElementRoot = null;
        }

        //if(this._tip){
        //    this._tip.onRemove(graphicLayer._scene);
        //}

        if(this._infoWindowShowing){
            this.hideInfoWindow();
        }

        this._layer = null;
        this._container =null;
        this._scene = null;
        this._added = false;

        this.needsUpdate = true;
        this.fire("removed");
    },

    dispose: function(){
        if(this._added){
            this.onRemove(this._layer);
        }

        if(this._mainElement){
            this._mainElement.dispose();
            this._mainElement = null;
        }

        if(this._titleElement){
            this._titleElement = null;
        }

        this.fire("disposed");
    },

    //infowindow的刷新在Z.Scene3D中进行
    refresh: function(){
        if(!this._show){
            return;
        }

        if(this._mainElement){
            this._mainElement.refresh();
        }

        //if(this._titleElement){
        //    if(this.options.enableTitle){
        //        this.showTitle();
        //    }
        //
        //    if(this._titleShowing){
        //        //this._titleElement.refresh();
        //        var titleAnchor = this._getTitlePos();
        //        this._titleElement.setLatLng(titleAnchor);
        //    }
        //}
        //
        //if(this._iconElement){
        //    if(this.options.enableIcon){
        //        this.showIcon();
        //    }
        //
        //    if(this._iconShowing){
        //        //this._titleElement.refresh();
        //        var iconAnchor = this._getTitlePos();
        //        this._iconElement.setLatLng(iconAnchor);
        //    }
        //}

        if(this._titleElement && this.options.enableTitle && this._titleShowing){
            this.showTitle();
            //this._titleElement.refresh();
            var titleAnchor = this._getTitlePos();
            this._titleElement.setLatLng(titleAnchor);
        }

        if(this._iconElement && this.options.enableIcon && this._iconShowing){
            this.showIcon();
            var iconAnchor = this._getTitlePos();
            this._iconElement.setLatLng(iconAnchor);
        }

        //if(this._infoWindowShowing){
        //    //this._titleElement.refresh();
        //    var infoWindowAnchor = this._getTitlePos();
        //    Z.SinglePopup.getInstance().setLatLng(infoWindowAnchor);
        //}
    },

    showTitle: function(titleContent){
        if(this._show){
            var text = titleContent || Z.Util.stringTrim(this._getTitleText());

            if(text && this._layer){
                var title = this._getTitleGraphic();
                title.setText(text);
                title.show();
            }
        }

        this._titleShowing = true;
    },

    hideTitle: function(){
        if(this._show) {
            if (this._titleElement && this._layer) {
                //this._layer.removeGraphic(this._titleElement);
                //this._titleElement.onRemove(this._layer);
                this._titleElement.hide();
            }
        }

        this._titleShowing = false;
    },

    showIcon: function(){
        this._iconShowing = true;

        if(this._show) {
            if (!this._layer) {
                return;
            }

            var marker = this._getIconElement();
            marker.show();
        }
    },

    hideIcon: function(){
        this._iconShowing = false;

        if(this._show) {
            if (!this._layer || !this._iconElement) {
                return;
            }

            var marker = this._getIconElement();
            marker.hide();
        }
    },

    showInfoWindow: function(popupOptions){
        this._infoWindowShowing = true;

        if(this._show) {
            if (!this._layer) {
                return;
            }

            var template = this._getInfoTemplate();
            var //info = template.toHtml(),
                info = template.getContent ? template.getContent() : null,
                title = template.getTitle ? template.getTitle() : null,
                popupAnchor = this._getTitlePos();
            this._layer._scene.openPopup(title, info, popupAnchor, popupOptions);
        }
    },

    hideInfoWindow: function(){
        this._infoWindowShowing = false;

        if(this._show) {
            if (!this._layer) {
                return;
            }

            this._layer._scene.closePopup();
        }
    },

    showTip: function(){
        if(this._titleShowing && !this._titleIsNull()){   //如果已经显示了标题，则不再显示tip
            return;
        }

        this._tipShowing = true;

        if(this._show) {
            if (!this._layer) {
                return;
            }

            var content = this._getTipText() || "",
                symbol = this._getTipSymbol();

            if (content && content.replace(/\s+/, "")) {
                var tip = Z.SingleTip.getInstance(this._layer._scene);
                tip.updateSymbol(symbol);
                var popupAnchor = this._getTitlePos();
                tip.setLatLng(popupAnchor);
                tip.setContent(content);
                tip.open();
            }
        }
    },

    hideTip: function(){
        this._tipShowing = false;

        if(this._show) {
            if (!this._layer) {
                return;
            }

            var tip = Z.SingleTip.getInstance(this._layer._scene);
            tip.close();
        }
    },

    show: function(force){
        if(this._show && !force){
            return;
        }

        //if(this._mainElementRoot){
        //    this._mainElementRoot.show();
        //}
        //
        //if(this.options.enableTitle && this._titleShowing){
        //    this.showTitle();
        //}
        //
        //if(this.options.enableIcon && this._iconShowing){
        //    this.showIcon();
        //}
        this._doShow();

        this._show = true;
        this.needsUpdate = true;
        this.fire("show");
    },

    hide: function(force){
        if(!this._show && !force){
            return;
        }

        //if(this._mainElementRoot){
        //    this._mainElementRoot.hide();
        //}
        //
        //this.hideTitle();
        //this.hideInfoWindow();
        //this.hideIcon();
        //this.hideTip();
        this._doHide();

        this._show = false;
        this.needsUpdate = true;
        this.fire("hide");
    },

    isShowing: function(){
        return this._show;
    },

    isTitleShowing: function(){
        return this._titleShowing;
    },

    isAdded: function(){
        return this._added;
    },

    enableTitle: function(){
        this.options.enableTitle = true;
        this.showTitle();
    },

    disableTitle: function(){
        this.options.enableTitle = false;
        this.hideTitle();
    },

    enableIcon: function(){
        this.options.enableIcon = true;
        this.showIcon();
    },

    disableIcon: function(){
        this.options.enableIcon = false;
        this.hideIcon();
    },

    doMouseOver: function(){//console.info("doMouseOver");
        var symbol = this.options.mouseoverSymbol;

        if(symbol){
            this._updateSymbol(symbol);
            this.needsUpdate = true;

            this.fire("symbolupdated");
        }

        if(this._titleShowing){
            var titleSymbol = this._titleMouseoverSymbol || this.options.titleMouseoverSymbol;
            this._updateTitleSymbol(titleSymbol);
        }
    },

    doMouseOut: function(){//console.info("doMouseOut");
        var symbol = this._titleMouseoverSymbol || this.options.mouseoverSymbol;

        if(symbol){
            this._updateSymbol(this._currentSymbol);
            this.needsUpdate = true;

            this.fire("symbolupdated");
        }

        if(this._titleShowing){
            this._updateTitleSymbol(this._currentTitleSymbol);
        }
    },

    doSelect: function(){//console.info("doSelect");
        var symbol = this.options.selectSymbol;

        if(symbol){
            this._updateSymbol(symbol);
            this._currentSymbol = symbol;
            this.needsUpdate = true;

            this.fire("symbolupdated");
        }

        if(this._titleShowing){
            var titleSymbol = this._titleSelectSymbol || this.options.titleSelectSymbol;
            this._updateTitleSymbol(titleSymbol);
            this._currentTitleSymbol = titleSymbol;
        }
    },

    doUnselect: function(){//console.info("doUnselect");
        var symbol = this.options.selectSymbol;

        if(symbol){
            this._updateSymbol(this.symbol);
            this._currentSymbol = this.symbol;
            this.needsUpdate = true;

            this.fire("symbolupdated");
        }

        if(this._titleShowing){
            var titleSymbol = this._getTitleSymbol();
            this._updateTitleSymbol(titleSymbol);
            this._currentTitleSymbol = titleSymbol;
        }
    },

    resetSymbol: function(){
        if(this._currentSymbol !== this.symbol){
            this._updateSymbol(this.symbol);
            this._currentSymbol = this.symbol;
            this.needsUpdate = true;

            this.fire("symbolupdated");

            if(this._titleShowing){
                var titleSymbol = this._getTitleSymbol();
                this._updateTitleSymbol(titleSymbol);
                this._currentTitleSymbol = titleSymbol;
            }
        }
    },

    setInfoTemplate: function(template){
        this._infoTemplate = template;
    },

    getInfoTemplate: function(){
        return this._infoTemplate;
    },

    clone: function(){
        var feature = this.feature.clone(),
            symbol = this.symbol.clone(),
            thisOps = this.options,
            options;

        options = {
            enableTitle: thisOps.enableTitle,
            enableIcon: thisOps.enableIcon,
            tip:thisOps.tip,
            title: thisOps.title,
            titleSymbol: thisOps.titleSymbol ? thisOps.titleSymbol.clone() : null,//new Z.TextSymbol(),
            iconSymbol: thisOps.iconSymbol ? thisOps.iconSymbol.clone() : null,
            markerSymbol: thisOps.markerSymbol ? thisOps.markerSymbol.clone() : null,
            infoTemplate: thisOps.infoTemplate ? thisOps.infoTemplate.clone() : null,
            mouseoverSymbol: thisOps.mouseoverSymbol ? thisOps.mouseoverSymbol.clone() : null,
            selectSymbol: thisOps.selectSymbol ? thisOps.selectSymbol.clone() : null
        };

        var newGraphic = new Z.Graphic(feature, symbol, options);

        newGraphic.eventCapturable = this.eventCapturable;
        newGraphic.eventFirable = this.eventFirable;
        newGraphic._show = this._show;
        newGraphic._titleShowing = this._titleShowing;
        newGraphic._tipShowing = this._tipShowing;
        newGraphic._iconShowing = this._iconShowing;
        newGraphic._infoWindowShowing = this._infoWindowShowing;
        newGraphic._titleContent = this._titleContent;
        newGraphic._titleSymbol = this._titleSymbol;

        return newGraphic;
    },

    _getDefaultSymbol: function(feature){
        //待完善
    },

    _updateFeature: function(feature){
        if(this._mainElement){
            this._mainElement.updateFeature(feature);
        }
    },

    _updateSymbol: function(symbol){
        if(this._mainElement){
            this._mainElement.updateSymbol(symbol);
        }
    },

    _updateTitleSymbol: function(titleSymbol){
        if(this._titleElement){
            this._titleElement.updateSymbol(titleSymbol);
        }
    },

    _getTipText: function(){
        var text = this._tipContent || Z.Util.getConfigValue(this.feature.props, this.options.tip);
        return text ? (text + "") : "";
    },

    _getTitleText: function(){
        var text = this._titleContent || Z.Util.getConfigValue(this.feature.props, this.options.title);

        if(Z.DomUtil.isDom(text)){
            return text;
        }else{
            return text ? (text + "") : "";
        }
    },

    _getTitleGraphic: function(){
        if(this._titleElement){
            return this._titleElement;
        }else{
            var symbol = this._getTitleSymbol();

            if(this._currentTitleSymbol !== symbol){
                this._currentTitleSymbol = symbol;
            }

            this._titleElement = new Z.TextIcon('', symbol, {
                width: 'auto',
                height: 'auto',
                anchor: 'bottomCenter',
                offset: [0, 0]
            });
            this._applyTitleEvents("on");
            this._titleElement.onAdd(this._layer._scene);
            var popupAnchor = this._getTitlePos();
            this._titleElement.setLatLng(popupAnchor);
            var content = this._getTitleText();
            this._titleElement.setText(content);

            return this._titleElement;
        }
    },

    _applyTitleEvents: function(onOff){
        if (!Z.DomEvent) { return; }

        onOff = onOff || 'on';

        var domEvents = [ 'click', 'mouseover', 'mouseout'],
            i, len;

        for (i = 0, len = domEvents.length; i < len; i++) {
            Z.DomEvent[onOff](this._titleElement, domEvents[i], this._reactTitleEvent, this);
        }
    },

    _reactTitleEvent:function(e){
        var type = e.type;

        //if(type === "click"){
        //    this.doSelect();
        //}else if(type === "mouseover"){
        //    this.doMouseOver();
        //}else if(type === "mouseout"){
        //    this.doMouseOut();
        //}
        //
        ////if(type === "click"){
        ////    type = "select";
        ////}
        //
        //this.fire(type, {
        //    originalEvent: e,
        //    object: this
        //});
//console.info("title event type:" + e.type);
//        if(e.type === "click"){
//            var ss = 9;
//        }
//
        if(this._layer){
            this._layer.delegateGraphicEvent(this, e);
        }
    },

    _getTitlePos:function(){
        var shp = this.feature.shape, pos;

        if(shp instanceof Z.LatLng){
            pos = shp.clone();
        }else{
            var bounds = shp.getBounds();
            pos = bounds.getCenter();
            pos.alt = bounds.getNorthEast().alt;
        }

        return pos;
    },

    _getTitleSymbol: function(){
        if(this._titleSymbol){
            return this._titleSymbol;
        }

        var options = this.options || {},
            symbol = options.titleSymbol ? options.titleSymbol.clone() : new Z.TextSymbol();

        return symbol;
    },

    _getInfoTemplate: function(){
        if(!this._infoTemplate){
            var symbol = this.options.infoTemplate;

            if(!symbol){
                var props = this.feature ? (this.feature.props || {}) : {};
                symbol = new Z.PropertyInfoTemplate(props);
                symbol.setTitle(this._getTitleText());
            }

            this._infoTemplate = symbol;
        }

        return this._infoTemplate;
    },

    _getIconElement: function(){
        if(this._iconElement){
            return this._iconElement;
        }else{
            var symbol = this._getIconSymbol(),
                symbolOffset = symbol.offset,
                iconOffset = symbolOffset ? [symbolOffset.x, symbolOffset.y] : [0, 0];

            if(symbol instanceof Z.PictureMarkerSymbol){
                this._iconElement = new Z.PictureIcon(symbol.url, {offset: iconOffset, anchor: symbol.anchor, width: symbol.width, height: symbol.height});
            }

            this._iconElement.onAdd(this._layer._scene);
            var popupAnchor = this._getTitlePos();
            this._iconElement.setLatLng(popupAnchor);
            //var content = this._getTitleText();
            //this._titleElement.setContent(content);

            return this._iconElement;
        }
    },

    _getIconSymbol: function(){
        var options = this.options || {};

        return options.iconSymbol ? options.iconSymbol.clone() : new Z.PictureMarkerSymbol();
    },

    _getTipSymbol: function(){
        if(!this._tipSymbol){
            this._tipSymbol = this.options.tipSymbol || new Z.TextSymbol({border: false});
        }

        return this._tipSymbol;
    },

    _doShow: function(){
        if(this._mainElementRoot){
            this._mainElementRoot.show();
        }

        if(this.options.enableTitle && this._titleShowing){
            this.showTitle();
        }

        if(this.options.enableIcon && this._iconShowing){
            this.showIcon();
        }
    },

    _doHide: function(){
        if(this._mainElementRoot){
            this._mainElementRoot.hide();
        }

        this.hideTitle();
        this.hideInfoWindow();
        this.hideIcon();
        this.hideTip();
    },

    _titleIsNull: function(){
        var titleText = this._getTitleText();
        var text = Z.Util.stringTrim();

        if(titleText){
            if(typeof titleText === "string"){
                var text = Z.Util.stringTrim(titleText);

                if(text && text.length > 0){
                    return false;
                }else{
                    return true;
                }
            }else{
                return false;
            }
        }else{
            return true;
        }


    }
});