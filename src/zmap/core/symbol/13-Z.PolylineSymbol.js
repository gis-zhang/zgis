/**
 * Created by Administrator on 2015/12/2.
 */
Z.PolylineSymbol = Z.Symbol.extend({
    initialize: function(options){
        Z.Symbol.prototype.initialize.call(this, options);
        options = options || {};
        this.color = options.color || '#555500';
        this.width = options.width || 1;
        this.style= options.style || Z.PolylineStyleType.Solid;
        this.dashSize = options.dashSize || 10;
        this.gapSize = options.gapSize || 5;
        this.only2d = options.only2d || true;             //是否只作为二维图形显示，若为ture则会忽略坐标点本身的z坐标
    },

    equals: function(symbol){
        var result = false;

        if(symbol instanceof Z.PolylineSymbol){
            //result = Z.Symbol.prototype.equals.call(this, symbol);
            //
            //if(result){
            //    if(this.color !== symbol.color
            //        || this.width !== symbol.width
            //        || this.style !== symbol.style
            //        || this.only2d !== symbol.only2d){
            //        result = false;
            //    }
            //}
            if(this.color === symbol.color
                && this.width === symbol.width
                && this.style === symbol.style
                && this.only2d === symbol.only2d){
                result = true;
            }

            if(result){
                result = Z.Symbol.prototype.equals.call(this, symbol);
            }
        }

        return result;
    },

    clone: function(){
        //var symbol = new Z.PolylineSymbol(),
        //    parentSymbol = Z.Symbol.prototype.clone.apply(this, [{opacity: this.opacity}]);
        //    //parentSymbol = new Z.Symbol({opacity: this.opacity}).clone();
        //Z.Util.objectClone(parentSymbol, symbol);
        var symbol = new Z.PolylineSymbol();
        symbol.opacity = this.opacity;
        symbol.color = this.color;
        symbol.width = this.width;
        symbol.style = this.style;
        symbol.only2d = this.only2d;

        return symbol;
    }
});