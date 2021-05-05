Z.TextIcon = Z.AbstractIcon.extend({
    initialize: function (text, symbol, options) {
        Z.AbstractIcon.prototype.initialize.call(this, options);
        //this._showArrow = options.showArrow || false;
        this._text = text;
        this._symbol = symbol;

        this._wrapperNode = null;
        this._contentNode = null;
        this._tipContainer = null;
        this._tip = null;
    },

    setContent: function (domContainer, contentWidth, contentHeight) {
        if(!this._contentNode){
            this._createContentNode(domContainer, this._symbol);
        }

        this._setStyle(this._wrapperNode, this._symbol);
        this._fillContent(this._text);
        this._setNodeSize(this._wrapperNode, contentWidth, contentHeight);
        //console.info("do setContent()");
    },

    setText: function (text) {
        this._text = text;

        //if(this._contentNode){
        //    this._fillContent(this._text);
        //}
        this.update();
        //console.info("do setText()");
        this._contentUpdated = true;
    },

    updateSymbol: function(symbol){
        if(!symbol){
            return;
        }

        this._setStyle(this._wrapperNode, symbol);
        //console.info("do updateSymbol()");
        this._symbol = symbol;
    },

    _createContentNode: function (container, style) {
        var wrapper = this._wrapperNode = Z.DomUtil.create('div', '', container);
        //Z.DomEvent.disableClickPropagation(wrapper);

        this._contentNode = Z.DomUtil.create('div', '', wrapper);

        //Z.DomEvent["on"](this._contentNode, "click", function(e){alert(e.type + "_0");}, this);

        //Z.DomEvent.disableScrollPropagation(this._contentNode);
        //Z.DomEvent.on(wrapper, 'contextmenu', Z.DomEvent.stopPropagation);

        this._createAnchorNode(container);

        if(style.anchor){
            this._showAnchorNode();
        }else{
            this._hideAnchorNode();
        }

        return container;
    },

    _createAnchorNode: function(container){
        this._tipContainer = Z.DomUtil.create('div', 'zmap-title-tip-container', container);
        this._tip = Z.DomUtil.create('div', 'zmap-title-tip', this._tipContainer);
    },

    _showAnchorNode: function(){
        //this._tipContainer.style.display = "block";
        this._showNode(this._tipContainer);
    },

    _hideAnchorNode: function(){
        this._hideNode(this._tipContainer);
    },

    _showNode: function(node){
        node.style.display = "block";
    },

    _hideNode: function(node){
        node.style.display = "none";
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

        this._setAnchorStyle(symbol);
    },

    _setAnchorStyle: function(nodeSymbol){
        var symbol = nodeSymbol;
        this._hideAnchorNode();

        if(symbol.fill){
            var fSymbol = symbol.fillSymbol;
            var bgColor = Z.DomUtil.colorToGRBA(fSymbol.bgColor, fSymbol.opacity);
            this._tip.style.backgroundColor = bgColor;
        }

        if(symbol.border){
            var bSymbol = symbol.borderSymbol;
            var borderColor = Z.DomUtil.colorToGRBA(bSymbol.color, bSymbol.opacity);

            this._tip.style.borderWidth = bSymbol.width;
            this._tip.style.borderStyle = bSymbol.style;
            this._tip.style.borderColor = borderColor;
        }else{
            this._tip.style.borderWidth = "0px";
        }

        if(nodeSymbol.anchor){
            this._showAnchorNode();
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
            //Z.DomEvent["on"](content, "click", function(e){alert(e.type + "_2");}, this);
        }

        //Z.DomEvent["on"](this._contentNode, "click", function(e){alert(e.type + "_1");}, this);
    },

    _setNodeSize: function(node, contentWidth, contentHeight){
        if(typeof contentWidth === 'number' && !isNaN(contentWidth) && node.width !== contentWidth){
            node.width = contentWidth;
        }

        if(typeof contentHeight === 'number' && !isNaN(contentHeight) && node.height !== contentHeight){
            node.height = contentHeight;
        }
    }
});