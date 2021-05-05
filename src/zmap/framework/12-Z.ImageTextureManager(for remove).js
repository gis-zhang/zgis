/**
 * Created by Administrator on 2016/5/6.
 */
Z.ImageTextureManager = (function () {
    var textureQueue = [],
        //frameIntervalCount = 3,   //每隔3帧检测一次图片加载情况，防止一直占用cpu
        //currentFrameIntervalLoop = 0,
        loadingLimit = 10,   //同时最多加载的图片数
        loadingsCount = 0;   //当前正在加载的图片数

    var createImage = function (texture, url, success, error, scope) {
        var image = new Image();
        image._src = url;

        image.addEventListener( 'load', function ( event ) {
            texture.image = image;
            texture.needsUpdate = true;

            THREE.Cache.add( url, image);

            loadingsCount--;

            if(success instanceof Function){
                success.call(scope, texture);
            }

        }, false );

        image.addEventListener( 'error', function ( event ) {
            loadingsCount--;

            if(error instanceof Function){
                error.call(scope, texture);
            }
        }, false);

        return image;
    }

    return {
        createTexture: function(url, mapping, success, error, scope){
            var texture = new THREE.Texture( undefined, mapping );
            var cachedImage = THREE.Cache.get( url );

            if ( cachedImage !== undefined ) {
                if(success instanceof Function){
                    success.call(scope, cachedImage);
                }

                texture.image = cachedImage;
                texture.needsUpdate = true;
            }else{
                var image = createImage(texture, url, success, error, scope);

                textureQueue.unshift({
                    texture: texture,
                    image: image
                });
            }

            return texture;
        },

        loadTextures: function(){
            var sub = loadingLimit - loadingsCount;

            //if(sub > 0 && currentFrameIntervalLoop >= 3){
            //    currentFrameIntervalLoop = 0;

                while(sub > 0 && textureQueue.length > 0){
                    var item = textureQueue.pop();

                    if(item){
                        sub--;
                        var curTexture = item.texture,
                            curImg = item.image;

                        curImg.src = curImg._src;
                    }
                }
            //}else{
            //    currentFrameIntervalLoop++;
            //}
        }
    }
})();

