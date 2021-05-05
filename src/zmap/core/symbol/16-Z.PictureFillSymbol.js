/**
 * Created by Administrator on 2015/12/2.
 */
Z.PictureFillSymbol = Z.FillSymbol.extend({
    initialize: function(options){
        options = options || {};
        Z.FillSymbol.prototype.initialize.call(this, options);
        this.url = options.url;
    },

    equals: function(symbol){
        var result = false;

        if(symbol instanceof Z.PictureFillSymbol){
            //result = Z.FillSymbol.prototype.equals.call(this, symbol);
            //
            //if(result){
            //    if(this.url !== symbol.url){
            //        result = false;
            //    }
            //}
            if(this.url === symbol.url){
                result = true;
            }

            if(result){
                result = Z.FillSymbol.prototype.equals.call(this, symbol);
            }
        }

        return result;
    },

    clone: function(){
        //var symbol = new Z.PictureFillSymbol(),
        //    parentSymbol = Z.FillSymbol.prototype.clone.apply(this, [{opacity: this.opacity, bgColor: this.bgColor}]);
        //Z.Util.objectClone(parentSymbol, symbol);
        symbol = new Z.PictureFillSymbol();
        symbol.opacity = this.opacity;
        symbol.bgColor = this.bgColor;
        symbol.url = this.url;

        return symbol;
    }
});