/**
 * 地表面
 * 单例.
 */
Z.SingleTerrainPlane = (function(){
    var instanceObj = null;

    //return {
    //    getInstance: function(){
    //        if(!instance){
    //            instance = new Z.SurfacePlane();
    //        }
    //
    //        return instance;
    //    }
    //}

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
                instance = context.getSingleInstance("SingleTerrainPlane");

                if(!instance){
                    context.registerSingleInstance("SingleTerrainPlane", new Z.SurfacePlane());
                }

                instance = context.getSingleInstance("SingleTerrainPlane");
            }else{
                if(!instanceObj){
                    instanceObj = new Z.SurfacePlane();
                }

                instance = instanceObj;
            }

            return instance;
        }
    }
})();