/**
 * Created by Administrator on 2016/5/6.
 */
Z.TaskSchedualer = (function () {
    var taskQueue = [],
        //frameIntervalCount = 3,   //每隔3帧检测一次图片加载情况，防止一直占用cpu
        //currentFrameIntervalLoop = 0,
        //loadingLimit = 10,   //同时最多加载的图片数
        //loadingsCount = 0;   //当前正在加载的图片数
        timeLimit = 30;      //单次可执行的最长时间

    //var addListener = function (image, success, error, scope) {
    //    if(!(image instanceof Image)){
    //        return;
    //    }
    //
    //    if(!image._src){
    //        return;
    //    }
    //
    //    var url = image._src;
    //
    //    image.addEventListener( 'load', function ( event ) {
    //        THREE.Cache.add( url, image);
    //
    //        loadingsCount--;
    //
    //        if(success instanceof Function){
    //            success.call(scope, image);
    //        }
    //
    //    }, false );
    //
    //    image.addEventListener( 'error', function ( event ) {
    //        loadingsCount--;
    //
    //        if(error instanceof Function){
    //            error.call(scope, image);
    //        }
    //    }, false);
    //
    //    //image._eventAppended = true;
    //
    //    return image;
    //}

    return {
        pushTask: function(task){
            taskQueue.unshift(task);
        },

        cancelTask: function(task){
            if(!task) {
                return;
            }

            for(var i = 0; i < taskQueue.length; i++){
                if(task === taskQueue[i]){
                    taskQueue.splice(i, 1);
                }
            }
        },

        clear: function(){
            taskQueue = [];
        },

        runTasks: function(){
            var spendedTime = 0;

            while(spendedTime < timeLimit && taskQueue.length > 0){
                var startTime = new Date(),
                item = taskQueue.pop();

                try{
                    item.run();
                }catch(e){
                    if(typeof item.error === "Function"){
                        item.error();
                    }
                }


                var endTime = new Date();
                spendedTime += (endTime.getMilliseconds() - startTime.getMilliseconds());
            }
        }
    }
})();

