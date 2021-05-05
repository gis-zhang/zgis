Z.Label = Z.AbstractPopup.extend({
    options: {
        minWidth: 50,
        maxWidth: 300,
        // maxHeight: null,
        hideNullContent: true,
        symbol: null,
        autoPan: false,
        //closeButton: true,
        //offset: [0, 7],
        offset: [0, 0],
        autoPanPadding: [5, 5],
        // autoPanPaddingTopLeft: null,
        // autoPanPaddingBottomRight: null,
        keepInView: false,
        className: '',
        zoomAnimation: true
    },

    initialize: function (target, options) {
        Z.Util.applyOptions(this.options, options, false);
        Z.AbstractPopup.prototype.initialize.call(this, this.options);

        this._target = target;
    },

    _getParentNode: function(mapScene){
        return mapScene._viewFrame.labelPane.root;
    },

    _initLayout: function () {
        var prefix = 'zmap-popup',
            //containerClass = prefix + ' ' + this.options.className + ' zmap-zoom-' +
            //    (this._animated ? 'animated' : 'hide'),
            containerClass = prefix + ' ' + this.options.className,
            container = Z.DomUtil.create('div', containerClass);
            //container = Z.DomUtil.create('div');

        var wrapper = this._wrapper =
            //Z.DomUtil.create('div', prefix + '-content-wrapper', container);
            Z.DomUtil.create('div', '', container);
        //Z.DomEvent.disableClickPropagation(wrapper);

        //this._contentNode = Z.DomUtil.create('div', prefix + '-content', wrapper);
        this._contentNode = Z.DomUtil.create('div', '', wrapper);

        //Z.DomEvent.disableScrollPropagation(this._contentNode);
        //Z.DomEvent.on(wrapper, 'contextmenu', Z.DomEvent.stopPropagation);

        //this._tipContainer = Z.DomUtil.create('div', prefix + '-tip-container', container);
        //this._tip = Z.DomUtil.create('div', prefix + '-tip', this._tipContainer);

        this._setStyle(container);

        return container;
    },

    _setStyle: function(){
        var symbol = this.options.symbol || new Z.TextSymbol();
        this._wrapper.style.fontSize = symbol.font.size + 'em';
        this._wrapper.style.fontFamily = symbol.font.family;
        this._wrapper.style.fontWeight = symbol.font.weight;
        this._wrapper.style.fontStyle = symbol.font.style;
        this._wrapper.style.color = symbol.color;

        if(symbol.fill){
            var fSymbol = symbol.fillSymbol;
            this._wrapper.style.backgroundColor = Z.DomUtil.colorToGRBA(fSymbol.bgColor, fSymbol.opacity);
        }

        if(symbol.border){
            var bSymbol = symbol.borderSymbol;
            this._wrapper.style.borderWidth = bSymbol.width;
            this._wrapper.style.borderStyle = bSymbol.style;
            this._wrapper.style.borderColor = Z.DomUtil.colorToGRBA(bSymbol.color, bSymbol.opacity);
        }
    },

    _updatePopupLayout: function (layoutRoot) {
        var container = this._contentNode,
            style = container.style;

        style.width = '';
        style.whiteSpace = 'nowrap';

        var width = container.offsetWidth;
        width = Math.min(width, this.options.maxWidth);
        width = Math.max(width, this.options.minWidth);

        style.width = (width + 1) + 'px';
        style.whiteSpace = '';

        style.height = '';

        var height = container.offsetHeight,
            maxHeight = this.options.maxHeight,
            scrolledClass = 'zmap-popup-scrolled';

        if (maxHeight && height > maxHeight) {
            style.height = maxHeight + 'px';
            Z.DomUtil.addClass(container, scrolledClass);
        } else {
            Z.DomUtil.removeClass(container, scrolledClass);
        }
    },

    _fillContent: function(content){
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
        var thisObj = this;

        return [
            //{target: this._target, event: 'mouseover', func: thisObj.open},
            //{target: this._target, event: 'mouseout', func: thisObj.close}
        ];
    }
});