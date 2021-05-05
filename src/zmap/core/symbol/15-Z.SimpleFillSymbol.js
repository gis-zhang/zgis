/**
 * Created by Administrator on 2015/12/2.
 */
Z.SimpleFillSymbol = Z.FillSymbol.extend({
    initialize: function(options){
        options = options || {};
        Z.FillSymbol.prototype.initialize.call(this, options);
        this.color = options.color || '#ffffff';
        this.style = options.style || Z.FillStyleType.Solid;
    },

    equals: function(symbol){
        var result = false;

        if(symbol instanceof Z.SimpleFillSymbol){
            //result = Z.FillSymbol.prototype.equals.call(this, symbol);
            //
            //if(result){
            //    if(this.color !== symbol.color
            //        || this.style !== symbol.style){
            //        result = false;
            //    }
            //}
            if(this.color === symbol.color
                && this.style === symbol.style){
                result = true;
            }

            if(result){
                result = Z.FillSymbol.prototype.equals.call(this, symbol);
            }
        }

        return result;
    },

    clone: function(){
        //var symbol = new Z.SimpleFillSymbol(),
        //    parentSymbol = Z.FillSymbol.prototype.clone.apply(this, [{opacity: this.opacity, bgColor: this.bgColor}]);
        //Z.Util.objectClone(parentSymbol, symbol);
        var symbol = new Z.SimpleFillSymbol();
        symbol.opacity = this.opacity;
        symbol.bgColor = this.bgColor;
        symbol.color = this.color;
        symbol.style = this.style;

        return symbol;
    }
});