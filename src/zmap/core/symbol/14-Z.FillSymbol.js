/**
 * Created by Administrator on 2015/12/2.
 */
Z.FillSymbol = Z.Symbol.extend({
    initialize: function(options){
        Z.Symbol.prototype.initialize.call(this, options);
        options = options || {};
        this.bgColor = options.bgColor || '#ffffff';
    },

    equals: function(symbol){
        var result = false;

        if(symbol instanceof Z.FillSymbol){
            //result = Z.Symbol.prototype.equals.call(this, symbol);
            //
            //if(result){
            //    if(this.bgColor !== symbol.bgColor){
            //        result = false;
            //    }
            //}
            if(this.bgColor === symbol.bgColor){
                result = true;
            }

            if(result){
                result = Z.Symbol.prototype.equals.call(this, symbol);
            }
        }

        return result;
    },

    clone: function(){
        //var symbol = new Z.FillSymbol(),
        //    parentSymbol = Z.Symbol.prototype.clone.apply(this, [{opacity: this.opacity}]);
        //Z.Util.objectClone(parentSymbol, symbol);
        var symbol = new Z.FillSymbol();
        symbol.opacity = this.opacity;
        symbol.bgColor = this.bgColor;

        return symbol;
    }
});