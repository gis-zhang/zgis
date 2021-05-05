/**
 * Created by Administrator on 2015/12/2.
 */
Z.CanvasTexture = Z.Class.extend({
    initialize: function(options){
        this._element = null;
        this._context = null;
        this.needsUpdate = false;
        this.options = {
            padding: 0,                //内边距，单位为像素
            width: 100,                //单位为像素
            height:100,                //单位为像素
            autoWidth: true,         //是否根据内容自动计算宽度
            autoHeight: true,        //是否根据内容自动计算高度
            //bgColor: 0xffffff,
            //bgOpacity: 1,            //默认背景不透明
            fill: true,
            fillSymbol: new Z.SimpleFillSymbol(),
            border: true,
            borderSymbol:new Z.PolylineSymbol(),
            opacity: 1
        };

        this.options = Z.Util.applyOptions(this.options, options, false);
    },

    draw: function(content, options){
        var context = this._getContext();
        this.drawContent(context, content, options);
    },

    drawContent: function(context, content, options){
        //textSymbol = textSymbol || new Z.TextSymbol();
        //this._setCanvasFont(context, textSymbol);
        ////根据文字内容的大小设置canvas大小
        //this._setCanvasSize(this._element, context, textSymbol.text);
        ////改变canvas大小后，canvas的所有内容和设置都会被清空，所以此处需重设字体
        //this._setCanvasFont(context, textSymbol);
        //this._fillBackground(this._element, context, textSymbol);
        //this._fillText(this._element, context, textSymbol.text);
    },

    clear: function(){
        if(this._context){
            //var width = this.px2num(this._element.style.width) || 0,
            //    height = this.px2num(this._element.style.height) || 0;
            var width = this._element.width,
                height = this._element.height;
            this._context.clearRect(0, 0, width, height);
        }
    },

    dispose: function(){
        this._context = null;
        this._element = null;
    },

    getElement: function(){
        return this._element;
    },

    getSize: function(){
        if(this._element){
            //var width = this.px2num(this._element.style.width) || 0,
            //    height = this.px2num(this._element.style.height) || 0;
            var width = this._element.width,
                height = this._element.height;
            return new Z.Point(width, height);
        }else{
            return new Z.Point(0, 0);
        }
    },

    _getContext: function(){
        if(!this._element){
            this._element = this._createCanvasElement();
        }

        if(!this._context){
            this._context = this._element.getContext( '2d' );
        }

        if(this._context.globalAlpha !== this.options.opacity){
            this._context.globalAlpha === this.options.opacity;
        }

        return this._context;
    },

    _createCanvasElement: function(){
        var canvas = document.createElement( 'canvas'),
            canvasPadding = this.options.padding;
        canvas.style.padding = canvasPadding + "px";

        return canvas;
    },

    //_setCanvasFont: function(canvasContext, symbol){
    //    var fontFamily = symbol.font.family,
    //        fontWeight = symbol.font.weight,
    //        fontStyle = symbol.font.style,
    //        fontSize = symbol.font.size;
    //    canvasContext.font = fontStyle + " " + fontWeight + " " + fontSize + "px " + fontFamily;
    //    canvasContext.fillStyle = symbol.color;//'blue';//symbol.color;
    //},

    //_calculateCanvasSize: function(canvas, canvasContext, text){
    //    var size = canvasContext.measureText(text),
    //        canvasPadding = this.options.padding;
    //    var width = size.width + canvasPadding * 2;
    //    size = canvasContext.measureText("中");
    //    var height = size.width * 1.5 + canvasPadding * 2;     //部分英文字母（g、y等）显示时下底位置比中文低1/3，h等字母上底则与中文持平，因此此处将中文字体算出来的高度乘以1.5，便于同时显示中英文
    //
    //    return {width: width, height: height};
    //},
    //
    //_setCanvasSize: function(canvas, canvasContext, text){
    //    if(this.options.autoWidth || this.options.autoHeight){
    //        var size = this._calculateCanvasSize(canvas, canvasContext, text);
    //        canvas.width = this.options.autoWidth ? size.width : this.options.width;
    //        canvas.height = this.options.autoHeight ? size.height : this.options.height;
    //    }else{
    //        canvas.width = this.options.width;
    //        canvas.height = this.options.height;
    //    }
    //},
    //
    //_fillBackground: function(canvas, canvasContext, symbol){
    //    if(!symbol.fillSymbol && !symbol.borderSymbol){
    //        return;
    //    }
    //
    //
    //    if(symbol.fill){
    //        var oldFillStyle = canvasContext.fillStyle;
    //        canvasContext.fillStyle = this._getStyle(symbol.fillSymbol.color, symbol.fillSymbol.opacity);//symbol.fillColor;
    //        canvasContext.fillRect(0,0,canvas.width,canvas.height);
    //        canvasContext.fillStyle = oldFillStyle;
    //    }
    //
    //    if(symbol.border){
    //        var oldStrokeStyle = canvasContext.strokeStyle;
    //        canvasContext.lineWidth = symbol.borderWidth;
    //        canvasContext.strokeStyle = this._getStyle(symbol.borderSymbol.color, symbol.borderSymbol.opacity);//symbol.borderColor;
    //        canvasContext.strokeRect(0,0,canvas.width, canvas.height);
    //        canvasContext.strokeStyle = oldStrokeStyle;
    //    }
    //},

    //将字符串或16进制形式的颜色值中的rgb值提取出来并加入透明度，重组为rgba(r, g, b, a)格式
    _getStyle: function(color, opacity){
        var result = color;

        if(typeof color === "string"){
            if(color.length >= 7 && color.indexOf("#") >= 0){
                color = color.substring(color.indexOf("#") + 1);
                var r = (this._hex2Int(color.charAt(0))<<4) + this._hex2Int(color.charAt(1)),
                    g = (this._hex2Int(color.charAt(2))<<4) + this._hex2Int(color.charAt(3)),
                    b = (this._hex2Int(color.charAt(4))<<4) + this._hex2Int(color.charAt(5));

                result = "rgba(" + r + "," + g + "," + b + "," + opacity + ")";
            }else if(color.length >= 8 && color.indexOf("0x") >= 0){
                color = color.substring(color.indexOf("0x") + 2);
                var r = (this._hex2Int(color.charAt(0))<<4) + this._hex2Int(color.charAt(1)),
                    g = (this._hex2Int(color.charAt(2))<<4) + this._hex2Int(color.charAt(3)),
                    b = (this._hex2Int(color.charAt(4))<<4) + this._hex2Int(color.charAt(5));

                result = "rgba(" + r + "," + g + "," + b + "," + opacity + ")";
            }
        }else if(typeof color === "number"){
            var r = (color >> 16) & 0x0000ff,
                g = (color >> 8) & 0x0000ff,
                b = color & 0x0000ff;

            result = "rgba(" + r + "," + g + "," + b + "," + opacity + ")";
        }

        return result;
    },

    _hex2Int: function(hex){
        return parseInt("0x" + hex);
    },

    px2num: function(pxSize){
        if((typeof pxSize === "string") && (pxSize.indexOf("px") >= 0)){
            return parseInt(pxSize.substring(0, pxSize.length - 2));
        }else{
            return NaN;
        }
    }
});