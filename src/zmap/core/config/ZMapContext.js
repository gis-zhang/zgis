/**
 * Created by Administrator on 2015/10/24.
 */
var mapContextObject = null;

var getCurrentMapContext = function(){
    return mapContextObject;
}

var ZMapContext = function(){
    this._singleInstanceConfig = {
        "SingleTerrainPlane": new Z.SurfacePlane()
    };
}

ZMapContext.prototype.registerSingleInstance = function(key, instance){
    if(key === undefined || key === null){
        return;
    }

    this._singleInstanceConfig[key] = instance;
}

ZMapContext.prototype.unregisterSingleInstance = function(key){
    if(this._singleInstanceConfig[key]){
        delete this._singleInstanceConfig[key];
    }
}

ZMapContext.prototype.getSingleInstance = function(key){
    return this._singleInstanceConfig[key];
}

var ZMapContextManager = {};

//ZMapContextManager.getUUID = function(){
//    var d = new Date().getTime();
//    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
//        var r = (d + Math.random()*16)%16 | 0;
//        d = Math.floor(d/16);
//        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
//    });
//    return uuid;
//}

ZMapContextManager.createContext = function(){
    //var contextId = ZMapContextManager.getUUID();
    //var mapContextObject = new ZMapContext();
    var currentContextObject = new ZMapContext();

    //getCurrentMapContext = function(){
    //    return mapContextObject;
    //}

    return {
        execute: function(fun, scope, args){
            if(!(fun instanceof Function)){
                return;
            }

            //var newArgs = [context];

            //for(var argName in arguments){
            //    newArgs[argName] = arguments[argName];
            //}

            //fun.call(this, args);
            //with(this){
                mapContextObject = currentContextObject;

            if(scope){
                fun.apply(scope, args);
            }else{
                fun(args);
            }

            //}
        }
    }
}