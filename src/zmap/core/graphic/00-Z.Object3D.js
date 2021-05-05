/**
 * Created by Administrator on 2016/8/21.
 */
Z.Object3D = function(geometry, material){
    //THREE.Object3D.apply( this, arguments);
    //this._propertyListener["propertryName"] = {
    //      preSet: function(object, propertyName, value){},
    //      afterSet: function(object, propertyName, value){},
    //      preGet: function(object, propertyName){},
    //      afterGet: function(object, propertyName){}
    // }
    this._propertyListener = {};

    var innerObject = new THREE.Object3D();
    var properties = Object.getOwnPropertyNames(innerObject);

    for(var i = 0; i < properties.length; i++){
        if(typeof innerObject[properties[i]] === "Function"){
            continue;
        }

        this._applyProperty(properties[i], innerObject, this._propertyListener[properties[i]]);
    }

    this._innerObject = innerObject;
}

Z.Object3D.prototype = Object.create( THREE.Object3D.prototype );
Z.Object3D.prototype.constructor = Z.Object3D;

Z.Object3D.prototype.getPropertyListener = function(property){
    return this._propertyListener[property];
}

Z.Object3D.prototype.setPropertyListener = function(property, listener){
    this._propertyListener[property] = listener;
    //this._refreshPropertyDefine(property, this._innerObject, listener);
}

Z.Object3D.prototype.removePropertyListener = function(property, listener){
    this._propertyListener[property] = null;
    delete this._propertyListener[property];
}

//Z.Object3D.prototype._refreshPropertyDefine = function(property, target, listener){
//    if(this[property]){
//        delete this[property];
//    }
//
//    this._applyProperty(property, target, listener);
//}

Z.Object3D.prototype._applyProperty = function(property, target){
    var thisObj = this;

    Object.defineProperty(this, property, {
        get: function () {
            var listener = thisObj._propertyListener[property] || {};

            if(listener.preGet){
                listener.preGet(target, property);
            }

            var result = target[property];

            if(listener.afterGet){
                result = listener.afterGet(target, property, result);
            }

            return result;
        },
        set: function (value) {
            var listener = thisObj._propertyListener[property] || {},
                thisValue = value;

            if(listener.preSet){
                thisValue = listener.preSet(target, property, thisValue);
            }

            target[property] = thisValue;

            if(listener.afterSet){
                listener.afterSet(target, property, thisValue);
            }
        }
    });
}