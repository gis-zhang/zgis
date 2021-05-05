/**
 * Created by Administrator on 2016/8/21.
 */
Z.THREELine = function(geometry, material){
    //this.root = new THREE.Object3D();
    //this._mergedGraphic = null;
    //this._meshesArray = [];
    //this._meshesMap = {};
    THREE.Line.apply( this, arguments);
    this.raycastIndex = null;
}

Z.THREELine.prototype = Object.create( THREE.Line.prototype );
Z.THREELine.prototype.constructor = Z.THREELine;

Z.THREELine.prototype.raycast = function(raycaster, intersects){
    if(this.raycastIndex){
        var curIntersects = this.raycastIndex.getIntersectMeshes(raycaster);

        for(var i = 0; i < curIntersects.length; i++){
            intersects.push(curIntersects[i]);
        }
    }else{
        return THREE.Line.prototype.raycast.apply(this, arguments);
    }
}

Z.THREELine.prototype.dispose = function(){
    if(this.material){
        var materials = [this.material];

        if(this.material instanceof THREE.MultiMaterial){
            materials = this.material.materials;
        }

        for(var i = 0; i < materials.length; i++){
            materials[i].dispose();
        }
    }

    if(this.geometry){
        this.geometry.dispose();
    }
}