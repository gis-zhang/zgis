/**
 * Created by Administrator on 2015/12/2.
 */
Z.Symbol = Z.Class.extend({
    initialize: function(options){
        options = options || {};
        this.opacity = (typeof options.opacity === 'number') ? options.opacity : 1;
    },

    equals: function(symbol){
        var result = false;

        if(symbol instanceof Z.Symbol){
            result = true;

            //for(var key in symbol){
            //    if(key === undefined || key === "prototype" || symbol[key] instanceof Function){
            //        continue;
            //    }
            //
            //    if(this[key] !== symbol[key]){
            //        result = false;
            //    }
            //}

            if(this.opacity !== symbol.opacity){
                result = false;
            }
        }

        return result;
    },

    clone: function(options){
        return new Z.Symbol({opacity: this.opacity});
    }
});