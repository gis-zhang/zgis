Z.AbstractPopup = Z.Class.extend({
    includes: Z.EventManager,

    options: {
        minWidth: 50,
        maxWidth: 300,
        minHeight: 50,
        maxHeight: 250,
        hideNullContent: true,       //设置为true时，如果内容为空，则不显示。设置为false时，无论内容是否为空都显示
        autoPan: true,
        stopPropagation: true,
        //closeButton: true,
        //offset: [0, 3],
        offset: [0, 0],
        autoPanPadding: [5, 5],
        // autoPanPaddingTopLeft: null,
        // autoPanPaddingBottomRight: null,
        keepInView: false,
        className: ''//,
        //zoomAnimation: true
    },

    initialize: function (options) {
        Z.Util.applyOptions(this.options, options, false);

        this._isOpen = false;
        this._parentNode = null;
        this._mapScene = null;
        this._container = null;
        this._latlng = null;
        this._content = null;
        this._containerBottom = 0;
        this._containerLeft = 0;

        this._contentUpdated = true;
    },

    onAdd: function (mapScene) {
        this._mapScene = mapScene;
        this._parentNode = this._getParentNode(mapScene);

        if (!this._container) {
            this._container = this._initLayout();
        }

        if(!this._container){
            console.info("popup对象对应的DOM对象未成功创建，请检查_initLayout（）方法是否返回了正确的值");
            return;
        }

        this._parentNode.appendChild(this._container);
        var events = this._getEvents();

        for(var i = 0; i < events.length; i++){
            events[i].target.on(events[i].event, events[i].func, this);
        }

        this.update();
        this._close();

        this._applyMouseEvents("on");
        this.fire('add');
        mapScene.fire('popupadd', {popup: this});
    },

    onRemove: function (mapScene) {
        if(!this._parentNode){
            return;
        }

        this._parentNode.removeChild(this._container);
        Z.Util.falseFn(this._container.offsetWidth); // force reflow

        var events = this._getEvents();

        for(var i = 0; i < events.length; i++){
            events[i].target.off(events[i].event, events[i].func, this);
        }
        //map.off(this._getEvents(), this);

        //if (map.options.fadeAnimation) {
        //    Z.DomUtil.setOpacity(this._container, 0);
        //}

        this._mapScene = null;

        this._applyMouseEvents("off");

        this.fire('remove');

        mapScene.fire('popupremove', {popup: this});

        //if (this._source) {
        //    this._source.fire('popupclose', {popup: this});
        //}
    },

    getLatLng: function () {
        return this._latlng;
    },

    setLatLng: function (latlng) {
        this._latlng = Z.LatLng.create(latlng);

        if (this._mapScene && this._isOpen) {
            this._updatePosition();
            //this._adjustPan();
        }

        return this;
    },

    getContent: function () {
        return this._content;
    },

    setContent: function (content) {
        if(content === this._content){
            return;
        }

        this._content = content;
        this._contentUpdated = true;

        if(this._isOpen){
            this.update();
        }

        return this;
    },

    getSize: function(){
        var width = 0,
            height = 0;

        if(this._container){
            width = this._container.offsetWidth;
            height = this._container.offsetHeight;
        }

        return {width: width, height: height}
    },

    update: function () {
        this._container.style.visibility = 'hidden';

        if (!this._mapScene || !this._latlng) { return; }

        if(this._isOpen || !this.options.hideNullContent){
            if(this._contentUpdated){
                this._updateContent();
                this._updateLayout();
                this._contentUpdated = false;
            }

            //this._updateContent();
            //this._updateLayout();
            this._updatePosition();

            this._container.style.visibility = '';

            //this._adjustPan();
        }
    },

    open: function(){
        if (!this._mapScene || !this._latlng || !this._container) { return; }

        if(this.options.hideNullContent &&
            (Z.Util.isNull(this._content) || this._content.length <= 0)){
            if(this.isOpened()){
                this.close();
            }

            return;
        }

        this._isOpen = true;
        this.update();
        //this._container.style.visibility = '';

        this.fire('open');
        this._mapScene.fire('popupopen', {popup: this});
    },

    close: function(){
        if (!this._mapScene || !this._latlng || !this._container) { return; }

        this._isOpen = false;
        this._close();

        this.fire('close');
        this._mapScene.fire('popupclose', {popup: this});
    },

    isOpened: function(){
        return this._isOpen;
    },

    isUpdated: function(){
        return this._contentUpdated;
    },

    _close: function(){
        this._container.style.visibility = 'hidden';
    },

    _getEvents: function () {
        var mapObj = this._mapScene,
            events = [
                {target: mapObj, event: 'viewreset', func: this._updatePosition},
                {target: mapObj, event: 'zoomlevelschange', func: this._updatePosition}
        ];

        //if (this._animated) {
        //    events.zoomanim = this._zoomAnimation;
        //}
        if ('closeOnClick' in this.options ? this.options.closeOnClick : this._mapScene.options.closePopupOnClick) {
            //events.preclick = this._close;
            events.push({target: mapObj, event: 'preclick', func: this.close});
        }
        if (this.options.keepInView) {
            //events.moveend = this._adjustPan;
            events.push({target: mapObj, event: 'moveend', func: this._adjustPan});
        }

        var popupEvents = this._getPopupEvents() || [];

        for(var i = 0; i < popupEvents.length; i++){
            events.push(popupEvents[i]);
        }

        return events;
    },

    _getParentNode: function(mapScene){
        return mapScene._viewFrame.popupPane.root;
    },

    _getPopupEvents: function(){
        //throw new error("_getPopupEvents是抽象方法， 请在子类中覆写， 不可直接调用");
    },

    _initLayout: function () {
        throw new error("_initLayout是抽象方法， 请在子类中覆写， 不可直接调用");
    },

    _updateContent: function () {
        //if (!this._content) { return; }
        var content = this._content || "";

        this._fillContent(content);
        this.fire('contentupdate');
    },

    _fillContent: function(content){
        throw new error("_fillContent是抽象方法， 请在子类中覆写， 不可直接调用");
    },

    _updateLayout: function () {
        this._updatePopupLayout(this._container);
        this._containerWidth = this._container.offsetWidth;
        this._containerHeight = this._container.offsetHeight;
    },

    _updatePopupLayout: function(layoutRoot){
        throw new error("_updatePopupLayout是抽象方法， 请在子类中覆写， 不可直接调用");
    },

    _updatePosition: function () {
        if (!this._mapScene || !this._latlng) { return; }

        //var pos = this._map.latLngToLayerPoint(this._latlng),
        var pos = this._mapScene.latLngToScreenPoint(this._latlng),
            //animated = this._animated,
            offset = Z.Point.create(this.options.offset);

        //if (animated) {
        //    Z.DomUtil.setPosition(this._container, pos);
        //}

        var pOffset = this._getPositionOffset(this._containerWidth, this._containerHeight) || {x: 0, y: 0};
        pOffset.x = (typeof pOffset.x === 'number' && !isNaN(pOffset.x))  ? pOffset.x : 0;
        pOffset.y = (typeof pOffset.y === 'number' && !isNaN(pOffset.y))  ? pOffset.y : 0;
        //this._containerBottom = -offset.y - (animated ? 0 : pos.y) - pOffset.y;
        ////this._containerLeft = -Math.round(this._containerWidth / 2) + offset.x + (animated ? 0 : pos.x);
        //this._containerLeft = offset.x + (animated ? 0 : pos.x) + pOffset.x;
        this._containerBottom = offset.y - pos.y - pOffset.y;
        //this._containerBottom = -offset.y + pos.y + this._containerWidth - pOffset.y;
        this._containerLeft = pos.x + pOffset.x;

        // bottom position the popup in case the height of the popup changes (images loading etc)
        this._container.style.bottom = this._containerBottom + 'px';
        this._container.style.left = this._containerLeft + 'px';
    },

    //相对于layout左下角的偏移量，单位为像素。默认定位点为layout左下角
    _getPositionOffset: function(layoutWidth, layoutHeight){
        throw new error("_getPositionOffset是抽象方法， 请在子类中覆写， 不可直接调用");
    },

    _applyMouseEvents: function(onOff){
        if (!Z.DomEvent) { return; }

        onOff = onOff || 'on';

        var domEvents = ['dblclick', 'click', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'mouseenter',
                'mouseleave', 'mousemove', 'contextmenu'],
            i, len;

        for (i = 0, len = domEvents.length; i < len; i++) {
            Z.DomEvent[onOff](this._container, domEvents[i], this._fireMouseEvent, this);
        }
    },

    _fireMouseEvent: function(e){
        var type = e.type;

        type = (type === 'mouseenter' ? 'mouseover' : (type === 'mouseleave' ? 'mouseout' : type));

        if (type === 'contextmenu') {
            Z.DomEvent.preventDefault(e);
        }

        if(type === 'resize'){
            this.fire(type);
        }else{
            var containerPoint = Z.DomEvent.getMousePosition(e, this._container);

            if(!containerPoint){
                this.fire(type);
            }else{
                this.fire(type, {
                    containerPoint: containerPoint,
                    originalEvent: e
                });
            }
        }

        if(this.options.stopPropagation){
            Z.DomEvent.stopPropagation(e);
        }
    }

    //_zoomAnimation: function (opt) {
    //    var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center);
    //
    //    Z.DomUtil.setPosition(this._container, pos);
    //},

    //_adjustPan: function () {
    //    if (!this.options.autoPan) { return; }
    //
    //    var mapScene = this._mapScene,
    //        //containerHeight = this._container.offsetHeight,
    //        containerHeight = this._containerHeight,
    //        containerWidth = this._containerWidth,
    //
    //        layerPos = new Z.Point(this._containerLeft, -containerHeight - this._containerBottom);
    //        //layerPos = new Z.Point(this._containerLeft, -containerHeight + this._containerBottom);
    //
    //    //if (this._animated) {
    //    //    layerPos._add(Z.DomUtil.getPosition(this._container));
    //    //}
    //
    //    //var containerPos = map.layerPointToContainerPoint(layerPos),
    //    var containerPos = layerPos,
    //        padding = Z.Point.create(this.options.autoPanPadding),
    //        paddingTL = Z.Point.create(this.options.autoPanPaddingTopLeft || padding),
    //        paddingBR = Z.Point.create(this.options.autoPanPaddingBottomRight || padding),
    //        size = map.getSize(),
    //        dx = 0,
    //        dy = 0;
    //
    //    if (containerPos.x + containerWidth + paddingBR.x > size.x) { // right
    //        dx = containerPos.x + containerWidth - size.x + paddingBR.x;
    //    }
    //    if (containerPos.x - dx - paddingTL.x < 0) { // left
    //        dx = containerPos.x - paddingTL.x;
    //    }
    //    if (containerPos.y + containerHeight + paddingBR.y > size.y) { // bottom
    //        dy = containerPos.y + containerHeight - size.y + paddingBR.y;
    //    }
    //    if (containerPos.y - dy - paddingTL.y < 0) { // top
    //        dy = containerPos.y - paddingTL.y;
    //    }
    //
    //    if (dx || dy) {
    //        mapScene
    //            .fire('autopanstart')
    //            .panByPixel(dx, dy);
    //    }
    //}
});