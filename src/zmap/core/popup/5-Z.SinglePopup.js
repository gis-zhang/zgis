/**
 * Z.Popup的单例模式
 */

Z.SinglePopup = (function () {
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
        getInstance: function (mapScene, options) {
            //if (!instantiated) {
            //    instantiated = new Z.Popup(options);
            //    instantiated.onAdd(mapScene);
            //    scene = mapScene;
            //}else if(mapScene && (mapScene !== scene)){
            //    instantiated.onRemove(scene);
            //    instantiated.onAdd(mapScene);
            //    scene = mapScene;
            //}
            //
            //return instantiated;

            var context = null,
                instance = null;

            try{
                if(getCurrentMapContext){
                    context = getCurrentMapContext();
                }
            }catch(e){}

            if(context){
                instance = context.getSingleInstance("SinglePopup");

                if(!instance){
                    var newPopup = new Z.Popup(options);
                    newPopup.onAdd(mapScene);
                    scene = mapScene;
                    context.registerSingleInstance("SinglePopup", newPopup);
                }

                instance = context.getSingleInstance("SinglePopup");
            }else {
                if (!instantiated) {
                    instantiated = new Z.Popup(options);
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
