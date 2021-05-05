Z.Tip = Z.AbstractPopup.extend({
    initialize: function (target, options) {
        this.options = {
            minWidth: 50,
            maxWidth: 300,
            // maxHeight: null,
            hideNullContent: true,
            autoPan: false,
            stopPropagation: false,
            //closeButton: true,
            //offset: [0, 7],
            offset: [0, 0],
            autoPanPadding: [5, 5],
            // autoPanPaddingTopLeft: null,
            // autoPanPaddingBottomRight: null,
            keepInView: false,
            className: '',
            zoomAnimation: true
        };

        this._symbol = null;
        Z.Util.applyOptions(this.options, options, false);
        Z.AbstractPopup.prototype.initialize.call(this, this.options);

        this._target = target;
    },

    updateSymbol: function(symbol){
        if(!symbol){
            return;
        }

        if(symbol === this._symbol || symbol.equals(this._symbol)){
            return;
        }

        this._setStyle(this._wrapper, symbol);
        this._symbol = symbol;
    },

    _setStyle: function(node, nodeSymbol){
        var symbol = nodeSymbol || new Z.TextSymbol(),
            nodeStyle = node.style;

        nodeStyle.fontSize = symbol.font.size + 'em';
        nodeStyle.fontFamily = symbol.font.family;
        nodeStyle.fontWeight = symbol.font.weight;
        nodeStyle.fontStyle = symbol.font.style;
        nodeStyle.color = symbol.color;

        if(symbol.fill){
            var fSymbol = symbol.fillSymbol;
            var bgColor = Z.DomUtil.colorToGRBA(fSymbol.bgColor, fSymbol.opacity);
            nodeStyle.backgroundColor = bgColor;
        }

        if(symbol.border){
            var bSymbol = symbol.borderSymbol;
            var borderColor = Z.DomUtil.colorToGRBA(bSymbol.color, bSymbol.opacity);
            nodeStyle.borderWidth = bSymbol.width + "px";
            nodeStyle.borderStyle = bSymbol.style;
            nodeStyle.borderColor = borderColor;
        }else{
            nodeStyle.borderWidth = "0px";
        }

        //this._setAnchorStyle(symbol);
    },

    //_setAnchorStyle: function(nodeSymbol){
    //    var symbol = nodeSymbol;
    //    this._hideAnchorNode();
    //
    //    if(symbol.fill){
    //        var fSymbol = symbol.fillSymbol;
    //        var bgColor = Z.DomUtil.colorToGRBA(fSymbol.bgColor, fSymbol.opacity);
    //        this._tip.style.backgroundColor = bgColor;
    //    }
    //
    //    if(symbol.border){
    //        var bSymbol = symbol.borderSymbol;
    //        var borderColor = Z.DomUtil.colorToGRBA(bSymbol.color, bSymbol.opacity);
    //
    //        this._tip.style.borderWidth = bSymbol.width;
    //        this._tip.style.borderStyle = bSymbol.style;
    //        this._tip.style.borderColor = borderColor;
    //    }else{
    //        this._tip.style.borderWidth = "0px";
    //    }
    //
    //    if(nodeSymbol.anchor){
    //        this._showAnchorNode();
    //    }
    //},
    //
    //_showAnchorNode: function(){
    //    this._tipContainer.style.display = "block";
    //},
    //
    //_hideAnchorNode: function(){
    //    this._tipContainer.style.display = "none";
    //},

    _getParentNode: function(mapScene){
        return mapScene._viewFrame.tipPane.root;
    },

    _initLayout: function () {
        var prefix = 'zmap-popup',
            //containerClass = prefix + ' ' + this.options.className + ' zmap-zoom-' +
            //    (this._animated ? 'animated' : 'hide'),
            containerClass = prefix + ' ' + this.options.className,
            //container = this._container = Z.DomUtil.create('div', containerClass),
            container = Z.DomUtil.create('div', containerClass),
            closeButton;

        var wrapper = this._wrapper =
            Z.DomUtil.create('div', prefix + '-content-wrapper', container);
        //Z.DomEvent.disableClickPropagation(wrapper);

        this._contentNode = Z.DomUtil.create('div', prefix + '-content', wrapper);

        //Z.DomEvent.disableScrollPropagation(this._contentNode);
        //Z.DomEvent.on(wrapper, 'contextmenu', Z.DomEvent.stopPropagation);

        this._tipContainer = Z.DomUtil.create('div', prefix + '-tip-container', container);
        this._tip = Z.DomUtil.create('div', prefix + '-tip', this._tipContainer);

        return container;
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
    }
});