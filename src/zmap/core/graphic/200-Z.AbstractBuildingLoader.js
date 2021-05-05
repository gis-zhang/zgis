/**
 * Created by Administrator on 2015/12/2.
 */
Z.AbstractBuildingLoader = Z.Class.extend({
    initialize: function(){},

    load: function(callback, recursive){
        throw error("load为抽象方法，请在子类中覆盖");
    }
});
