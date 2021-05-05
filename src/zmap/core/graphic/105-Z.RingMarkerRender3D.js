/**
 * Created by Administrator on 2015/12/2.
 */
Z.RingMarkerRender3D = Z.GraphicRender3D.extend({
    initialize: function(graphic){
        Z.GraphicRender3D.prototype.initialize.apply(this, arguments);
        //this._spriteContainer = null;
        //this._texture = null;
    },

    buildGeometry: function(shape, cw){
        shape = shape.center;

        if(shape instanceof Z.LatLng){
            return this._latLngPointToScene(new THREE.Vector3(shape.lng, shape.lat, shape.alt));
        }else{
            return null;
        }
    },

    buildMaterial: function(symbol){
        var material;
        var thisObj = this;

        if(symbol instanceof Z.RingSymbol){
            material = Z.StyleBuilder3D.createRenderStyle(symbol.fillSymbol, undefined, undefined, function(){
                thisObj._scene.refresh();
            });
        }else{
            material = Z.StyleBuilder3D.createDefaultRenderStyle("simplefillsymbol", undefined, function(){
                thisObj._scene.refresh();
            });
        }

        return material;
    },

    buildGraphicObject: function(geometry, material){
        if(!geometry || !material){
            return;
        }

        var ring = this._createRingObject(material);
        ring.position.set(geometry.x, geometry.y, geometry.z);

        return ring;
    },

    //refresh: function(){
    //    Z.GraphicRender3D.prototype.refresh.apply(this, arguments);
    //    this._spriteContainer.refresh();
    //},

    //默认的updateGeometry直接使用buildGeometry方法的返回结果。不过这里的buildGeometry方法不直接返回THREE.Geometry对象，所以需要重写updateGeometry方法
    updateGeometry: function(shape, cw){
        var position = this.buildGeometry(shape, cw);
        this._renderedObject.position.set(position.x, position.y, position.z);

        var ringGeom = this._createRingGeometry();
        this._renderedObject.geometry = ringGeom;
    },

    ////将定位点移到图片的下底边的中心
    //_applyOffset: function(spriteContainer){
    //    var offset = this._graphic.symbol.offset || Z.Point.create(0, 0, 0),
    //        pixelSceneRatio = this._scene.getPixelSceneRatio(),
    //        offsetX = offset.x / pixelSceneRatio.x,
    //        offsetY = offset.y / pixelSceneRatio.y,
    //        offsetZ = offset.z / pixelSceneRatio.z;
    //    spriteContainer.setOffset(new Z.Point(offsetX, offsetY, offsetZ));
    //},
    //
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

    _createRingObject: function(material){
        var geometry = this._createRingGeometry();
        var mater = material || Z.StyleBuilder3D.createDefaultRenderStyle("simplefillsymbol");//new THREE.MeshBasicMaterial({color: 0xffffff, fog: true});
        var mesh = new THREE.Mesh(geometry, mater);
        //mesh.castShadow = true;
        //mesh.receiveShadow = true;

        return mesh;
    },

    _createRingGeometry: function(){
        var shape = this._graphic.feature.shape,
            segments = this._graphic.symbol.segments;
        var innerRadius = this._layer.getSceneHeight(shape.innerRadius),
            outerRadius = this._layer.getSceneHeight(shape.outerRadius);

        var geometry = new THREE.RingGeometry(innerRadius,outerRadius, segments);

        return geometry;
    }
});