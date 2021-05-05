/**
 * Created by Administrator on 2015/11/4.
 */
Z.ScenePaneItem = Z.Class.extend({
    initialize: function () {
        this.root = this.createRootObject();
        this._children = [];
        //this.parent = null;
        this.index = 0;
    },

    createRootObject: function(){

    },

    addChild: function(item, index){
        if(!(item instanceof this.constructor)){
            return;
        }

        if(typeof index === "number"){
            item.index = index;
        }

        if(item.parent){

        }

        this.addElementToRoot(item.root, item.index);
        //item.parent = this;
        //Z.Util.addToArray(this._children, item, item.index);
        //if(this._children.length <= 0){
        //    this._children.push(item);
        //}else{
        //    for(var i = 0; i < this._children.length; i++){
        //        if(item.index < this._children[i].index){
        //            this._children.splice(i, 0, item);
        //            break;
        //        }
        //    }
        //
        //    if(i >= this._children.length){
        //        this._children.push(item);
        //    }
        //}
        this._children.push(item);
        //this._children.sort(function(a, b){
        //    return a.index - b.index;
        //});
    },

    addElementToRoot: function(element, index){

    },

    removeChild: function(item){
        if(!(item instanceof this.constructor)){
            return;
        }

        this.removeElementFromRoot(item.root);
        //item.parent = null;
        Z.Util.removeFromArray(this._children, item);
    },

    removeElementFromRoot: function(element){

    },

    setChildIndex: function(item, index){
        if(typeof index !== "number"){
            return;
        }

        item.index = index;
        this.setElementIndex(this.root, item.root, item.index);
    },

    setElementIndex: function(parent, element, index){

    },

    show: function(){

    },

    hide: function(){

    },

    resetRoot: function(){
        this.root = this.createRootObject();
    },

    getMaxChildIndex: function(){
        var maxIndex = 0;

        for(var i = 0; i < this._children.length; i++){
            if(maxIndex < this._children[i].index){
                maxIndex = this._children[i].index;
            }
        }

        return maxIndex;
    },

    getPosition: function(){},

    setPosition: function(pos){},

    setScale: function(scale){},

    newInstance: function(){}
    //,
    //
    //getAbsoluteIndex: function(){
    //    var parentIndex = 0;
    //
    //    if(this.parent){
    //        parentIndex = this.parent.getAbsoluteIndex();
    //    }
    //
    //    return parentIndex * 10 + this.index;        //每个item下面的子元素数量控制为10个
    //}
});