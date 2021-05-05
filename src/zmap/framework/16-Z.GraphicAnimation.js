/**
 * Created by Administrator on 2016/5/6.
 */
Z.GraphicAnimation = (function () {
    var graphicQueue = [],
        //frameIntervalCount = 3,   //每隔3帧检测一次图片加载情况，防止一直占用cpu
        //currentFrameIntervalLoop = 0,
        loadingLimit = 2,   //同时最多加载的图片数
        loadingsCount = 0;   //当前正在加载的图片数

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
        animateZValueByStep: function(graphic, step, startValue, endValue, callback, callbackScope){
            //var image = new Image();
            //image._src = url;
            //
            //addListener(image, success, error, scope);
            //imageQueue.unshift(image);
            //
            //return image;
            graphicQueue.push({
                graphic: graphic,
                step: step,
                startValue: startValue,
                endValue: endValue,
                tempValue: startValue,
                callback: callback,
                callbackScope: callbackScope
            });
        },

        //cancelImageLoad: function(image){
        //    if(image){
        //        image._loadingCanceled = true;
        //
        //        //if(image.src){
        //        //    image.src = "";
        //        //}
        //    }
        //},
        //
        //clear: function(){
        //    imageQueue = [];
        //},
        //
        //resort: function(centerTilePoint){
        //    imageQueue.sort(function(a, b){
        //        if(a._loadingCanceled || !a._src){
        //            return -1;
        //        }
        //
        //        var aDis = Math.abs(a._tilePoint.x - centerTilePoint.x) + Math.abs(a._tilePoint.y - centerTilePoint.y),
        //            bDis = Math.abs(b._tilePoint.x - centerTilePoint.x) + Math.abs(b._tilePoint.y - centerTilePoint.y);
        //        return bDis - aDis;
        //    });
        //},

        run: function(){
            var //sub = loadingLimit - loadingsCount,
                completed = [];

            //while(sub > 0 && graphicQueue.length > 0){
            //    var item = graphicQueue.pop();
            //
            //    if(item && !item._loadingCanceled && item._src){
            //        sub--;
            //
            //        item.src = item._src;
            //        loadingsCount++;
            //    }
            //}

            for(var i = 0; i < graphicQueue.length && i < loadingLimit; i++){
                var curGraphic = graphicQueue[i],
                    obj = curGraphic.graphic,
                    temp = curGraphic.tempValue,
                    step = curGraphic.step,
                    endValue = curGraphic.endValue,
                    callback = curGraphic.callback,
                    callbackScope = curGraphic.callbackScope;

                temp += step;

                if(temp >= endValue){
                    obj.scale.set(1, 1, endValue);
                    completed.push(i);

                    if(callback){
                        callback.call(callbackScope, obj);
                    }
                }else{
                    curGraphic.tempValue = temp;
                    obj.scale.set(1, 1, temp);
                }
            }

            for(var j = completed.length - 1; j >= 0; j--){
                graphicQueue.splice(completed[j], 1);
            }
        }
    }
})();

