/**
 * Created by Administrator on 2015/12/2.
 */
Z.ModelRender3D = Z.GraphicRender3D.extend({
    //initialize: function(graphic){
    //    Z.GraphicRender3D.prototype.initialize.apply(this, arguments);
    //    //this._uvScale;
    //    //this._textureForLoad = [];
    //    //this._textureLoaded = [];
    //},
    //
    //onAdd: function(graphicLayer, container, scene, baseIndex, layerIndex){
    //    Z.GraphicRender3D.prototype.onAdd.apply(this, arguments);
    //},
    //
    //onRemove: function(graphicLayer, container, scene, baseIndex, layerIndex){
    //    Z.GraphicRender3D.prototype.onRemove.apply(this, arguments);
    //
    //    //this._uvScale = undefined;
    //    //this._uvScaled = false;
    //},

    buildGeometry: function(shape, cw){
        var params = shape ? shape.modelParams : null,
            lngStart = shape.lngStart,
            geometry = null;

        if(params){
            var bufferGeometry = new THREE.BufferGeometry(),
                newVertices = null;

            if(shape.transformation){
                newVertices = new Array(params.vertices.length);

                for(var i = 0; i < params.vertices.length; i = i + 3){
                    var curX = params.vertices[i],
                        curY = params.vertices[i + 1],
                        curZ = params.vertices[i + 2];

                    if(lngStart === false){
                        curZ = params.vertices[i + 1];
                        curY = params.vertices[i + 2];
                    }

                    var transformPoint = shape.transformation.transform(curX, curY, curZ);
                    var newPoint = this._latLngPointToScene(new THREE.Vector3(transformPoint.x, transformPoint.y, 0)),
                        zValue = this._layer.getSceneHeight(transformPoint.z);
                    newVertices[i] = newPoint.x;
                    newVertices[i + 1] = newPoint.y;
                    newVertices[i + 2] = zValue;
                }
            }else if(lngStart === false){
                newVertices = new Array(params.vertices.length);

                for(var i = 0; i < params.vertices.length; i = i + 3){
                    var curX = params.vertices[i],
                        curZ = params.vertices[i + 1],
                        curY = params.vertices[i + 2];

                    newVertices[i] = curX;
                    newVertices[i + 1] = curY;
                    newVertices[i + 2] = curZ;
                }
            }

            bufferGeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array(newVertices || params.vertices), 3 ) );

            if(params.faces){
                if (params.faces.length > 65535) {
                    bufferGeometry.setIndex( new THREE.BufferAttribute( new Uint32Array( params.faces ), 1 ) );
                } else {
                    bufferGeometry.setIndex( new THREE.BufferAttribute( new Uint16Array( params.faces ), 1 ) );
                }
            }

            if(params.normals && params.normals.length > 0){
                bufferGeometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array(params.normals), 3 ) );
            }else{
                bufferGeometry.computeFaceNormals();
            }

            if ( params.uvs && params.uvs.length > 0 ) {
                bufferGeometry.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( params.uvs ), 2 ) );
            }

            var groups = this._graphic.symbol.groups;

            if(groups){
                for(var k = 0; k < groups.length; k++){
                    bufferGeometry.addGroup(groups[k].start, groups[k].count, groups[k].symbolIndex);
                }
            }

            bufferGeometry.verticesNeedUpdate = true;
            bufferGeometry.computeBoundingSphere();
            bufferGeometry.computeBoundingBox();

            //geometry = new THREE.Geometry().fromBufferGeometry( bufferGeometry );

            //if(!params.normals) {
            //    geometry.computeFaceNormals();
            //}
        }

        //return geometry;
        return bufferGeometry;
    },

    buildMaterial: function(symbol){
        //symbol = symbol || {};
        var fillMaterial = null;

        if(symbol instanceof Z.GroupSymbol){
            var subSymbols = symbol.symbols,
                materials = [];

            for(var i = 0; i < subSymbols.length; i++){
                materials.push(this._getFillMaterial(subSymbols[i]));
            }

            if(materials.length === 1){
                fillMaterial = materials[0];
            }else if(materials.length > 1){
                fillMaterial = new THREE.MultiMaterial(materials);
            }else{
                fillMaterial = this._getFillMaterial(symbol);
            }
        }else{
            fillMaterial = this._getFillMaterial(symbol);
        }

        return fillMaterial;
    },

    buildGraphicObject: function(geometry, material){
        var meshs = [],
            geometrys = (geometry instanceof Array) ? geometry : [geometry],
            isLine = this._graphic.feature.shape.isLine;

        for(var geomLength = 0; geomLength < geometrys.length; geomLength++){
            var mesh = null;
            //this._loadTexture(geometrys[geomLength]);

            if(material instanceof Array){
                var solidMaterial = [];

                for(var i = 0; i < material.length; i++){
                    if(material[i]){
                        solidMaterial.push(material[i]);
                    }
                }

                if(solidMaterial.length > 1){
                    //mesh = new THREE.SceneUtils.createMultiMaterialObject(geometrys[geomLength], solidMaterial);
                    ////mesh.children[1].scale.set(0.99, 0.99, 0.99);
                    //
                    ////return mesh;
                    ////return new THREE.Mesh(geometry, solidMaterial[1]);

                    mesh = new THREE.Group();

                    for ( var i = 0, l = solidMaterial.length; i < l; i ++ ) {
                        //mesh.add( new THREE.Mesh( geometrys[geomLength], solidMaterial[ i ] ) );
                        mesh = this._createThreeObject(geometrys[geomLength], solidMaterial[i], isLine);
                    }
                }else if(solidMaterial.length === 1){
                    //mesh = new THREE.Mesh(geometrys[geomLength], solidMaterial[0]);
                    mesh = this._createThreeObject(geometrys[geomLength], solidMaterial[0], isLine);
                }
            }else{
                //mesh = new THREE.Mesh(geometrys[geomLength], material);
                mesh = this._createThreeObject(geometrys[geomLength], material, isLine);
            }

            //var transformation = this._graphic.feature.shape.transformation;
            //
            //if(transformation){
            //    var vecs = transformation.decompose();
            //    mesh.position.set(vecs.position.x, vecs.position.y, vecs.position.z);
            //    mesh.quaternion.set(vecs.quaternion.x, vecs.quaternion.y, vecs.quaternion.z, vecs.quaternion.w);
            //    mesh.scale.set(vecs.scale.x, vecs.scale.y, vecs.scale.z);
            //    //mesh.matrix.multiply(matrix);
            //    mesh.matrixWorldNeedsUpdate = true;
            //}

            meshs.push(mesh);
        }


        if(meshs.length <= 0){
            return new THREE.Object3D();
        }else if(meshs.length === 1){
            return meshs[0];
        }else{
            var graphic = new THREE.Object3D();

            for(var k = 0; k < meshs.length; k++){
                graphic.add(meshs[k]);
            }

            return graphic;
        }
    },

    //getRenderedObject: function(baseIndex, layerIndex){
    //    //this._uvScale = undefined;
    //    //this._textureForLoad = [];
    //
    //    return Z.GraphicRender3D.prototype.getRenderedObject.apply(this, arguments);
    //},

    //_getFrameMaterial: function(lineSymbol){
    //    var frameMaterial = null;
    //
    //    if(lineSymbol instanceof Z.PolylineSymbol){
    //        frameMaterial = Z.StyleBuilder3D.createRenderStyle(lineSymbol);
    //    }else{
    //        frameMaterial = Z.StyleBuilder3D.createDefaultRenderStyle("linesymbol");
    //    }
    //
    //    return frameMaterial;
    //},

    _getFillMaterial: function(fillSymbol){
        var name = fillSymbol.name;

        if(Z.MaterialCache.getMaterial(name)){
            return Z.MaterialCache.getMaterial(name);
        }

        var thisObj = this, fillMaterial, fillSymbol = fillSymbol || {};

        if(fillSymbol instanceof Z.PictureFillSymbol){
            //fillMaterial = Z.StyleBuilder3D.createRenderStyle(fillSymbol, "lambert");
            fillMaterial = Z.Style3DFlyweight.getStyle(fillSymbol, "lambert", fillSymbol.side, function(){
                thisObj._scene.refresh();
            });
            fillMaterial.side = THREE.DoubleSide;
            //this._textureForLoad.push({material:fillMaterial, url: fillSymbol.url});
        }else if(fillSymbol){
            //fillMaterial = Z.StyleBuilder3D.createRenderStyle(fillSymbol, "lambert");
            fillMaterial = Z.Style3DFlyweight.getStyle(fillSymbol, "lambert", fillSymbol.side);
        }else{
            //此处未用到单例，需修改
            fillMaterial = Z.StyleBuilder3D.createDefaultRenderStyle("fillsymbol");
        }

        Z.MaterialCache.putMaterial(name, fillMaterial);

        return fillMaterial;
    },

    _createThreeObject: function(geometry, material, isLine){
        return isLine ? new THREE.Line(geometry, material) : new THREE.Mesh(geometry, material);
    }

    ////计算uv映射的比例，用于修改默认的uv值，确保纹理图片显示为原始大小
    //_getUVScale: function(texture){
    //    var uScale = 1, vScale = 1;
    //
    //    //if(material.map){
    //    if(texture){
    //        var image = texture.image,
    //            imageWidth = image.width,
    //            imageHeight = image.height
    //            pixelSceneRatio = this._scene.getPixelSceneRatio();
    //
    //        uScale = imageWidth / pixelSceneRatio.x;
    //        vScale = imageHeight / pixelSceneRatio.y;
    //    }
    //
    //    return Z.Point.create(uScale, vScale);
    //},

    //_updateUV: function(object, uvScale){
    //    if(object instanceof THREE.Geometry){
    //        this._updateGeometryUV(object, uvScale);
    //    }
    //},
    //
    //_updateGeometryUV: function(geometry, uvScale){
    //    var uvs = geometry.faceVertexUvs;
    //    geometry.computeBoundingBox();
    //    var bbox = geometry.boundingBox;
    //
    //    for(var i = 0; i < uvs.length; i++){
    //        for(var j = 0; j < uvs[i].length; j++){
    //            for(var k = 0; k < uvs[i][j].length; k++){
    //                uvs[i][j][k].x = (uvs[i][j][k].x - bbox.min.x)/uvScale.x;
    //                uvs[i][j][k].y = (uvs[i][j][k].y - bbox.min.y)/uvScale.y;
    //            }
    //        }
    //    }
    //},

    //_loadTexture: function(geometry){
    //    if(this._textureForLoad.length > 0){
    //        var thisObj = this;
    //
    //        for(var i = 0; i < this._textureForLoad.length; i++){
    //            var url = this._textureForLoad[i].url,
    //                material = this._textureForLoad[i].material,
    //                texture = THREE.ImageUtils.loadTexture(url, {}, function(curTexture){
    //                    //curTexture.wrapS = THREE.RepeatWrapping;
    //                    //curTexture.wrapT = THREE.RepeatWrapping;
    //
    //                    if(!thisObj._uvScale){
    //                        //debugger;
    //                        var uvScale = thisObj._getUVScale(curTexture);
    //                        thisObj._uvScale = uvScale;
    //                    }
    //
    //                    thisObj._updateUV(geometry, thisObj._uvScale);
    //                    geometry.uvsNeedUpdate = true;
    //
    //                    thisObj._scene.refresh();
    //                }, function(){
    //                    thisObj._scene.refresh();
    //                });
    //            texture.wrapS = THREE.RepeatWrapping;
    //            texture.wrapT = THREE.RepeatWrapping;
    //            texture.minFilter = THREE.LinearFilter;
    //            material.map = texture;
    //            //this._textureLoaded.push(texture);
    //        }
    //    }
    //}
});