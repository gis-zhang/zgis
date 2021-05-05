/**
 * Created by Administrator on 2015/10/30.
 */
Z.ThreeDMaxModelLayer = Z.GraphicLayer.extend({
    initialize: function(options){
        options = options || {};
        Z.GraphicLayer.prototype.initialize.call(this, options);
        //this.buildingOptions = Z.Util.applyOptions(this.buildingOptions, options, false);

        //this._graphics = {};
        //this._scene = null;
        //this._render = null;
        //this._visible = true;

        this._components = {};

        this._shells = [];
        this._floors = {};
        this._shellConfig = {"外壳1": true, "外壳2": true};
        this._floorConfig = {
            "-1" : {"_1f": true, "_1F物品": true},
            "1" : {"1f": true, "1F物品": true, "1楼楼梯7": true, "1楼指示牌": true, "地面": true},
            "2" : {"2f": true, "2F物品": true, "2楼楼梯": true, "2楼指示牌": true, "2楼楼板": true},
            "3" : {"3f01": true, "3F物品": true, "3楼楼梯": true, "3层楼板": true}
        };
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
            //if ( xhr.lengthComputable ) {
            //    //var percentComplete = xhr.loaded / xhr.total * 100;
            //    //console.log( Math.round( percentComplete, 2 ) + '% downloaded' );
            //    //showLoadingStatus("正在加载：" + (Math.round( percentComplete, 2 ) + '% downloaded'));
            //    showLoadingStatus("正在加载");
            //}

        };

        var onError = function( xhr ) {
            showLoadingStatus( "建筑模型加载出错， 请检查网络");
        };

        var resolveURL = function ( baseUrl, url ) {
            if ( typeof url !== 'string' || url === '' )
                return '';

            // Absolute URL
            if ( /^https?:\/\//i.test( url ) ) {
                return url;
            }

            return baseUrl + url;
        };

        var toArray = function(inputArray){
            inputArray = inputArray || [];
            var array = [];

            for(var i = 0; i < inputArray.length; i++){
                array[i] = inputArray[i];
            }

            return array;
        }

        THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );

        if(url.lastIndexOf("/") === url.length - 1){
            url = url.substring(0, url.length - 1);
        }

        var index = url.lastIndexOf("/"),
            modelName = "", path = "";

        if(index < 0){
            modelName = url;
        }else if(index === 0){
            modelName = url.substring(index + 1);
        }else if(index > 0 && index < url.length - 1){
            modelName = url.substring(index + 1);
            path = url.substring(0, index + 1);
        }

        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setPath( path );
        mtlLoader.load( modelName + '.mtl', function( materials ) {
            //materials.preload();

            //var objLoader = new THREE.OBJLoader();
            var objLoader = new Z.OBJLoader();
            objLoader.setMaterials( materials );
            objLoader.setPath( path );

            function loadCallback(object){
                var objectLength = object.length,
                    symbolLib = {};

                for(var i = objectLength - 1; i >= 0; i--){
                    var geom = object[i].geometry,
                        rawMaterial = object[i].materials,
                        isLine = object[i].isLine;
                    var normals = geom.normal,
                        positions = geom.position,
                        uvs = geom.uv,
                        faces = geom.face,
                        rawGroups = geom.groups,
                        //curMaterials = rawMaterial.materials,
                        curMaterials = rawMaterial,
                        symbols = [],
                        targetGroup = [], targetSymbol, targetGeometry;

                    for(var j = 0; j < curMaterials.length; j++){
                        var materialName = curMaterials[j].name,matUrl;

                        if(symbolLib[materialName]){
                            symbols[j] = symbolLib[materialName];
                            continue;
                        }

                        if(materials.materialsInfo[materialName]){
                            var curMaterialInfo = materials.materialsInfo[materialName];
                            symbols[j] = new Z.ModelSymbol(curMaterialInfo);
                            symbols[j].path = path
                        }else{
                            symbols[j] = new Z.ModelSymbol({
                                name: materialName//,
                                //path: path,
                                //d: curMaterials[j].opacity,
                                //kd: curMaterials[j].color,
                                //map_kd: curMaterials[j].map ? (curMaterials[j].map.image ? curMaterials[j].map.image.src : null) : null
                            });
                        }

                        symbols[j].isLine = isLine;
                        //symbols[j] = curSymbol;
                        symbolLib[materialName] = symbols[j];
                    }

                    for(j = 0; j < rawGroups.length; j++){
                        targetGroup[j] = {
                            start: rawGroups[j].start,
                            count: rawGroups[j].count,
                            symbolIndex: rawGroups[j].materialIndex
                        };
                    }

                    targetSymbol = new Z.GroupSymbol(targetGroup, symbols);

                    var modelParams = {
                        normals: normals || null,
                        uvs: uvs || null,
                        vertices: positions || null,
                        faces: faces || null,
                        isLine: isLine
                    };

                    targetGeometry = new Z.ModelGeometry(null, modelParams, transformation);

                    var name = object[i].name;
                    var graphicOptions = {title: "#{name}", tip: "#{name}", enableTitle: true};
                    var graphic = new Z.Graphic(new Z.Feature({name: name}, targetGeometry), targetSymbol, graphicOptions);

                    thisObj._components[name] = graphic;

                    if(thisObj._shellConfig[name]){
                        thisObj._shells.push({
                            "ArchGeometry3D" : graphic,
                            "Type": name
                        });
                    }else{
                        for(var key in thisObj._floorConfig){
                            if(thisObj._floorConfig[key][name]){
                                if(!thisObj._floors[key]){
                                    thisObj._floors[key] = [];
                                }

                                thisObj._floors[key].push({
                                    "ArchGeometry3D" : graphic,
                                    "Type": name
                                });
                            }
                        }
                    }
                }

                thisObj.fire("modelLoaded");
            }

            objLoader.load( modelName + '.obj', loadCallback, onProgress, onError );
        });
    },

    getFloorIndexes: function(){
        var floorIndexes = [];

        for(var key in this._floors){
            floorIndexes.push(key);
        }

        var shellIndex = "外壳";

        for(var shellKey in this._shellConfig){
            if(shellKey){
                floorIndexes.push(shellIndex);
                break;
            }
        }

        return floorIndexes;
    },

    getComponentTypes: function(floors){
        //floors = (floors instanceof Array) ? floors : (floors ? [floors] : []);
        //var types = [],
        //    elements = {},
        //    hasShell = false;
        //
        //for(var floor in this._floorConfig){
        //    if(floors.length > 0){
        //        for(var floorIndex = 0; floorIndex < floors.length; floorIndex++){
        //            if((floors[floorIndex] + "") === floor){
        //                break;
        //            }
        //        }
        //
        //        if(floorIndex >= floors.length){
        //            continue;
        //        }
        //    }
        //
        //    for(var key in this._floorConfig[floor]){
        //        elements[key] = true;
        //    }
        //}
        //
        //for(var type in elements){
        //    types.push(type);
        //}
        //
        //if(floors.length > 0){
        //    for(floorIndex = 0; floorIndex < floors.length; floorIndex++){
        //        if((floors[floorIndex] + "") === "外壳"){
        //            //types["外壳"] = true;
        //            //types.push("外壳");
        //            for(var key in this._shellConfig){
        //                types.push(key);
        //            }
        //
        //            break;
        //        }
        //    }
        //}else{
        //    for(var key in this._shellConfig){
        //        types.push(key);
        //    }
        //}
        //
        //return types;

        var types = [];

        for(var key in this._components){
            types.push(key);
        }

        return types;
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
                if(curIndex === "外壳"){
                    curFloor = this._shells;

                    //for(var j = 0; j < elements.length; j++){
                    //    if(!types[elements[j].Type]){
                    //        continue;
                    //    }
                    //
                    //    graphics.push(elements[j].ArchGeometry3D);
                    //}
                }else{
                    continue;
                }
            }

            //var elements = floorIndexes[i].elements;
            //var elements = curFloor.elements;
            var elements = curFloor;

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
    },

    showComponents: function(componentIds){
        if(!(componentIds instanceof Array)){
            return;
        }

        var types = {},
            graphics = [];

        //for(var l = 0; l < componentTypes.length; l++){
        //    types[componentTypes[l]] = true;
        //}

        for(var i = 0; i < componentIds.length; i++){
            graphics.push(this._components[componentIds[i]]);
            //var curIndex = componentIds[i] + "",
            //    curFloor = this._floors[curIndex];
            //
            //if(!curFloor){
            //    if(curIndex === "外壳"){
            //        curFloor = this._shells;
            //
            //        //for(var j = 0; j < elements.length; j++){
            //        //    if(!types[elements[j].Type]){
            //        //        continue;
            //        //    }
            //        //
            //        //    graphics.push(elements[j].ArchGeometry3D);
            //        //}
            //    }else{
            //        continue;
            //    }
            //}
            //
            ////var elements = floorIndexes[i].elements;
            ////var elements = curFloor.elements;
            //var elements = curFloor;
            //
            //for(var j = 0; j < elements.length; j++){
            //    if(!types[elements[j].Type]){
            //        continue;
            //    }
            //
            //    graphics.push(elements[j].ArchGeometry3D);
            //}
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
    },

    showAllComponents: function(){
        var graphics = [];

        for(var key in this._components) {
            graphics.push(this._components[key]);
        }

        this.addGraphics(graphics);
    },

    _getGraphicLayerRender3D: function(options){
        return new Z.GraphicLayerRender3D(options);
        //return new Z.GraphicLayerMergedRender3D(options);
    }
});

