/**
 * Created by Administrator on 2015/12/2.
 */
Z.PolygonRender3D = Z.GraphicRender3D.extend({
    initialize: function(graphic){
        Z.GraphicRender3D.prototype.initialize.apply(this, arguments);
        this._uvScale;
        this._textureForLoad = [];
        this._textureLoaded = [];
    },

    onAdd: function(graphicLayer, container, scene, baseIndex, layerIndex){
        Z.GraphicRender3D.prototype.onAdd.apply(this, arguments);
    },

    onRemove: function(graphicLayer, container, scene, baseIndex, layerIndex){
        Z.GraphicRender3D.prototype.onRemove.apply(this, arguments);

        this._uvScale = undefined;
        //this._uvScaled = false;
    },

    buildGeometry: function(shape){
        var shapes,
            rings = shape ? shape.rings : null,
            lngStart = shape ? shape.lngStart : false,
            baseHeight = shape.baseHeight,
            offsetX = 0,
            offsetY = 0,
            cw = shape.ignoreCw ? 0 : (shape.cw ? 1 : -1);

        if(rings){
            shapes = Z.GeometryUtil.convertPathToShapes(rings, this._latLngPointToScene, cw, this, offsetX, offsetY, lngStart);
        }

        var geoms = [];

        for(var i = 0; i < shapes.length; i++){
            var geometry = new THREE.ShapeGeometry(shapes);

            if(this._uvScale && this._textureForLoad.length > 0){
                this._updateUV(geometry, this._uvScale);
                geometry.uvsNeedUpdate = true;
            }

            geoms.push(geometry);
        }

        return geoms;
    },

    buildMaterial: function(symbol){
        symbol = symbol || {};
        this._uvScale = undefined;
        //this._uvScaled = false;

        //多边形边框的显示尚未处理
        var frameMaterial = null,//symbol.hidePolyline ? null : this._getFrameMaterial(symbol.polylineSymbol),
            fillMaterial = symbol.hideFill ? null : this._getFillMaterial(symbol.fillSymbol);

        return [frameMaterial, fillMaterial];
    },

    buildGraphicObject: function(geometry, material){
        var meshs = [], geometrys = (geometry instanceof Array) ? geometry : [geometry];

        for(var geomLength = 0; geomLength < geometrys.length; geomLength++){
            var mesh = null;
            this._loadTexture(geometrys[geomLength]);

            if(material instanceof Array){
                var solidMaterial = [];

                for(var i = 0; i < material.length; i++){
                    if(material[i]){
                        solidMaterial.push(material[i]);
                    }
                }

                if(solidMaterial.length > 1){
                    mesh = new THREE.SceneUtils.createMultiMaterialObject(geometrys[geomLength], solidMaterial);
                    //mesh.children[1].scale.set(0.99, 0.99, 0.99);

                    //return mesh;
                    //return new THREE.Mesh(geometry, solidMaterial[1]);


                }else if(solidMaterial.length === 1){
                    mesh = new THREE.Mesh(geometrys[geomLength], solidMaterial[0]);
                }
            }else{
                mesh = new THREE.Mesh(geometrys[geomLength], material);
            }

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

    getRenderedObject: function(baseIndex, layerIndex){
        this._uvScale = undefined;
        this._textureForLoad = [];

        return Z.GraphicRender3D.prototype.getRenderedObject.apply(this, arguments);
    },

    _getFrameMaterial: function(lineSymbol){
        var frameMaterial = null;

        if(lineSymbol instanceof Z.PolylineSymbol){
            frameMaterial = Z.StyleBuilder3D.createRenderStyle(lineSymbol);
        }else{
            frameMaterial = Z.StyleBuilder3D.createDefaultRenderStyle("linesymbol");
        }

        return frameMaterial;
    },

    _getFillMaterial: function(fillSymbol){
        var thisObj = this, fillMaterial, fillSymbol = fillSymbol || {};

        if(fillSymbol instanceof Z.PictureFillSymbol){
            fillMaterial = Z.StyleBuilder3D.createRenderStyle(fillSymbol);
            fillMaterial.side = THREE.DoubleSide;
            this._textureForLoad.push({material:fillMaterial, url: fillSymbol.url});
        }else if(fillSymbol){
            fillMaterial = Z.StyleBuilder3D.createRenderStyle(fillSymbol);
        }else{
            fillMaterial = Z.StyleBuilder3D.createDefaultRenderStyle("fillsymbol");
        }

        return fillMaterial;
    },

    //计算uv映射的比例，用于修改默认的uv值，确保纹理图片显示为原始大小
    _getUVScale: function(texture){
        var uScale = 1, vScale = 1;

        //if(material.map){
        if(texture){
            var image = texture.image,
                imageWidth = image.width,
                imageHeight = image.height,
                pixelSceneRatio = this._scene.getPixelSceneRatio();

            uScale = imageWidth / pixelSceneRatio.x;
            vScale = imageHeight / pixelSceneRatio.y;
        }

        return Z.Point.create(uScale, vScale);
    },

    _updateUV: function(object, uvScale){
        if(object instanceof THREE.Geometry){
            this._updateGeometryUV(object, uvScale);
        }
    },

    _updateGeometryUV: function(geometry, uvScale){
        var uvs = geometry.faceVertexUvs;
        geometry.computeBoundingBox();
        var bbox = geometry.boundingBox;

        for(var i = 0; i < uvs.length; i++){
            for(var j = 0; j < uvs[i].length; j++){
                for(var k = 0; k < uvs[i][j].length; k++){
                    uvs[i][j][k].x = (uvs[i][j][k].x - bbox.min.x)/uvScale.x;
                    uvs[i][j][k].y = (uvs[i][j][k].y - bbox.min.y)/uvScale.y;
                }
            }
        }
    },

    _loadTexture: function(geometry){
        if(this._textureForLoad.length > 0){
            var thisObj = this;

            for(var i = 0; i < this._textureForLoad.length; i++){
                var url = this._textureForLoad[i].url,
                    material = this._textureForLoad[i].material,
                    texture = THREE.ImageUtils.loadTexture(url, {}, function(curTexture){
                        //curTexture.wrapS = THREE.RepeatWrapping;
                        //curTexture.wrapT = THREE.RepeatWrapping;

                        if(!thisObj._uvScale){
                            //debugger;
                            var uvScale = thisObj._getUVScale(curTexture);
                            thisObj._uvScale = uvScale;
                        }

                        thisObj._updateUV(geometry, thisObj._uvScale);
                        geometry.uvsNeedUpdate = true;

                        thisObj._scene.refresh();
                    }, function(){
                        thisObj._scene.refresh();
                    });
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.minFilter = THREE.LinearFilter;
                material.map = texture;
                //this._textureLoaded.push(texture);
            }
        }
    }
});