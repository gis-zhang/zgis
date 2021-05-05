/**
 * 叠加次序控制分为两个层次：一个是对图层组层面的叠加顺序，包括baseBgPane、baseOverPane、layerPane等，通过设置polygonOffsetFactor实现。每个
 * 图层组内部的各个图层的polygonOffset都相同，他们之间的叠加顺序通过设置renderOrder来实现
 * _setBaseIndex用于控制图层组的叠加顺序，_setZIndex用于控制同一图层组内部各个图层间的叠加顺序，每个图层组内部的叠加顺序都以0开始，值大的叠加在上面
 */
Z.ZIndexManager = function(){}

Z.ZIndexManager.enableZIndex = function(material){
    if(!material){
        return;
    }

    if(material instanceof Array){
        for(var i = 0; i < material.length; i++){
            Z.ZIndexManager.enableZIndex(material[i]);
        }
    }else{
        material.polygonOffset = true;
    }
}

Z.ZIndexManager.setZIndex = function(object3D, zIndex, containerPaneIndex){
    object3D = object3D || {};

    if(!object3D.children){
        return;
    }

    if(object3D.children.length > 0){
        for(var i = 0; i < object3D.children.length; i++){
            Z.ZIndexManager.setZIndex(object3D.children[i], zIndex, containerPaneIndex);
        }
    }else{
        Z.ZIndexManager._setBaseIndex(object3D, containerPaneIndex);
        Z.ZIndexManager._setZIndex(object3D, zIndex, containerPaneIndex);
    }
}

Z.ZIndexManager._setBaseIndex = function(graphicObject, baseIndex){
    graphicObject = graphicObject || {};
    var material = graphicObject.material;

    if(material){
        var factor = 1 - baseIndex, units = 1 - baseIndex;
        //material.polygonOffset = true;
        material.polygonOffsetFactor = factor;
        material.polygonOffsetUnits = units;
    }

}

Z.ZIndexManager._setZIndex = function(geometry, zIndex, baseIndex){
    geometry.renderOrder = baseIndex * Z.Globe.Layer.layerGroupSize + zIndex;
}