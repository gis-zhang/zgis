/**
 * Created by Administrator on 2015/12/2.
 */
//默认情况下定位点在图片下边沿的正中间
Z.PictureMarkerSymbol = Z.MarkerSymbol.extend({
    initialize: function(options){   //url=>string
        options = options || {};
        Z.MarkerSymbol.prototype.initialize.call(this, options);
        this.url = options.url;
    },

    equals: function(symbol){
        var result = false;

        if(symbol instanceof Z.PictureMarkerSymbol){
            //result = Z.MarkerSymbol.prototype.equals.call(this, symbol);
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
                result = Z.MarkerSymbol.prototype.equals.call(this, symbol);
            }
        }

        return result;
    },

    clone: function(){
        var symbol = new Z.PictureMarkerSymbol(),
            parentSymbol = Z.MarkerSymbol.prototype.clone.apply(this, [{opacity: this.opacity, width: this.width, height: this.height, offset: this.offset}]);
        Z.Util.objectClone(parentSymbol, symbol);
        symbol.url = this.url;

        return symbol;
    }
});