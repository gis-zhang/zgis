/**
 * Created by Administrator on 2015/12/2.
 */
Z.TextCanvasTexture = Z.CanvasTexture.extend({
    initialize: function(options){
        Z.CanvasTexture.prototype.initialize.call(this, options);
    },

    drawContent: function(context, content, options){
        options = options || {};
        var textSymbol = options.textSymbol || new Z.TextSymbol();
        //var context = this._getContext();
        this._setCanvasFont(context, textSymbol);
        //根据文字内容的大小设置canvas大小
        this._setCanvasSize(this._element, context, content);
        //改变canvas大小后，canvas的所有内容和设置都会被清空，所以此处需重设字体
        this._setCanvasFont(context, textSymbol);
        this._fillBackground(this._element, context, textSymbol);
        this._fillText(this._element, context, content);
    },

    _setCanvasFont: function(canvasContext, symbol){
        var fontFamily = symbol.font.family,
            fontWeight = symbol.font.weight,
            fontStyle = symbol.font.style,
            fontSize = (symbol.font.size + "").toLowerCase();

        if((fontSize.indexOf('px') < 0) && (fontSize.indexOf('em') < 0)){
            fontSize += "px";
        }

        canvasContext.font = fontStyle + " " + fontWeight + " " + fontSize + " " + fontFamily;
        canvasContext.fillStyle = symbol.color;//'blue';//symbol.color;
    },

    _calculateCanvasSize: function(canvas, canvasContext, text){
        var size = canvasContext.measureText(text),
            canvasPadding = this.options.padding;
        var width = size.width + canvasPadding * 2;
        size = canvasContext.measureText("中");
        var height = size.width * 1.5 + canvasPadding * 2;     //部分英文字母（g、y等）显示时下底位置比中文低1/3，h等字母上底则与中文持平，因此此处将中文字体算出来的高度乘以1.5，便于同时显示中英文

        return {width: width, height: height};
    },

    _setCanvasSize: function(canvas, canvasContext, text){
        if(this.options.autoWidth || this.options.autoHeight){
            var size = this._calculateCanvasSize(canvas, canvasContext, text);
            canvas.width = this.options.autoWidth ? size.width : this.options.width;
            canvas.height = this.options.autoHeight ? size.height : this.options.height;
        }else{
            canvas.width = this.options.width;
            canvas.height = this.options.height;
        }
    },

    _fillBackground: function(canvas, canvasContext, symbol){
        if(!symbol.fillSymbol && !symbol.borderSymbol){
            return;
        }


        if(symbol.fill){
            var oldFillStyle = canvasContext.fillStyle;
            canvasContext.fillStyle = this._getStyle(symbol.fillSymbol.color, symbol.fillSymbol.opacity);//symbol.fillColor;
            canvasContext.fillRect(0,0,canvas.width,canvas.height);
            canvasContext.fillStyle = oldFillStyle;
        }

        if(symbol.border){
            var oldStrokeStyle = canvasContext.strokeStyle;
            canvasContext.lineWidth = symbol.borderWidth;
            canvasContext.strokeStyle = this._getStyle(symbol.borderSymbol.color, symbol.borderSymbol.opacity);//symbol.borderColor;
            canvasContext.strokeRect(0,0,canvas.width, canvas.height);
            canvasContext.strokeStyle = oldStrokeStyle;
        }
    },

    ////将字符串或16进制形式的颜色值中的rgb值提取出来并加入透明度，重组为rgba(r, g, b, a)格式
    //_getStyle: function(color, opacity){
    //    var result = color;
    //
    //    if(typeof color === "string"){
    //        if(color.length >= 7 && color.indexOf("#") >= 0){
    //            color = color.substring(color.indexOf("#") + 1);
    //            var r = (this._hex2Int(color.charAt(0))<<4) + this._hex2Int(color.charAt(1)),
    //                g = (this._hex2Int(color.charAt(2))<<4) + this._hex2Int(color.charAt(3)),
    //                b = (this._hex2Int(color.charAt(4))<<4) + this._hex2Int(color.charAt(5));
    //
    //            result = "rgba(" + r + "," + g + "," + b + "," + opacity + ")";
    //        }else if(color.length >= 8 && color.indexOf("0x") >= 0){
    //            color = color.substring(color.indexOf("0x") + 2);
    //            var r = (this._hex2Int(color.charAt(0))<<4) + this._hex2Int(color.charAt(1)),
    //                g = (this._hex2Int(color.charAt(2))<<4) + this._hex2Int(color.charAt(3)),
    //                b = (this._hex2Int(color.charAt(4))<<4) + this._hex2Int(color.charAt(5));
    //
    //            result = "rgba(" + r + "," + g + "," + b + "," + opacity + ")";
    //        }
    //    }else if(typeof color === "number"){
    //        var r = (color >> 16) & 0x0000ff,
    //            g = (color >> 8) & 0x0000ff,
    //            b = color & 0x0000ff;
    //
    //        result = "rgba(" + r + "," + g + "," + b + "," + opacity + ")";
    //    }
    //
    //    return result;
    //},
    //
    //_hex2Int: function(hex){
    //    return parseInt("0x" + hex);
    //},

    _fillText: function(canvas, canvasContext, text){
        var canvasPadding = this.options.padding,
            position = this._getTextPosition(canvas);
        canvasContext.fillText(text, position.x, position.y);
        //canvasContext.fillText(text, 0, 35);
    },

    _getTextPosition: function(canvas){
        var canvasPadding = this.options.padding,
            textHeight = canvas.height - canvasPadding * 2;
        var x = canvasPadding,
            y = canvas.height - canvasPadding - textHeight * 1 / 3;

        return {x: x, y: y};
    }
});