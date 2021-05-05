/**
 * Created by Administrator on 2015/10/30.
 */
var ObjLoader = (function(){
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

    var resolveURL = function ( url ) {
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

        return {
            modelName: modelName,
            path: path
        }
    };

    THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );

    var materials = null;

    function composeModel(object, materials, path){
        var objectLength = object.length,
            symbolLib = {},
            models = {};

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
                    symbols[j].d = 1;        //因为室内结构用半透明方式看不清楚，此处强制设置为不透明
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

            //targetGeometry = new Z.ModelGeometry(null, modelParams, transformation);
            targetGeometry = new Z.ModelGeometry(null, modelParams);

            var name = object[i].name;
            var graphicOptions = {title: "#{name}", tip: "#{name}"};
            var graphic = new Z.Graphic(new Z.Feature({name: name}, targetGeometry), targetSymbol, graphicOptions);

            //thisObj._components[name] = graphic;
            models[name] = graphic;

            //if(thisObj._shellConfig[name]){
            //    thisObj._shells.push({
            //        "ArchGeometry3D" : graphic,
            //        "Type": name
            //    });
            //}else{
            //    for(var key in thisObj._floorConfig){
            //        if(thisObj._floorConfig[key][name]){
            //            if(!thisObj._floors[key]){
            //                thisObj._floors[key] = [];
            //            }
            //
            //            thisObj._floors[key].push({
            //                "ArchGeometry3D" : graphic,
            //                "Type": name
            //            });
            //        }
            //    }
            //}
        }

        //thisObj.fire("modelLoaded");
        return models;
    }

    return {
        loadObjModel: function(url, callback, scope){
            var resolvedUrl = resolveURL(url),
                path = resolvedUrl.path,
                modelName = resolvedUrl.modelName;

            var mtlLoader = new THREE.MTLLoader();
            mtlLoader.setPath( path );
            mtlLoader.load( modelName + '.mtl', function( materials ) {
                //materials.preload();

                //var objLoader = new THREE.OBJLoader();
                var objLoader = new Z.OBJLoader();
                objLoader.setMaterials( materials );
                objLoader.setPath( path );

                var mtls = materials;
                function loadCallback(object){
                    var composedModels = composeModel(object, mtls, path);

                    if(callback){
                        if(scope){
                            callback.call(scope, composedModels);
                        }else{
                            callback(composedModels);
                        }
                    }
                }

                objLoader.load( modelName + '.obj', loadCallback, onProgress, onError );
                //objLoader.load( modelName + '.obj', composeModel, onProgress, onError );
            });
        }
    };
})();

