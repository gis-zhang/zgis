/**
 * Created by Administrator on 2015/12/2.
 */
Z.ExtrudeSymbol = Z.Symbol.extend({
    initialize: function(options){
        Z.Symbol.prototype.initialize.call(this, options);
        options = options || {};
        this.topColor = options.topColor || '#aaaaaa';
        this.topImageUrl = options.topImageUrl;
        this.wallColor = options.wallColor || '#aaaaaa';
        this.wallImageUrl = options.wallImageUrl;
        this.wire = options.wire || false;
        this.wireSymbol = options.wireSymbol || new Z.PolylineSymbol();
        this.side = 'FrontSide';  //'BackSide', 'DoubleSide'
    },

    equals: function(symbol){
        var result = false;

        if(symbol instanceof Z.ExtrudeSymbol){
            //result = Z.Symbol.prototype.equals.call(this, symbol);
            //
            //if(result){
            //    if(this.topColor !== symbol.topColor
            //        || this.topImageUrl !== symbol.topImageUrl
            //        || this.wallColor !== symbol.wallColor
            //        || this.wallImageUrl !== symbol.wallImageUrl
            //        || this.wire !== symbol.wire
            //        || !this.wireSymbol.equals(symbol.wireSymbol)
            //        || this.side !== symbol.side){
            //        result = false;
            //    }
            //}
            if(this.topColor === symbol.topColor
                && this.topImageUrl === symbol.topImageUrl
                && this.wallColor === symbol.wallColor
                && this.wallImageUrl === symbol.wallImageUrl
                && this.wire === symbol.wire
                && this.wireSymbol.equals(symbol.wireSymbol)
                && this.side === symbol.side){
                result = true;
            }

            if(result){
                result = Z.Symbol.prototype.equals.call(this, symbol);
            }
        }

        return result;
    },

    clone: function(){
        //var symbol = new Z.ExtrudeSymbol(),
        //    parentSymbol = Z.Symbol.prototype.clone.apply(this, [{opacity: this.opacity}]);
        //Z.Util.objectClone(parentSymbol, symbol);
        var symbol = new Z.ExtrudeSymbol();
        symbol.opacity = this.opacity;
        symbol.topColor = this.topColor;
        symbol.topImageUrl = this.topImageUrl;
        symbol.wallColor = this.wallColor;
        symbol.wallImageUrl = this.wallImageUrl;
        symbol.wire = this.wire;
        symbol.wireSymbol = this.wireSymbol;

        return symbol;
    }
});