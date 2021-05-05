/**
 * Created by Administrator on 2015/12/2.
 */
Z.MaterialCache = (function(){
    //var symbolsBuffer = {};
    var instanceObj = null;

    return {
        getInstance: function(){
            var context = null,
                instance = null;

            try{
                if(getCurrentMapContext){
                    context = getCurrentMapContext();
                }
            }catch(e){}

            if(context){
                instance = context.getSingleInstance("MaterialCache");

                if(!instance){
                    context.registerSingleInstance("MaterialCache", {
                        symbolsBuffer: {}
                    });
                }

                instance = context.getSingleInstance("MaterialCache");
            }else{
                if(!instanceObj){
                    instanceObj = {
                        symbolsBuffer: {}
                    };
                }

                instance = instanceObj;
            }

            return instance;
        },

        getMaterial: function(name){
            return Z.MaterialCache.getInstance().symbolsBuffer[name];
        },

        putMaterial: function(name, style){
            Z.MaterialCache.getInstance().symbolsBuffer[name] = style;
        },

        removeMaterial: function(name){
            delete Z.MaterialCache.getInstance().symbolsBuffer[name];
        },

        clear: function(){
            Z.MaterialCache.getInstance().symbolsBuffer = {};
        }
    }
})();