L.TextIcon = L.DivIcon.extend({
    options: {
        //iconSize: [12, 12], // also can be set through CSS
        /*
        iconAnchor: (Point)
        popupAnchor: (Point)
        html: (String)
        bgPos: (Point)
        */
        //className: 'leaflet-div-icon',
        className: 'control-text-icon',
        html: ''
    },

    _iconRoot: null,
    _textContainerDiv: null,

    createIcon: function (oldIcon) {
        var div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
		    options = this.options;

        var html = '<span>' + options.text + '</span>';

        if (options.html !== false) {
            //div.innerHTML = options.html;
            div.innerHTML = html;
        } else {
            div.innerHTML = '';
        }

        div.style.whiteSpace = 'nowrap';

        if (options.bgPos) {
            div.style.backgroundPosition =
			        (-options.bgPos.x) + 'px ' + (-options.bgPos.y) + 'px';
        }

        this.options.iconSize = undefined;
        this._setIconStyles(div, options);

//        if (!options.iconAnchor) {
//            div.style.marginTop = (-div.style.height) + 'px';
//        }

        this._textContainerDiv = div

        if(!this._iconRoot){
            this._iconRoot = document.createElement('div');
        }else{
            this._iconRoot.innerHTML = '';
        }

        this._iconRoot.appendChild(this._textContainerDiv);

        return this._iconRoot;
    },

    updateContent: function (content) {
        var html = '<span>' + options.text + '</span>';
        this._textContainerDiv.innerHTML = html;
    },

    createShadow: function () {
        return null;
    },

    getSize: function(){
        var width = this._textContainerDiv.clientWidth,
            height = this._textContainerDiv.clientHeight;

        return L.point(width, height);
    },

    setAnchor: function(point){
        this._setOffset(this._iconRoot, point);
    },

    _setIconStyles: function(element, options){
        if(options.fill){
            element.style.backgroundColor = options.fillSymbol.bgColor;
        }

        if(options.border){
            element.style.borderWidth = options.borderSymbol.width;
            element.style.borderColor = options.borderSymbol.color;
            element.style.borderStyle = options.borderSymbol.style;
            element.style.borderOpacity = options.borderSymbol.opacity;
        }

        element.style.fontFamily = options.font.family;
        element.style.fontStyle = options.font.style;
        element.style.fontWeight = options.font.weight;
        element.style.fontSize = options.font.size;

        this._setOffset(element, options.anchor);
        this._setOpacity(element, options.fillSymbol.opacity);
    },

    _setOffset: function(element, anchor){
        if(anchor){
            element.style.marginLeft = (-anchor.x) + 'px';
            element.style.marginTop  = (-anchor.y) + 'px';
        }
    },

    _setOpacity: function(element, opacity){
        element.style.filter = 'alpha(opacity=' + opacity * 100 + ')';
        element.style.opacity = opacity;
        //element.style.-moz-opacity = opacity;
    }
});