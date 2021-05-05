/**
 * Created by Administrator on 2015/12/2.
 */
Z.MarkerSymbol = Z.Symbol.extend({
    initialize: function(options){
        Z.Symbol.prototype.initialize.call(this, options);
        options = options || {};
        this.width = options.width;     //float，单位为像素
        this.height = options.height;   //float，单位为像素
        this.anchor = options.anchor || "bottomCenter";     //bottomCenter、bottomRight、centerLeft、centerCenter、centerRight、topLeft、topCenter、topRight
        this.offset = options.offset;  //Z.Point，相对于中心点的偏移量，x为正时向右偏移，y为正时向上偏移，单位为像素
    },

    equals: function(symbol){
        var result = false;

        if(symbol instanceof Z.MarkerSymbol){
            //result = Z.Symbol.prototype.equals.call(this, symbol);
            //
            //if(result){
            //    var offset = this.offset || new Z.Point(0, 0);
            //
            //    if(this.width !== symbol.width
            //        || this.height !== symbol.height
            //        || !offset.equals(symbol.offset)){
            //        result = false;
            //    }
            //}
            var offset = this.offset || new Z.Point(0, 0);

            if(this.width === symbol.width
                && this.height === symbol.height
                && offset.equals(symbol.offset)){
                result = true;
            }

            if(result){
                result = Z.Symbol.prototype.equals.call(this, symbol);
            }
        }

        return result;
    },

    clone: function(){
        var symbol = new Z.MarkerSymbol(),
            parentSymbol = Z.Symbol.prototype.clone.apply(this, [{opacity: this.opacity}]);
        Z.Util.objectClone(parentSymbol, symbol);
        symbol.width = this.width;
        symbol.height = this.height;
        symbol.offset = this.offset;
        symbol.anchor = this.anchor;

        return symbol;
    }
});