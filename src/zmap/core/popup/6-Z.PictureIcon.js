Z.PictureIcon = Z.AbstractIcon.extend({
    initialize: function (pictureUrl, options) {
        Z.AbstractIcon.prototype.initialize.call(this, options);
        this._pictureUrl = pictureUrl;
        this._imageObj = null;
    },

    setContent: function (domContainer, contentWidth, contentHeight) {
        //return this._content;
        if(!this._imageObj){
            this._imageObj = new Image();
            this._imageObj.src = this._pictureUrl;

            //var thisObj = this;
            //this._imageObj.onload = function(){
            //    thisObj._setNodeSize(thisObj._imageObj, contentWidth, contentHeight);
            //};

            domContainer.appendChild(this._imageObj);
        }

        this._setNodeSize(this._imageObj, contentWidth, contentHeight);
    },

    setPicture: function (pictureUrl) {
        this._pictureUrl = pictureUrl;
        this.update();
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