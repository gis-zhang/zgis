Z.Popup = Z.AbstractPopup.extend({
    //includes: Z.EventManager,

    //options: {
    //    minWidth: 50,
    //    maxWidth: 300,
    //    // maxHeight: null,
    //    autoPan: true,
    //    closeButton: true,
    //    offset: [0, 7],
    //    autoPanPadding: [5, 5],
    //    // autoPanPaddingTopLeft: null,
    //    // autoPanPaddingBottomRight: null,
    //    keepInView: false,
    //    className: '',
    //    zoomAnimation: true
    //},

    initialize: function (options, source) {
        Z.AbstractPopup.prototype.initialize.apply(this, arguments);

        Z.Util.applyOptions(this.options, {
            width: 150,
            height: 200,
            closeButton: true
        }, true);

        Z.Util.applyOptions(this.options, options, false);

        this._source = source;
        //this._animated = Z.Browser.any3d && this.options.zoomAnimation;
        //this._animated = false;
        this._isOpen = false;
        this._title = null;

        this._titleUpdated = true;
    },

    //@Override
    update: function(){
        Z.AbstractPopup.prototype.update.apply(this, arguments);
        //this._adjustPan();
    },

    setTitle: function(title){
        //if(!(title || title === 0)){
        //    return;
        //}

        title = Z.Util.stringTrim((title || "") + "");

        if(title === this._title){
            return;
        }

        this._title = title;
        this._titleUpdated = true;
    },

    getTitle: function(){
        return this._title;
    },

    isUpdated: function(){
        return this._contentUpdated || this._titleUpdated;
    },

    _getParentNode: function(mapScene){
        return mapScene._viewFrame.popupPane.root;
    },

    _initLayout: function () {
        var prefix = 'zmap-popup',
            //containerClass = prefix + ' ' + this.options.className + ' zmap-zoom-' +
            //    (this._animated ? 'animated' : 'hide'),
            containerClass = prefix + ' ' + this.options.className,
            //container = this._container = Z.DomUtil.create('div', containerClass),
            container = Z.DomUtil.create('div', containerClass),
            closeButton;

        if (this.options.closeButton) {
            closeButton = this._closeButton =
                Z.DomUtil.create('a', prefix + '-close-button', container);
            closeButton.href = '#close';
            closeButton.innerHTML = '&#215;';
            //Z.DomEvent.disableClickPropagation(closeButton);

            Z.DomEvent.on(closeButton, 'click', this._onCloseButtonClick, this);
        }

        var wrapper = this._wrapper =
            Z.DomUtil.create('div', prefix + '-content-wrapper', container);
        //Z.DomEvent.disableClickPropagation(wrapper);

        this._titleNode = Z.DomUtil.create('div', prefix + '-title', wrapper);
        this._contentNode = Z.DomUtil.create('div', prefix + '-content', wrapper);
        //this._contentNode.style.width = this.options.width + "px";
        //this._contentNode.style.height = this.options.height + "px";

        //Z.DomEvent.disableScrollPropagation(this._contentNode);
        //Z.DomEvent.on(wrapper, 'contextmenu', Z.DomEvent.stopPropagation);

        this._tipContainer = Z.DomUtil.create('div', prefix + '-tip-container', container);
        this._tip = Z.DomUtil.create('div', prefix + '-tip', this._tipContainer);

        return container;
    },
    //
    //_updateContent: function () {
    //    if (!this._content) { return; }
    //
    //    if (typeof this._content === 'string') {
    //        this._contentNode.innerHTML = this._content;
    //    } else {
    //        while (this._contentNode.hasChildNodes()) {
    //            this._contentNode.removeChild(this._contentNode.firstChild);
    //        }
    //        this._contentNode.appendChild(this._content);
    //    }
    //    this.fire('contentupdate');
    //},
    //
    _updatePopupLayout: function (layoutRoot) {
        var container = this._contentNode,
            style = container.style;

        style.width = '';
        style.whiteSpace = 'nowrap';

        var width = container.offsetWidth,
            styleWidth = style.width;
        width = Math.min(width, this.options.maxWidth);
        width = Math.max(width, this.options.minWidth);

        //if(styleWidth !== (width + 'px')){
        //    //style.width = '';
        //    //style.whiteSpace = 'nowrap';
        //    style.width = width + 'px';
        //    //style.whiteSpace = '';
        //}

        style.width = width + 'px';
        style.whiteSpace = '';

        style.height = '';

        var height = Math.max(container.offsetHeight, this.options.minHeight),
            maxHeight = this.options.maxHeight,
            scrolledClass = 'zmap-popup-scrolled';

        if (maxHeight && height > maxHeight) {
            //var styleHeight = style.height;
            //
            //if(styleHeight !== (maxHeight + 'px')){
            //    style.height = maxHeight + 'px';
            //    Z.DomUtil.addClass(container, scrolledClass);
            //}
            style.height = maxHeight + 'px';
            Z.DomUtil.addClass(container, scrolledClass);
        } else {
            //style.height = '';
            Z.DomUtil.removeClass(container, scrolledClass);
        }

        //this._containerWidth = this._container.offsetWidth;
    },

    _fillContent: function(content){
        if(this._title){
            this._titleNode.innerHTML = this._title + "<hr/>";
            this._titleNode.style.display = "block";
        }else{
            this._titleNode.style.display = "none";
        }

        if (typeof content === 'string') {
            this._contentNode.innerHTML = content;
        } else {
            while (this._contentNode.hasChildNodes()) {
                this._contentNode.removeChild(this._contentNode.firstChild);
            }

            this._contentNode.appendChild(content);
        }
    },

    //相对于layout左下角的偏移量，单位为像素。默认定位点为layout左下角
    _getPositionOffset: function(layoutWidth, layoutHeight){
        return {x: -Math.round(layoutWidth / 2), y: 0};
    },

    _getPopupEvents: function(){
        //
    },

    _onCloseButtonClick: function (e) {
        this.close();
        Z.DomEvent.stop(e);
    },

    _adjustPan: function () {
        if (!this.options.autoPan) { return; }

        var mapScene = this._mapScene,
        //containerHeight = this._container.offsetHeight,
            containerHeight = this._containerHeight,
            containerWidth = this._containerWidth,

            layerPos = new Z.Point(this._containerLeft, -containerHeight - this._containerBottom);
        //layerPos = new Z.Point(this._containerLeft, -containerHeight + this._containerBottom);

        //if (this._animated) {
        //    layerPos._add(Z.DomUtil.getPosition(this._container));
        //}

        //var containerPos = map.layerPointToContainerPoint(layerPos),
        var containerPos = layerPos,
            padding = Z.Point.create(this.options.autoPanPadding),
            paddingTL = Z.Point.create(this.options.autoPanPaddingTopLeft || padding),
            paddingBR = Z.Point.create(this.options.autoPanPaddingBottomRight || padding),
            size = map.getSize(),
            dx = 0,
            dy = 0;

        if (containerPos.x + containerWidth + paddingBR.x > size.x) { // right
            dx = containerPos.x + containerWidth - size.x + paddingBR.x;
        }
        if (containerPos.x - dx - paddingTL.x < 0) { // left
            dx = containerPos.x - paddingTL.x;
        }
        if (containerPos.y + containerHeight + paddingBR.y > size.y) { // bottom
            dy = containerPos.y + containerHeight - size.y + paddingBR.y;
        }
        if (containerPos.y - dy - paddingTL.y < 0) { // top
            dy = containerPos.y - paddingTL.y;
        }

        if (dx || dy) {
            mapScene
                .fire('autopanstart')
                .panByPixel(dx, dy);
        }
    }
});