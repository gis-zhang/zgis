/**
 * Created by Administrator on 2015/12/2.
 */
Z.RingSymbol = Z.CircleSymbol.extend({
    initialize: function(options){
        Z.CircleSymbol.prototype.initialize.call(this, options);
    },

    clone: function(){
        return Z.CircleSymbol.prototype.clone.call(this);
    }
});