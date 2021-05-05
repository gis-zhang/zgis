/**
 * Created by Administrator on 2015/10/30.
 */
Z.NSDModelLayer = Z.GraphicLayer.extend({
    initialize: function(options){
        options = options || {};
        Z.GraphicLayer.prototype.initialize.call(this, options);
        //this.buildingOptions = Z.Util.applyOptions(this.buildingOptions, options, false);

        //this._graphics = {};
        //this._scene = null;
        //this._render = null;
        //this._visible = true;
        this._model = null;
        this._floors = null;
    },

    showModel: function(url, transformation){
        var thisObj = this;

        function showLoadingStatus(status){
            var loadingTagNode = document.getElementById("loadingTag"),
                loadingContentNode = document.getElementById("loadingStatus");

            if(!loadingTagNode){
                loadingTagNode = document.createElement("div");
                loadingTagNode.id = "loadingTag";
                document.body.appendChild(loadingTagNode);
            }

            if(!loadingContentNode){
                loadingContentNode = document.createElement("span");
                loadingContentNode.id = "loadingStatus";
                loadingTagNode.appendChild(loadingContentNode);
            }

            if(loadingTagNode.style.display === "none"){
                var windowWidth = window.innerWidth,
                    windowHeight = window.innerHeight,
                    nodeWidth = 250,
                    nodeHeight = 20;

                loadingTagNode.style.left = (windowWidth - nodeWidth) / 2 + "px";
                loadingTagNode.style.top = (windowHeight - nodeHeight) / 2 + "px";

                loadingTagNode.style.display = "block";
            }

            loadingContentNode.innerHTML = status;
        }

        function hideLoadingStatus(){
            var element = document.getElementById("loadingTag");

            if(element){
                element.style.display = "none";
            }
        }

        var onProgress = function( xhr ) {
            if ( xhr.lengthComputable ) {
                //var percentComplete = xhr.loaded / xhr.total * 100;
                //console.log( Math.round( percentComplete, 2 ) + '% downloaded' );
                //showLoadingStatus("正在加载：" + (Math.round( percentComplete, 2 ) + '% downloaded'));
                showLoadingStatus("正在加载");
            }

        };

        var onError = function( xhr ) {
            showLoadingStatus( "建筑模型加载出错， 请检查网络");
        };

        var loader = new THREE.XHRLoader();
        loader.load( url, function( object ) {
            var model = Z.NSDModelBuilder.parse(object, transformation);
            var types = {};
            var floors = Z.NSDModelBuilder.findFloors(model.entities);

            for(var k in model.entities){
                if(!types[model.entities[k].Type]){
                    types[model.entities[k].Type] = "1";
                }
            }

            thisObj._model = model;
            thisObj._floors = floors;
            thisObj.fire("modelLoaded");
        }, onProgress, onError);
    },

    getFloorIndexes: function(){
        var floorIndexes = [];

        for(var key in this._floors){
            floorIndexes.push(key);
        }

        return floorIndexes;
    },

    getComponentTypes: function(){
        return Z.NSDModelBuilder.types;
    },

    showFloors: function(floorIndexes, componentTypes){
        //this.clear();

        if(!(floorIndexes instanceof Array)){
            return;
        }

        var types = {},
            graphics = [];

        for(var l = 0; l < componentTypes.length; l++){
            types[componentTypes[l]] = true;
        }

        for(var i = 0; i < floorIndexes.length; i++){
            var curIndex = floorIndexes[i] + "",
                curFloor = this._floors[curIndex];

            if(!curFloor){
                continue;
            }

            //var elements = floorIndexes[i].elements;
            var elements = curFloor.elements;

            for(var j = 0; j < elements.length; j++){
                if(!types[elements[j].Type]){
                    continue;
                }

                graphics.push(elements[j].ArchGeometry3D);
            }
        }

        var curGraphicStamps = {}, newGraphics = [], removedGraphics = [];

        for(var j = 0; j < graphics.length; j++){
            var stamp = Z.Util.stamp(graphics[j], 'graphic');
            curGraphicStamps[stamp] = true;

            if(!this.hasGraphic(graphics[j])){
                newGraphics.push(graphics[j]);
            }
        }

        for(var key in this._graphics){
           if(!curGraphicStamps[key]){
               removedGraphics.push(this._graphics[key]);
           }
        }

        this.addGraphics(newGraphics);
        this.removeGraphics(removedGraphics);
    }
});

