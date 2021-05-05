/**
 * Created by Administrator on 2015/12/2.
 */
Z.ExtrudeTextRender3D = Z.GraphicRender3D.extend({
    initialize: function(graphic){
        Z.GraphicRender3D.prototype.initialize.apply(this, arguments);
        this._spriteContainer = null;
        //this._texture = null;
    },

    buildGeometry: function(shape, cw){
        if(shape instanceof Z.LatLng){
            return this._latLngPointToScene(new THREE.Vector3(shape.lng, shape.lat, shape.alt));
        }else{
            return null;
        }
    },

    buildMaterial: function(symbol){
        var material, thisObj = this;

        if(symbol instanceof Z.TextSymbol){
            material = new THREE.MeshFaceMaterial( [
                Z.StyleBuilder3D.createRenderStyle(new Z.SimpleFillSymbol({color : symbol.color})), // front
                Z.StyleBuilder3D.createRenderStyle(new Z.SimpleFillSymbol({color : symbol.color}))  // side
                //new THREE.MeshBasicMaterial( { color: symbol.color, shading: THREE.FlatShading } ), // front
                //new THREE.MeshBasicMaterial( { color: symbol.color, shading: THREE.SmoothShading } ) // side
            ] );
        }else{
            material = new THREE.MeshFaceMaterial( [
                Z.StyleMaker3D.createRenderStyle("simplefillsymbol"), // front
                Z.StyleMaker3D.createRenderStyle("simplefillsymbol")  // side
            ] );
        }

        return material;
    },

    buildGraphicObject: function(geometry, material){
        if(!geometry || !material){
            return;
        }

        var sprite = this._createExtrudeText(material);
        var spriteContainer = new Z.SpriteContainer(sprite);
        spriteContainer.onAdd(this._scene);
        spriteContainer.setPosition(geometry.x, geometry.y, geometry.z);

        this._applyOffset(spriteContainer, sprite.geometry);
        //this._loadTexture(spriteContainer);
        this._spriteContainer = spriteContainer;

        return spriteContainer.getThreeObject();
    },

    refresh: function(){
        Z.GraphicRender3D.prototype.refresh.apply(this, arguments);
        this._spriteContainer.refresh();
    },

    //默认的updateGeometry直接使用buildGeometry方法的返回结果。不过这里的buildGeometry方法不直接返回THREE.Geometry对象，所以需要重写updateGeometry方法
    updateGeometry: function(shape, cw){
        var geometry = this.buildGeometry(shape, cw);
        this._spriteContainer.setPosition(geometry.x, geometry.y, geometry.z);
    },

    _createExtrudeText: function(material){
        var geometry = this._createTextGeometry(),
            mesh = new THREE.Mesh(geometry, material);

        return mesh;
    },

    _createTextGeometry: function(){
        var text = this._graphic.symbol.text,
            size = this._graphic.symbol.font.size,
            textGeo = new THREE.TextGeometry( text, {
                size: size,
                height: 0.01,
                curveSegments: 3,

                font: this._graphic.symbol.font.family,
                weight: this._graphic.symbol.font.weight,
                style: this._graphic.symbol.font.style,

                //bevelThickness: bevelThickness,
                //bevelSize: bevelSize,
                bevelEnabled: false,

                material: 0,
                extrudeMaterial: 1
            });

        textGeo.computeBoundingBox();
        textGeo.computeVertexNormals();

        return textGeo;
    },

    //将定位点移到图片的下底边的中心
    _applyOffset: function(spriteContainer, textGeometry){
        var offsetY = 0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
        spriteContainer.setOffset(new Z.Point(0, offsetY, 0));
    }

    //_loadTexture: function(spriteContainer){
    //    var url = this._graphic.symbol.url,
    //        thisObj = this,
    //        symbol = this._graphic.symbol,
    //        symbolWidth = (typeof symbol.width) === "number" ? symbol.width : undefined,
    //        symbolHeight = (typeof symbol.height) === "number" ? symbol.height : undefined;
    //
    //    var texture = THREE.ImageUtils.loadTexture(url, {}, function(curTexture){
    //        var pixelSceneRatio = thisObj._scene.getPixelSceneRatio(),
    //            image = curTexture.image,
    //            imageWidth = symbolWidth || image.width,
    //            imageHeight = symbolHeight || image.height,
    //            sceneWidth = imageWidth / pixelSceneRatio.x,
    //            sceneHeight = imageHeight / pixelSceneRatio.y;
    //
    //        spriteContainer.setScale(new Z.Point(sceneWidth, sceneHeight, 1));
    //        thisObj._applyOffset(spriteContainer);
    //
    //        thisObj._scene.refresh();
    //    }, function(){
    //        thisObj._scene.refresh();
    //    });
    //    texture.minFilter = THREE.LinearFilter;
    //
    //    spriteContainer.sprite.material.map = texture;
    //},

    //_createPictureObject: function(material){
    //    var geometry = new THREE.PlaneGeometry(1,1);
    //    var mater = material || new THREE.MeshBasicMaterial({color: 0xffffff, fog: true});
    //    var spriteObject = new THREE.Mesh(geometry, mater);
    //    spriteObject.castShadow = true;
    //
    //    return spriteObject;
    //}
});