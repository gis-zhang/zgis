Z.AbstractIcon = Z.Class.extend({
    includes: Z.EventManager,

    //initialize: function (options, source) {
    initialize: function (options) {
        this.options = {
            width: 'auto',
            height: 'auto',
            anchor: 'bottomLeft',    //bottomCenter、bottomRight、centerLeft、centerCenter、centerRight、topLeft、topCenter、topRight
            offset: [0, 0]
        };

        Z.Util.applyOptions(this.options, options, false);
        //this._isOpen = false;
        this._parentNode = null;
        this._mapScene = null;
        this._container = null;
        this._latlng = null;
        this._content = null;
        this._containerBottom = 0;
        this._containerLeft = 0;

        //this._mouseovering = false;   //正处于mouseover事件中
        this._lastMouseOverPosition = null;
        this._contentUpdated = false;
    },

    onAdd: function (mapScene) {
        this._mapScene = mapScene;
        this._parentNode = this._getParentNode(mapScene);

        if (!this._container) {
            this._container = this._initLayout();
            this._applyMouseEvents("on");
        }

        if(!this._container){
            console.info("marker对象对应的DOM对象未成功创建，请检查_initLayout（）方法是否返回了正确的值");
            return;
        }

        this._parentNode.appendChild(this._container);
        var events = this._getEvents();

        for(var i = 0; i < events.length; i++){
            events[i].target.on(events[i].event, events[i].func, this);
        }

        this._initContent();
        this.update();
        //this._close();

        this.fire('add');
        //mapScene.fire('markeradd', {popup: this});
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
        //this._applyMouseEvents("off");

        this.fire('remove');

        //mapScene.fire('popupremove', {popup: this});

        //if (this._source) {
        //    this._source.fire('popupclose', {popup: this});
        //}
    },

    getLatLng: function () {
        return this._latlng;
    },

    setLatLng: function (latlng) {
        this._latlng = Z.LatLng.create(latlng);

        //if (this._mapScene && this._isOpen) {
        //    this._updatePosition();
        //    //this._adjustPan();
        //}

        if (this._mapScene) {
            this._updatePosition();
            //this._adjustPan();
        }

        return this;
    },

    setContent: function (domContainer, contentWidth, contentHeight) {
        //return this._content;
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

        //if(this._isOpen || !this.options.hideNullContent){
        //    this._updateContent();
        //    this._updateLayout();
        //    this._updatePosition();
        //
        //    this._container.style.visibility = '';
        //
        //    //this._adjustPan();
        //}
        this._updateContent();
        this._updateLayout();
        this._updatePosition();

        this._container.style.visibility = '';
        console.info("do update()");
    },

    show: function(){
        if(this._container){
            this._container.style.visibility = '';
        }
    },

    hide: function(){
        if(this._container){
            this._container.style.visibility = 'hidden';
        }
    },

    _getParentNode: function(mapScene){
        return mapScene._viewFrame.labelPane.root;
    },

    _initLayout: function () {
        var container = document.createElement("div");//Z.DomUtil.create('div');
        container.style.position = "absolute";
        //container.style.position = "relative";
        //this._setContainerSize(container, this.options.width, this.options.height);

        return container;
    },

    _initContent: function () {
        this._updateContent();
        this._updateLayout();
    },

    //_setContainerSize: function(element, width, height){
    //    if((typeof width === 'number' && width !== 'NaN')){
    //        element.width = width;
    //    }
    //
    //    if((typeof height === 'number' && height !== 'NaN')){
    //        element.height = height;
    //    }
    //},

    _getEvents: function () {
        var mapObj = this._mapScene,
            events = [
                //{target: mapObj, event: 'viewreset', func: this._updatePosition},
                //{target: mapObj, event: 'zoomlevelschange', func: this._updatePosition}
        ];

        var popupEvents = this._getPopupEvents() || [];

        for(var i = 0; i < popupEvents.length; i++){
            events.push(popupEvents[i]);
        }

        return events;
    },

    _getPopupEvents: function(){
        return [];    //[{target:target, event:'click', func: function(){}}, {target:target, event:'dbclick', func: function(){}}]
    },

    _updateContent: function () {
        //if (!this._content) { return; }
        //
        //this._fillContent(this._content);
        this.setContent(this._container, this.options.width, this.options.height);
        //this.fire('contentupdate');
    },

    //_fillContent: function(content){
    //    throw new error("_fillContent是抽象方法， 请在子类中覆写， 不可直接调用");
    //},

    _updateLayout: function () {
        //this._updatePopupLayout(this._container);
        this._containerWidth = this._container.offsetWidth;
        this._containerHeight = this._container.offsetHeight;
    },

    //_updatePopupLayout: function(layoutRoot){
    //    //throw new error("_updatePopupLayout是抽象方法， 请在子类中覆写， 不可直接调用");
    //},

    _updatePosition: function () {
        if (!this._mapScene || !this._latlng) { return; }

        var pos = this._mapScene.latLngToScreenPoint(this._latlng),
            offset = Z.Point.create(this.options.offset);

        var pOffset = this._getPositionOffset(this._containerWidth, this._containerHeight) || {x: 0, y: 0};
        pOffset.x = (typeof pOffset.x === 'number' && !isNaN(pOffset.x))  ? pOffset.x : 0;
        pOffset.y = (typeof pOffset.y === 'number' && !isNaN(pOffset.y))  ? pOffset.y : 0;
        //this._containerBottom = offset.y - pos.y - pOffset.y;
        //this._containerLeft = offset.x + pos.x + pOffset.x;
        //this._containerBottom = offset.y + pos.y - pOffset.y;
        //this._containerLeft = offset.x + pos.x + pOffset.x;
        this._containerTop = -offset.y + pos.y - pOffset.y;
        this._containerLeft = offset.x + pos.x + pOffset.x;

        // bottom position the popup in case the height of the popup changes (images loading etc)
        //this._container.style.bottom = this._containerBottom + 'px';
        this._container.style.top = this._containerTop + 'px';
        this._container.style.left = this._containerLeft + 'px';
    },

    //相对于layout左下角的偏移量，单位为像素。默认定位点为layout左下角
    _getPositionOffset: function(layoutWidth, layoutHeight){
        //throw new error("_getPositionOffset是抽象方法， 请在子类中覆写， 不可直接调用");
        var anchor = this.options.anchor || "bottomLeft",
            ratio = this._getOffsetRatio(anchor);

        return {
            x: -layoutWidth * ratio.xRatio,
            y: layoutHeight * ratio.yRatio
        }
    },

    _getOffsetRatio: function(anchor){
        var xRatio = 0,
            yRatio = 1;

        if(anchor === "bottomLeft"){
            xRatio = 0;
            yRatio = 1;
        }else if(anchor === "bottomCenter"){
            xRatio = 0.5;
            yRatio = 1;
        }else if(anchor === "bottomRight"){
            xRatio = 1;
            yRatio = 1;
        }else if(anchor === "centerLeft"){
            xRatio = 0;
            yRatio = 0.5;
        }else if(anchor === "centerCenter"){
            xRatio = 0.5;
            yRatio = 0.5;
        }else if(anchor === "centerRight"){
            xRatio = 1;
            yRatio = 0.5;
        }else if(anchor === "topLeft"){
            xRatio = 0;
            yRatio = 0;
        }else if(anchor === "topCenter"){
            xRatio = 0.5;
            yRatio = 0;
        }else if(anchor === "topRight"){
            xRatio = 1;
            yRatio = 0;
        }

        return {
            xRatio: xRatio,
            yRatio: yRatio
        }
    },

    _applyMouseEvents: function(onOff){
        if (!Z.DomEvent) { return; }

        onOff = onOff || 'on';

        var domEvents = ['dblclick', 'click', 'mousedown', 'mouseup', 'mouseover', 'mouseout',
            'mouseenter', 'mouseleave', 'mousemove', 'contextmenu'],
        //var domEvents = ['dblclick', 'click', 'mousedown', 'mouseup', 'mouseenter', 'mouseleave', 'mousemove', 'contextmenu'],
            i, len;

        for (i = 0, len = domEvents.length; i < len; i++) {
            Z.DomEvent[onOff](this._container, domEvents[i], this._fireMouseEvent, this);
        }
    },

    _fireMouseEvent: function(e){
        var type = e.type;
//console.info("abstraceIcon.type:" + type);
//
//        if(type === "mouseover"){
//            console.info(e.target.outerHTML);
//        }

        //if(type === "mouseover" && this._contentUpdated){
        //    Z.DomEvent.stopPropagation(e);
        //    this._contentUpdated = false;
        //    return;
        //}

        type = (type === 'mouseenter' ? 'mouseover' : (type === 'mouseleave' ? 'mouseout' : type));

        if (type === 'contextmenu') {
            Z.DomEvent.preventDefault(e);
        }

        if(type === "mouseout" || type === "mouseover"){
            if(!Z.DomEvent._checkMouse(this._container, e)){
                Z.DomEvent.stopPropagation(e);
                return;
            }
        }

        var mouseoverPoint = new Z.Point(e.clientX, e.clientY);

        if(type === "mouseover"){
            var lastMouseoverPoint = this._lastMouseOverPosition;

            if(lastMouseoverPoint && this._contentUpdated){
                if(mouseoverPoint.x - lastMouseoverPoint.x < 1 && mouseoverPoint.y - lastMouseoverPoint.y < 1){
                    //lastMouseoverPoint = mouseoverPoint;
                    Z.DomEvent.stopPropagation(e);
                    return;
                }else{
                    this._contentUpdated = false;
                }
            }

            this._lastMouseOverPosition = mouseoverPoint;
        }else{
            this._lastMouseOverPosition = null;
        }



        //if(this._mouseovering){
        //    if(type === "mouseover" || type === "mousemove"){
        //        Z.DomEvent.stopPropagation(e);
        //        return;
        //    }
        //}
        //
        //if(type === "mouseover"){
        //    this._mouseovering = true;
        //}
        //
        //
        //
        //if(type === "mouseout"){
        //    if(this._outOfContainer(containerPoint, this._container)){
        //        this._mouseovering = false;
        //    }else{
        //        //排除子元素的mouseout事件
        //        Z.DomEvent.stopPropagation(e);
        //        return;
        //    }
        //}

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

        Z.DomEvent.stopPropagation(e);
    },

    //判断鼠标点是否超出了div范围
    _outOfContainer: function(containerPoint, container){
        if(containerPoint.x < 0 || containerPoint.y < 0 || containerPoint.x > container.clientWidth || containerPoint.y > container.clientHeight){
            return true;
        }else{
            return false;
        }
    }
});