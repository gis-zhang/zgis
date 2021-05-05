/**
 * Created by Administrator on 2015/12/2.
 */
Z.CircleExtrudeRender3D = Z.ExtrudeRender3D.extend({
    //initialize: function(graphic){
    //    Z.GraphicRender3D.prototype.initialize.apply(this, arguments);
    //},

    //buildGeometry: function(shape, cw){
    //    //var shapes, paths = shape ? shape.paths : null;
    //    //
    //    //if(paths){
    //    //    shapes = Z.GeometryUtil.convertPathToShapes(paths, this._latLngPointToScene, this);
    //    //}
    //    //
    //    //var geoms = [],
    //    //    extrudeHeight = this._layer.getSceneHeight(this._graphic.feature.shape.height),//this._getSceneHeight(this._graphic.feature.shape.height),//this._getExtrudeHeight(),
    //    //    extrudeOptions ={
    //    //        amount: extrudeHeight,
    //    //        bevelEnabled: false,
    //    //        material: 0,
    //    //        extrudeMaterial:1
    //    //    };
    //    //
    //    //for(var i = 0; i < shapes.length; i++){
    //    //    var geometry = new THREE.ExtrudeGeometry(shapes[i], extrudeOptions);
    //    //
    //    //    geoms.push(geometry);
    //    //}
    //    //
    //    //return geoms;
    //
    //    if(shape instanceof Z.Extrude){
    //        return this._buildOneGeometry(shape, cw);
    //    }else if(shape instanceof Z.MultiExtrude){
    //        var geoms = [];
    //
    //        for(var i = 0; i < shape.extrudes.length; i++){
    //            geoms.push(this._buildOneGeometry(shape.extrudes[i], cw));
    //        }
    //
    //        return this._mergeGeometrys(geoms);
    //    }
    //},
    //
    //buildMaterial: function(symbol){
    //    var topMaterial, wallMaterial;
    //
    //    if(symbol instanceof Z.ExtrudeSymbol){
    //        //topMaterial = Z.StyleBuilder3D.createRenderStyle(new Z.SimpleFillSymbol({color : symbol.topColor, opacity: symbol.opacity}), "lambert");
    //        topMaterial = Z.Style3DFlyweight.getStyle(new Z.SimpleFillSymbol({color : symbol.topColor, opacity: symbol.opacity}), "lambert");
    //
    //        if(symbol.topImageUrl){
    //            topMaterial = this._appendTexture(topMaterial, symbol.topImageUrl);
    //        }
    //
    //        //wallMaterial = Z.StyleBuilder3D.createRenderStyle(new Z.SimpleFillSymbol({color : symbol.wallColor, opacity: symbol.opacity}), "lambert");
    //        wallMaterial = Z.Style3DFlyweight.getStyle(new Z.SimpleFillSymbol({color : symbol.wallColor, opacity: symbol.opacity}), "lambert");
    //
    //        if(symbol.wallImageUrl){
    //            wallMaterial = this._appendTexture(wallMaterial, symbol.wallImageUrl);
    //        }
    //    }else{
    //        //topMaterial = Z.StyleBuilder3D.createRenderStyle(new Z.SimpleFillSymbol(), "lambert");
    //        //wallMaterial = topMaterial.clone();
    //        topMaterial = Z.Style3DFlyweight.getStyle(new Z.SimpleFillSymbol(), "lambert");
    //        wallMaterial = topMaterial;
    //    }
    //
    //    return [topMaterial, wallMaterial];
    //},
    //
    //buildGraphicObject: function(geometry, material){
    //    if(!geometry || !material){
    //        return;
    //    }
    //
    //    var meshs = [], geometrys = (geometry instanceof Array) ? geometry : [geometry];
    //
    //    for(var geomLength = 0; geomLength < geometrys.length; geomLength++){
    //        //var mesh = new THREE.Mesh(geometrys[geomLength], new THREE.MeshFaceMaterial(material));
    //        var mesh = new THREE.Mesh(geometrys[geomLength], new THREE.MultiMaterial(material));
    //        mesh.castShadow = true;
    //        //this._setBaseHeight(mesh);
    //
    //        meshs.push(mesh);
    //    }
    //
    //    var graphic = new THREE.Object3D();
    //
    //    if(meshs.length >= 1){
    //        for(var k = 0; k < meshs.length; k++){
    //            graphic.add(meshs[k]);
    //        }
    //
    //        if(this._graphic.symbol.wire){
    //            var wires = this._buildWire(meshs);
    //
    //            for(var l = 0; l < wires.length; l++){
    //                wires[l]._disableMouseEvent = true;
    //                //this._setBaseHeight(wires[l]);
    //                graphic.add(wires[l]);
    //            }
    //        }
    //    }
    //
    //    //this._setBaseHeight(graphic);
    //
    //    return graphic;
    //
    //    //if(meshs.length <= 0){
    //    //    return new THREE.Object3D();
    //    //}else if(meshs.length === 1){
    //    //    return meshs[0];
    //    //}else{
    //    //    var graphic = new THREE.Object3D();
    //    //
    //    //    for(var k = 0; k < meshs.length; k++){
    //    //        graphic.add(meshs[k]);
    //    //    }
    //    //
    //    //    return graphic;
    //    //}
    //},
    //
    //////默认的updateGeometry直接使用buildGeometry方法的返回结果。不过这里的buildGeometry方法不直接返回THREE.Geometry对象，所以需要重写updateGeometry方法
    //updateGeometry: function(shape, cw){
    //    //Z.GraphicRender3D.prototype.updateGeometry.apply(this, arguments);
    //    //this._setBaseHeight(this._renderedObject);
    //
    //    this.updateSymbol(this._graphic.symbol);
    //    this._setBaseHeight(this._renderedObject);
    //},

    _buildOneGeometry: function(shape, cw){
        //var shapes, paths = shape ? shape.paths : null;
        //
        //if(paths){
        //    //shapes = Z.GeometryUtil.convertPathToShapes(paths, this._latLngPointToScene, cw, this);
        //    //var offsetX = 4.083,
        //    //    offsetY = 31.171;
        //    var offsetX = 0,
        //        offsetY = 0;
        //    shapes = Z.GeometryUtil.convertPathToShapes(paths, this._latLngPointToScene, cw, this, offsetX, offsetY);
        //}

        var circleCenter = this._latLngPointToScene(shape.circle.center),
            radius = this._layer.getSceneHeight(shape.circle.radius),
            path, shapes;
        path = new THREE.Shape();
        path.absellipse(circleCenter.x, circleCenter.y, radius, radius, 0, Math.PI * 2);
        //shapes = path.toShapes();
        shapes = [path];

        var geoms = [],
            extrudeHeight = this._layer.getSceneHeight(this._graphic.feature.shape.height),//this._getSceneHeight(this._graphic.feature.shape.height),//this._getExtrudeHeight(),
            extrudeOptions ={
                amount: extrudeHeight,
                bevelEnabled: false,
                material: 0,
                extrudeMaterial:1
            };

        for(var i = 0; i < shapes.length; i++){
            var geometry = new THREE.ExtrudeGeometry(shapes[i], extrudeOptions),
                baseHeight = shapes[i].length > 0 ? shapes[i][0].z : 0;

            //for(var j = 0; j < geometry.vertices.length; j++){
            //    if(geometry.vertices[j].z - baseHeight > 0.0000001){
            //        geometry.vertices[j].y += geometry.vertices[j].z - baseHeight;
            //    }
            //}

            geoms.push(geometry);
        }

        return this._mergeGeometrys(geoms);
    },

    //_mergeGeometrys: function(geoms){
    //    if(geoms.length <= 0){
    //        return null;
    //    }else if(geoms.length === 1){
    //        return geoms[0];
    //    }else{
    //        var baseGeom = geoms[0];
    //
    //        for(var j = 1; j < geoms.length; j++){
    //            //baseGeom = THREE.GeometryUtils.merge(baseGeom, geoms[j]);
    //            baseGeom.merge(geoms[j]);
    //        }
    //
    //        return baseGeom;
    //    }
    //},
    //
    ////_setBaseHeight: function(mesh){
    ////    var baseHeight = this._layer.getSceneHeight(this._graphic.feature.shape.baseHeight);//this._getSceneHeight(this._graphic.feature.shape.baseHeight),
    ////
    ////    //if(mesh.children.length > 0){
    ////    //    for(var i = 0; i < mesh.children.length; i++){
    ////    //        this._setBaseHeight(mesh.children[i]);
    ////    //    }
    ////    //}else{
    ////    //    var meshPos = mesh.position;
    ////    //    mesh.position.set(meshPos.x, meshPos.y, baseHeight);
    ////    //}
    ////    var meshPos = mesh.position;
    ////    mesh.position.set(meshPos.x, meshPos.y, baseHeight);
    ////},
    //
    //_appendTexture: function(material, url){
    //    if(typeof url !== "string" || url.length <= 0){
    //        return;
    //    }
    //
    //    var thisObj = this,
    //        texture = THREE.ImageUtils.loadTexture(url, {}, function(curTexture){
    //            thisObj._scene.refresh();
    //        }, function(){
    //            thisObj._scene.refresh();
    //        });
    //
    //    var newMaterial = material.clone();
    //    newMaterial.map = texture;
    //
    //    return newMaterial;
    //},
    //
    ////重写父类的_enableZIndex方法，方法体置为空
    //_enableZIndex: function(material){},
    //
    ////重写父类的_getTitlePos方法
    //_getTitlePos: function(){
    //    var pos = Z.GraphicRender3D.prototype._getTitlePos.apply(this, arguments),
    //        offset = 0.00001;
    //    pos.alt = this._layer.getSceneHeight(this._graphic.feature.shape.height) + offset;//通过offset偏移，确保title始终叠加显示在几何对象上面
    //
    //    return pos;
    //},
    //
    //_buildWire: function(graphics){
    //    var wire = [];
    //
    //    for(var i = 0; i < graphics.length; i++){
    //        if(graphics[i] instanceof THREE.Mesh){
    //            wire.push(new THREE.Line(graphics[i].geometry.clone(), this._getWireMaterial()));
    //        }
    //    }
    //
    //    return wire;
    //},
    //
    //_getWireMaterial: function(){
    //    var wireSymbol = this._graphic.symbol.wireSymbol,
    //        materialOptions = {
    //            color: wireSymbol.color,
    //            linewidth: wireSymbol.width,
    //            transparent: true
    //        },
    //        material;
    //
    //    if(wireSymbol.style === Z.PolylineStyleType.Dash){
    //        material = new THREE.LineDashedMaterial(materialOptions);
    //    }else{
    //        material = new THREE.LineBasicMaterial(materialOptions);
    //    }
    //
    //    return material;
    //}
});