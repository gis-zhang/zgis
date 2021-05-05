/**
 * Created by Administrator on 2015/10/30.
 */
Z.ThreejsUtil = {
    clearObject3D: function(object3d){
        var children = object3d.children();

        for(var i = 0; i < children.length; i++){
            object3d.remove(children[i]);
        }
    },

    vector2GLPoint: function(vector){
        vector = vector || {};

        if(typeof vector.x !== "number" || typeof vector.y !== "number"){
            return null;
        }else{
            return Z.Point.create(vector.x, vector.y, vector.z);
        }
    }
}