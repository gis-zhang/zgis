/**
 * Created by Administrator on 2015/11/4.
 */
Z.SceneDivPaneItem = Z.ScenePaneItem.extend({
    createRootObject: function(){
        var element = document.createElement("div");
        //element.style.position = "absolute";
        element.className = "zmap-view-pane";

        return element;
    },

    addElementToRoot: function(element, index){
        if(!element){
            return;
        }

        if(this.root.childNodes.length == 0){
            this.root.appendChild(element);
            index = index || 0;
        }else{
            index = Z.Util.limitIndexToArray(this.root.childNodes, index);

            if(index >= this.root.childNodes.length){
                this.root.appendChild(element);
            }else{
                this.root.insertBefore(element, this.root.childNodes[index]);
            }
        }

        element.style.zIndex = index;
    },

    removeElementFromRoot: function(element){
        if(element){
            try{
                this.root.removeChild(element);
            }catch(e){}
        }
    },

    setElementIndex: function(parent, element, index){
        if(Z.Util.isNull(index) || !element){
            return;
        }

        element.style.zIndex = index;
    },

    show: function(){
        this.root.style.display = "block";
    },

    hide: function(){
        this.root.style.display = "none";
    },

    getPosition: function(){
        return {x: this.root.offsetLeft, y:this.root.offsetTop, z: 0};
    },

    setPosition: function(pos){
        pos = pos || {};
        this.root.style.left = isNaN(parseInt(pos.x)) ? this.root.style.left : parseInt(pos.x);
        this.root.style.top = isNaN(parseInt(pos.y)) ? this.root.style.top : parseInt(pos.y);
    },

    setWidth: function(width){
        if(!isNaN(width)){
            this.root.style.width = width + "px";
        }
    },

    setHeight: function(height){
        if(!isNaN(height)){
            this.root.style.height = height + "px";
        }
    },

    setScale: function(scale){
        //待完善
    },

    newInstance: function(){
        return new Z.SceneDivPaneItem();
    }
});