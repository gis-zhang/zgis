/**
 * Created by Administrator on 2015/12/2.
 */
Z.PolylineRender3D = Z.GraphicRender3D.extend({
    initialize: function(graphic){
        Z.GraphicRender3D.prototype.initialize.apply(this, arguments);
    },

    buildGeometry: function(shape){
        var geometry, paths = shape ? shape.paths : null, lngStart = shape ? shape.lngStart : false;

        if(paths){
            geometry = Z.GeometryUtil.convertPathToGeometry(paths, this._latLngPointToScene, this, lngStart);
        }

        return geometry;
    },

    buildMaterial: function(symbol){
        var material, dashSize, gapSize;

        if(symbol instanceof Z.PolylineSymbol){
            material = Z.StyleBuilder3D.createRenderStyle(symbol);
        }else{
            material = Z.StyleBuilder3D.createRenderStyle("linesymbol");
        }

        return material;
    },

    buildGraphicObject: function(geometry, material){
        if(geometry instanceof Array){
            var graphic = new THREE.Object3D();

            for(var i = 0; i < geometry.length; i++){
                graphic.add(new THREE.Line(geometry[i], material));
            }

            return graphic;
        }else{
            return new THREE.Line(geometry, material);
        }
    },

    //THREE.Line对象直接替换geometry属性无效，似乎生成后坐标就不能在变动，原因不明。此处对于每次位置的变化都重新生成新的line对象
    updateGeometry: function(shape, cw){
        if(this._renderedObject){
            var  graphicObject = this.getRenderedObject(this._baseIndex, this._layerIndex);

            if(this._container) {
                this._container.remove(this._renderedObject);
            }

            this._renderedObject = graphicObject;

            if(this._container) {
                this._container.add(this._renderedObject);
            }
        }
    }
});