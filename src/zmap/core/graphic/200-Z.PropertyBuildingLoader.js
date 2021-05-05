/**
 * Created by Administrator on 2015/12/2.
 */
Z.PropertyBuildingLoader = Z.AbstractBuildingLoader.extend({
    initialize: function(data, prop){
        this.data = data || {};
        this.prop = prop;
    },

    load: function(callback){
        if(!(callback instanceof Function)){
            return;
        }

        var propValue = this.data[this.prop];

        callback(propValue);
    }
});
