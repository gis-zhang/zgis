/**
 * Created by Administrator on 2015/12/2.
 */
Z.SphereRender3D = Z.GraphicRender3D.extend({
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
        var geometry = null,
            center = shape ? shape.center: null,
            radius = shape ? shape.radius : null;

        if(center){
            var //transformCenter = this._latLngPointToScene(new THREE.Vector3(center.lng, center.lat, 0)),
                //zValue = this._layer.getSceneHeight(center.alt || 0),
                transformRadius = this._layer.getSceneHeight(radius || 0);

            var geometry = new THREE.SphereGeometry(transformRadius);
            //var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
            //var sphere = new THREE.Mesh( geometry, material );
        }

        return geometry;
    },

    buildMaterial: function(symbol){
        //symbol = symbol || {};
        var fillMaterial = this._getFillMaterial(symbol);

        return fillMaterial;
    },

    buildGraphicObject: function(geometry, material){
        var meshs = [],
            geometrys = (geometry instanceof Array) ? geometry : [geometry],
            center = this._graphic.feature.shape.center;
        var transformCenter = this._latLngPointToScene(new THREE.Vector3(center.lng, center.lat, 0)),
            zValue = this._layer.getSceneHeight(center.alt || 0);

        for(var geomLength = 0; geomLength < geometrys.length; geomLength++){
            var mesh = null;

            if(material instanceof Array){
                var solidMaterial = [];

                for(var i = 0; i < material.length; i++){
                    if(material[i]){
                        solidMaterial.push(material[i]);
                    }
                }

                if(solidMaterial.length > 1){
                    mesh = new THREE.SceneUtils.createMultiMaterialObject(geometrys[geomLength], solidMaterial);
                }else if(solidMaterial.length === 1){
                    mesh = new THREE.Mesh(geometrys[geomLength], solidMaterial[0]);
                }
            }else{
                mesh = new THREE.Mesh(geometrys[geomLength], material);
            }

            mesh.position.set(transformCenter.x, transformCenter.y, zValue);
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

    //override
    updateGeometry: function(){
        this._updateGraphic();
    },

    _getFillMaterial: function(fillSymbol){
        var thisObj = this, fillMaterial, fillSymbol = fillSymbol || {};

        if(fillSymbol instanceof Z.PictureFillSymbol){
            fillMaterial = Z.StyleBuilder3D.createRenderStyle(fillSymbol, "lambert");
            fillMaterial.side = THREE.DoubleSide;
            //this._textureForLoad.push({material:fillMaterial, url: fillSymbol.url});
        }else if(fillSymbol){
            fillMaterial = Z.StyleBuilder3D.createRenderStyle(fillSymbol, "lambert");
        }else{
            fillMaterial = Z.StyleBuilder3D.createDefaultRenderStyle("fillsymbol");
        }

        return fillMaterial;
    }
});