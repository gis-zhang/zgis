/**
 * Z.Tip的单例模式
 */

Z.SingleTip = (function () {
    var instantiated, scene;
    //function init() {
    //    /*这里定义单例代码*/
    //    return {
    //        publicMethod: function () {
    //            console.log('hello world');
    //        },
    //        publicProperty: 'test'
    //    };
    //}

    return {
        getInstance: function (mapScene) {
            var context = null,
                instance = null;

            try{
                if(getCurrentMapContext){
                    context = getCurrentMapContext();
                }
            }catch(e){}

            if(context){
                instance = context.getSingleInstance("SingleTip");

                if(!instance){
                    var newTip = new Z.Tip();
                    newTip.onAdd(mapScene);
                    scene = mapScene;
                    context.registerSingleInstance("SingleTip", newTip);
                }

                instance = context.getSingleInstance("SingleTip");
            }else {
                if (!instantiated) {
                    instantiated = new Z.Tip();
                    instantiated.onAdd(mapScene);
                    scene = mapScene;
                }

                instance = instantiated;
            }

            if (mapScene && (mapScene !== scene)) {
                instance.onRemove(scene);
                instance.onAdd(mapScene);
                scene = mapScene;
            }

            return instance;
        }
    };
})();
