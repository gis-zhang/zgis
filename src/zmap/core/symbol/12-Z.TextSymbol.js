/**
 * Created by Administrator on 2015/12/2.
 */
Z.TextSymbol = Z.MarkerSymbol.extend({
    initialize: function(options){
        options = options || {};
        Z.MarkerSymbol.prototype.initialize.call(this, options);
        this.text = options.text;             //string
        this.font = options.font ? new Z.Font(options.font) : new Z.Font();
        this.color= options.color || '#222222';                                                           //文字颜色
        this.fill = (typeof options.fill === "boolean") ? options.fill : true;                           //是否填充文本区域
        this.fillSymbol = (options.fillSymbol instanceof Z.FillSymbol) ? options.fillSymbol : new Z.SimpleFillSymbol(options.fillSymbol);
        this.border = (typeof options.border === "boolean") ? options.border : true;                         //是否显示文本区域边框
        this.borderSymbol = (options.borderSymbol instanceof Z.PolylineSymbol) ? options.borderSymbol : new Z.PolylineSymbol(options.borderSymbol);
        this.anchor = options.anchor || false;
        //this.align = options.align;
    },

    equals: function(symbol){
        var result = false;

        if(symbol instanceof Z.TextSymbol){
            //result = Z.MarkerSymbol.prototype.equals.call(this, symbol);
            //
            //if(result){
            //    if(this.text !== symbol.text
            //        || !this.font.equals(symbol.font)
            //        || this.color !== symbol.color
            //        || this.fill !== symbol.fill
            //        || !this.fillSymbol.equals(symbol.fillSymbol)
            //        || this.border !== symbol.border
            //        || !this.borderSymbol.equals(symbol.borderSymbol)){
            //        result = false;
            //    }
            //}
            if(this.text === symbol.text
                && this.font.equals(symbol.font)
                && this.color === symbol.color
                && this.fill === symbol.fill
                && this.fillSymbol.equals(symbol.fillSymbol)
                && this.border === symbol.border
                && this.borderSymbol.equals(symbol.borderSymbol)){
                result = true;
            }

            if(result){
                result = Z.MarkerSymbol.prototype.equals.call(this, symbol);
            }
        }

        return result;
    },

    clone: function(){
        var symbol = new Z.TextSymbol(),
            parentSymbol = Z.MarkerSymbol.prototype.clone.apply(this, [{opacity: this.opacity, width: this.width, height: this.height, offset: this.offset}]);
        Z.Util.objectClone(parentSymbol, symbol);
        symbol.text = this.text;
        symbol.font = this.font.clone();
        symbol.color = this.color;
        symbol.fill = this.fill;
        symbol.fillSymbol = this.fillSymbol.clone();
        symbol.border = this.border;
        symbol.borderSymbol = this.borderSymbol.clone();

        return symbol;
    }
});