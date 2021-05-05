/**
 * Created by Administrator on 2015/11/4.
 */
Z.SceneThreePaneItem = Z.ScenePaneItem.extend({
    //_objects: [],
    initialize: function(){
        Z.ScenePaneItem.prototype.initialize.call(this, arguments);
        this._objects = [];
    },

    createRootObject: function(){
        return new THREE.Object3D();
    },

    addElementToRoot: function(element, index){
        //this._removeObjects(this._objects);

        //if(this._objects.length <= 0){
        //    this._objects.push({element:element, index:index});
        //}else{
        //    for(var i = 0; i < this._objects.length; i++){
        //        if(index < this._objects[i].index){
        //            this._objects.splice(i, 0, {element:element, index:index});
        //            break;
        //        }
        //    }
        //
        //    if(i >= this._objects.length){
        //        this._objects.push({element:element, index:index});
        //    }
        //}

        this._objects.push({element:element, index:index});
        //this._objects.sort(function(a, b){
        //    return a.index - b.index;
        //});

        //element.renderOrder = index;
        //this._appendObjects(this._objects);
        this._appendObjects([{element:element, index:index}]);
    },

    removeElementFromRoot: function(element){
        this.root.remove(element);
        //Z.Util.removeFromArray(this._objects, element);
        for(var i = this._objects.length - 1; i >=0; i--){
            if(element === this._objects[i].element){
                this._objects.splice(i, 1);
            }
        }
    },

    setElementIndex: function(parent, element, index){
        this.removeElementFromRoot(element);
        this.addElementToRoot(element, index);
    },

    show: function(){
        this.root.visible = true;
    },

    hide: function(){
        this.root.visible = false;
    },

    //_removeObjects: function(objects){
    //    for(var i = 0; i < objects.length; i++){
    //        this.root.remove(objects[i].element);
    //    }
    //},

    _appendObjects: function(objects){
        for(var i = 0; i < objects.length; i++){
            this.root.add(objects[i].element);
        }
    },

    getPosition: function(){
        return {x: this.root.position.x, y:this.root.position.y, z: this.root.position.z};
    },

    setPosition: function(pos){
        pos = pos || {};
        var x = isNaN(parseFloat(pos.x)) ? this.root.position.x : parseFloat(pos.x),
            y = isNaN(parseFloat(pos.y)) ? this.root.position.y : parseFloat(pos.y),
            z = isNaN(parseFloat(pos.z)) ? this.root.position.z : parseFloat(pos.z);
        this.root.position.set(x, y, z);
    },

    setScale: function(scale){
        scale = scale || {};
        var x = isNaN(parseFloat(scale.x)) ? 1 : parseFloat(scale.x),
            y = isNaN(parseFloat(scale.y)) ? 1 : parseFloat(scale.y),
            z = isNaN(parseFloat(scale.z)) ? 1 : parseFloat(scale.z);
        this.root.scale.set(x, y, z);
    },

    newInstance: function(){
        return new Z.SceneThreePaneItem();
    }
});