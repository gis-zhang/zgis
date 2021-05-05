/**
 * Created by Administrator on 2017/4/29.
 */

Z.ResourceCache = (function(){
    var objects = {};

    function getObjects(){
        var context = getContext(),
            cachedObjects = null;

        if(context){
            cachedObjects = context.getSingleInstance("CachedObjects");

            if(!cachedObjects){
                context.registerSingleInstance("CachedObjects", {});
                cachedObjects = context.getSingleInstance("CachedObjects");
            }
        }else {
            cachedObjects = objects;
        }

        return cachedObjects;
    }

    function clear(){
        var context = getContext();

        if(context){
            context.registerSingleInstance("CachedObjects", {});
        }else {
            objects = [];
        }
    }

    function getContext(){
        var context = null;

        try{
            if(getCurrentMapContext){
                context = getCurrentMapContext();
            }
        }catch(e){}

        return context;
    }

    return {
        add: function ( key, file ) {
            var cachedObjects = getObjects();
            cachedObjects[ key ] = file;
        },

        get: function ( key ) {
            var cachedObjects = getObjects();

            return cachedObjects[ key ];
        },

        remove: function ( key ) {
            var cachedObjects = getObjects();
            delete cachedObjects[ key ];
        },

        clear: function () {
            clear();
        }
    }
})();