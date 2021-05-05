/**
 * Created by Administrator on 2015/12/2.
 */
Z.SimpleMarkerSymbol = Z.MarkerSymbol.extend({
    initialize: function(options){
        options = options || {};
        Z.MarkerSymbol.prototype.initialize.apply(this, options);
        this.type = options.type || Z.SimpleMarkerType.Square;
        this.borderColor = options.borderColor;
        this.borderWidth = options.borderWidth;
        this.fill = options.fill;
        this.fillColor = options.fillColor;
    },

    equals: function(symbol){
        var result = false;

        if(symbol instanceof Z.SimpleMarkerSymbol){
            //result = Z.MarkerSymbol.prototype.equals.call(this, symbol);
            //
            //if(result){
            //    if(this.type !== symbol.type
            //        || this.borderColor !== symbol.borderColor
            //        || this.borderWidth !== symbol.borderWidth
            //        || this.fill !== symbol.fill
            //        || this.fillColor !== symbol.fillColor){
            //        result = false;
            //    }
            //}
            if(this.type === symbol.type
                && this.borderColor === symbol.borderColor
                && this.borderWidth === symbol.borderWidth
                && this.fill === symbol.fill
                && this.fillColor === symbol.fillColor){
                result = true;
            }

            if(result){
                result = Z.MarkerSymbol.prototype.equals.call(this, symbol);
            }
        }

        return result;
    },

    clone: function(){
        var symbol = new Z.SimpleMarkerSymbol(),
            parentSymbol = Z.MarkerSymbol.prototype.clone.apply(this, [{opacity: this.opacity, width: this.width, height: this.height, offset: this.offset}]);
        Z.Util.objectClone(parentSymbol, symbol);
        symbol.type = this.type;
        symbol.borderColor = this.borderColor;
        symbol.borderWidth = this.borderWidth;
        symbol.fill = this.fill;
        symbol.fillColor = this.fillColor;

        return symbol;
    }
});