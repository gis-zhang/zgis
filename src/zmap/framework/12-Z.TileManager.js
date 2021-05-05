/**
 * Created by Administrator on 2016/5/6.
 */
Z.TileManager = (function () {
    var imageQueue = [],
        //frameIntervalCount = 3,   //每隔3帧检测一次图片加载情况，防止一直占用cpu
        //currentFrameIntervalLoop = 0,
        loadingLimit = 10,   //同时最多加载的图片数
        loadingsCount = 0;   //当前正在加载的图片数

    var addListener = function (image, success, error, scope) {
        if(!(image instanceof Image)){
            return;
        }

        if(!image._src){
            return;
        }

        var url = image._src;
        //var cachedImage = Z.ResourceCache.get(url);
        //
        //if(cachedImage){
        //    if(success instanceof Function){
        //        success.call(scope, image);
        //    }
        //
        //    return;
        //}

        image.addEventListener( 'load', function ( event ) {
            //Z.ResourceCache.add( url, image);

            loadingsCount--;

            if(success instanceof Function){
                success.call(scope, image);
            }

        }, false );

        image.addEventListener( 'error', function ( event ) {
            loadingsCount--;

            if(error instanceof Function){
                error.call(scope, image);
            }
        }, false);

        //image._eventAppended = true;

        return image;
    }

    return {
        pushImageByUrl: function(url, success, error, scope){
            var image = new Image();
            image._src = url;

            addListener(image, success, error, scope);
            imageQueue.unshift(image);

            return image;
        },

        pushImageObject: function(image, success, error, scope){
            addListener(image, success, error, scope);
            imageQueue.unshift(image);

            return image;
        },

        cancelImageLoad: function(image){
            if(image){
                image._loadingCanceled = true;

                //if(image.src){
                //    image.src = "";
                //}
            }
        },

        clear: function(){
            imageQueue = [];
        },

        resort: function(centerTilePoint){
            imageQueue.sort(function(a, b){
                if(a._loadingCanceled || !a._src){
                    return -1;
                }

                var aDis = Math.abs(a._tilePoint.x - centerTilePoint.x) + Math.abs(a._tilePoint.y - centerTilePoint.y),
                    bDis = Math.abs(b._tilePoint.x - centerTilePoint.x) + Math.abs(b._tilePoint.y - centerTilePoint.y);
                return bDis - aDis;
            });
        },

        loadImages: function(){
            var sub = loadingLimit - loadingsCount;

            while(sub > 0 && imageQueue.length > 0){
                var item = imageQueue.pop();

                if(item && !item._loadingCanceled && item._src){
                    sub--;

                    item.src = item._src;
                    loadingsCount++;
                }
            }
        }
    }
})();

