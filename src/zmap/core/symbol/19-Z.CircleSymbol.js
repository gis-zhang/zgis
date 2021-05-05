/**
 * Created by Administrator on 2015/12/2.
 */
Z.CircleSymbol = Z.Symbol.extend({
    initialize: function(options){
        Z.Symbol.prototype.initialize.call(this, options);
        this.borderSymbol = options.borderSymbol || new Z.PolylineSymbol;
        this.borderSymbol.opacity = (typeof this.borderSymbol.opacity === "number") ? this.borderSymbol.opacity : this.opacity;
        this.fillSymbol = options.fillSymbol || new Z.SimpleFillSymbol;
        this.fillSymbol.opacity = (typeof this.fillSymbol.opacity === "number") ? this.fillSymbol.opacity : this.opacity;
        this.hidePolyline = (typeof options.hideBorder === "boolean") ? options.hideBorder : false;
        this.hideFill = (typeof options.hideFill === "boolean") ? options.hideFill : false;
        this.segments = (typeof options.segments === "number") ? options.segments : 360;
    },

    equals: function(symbol){
        var result = false;

        if(symbol instanceof Z.CircleSymbol){
            result = Z.Symbol.prototype.equals.call(this, symbol);

            if(result){
                if(!this.borderSymbol.equals(symbol.borderSymbol)
                    || !this.fillSymbol.equals(symbol.fillSymbol)
                    || this.hidePolyline !== symbol.hidePolyline
                    || this.hideFill !== symbol.hideFill
                    || this.segments !== symbol.segments){
                    result = false;
                }
            }
        }

        return result;
    },

    clone: function(){
        //var symbol = new Z.CircleSymbol(),
        //    parentSymbol = Z.Symbol.prototype.clone.apply(this, [{opacity: this.opacity}]);
        //Z.Util.objectClone(parentSymbol, symbol);
        var symbol = new Z.CircleSymbol();
        symbol.opacity = this.opacity;
        symbol.borderSymbol = this.borderSymbol.clone();
        symbol.fillSymbol = this.fillSymbol.clone();
        symbol.hideBorder = this.hideBorder;
        symbol.hideFill = this.hideFill;
        symbol.segments = this.segments;

        return symbol;
    }
});