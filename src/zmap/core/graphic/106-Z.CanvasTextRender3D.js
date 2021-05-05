/**
 * Created by Administrator on 2015/12/2.
 */
Z.CanvasTextRender3D = Z.GraphicRender3D.extend({
    initialize: function(graphic){
        Z.GraphicRender3D.prototype.initialize.apply(this, arguments);
        this._spriteContainer = null;
        this._markerSize = null;
        this._canvasTexture = null;
    },

    buildGeometry: function(shape, cw){
        if(shape instanceof Z.LatLng){
            return this._latLngPointToScene(new THREE.Vector3(shape.lng, shape.lat, shape.alt));
        }else{
            return null;
        }
    },

    buildMaterial: function(symbol){
        var material;
        material = Z.StyleBuilder3D.createDefaultRenderStyle("fillsymbol", {color: "#ffffff"});    //由于材质的颜色与canvas的颜色会混合，此处将材质本身的颜色设为白色，这样的话最终显示结果完全以canvas为准

        return material;
    },

    buildGraphicObject: function(geometry, material){
        if(!geometry || !material){
            return;
        }

        var sprite = this._createCanvasText(material);
        var spriteContainer = new Z.SpriteContainer(sprite);
        spriteContainer.onAdd(this._scene);
        spriteContainer.setPosition(geometry.x, geometry.y, geometry.z);

        this._applyOffset(spriteContainer);
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

    onRemove: function(graphicLayer){
        Z.GraphicRender3D.prototype.onRemove.apply(this, arguments);
        this._markerSize = null;
    },

    _createCanvasText: function(material){
        this._createCanvas();
        var canvasElement = this._canvasTexture.getElement();
        var texture = new THREE.Texture(canvasElement);
        texture.minFilter = THREE.LinearFilter;
        texture.needsUpdate = true;

        material.map = texture;
        var geometrySize = this._getGeometrySize(canvasElement);
        var geometry = new THREE.PlaneBufferGeometry( geometrySize.x, geometrySize.y);
        this._markerSize = geometrySize;
        var mesh = new THREE.Mesh( geometry, material );

        return mesh;
    },

    _createCanvas: function(){
        if(!this._canvasTexture){
            this._canvasTexture = new Z.TextCanvasTexture({
                padding: 5,                //内边距，单位为像素
                autoWidth: true,         //是否根据内容自动计算宽度
                autoHeight: true,        //是否根据内容自动计算高度
                //bgColor: 0xffffff,
                //bgOpacity: 1,            //默认背景不透明
                opacity: 1
            });
        }

        this._canvasTexture.clear();
        this._canvasTexture.draw(this._graphic.symbol.text, {textSymbol: this._graphic.symbol});
    },

    _getGeometrySize: function(canvas){
        var //crs = this._graphic.feature.shape.crs,
            pixelSceneRatio = this._scene.getPixelSceneRatio(),
            //canvasSize = this._canvasTexture.getsSize();
            //canvas = this._canvasTexture.getElement(),
            width = canvas.width / pixelSceneRatio.x,
            height = canvas.height / pixelSceneRatio.y;

        return new Z.Point(width, height);
    },

    //将定位点移到图片的下底边的中心
    _applyOffset: function(spriteContainer){
        var offsetY = 0.5 * this._markerSize.y;
        spriteContainer.setOffset(new Z.Point(0, offsetY, 0));
    }
});