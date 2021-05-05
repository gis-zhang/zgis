/**
 * Created by Administrator on 2015/12/2.
 */
Z.PictureMarkerRender3D = Z.GraphicRender3D.extend({
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
        var material, dashSize, gapSize, thisObj = this;

        if(symbol instanceof Z.PictureMarkerSymbol){
            material = Z.StyleBuilder3D.createRenderStyle(new Z.PictureFillSymbol({url: symbol.url}), undefined, undefined, function(){
                thisObj._scene.refresh();
            });
        }else{
            material = Z.StyleBuilder3D.createDefaultRenderStyle("picturefillsymbol", undefined, function(){
                thisObj._scene.refresh();
            });
        }

        return material;
    },

    buildGraphicObject: function(geometry, material){
        if(!geometry || !material){
            return;
        }

        var sprite = this._createPictureObject(material);
        var spriteContainer = new Z.SpriteContainer(sprite);
        spriteContainer.setPosition(geometry.x, geometry.y, geometry.z);

        //this._applyOffset(spriteContainer);
        //var symbol = this._graphic.symbol;
        //this._applyAnchor(spriteContainer, symbol.anchor, symbol.offset);
        this._applyOffset(spriteContainer);
        this._updateSpriteSize(spriteContainer, this._graphic.symbol);

        spriteContainer.onAdd(this._scene);

        //this._loadTexture(spriteContainer);
        this._spriteContainer = spriteContainer;

        return spriteContainer.getThreeObject();
    },

    refresh: function(){
        Z.GraphicRender3D.prototype.refresh.apply(this, arguments);
        //this._spriteContainer.resetScale();
        //this._applyOffset(this._spriteContainer);
        //this._updateSpriteSize(this._spriteContainer, this._spriteContainer.sprite.material.map.image, this._graphic.symbol);
        this._spriteContainer.refresh();
    },

    //默认的updateGeometry直接使用buildGeometry方法的返回结果。不过这里的buildGeometry方法不直接返回THREE.Geometry对象，所以需要重写updateGeometry方法
    updateGeometry: function(shape, cw){
        var geometry = this.buildGeometry(shape, cw);
        this._spriteContainer.setPosition(geometry.x, geometry.y, geometry.z);
    },

    //将定位点移到图片的中心
    _applyOffset: function(spriteContainer){
        //var offset = this._graphic.symbol.offset || Z.Point.create(0, 0, 0),
        //    pixelSceneRatio = this._scene.getPixelSceneRatio(),
        //    offsetX = (offset.x / pixelSceneRatio.x) || 0,
        //    offsetY = (offset.y / pixelSceneRatio.y) || 0,
        //    offsetZ = (offset.z / pixelSceneRatio.z) || 0;
        //spriteContainer.offset(new Z.Point(offsetX, offsetY, offsetZ));
        var symbol = this._graphic.symbol;
        var sceneOffset = this._pixelOffsetToScene(symbol.offset),
            anchorOffset = this._getAnchorOffset(spriteContainer, symbol.anchor);

        spriteContainer.setOffset(new Z.Point(sceneOffset.x + anchorOffset.x, sceneOffset.y + anchorOffset.y, sceneOffset.z + anchorOffset.z));
    },

    _getAnchorOffset: function(spriteContainer, anchor){
        var widthRatio = 0, heightRatio = 0;

        if(anchor === "bottomLeft"){
            widthRatio = 0.5;
            heightRatio = 0.5;
        }else if(anchor === "bottomCenter"){
            widthRatio = 0;
            heightRatio = 0.5;
        }else if(anchor === "bottomRight"){
            widthRatio = -0.5;
            heightRatio = 0.5;
        }else if(anchor === "centerLeft"){
            widthRatio = 0.5;
            heightRatio = 0;
        }else if(anchor === "centerCenter"){
            widthRatio = 0;
            heightRatio = 0;
        }else if(anchor === "centerRight"){
            widthRatio = -0.5;
            heightRatio = 0;
        }else if(anchor === "topLeft"){
            widthRatio = 0.5;
            heightRatio = -0.5;
        }else if(anchor === "topCenter"){
            widthRatio = 0;
            heightRatio = -0.5;
        }else if(anchor === "topRight"){
            widthRatio = -0.5;
            heightRatio = -0.5;
        }

        var spriteBounds = spriteContainer.getSpriteBounds();
        var width = Math.abs(spriteBounds.max.x - spriteBounds.min.x),
            height = Math.abs(spriteBounds.max.y - spriteBounds.min.y);
        var offsetX = widthRatio * width,
            offsetY = heightRatio * height;

        return {x: offsetX, y: offsetY, z: 0};
    },

    _pixelOffsetToScene: function(symbolOffset){
        var offset = symbolOffset || Z.Point.create(0, 0, 0),
            pixelSceneRatio = this._scene.getPixelSceneRatio(),
            offsetX = (offset.x / pixelSceneRatio.x) || 0,
            offsetY = (offset.y / pixelSceneRatio.y) || 0,
            offsetZ = (offset.z / pixelSceneRatio.z) || 0;

        return {x: offsetX, y: offsetY, z: offsetZ};
    },

    //_loadTexture: function(spriteContainer){
    //    var url = this._graphic.symbol.url,
    //        thisObj = this,
    //        symbol = this._graphic.symbol;
    //        //symbolWidth = (typeof symbol.width) === "number" ? symbol.width : undefined,
    //        //symbolHeight = (typeof symbol.height) === "number" ? symbol.height : undefined;
    //
    //    //var texture = THREE.ImageUtils.loadTexture(url, {}, function(curTexture){
    //    //    spriteContainer.resetScale();
    //    //    thisObj._applyOffset(spriteContainer);
    //    //
    //    //    //var pixelSceneRatio = thisObj._scene.getPixelSceneRatio(),
    //    //    //    image = curTexture.image,
    //    //    //    imageWidth = symbolWidth || image.width,
    //    //    //    imageHeight = symbolHeight || image.height,
    //    //    //    sceneWidth = imageWidth / pixelSceneRatio.x,
    //    //    //    sceneHeight = imageHeight / pixelSceneRatio.y;
    //    //    //
    //    //    //spriteContainer.setScale(new Z.Point(sceneWidth, sceneHeight, 1));
    //    //    thisObj._updateSpriteSize(spriteContainer, curTexture.image, symbol);
    //    //
    //    //    thisObj._scene.refresh();
    //    //}, function(){
    //    //    thisObj._scene.refresh();
    //    //});
    //    //
    //    //texture.minFilter = THREE.LinearFilter;
    //    //spriteContainer.sprite.material.map = texture;
    //
    //    Z.TileManager.pushImageByUrl(url, function(img){
    //        var texture = new THREE.Texture();
    //
    //        var isJPEG = url.search( /\.(jpg|jpeg)$/ ) > 0 || url.search( /^data\:image\/jpeg/ ) === 0;
    //        texture.format = isJPEG ? THREE.RGBFormat : THREE.RGBAFormat;
    //
    //        texture.image = img;
    //        texture.needsUpdate = true;
    //
    //        //tp.onLoad(texture);
    //        //style[texKey] = texture;
    //        //style.needsUpdate = true;
    //        texture.minFilter = THREE.LinearFilter;
    //        spriteContainer.sprite.material.map = texture;
    //
    //        spriteContainer.resetScale();
    //        thisObj._applyOffset(spriteContainer);
    //        thisObj._updateSpriteSize(spriteContainer, texture.image, symbol);
    //
    //        thisObj._scene.refresh();
    //    });
    //},

    //_updateSpriteSize: function(spriteContainer, spriteImg, symbol){
    //    var pixelSceneRatio = this._scene.getPixelSceneRatio(),
    //        image = spriteImg, //curTexture.image,
    //        imageWidth = symbol.width || image.width,
    //        imageHeight = symbol.height || image.height,
    //        sceneWidth = imageWidth / pixelSceneRatio.x,
    //        sceneHeight = imageHeight / pixelSceneRatio.y;
    //
    //    spriteContainer.setScale(new Z.Point(sceneWidth, sceneHeight, 1));
    //},

    _updateSpriteSize: function(spriteContainer, symbol){
        var pixelSceneRatio = this._scene.getPixelSceneRatio(),
            imageWidth = symbol.width || 1,
            imageHeight = symbol.height || 1,
            sceneWidth = imageWidth / pixelSceneRatio.x,
            sceneHeight = imageHeight / pixelSceneRatio.y;

        spriteContainer.setScale(new Z.Point(sceneWidth, sceneHeight, 1));
    },

    _createPictureObject: function(material){
        var geometry = new THREE.PlaneGeometry(1,1);
        var mater = material || Z.StyleBuilder3D.createDefaultRenderStyle("picturefillsymbol");//new THREE.MeshBasicMaterial({color: 0xffffff, fog: true});
        var spriteObject = new THREE.Mesh(geometry, mater);
        spriteObject.castShadow = true;

        return spriteObject;
    }
});