/**
 * Created by Administrator on 2015/12/2.
 */
Z.SpriteContainer = Z.Class.extend({
    includes: Z.EventManager,

    initialize: function(sprite, offset){   //sprite=>THREE.Object3D, offset=>Z.Point
        if(!(sprite instanceof THREE.Object3D) && !(sprite instanceof THREE.Geometry)){
            throw new Error("缺少sprite参数");
        }

        this.sprite = sprite;
        var spriteOriginPosition = sprite.position.clone();
        this.sprite.position.set(0, 0, 0);

        this._container = new THREE.Object3D();
        this._container.add(this.sprite);
        this._container.position.set(spriteOriginPosition.x, spriteOriginPosition.y, spriteOriginPosition.z);
        this.setOffset(offset);
    },

    setPosition: function(x, y, z){
        this._container.position.set(x, y, z);
    },

    setOffset: function(offset){
        if(!(offset instanceof Z.Point)){
            return;
        }

        this.sprite.position.set(offset.x, offset.y, offset.z);
    },

    //offset: function(offset){
    //    if(!(offset instanceof Z.Point)){
    //        return;
    //    }
    //
    //    var curPos = this.sprite.position;
    //    var newX = offset.x ? (offset.x + curPos.x) : curPos.x,
    //        newY = offset.y ? (offset.y + curPos.y) : curPos.y,
    //        newZ = offset.z ? (offset.z + curPos.z) : curPos.z;
    //    this.sprite.position.set(newX, newY, newZ);
    //},

    resetScale: function(){
        this.sprite.scale.set(1, 1, 1);
    },

    setScale: function(scale){
        if(!(scale instanceof Z.Point)){
            return;
        }

        this.sprite.scale.set(scale.x || 1, scale.y || 1, scale.z || 1);
    },

    getSpriteBounds: function(){
        this.sprite.geometry.computeBoundingBox();

        return this.sprite.geometry.boundingBox;
    },

    onAdd: function(scene){
        this._scene = scene;
        this.refresh();
    },

    refresh: function(){
        if(this._scene){
            var mapRotate = this._scene.getRotateByRad();
            this._container.setRotationFromQuaternion(new THREE.Quaternion(mapRotate.x, mapRotate.y, mapRotate.z, mapRotate.w));
        }
    },

    getThreeObject: function(){
        return this._container;
    }
});