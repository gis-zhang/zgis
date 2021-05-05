/**
 * Created by Administrator on 2015/12/2.
 */
Z.PolygonSymbol = Z.Symbol.extend({
    initialize: function(options){
        options = options || {};
        Z.Symbol.prototype.initialize.call(this, options);
        this.polylineSymbol = options.polylineSymbol || new Z.PolylineSymbol();
        this.polylineSymbol.opacity = (typeof this.polylineSymbol.opacity === "number") ? this.polylineSymbol.opacity : this.opacity;
        this.fillSymbol = options.fillSymbol || new Z.SimpleFillSymbol();
        this.fillSymbol.opacity = (typeof this.fillSymbol.opacity === "number") ? this.fillSymbol.opacity : this.opacity;
        this.hidePolyline = (typeof options.hidePolyline === "boolean") ? options.hidePolyline : false;
        this.hideFill = (typeof options.hideFill === "boolean") ? options.hideFill : false;
        //this.only2d = false;   //是否只作为二维图形显示，弱为ture则会忽略坐标点本身的z坐标
    },

    equals: function(symbol){
        var result = false;

        if(symbol instanceof Z.PolygonSymbol){
            //result = Z.Symbol.prototype.equals.call(this, symbol);
            //
            //if(result){
            //    if(!this.polylineSymbol.equals(symbol.polylineSymbol)
            //        || !this.fillSymbol.equals(symbol.fillSymbol)
            //        || this.hidePolyline !== symbol.hidePolyline
            //        || this.hideFill !== symbol.hideFill){
            //        result = false;
            //    }
            //}
            if(this.polylineSymbol.equals(symbol.polylineSymbol)
                && this.fillSymbol.equals(symbol.fillSymbol)
                && this.hidePolyline === symbol.hidePolyline
                && this.hideFill === symbol.hideFill){
                result = true;
            }

            if(result){
                result = Z.Symbol.prototype.equals.call(this, symbol);
            }
        }

        return result;
    },

    clone: function(){
        //var symbol = new Z.PolygonSymbol(),
        //    parentSymbol = Z.Symbol.prototype.clone.apply(this, [{opacity: this.opacity}]);
        //Z.Util.objectClone(parentSymbol, symbol);
        var symbol = new Z.PolygonSymbol();
        symbol.opacity = this.opacity;
        symbol.polylineSymbol = this.polylineSymbol.clone();
        symbol.fillSymbol = this.fillSymbol.clone();
        symbol.hidePolyline = this.hidePolyline;
        symbol.hideFill = this.hideFill;

        return symbol;
    }
});