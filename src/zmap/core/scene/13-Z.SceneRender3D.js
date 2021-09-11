/**
 * Created by Administrator on 2015/11/3.
 */
Z.SceneRender3D = function(container, options){
    this._container = container;

    if(!container){
        throw new error("Z.SceneRender3D对象创建失败：container参数不能为空");
    }

    this.needsUpdate = true;

    this._initialized = false;
    this._objects = [];
    this._cameraObject = null;
    this._rawCameraObject = null,
    this._radRotation = null,
    this._ambientLightObject = null;
    this._lightObject = null;
    this._reverseLightObject = null;      //与主光源方向相反的光，使各个阴暗面之间也产生明暗差异，若不加则各个阴暗面为同一颜色，难以区分。光的颜色与环境光保持一致
    this._sceneObject = null;
    this._renderObject = null;
    this._xyPlane = null;            //xy平面（z=0），用于计算地面中哪些部分显示在视域中
    this._viewCenter = new THREE.Vector3(0, 0, 0);     //场景中心点

    this._updateChecker = [];
    this._removedUpdateChecker = [];

    this._postprocessingObject = null;
    this._enablePostprocessing = true;

    this.options = {
        width:400,
        height:400,
        bgColor: '#000000', //'#000000',
        //ambientColor:'#333333',
        ambientColor:'#666666',//ambientColor:'#ffffff',
        lightColor:'#aaaaaa',
        lightIntensity: 1,
        //lightPosition: {x:10, y: 8, z: 6},
        lightAngle: {h:30, v:45},
        //lightDistance: 200,
        fogColor:'#f2f7ff',
        cameraFov: 45,    //相机视场,单位为角度
        cameraNear: 1,  //相机近面
        cameraFar: 100,   //相机远面
        cameraPosition: {x: 0, y: 0, z:50},
        cameraRotation:{x:0, y: 0, z: 0},
        //cameraTarget:{x:0, y: 0, z: 0},
        showFrameRate: false
    };

    Z.Util.applyOptions(this.options, options, false);
    this.initialize();
};

Z.SceneRender3D.prototype = {
    initialize: function () {
        this._cameraObject = new THREE.PerspectiveCamera(this.options.cameraFov,
            this.options.width/this.options.height, this.options.cameraNear,
            this.options.cameraFar);
        //this._cameraAnchorGroup = new THREE.Group();
        ////this._cameraAnchorGroup.visible = false;
        //this._cameraAnchor = new THREE.Object3D();//new THREE.Mesh(new THREE.SphereGeometry( 1, 32, 32), new THREE.MeshBasicMaterial( {color: 0xffff00} ));
        ////this._cameraAnchor.visible = false;
        //this._cameraAnchorGroup.add(this._cameraObject);
        //this._radRotation = new THREE.Vector3(0,0,0);
        this._initCameraPosition();
        this.rotateByEuler(this.options.cameraRotation);

        this._ambientLightObject = new THREE.AmbientLight(this.options.ambientColor);
        this._lightObject = new THREE.DirectionalLight(this.options.lightColor, this.options.lightIntensity);
        this._reverseLightObject = new THREE.DirectionalLight(this.options.ambientColor, this.options.lightIntensity);
        this.setLightPosition(this.options.lightAngle);
        //this.setLightShadow();


        this._sceneObject = new THREE.Scene();
        //this._sceneObject.add(this._cameraAnchorGroup);
        this._sceneObject.add(this._ambientLightObject);
        this._sceneObject.add(this._lightObject);
        this._sceneObject.add(this._reverseLightObject);

        this._xyPlane = this._createXYPlane(this.options.cameraFov,
            this.options.cameraFar, this.options.width/this.options.height);
        this._sceneObject.add(this._xyPlane);

        this._renderObject = new THREE.WebGLRenderer({antialias: true, alpha: true, precision: "highp"});
        //this._renderObject.fog = new THREE.Fog( this.options.fogColor, this._cameraObject.near, this._cameraObject.far);
        this._renderObject.sortObjects = false;
        this._renderObject.setClearColor(this.options.bgColor);
        //取消双面绘制
        //this._renderObject.setFaceCulling(false);

        if(window.devicePixelRatio){
            this._renderObject.setPixelRatio( window.devicePixelRatio);
        }

        this._renderObject.setSize(this.options.width, this.options.height);
        ////this._renderObject.shadowMapEnabled = true;
        //this._renderObject.shadowMap.enabled = true;
        this._container.appendChild(this._renderObject.domElement);

        if(this._enablePostprocessing){
            this._postprocessingObject = new Z.Postprocessing(this._sceneObject, this._cameraObject, this._renderObject);
        }

        this._initialized = true;
    },

    addUpdateChecker: function(checker){
        if(!checker){
            return;
        }

        this._updateChecker.push(checker);
    },

    removeUpdateChecker: function(checker){
        if(!checker){
            return;
        }

        var checkers = this._updateChecker;
        var checkerLength = checkers.length;

        for(var i = 0; i < checkerLength; i++){
            if(checkers[i] === checker){
                checkers.splice(i, 1);

                break;
            }
        }

        this._removedUpdateChecker.push(checker);
    },

    render: function () {//console.info("render()");
        if(this._renderLoopRunging){
            return;
        }

        if(!this._initialized){
            this.initialize();
            this._initialized = true;
            console.info("initialize()");
        }

        this._renderObject.setClearColor(this.options.bgColor);
        //this._renderObject.clear();

        try{
            //requestAnimationFrame(_render);
            //requestAnimationFrame(this._doRender);
            this._runRenderLoop();
            //this._renderObject.render(this._sceneObject, this._cameraObject);
            this._renderLoopRunging = true;
        }catch(e){
            console.error(e.message);
        }
    },

    _runRenderLoop: function(){
        requestAnimationFrame(_doRender);

        var thisObj = this;

        if(this._loopCount === undefined){
            this._loopCount = 0;
        }

        function _doRender(){
            if(thisObj.options.showFrameRate){
                Z.RenderMonitor.update();
            }

            var needsUpdate = thisObj.needsUpdate;
            var tpIns = Z.SingleTerrainPlane.getInstance();

            if(!needsUpdate){
                needsUpdate = tpIns.needsUpdate;
            }

            if(thisObj._removedUpdateChecker.length > 0){
                needsUpdate = true;
            }

            var updateCheckers = thisObj._updateChecker;
            var checkersLength = updateCheckers.length;
            var i = 0;

            if(!needsUpdate){
                for(i = 0; i < checkersLength; i++){
                    if(updateCheckers[i].needsUpdate){
                        needsUpdate = true;

                        break;
                    }
                }
            }

            //Z.ImageTextureManager.loadTextures();
            Z.TileManager.loadImages();
            tpIns.refresh();
            Z.GraphicAnimation.run();

            if(thisObj._loopCount >= 5){
                thisObj._loopCount = 0;
            }else if(needsUpdate){
                thisObj._renderObject.clear();
                // console.info("thisObj._renderObject.render(thisObj._sceneObject, thisObj._cameraObject)");

                if(this._enablePostprocessing && this._postprocessingObject){
                    this._postprocessingObject.render();
                }else{
                    thisObj._renderObject.render(thisObj._sceneObject, thisObj._cameraObject);//console.info("render end");
                }

                thisObj._loopCount++;
                thisObj.needsUpdate = false;
            }

            //if(Z.SingleTerrainPlane.needsUpdate){
            //    Z.SingleTerrainPlane.needsUpdate = false;
            //}

            for(i = 0; i < checkersLength; i++){
                if(updateCheckers[i].resetUpdateState){
                    updateCheckers[i].resetUpdateState();
                }
            }

            this._removedUpdateChecker = [];

            requestAnimationFrame(_doRender);
        }
    },

    resize: function(width, height){
        if(!width || !height){
            width = this._container.clientWidth;
            height = this._container.clientHeight;
        }

        var oldHeight = this.options.height;
        this.options.width = width;
        this.options.height = height;
        this._renderObject.setSize(width, height);

        var cameraDis = oldHeight / (2 * Math.tan((this._cameraObject.fov / 2) * (Math.PI / 180)));
        var newFov = Math.atan(height / (2 * cameraDis)) * 2 * 180 / Math.PI;
        this._cameraObject.fov = newFov;

        this._cameraObject.aspect = this.options.width/this.options.height;
        this._cameraObject.updateProjectionMatrix();

        //this._sceneObject.updateMatrixWorld(true);

        //this.render();
    },

    getSize: function(){
        return Z.Point.create(this.options.width, this.options.height);
    },

    setViewCenter: function(glCenter){
        if(!glCenter || (!(glCenter instanceof THREE.Vector3) && !(glCenter instanceof Z.Point))){
            return;
        }

        var pt = glCenter;

        if(glCenter instanceof Z.Point){
            pt = new THREE.Vector3(glCenter.x, glCenter.y, glCenter.z);
        }

        var offset = pt.clone().sub(this._viewCenter);
        this._cameraObject.position.add(offset);
        this._cameraObject.updateMatrix();
        this._cameraObject.updateMatrixWorld(true);
        console.info("Z.SceneRender3D.setViewCenter:camera position:(" + this._cameraObject.position.x + ", " + this._cameraObject.position.y + ", " + this._cameraObject.position.z + ")");

        this._viewCenter.x = pt.x;
        this._viewCenter.y = pt.y;
        this._viewCenter.z = pt.z;
    },

    resetCamera: function(){
        this._cameraObject = this._rawCameraObject.clone();
        this._viewCenter.set(0, 0, 0);
        this._cameraObject.updateMatrixWorld();
    },

    /*参数rotate为相对旋转角，单位为弧度*/
    rotateByRad: function(rotate){
        if(rotate && (typeof rotate.x === "number") && (typeof rotate.y === "number") && (typeof rotate.z === "number")){
            var matrix = this._getRotationMatrix(rotate, this.options.cameraRotation),
                translate = new THREE.Vector3(),
                quaternion = new THREE.Quaternion(),
                scale = new THREE.Vector3();
            matrix.decompose(translate, quaternion, scale);
            //this.resetCamera();
            this._cameraObject.position.applyMatrix4(matrix);
            this._cameraObject.up.applyQuaternion(quaternion);
            //this._radRotation.set(rotate.x, rotate.y, rotate.z);
            //this._cameraObject.lookAt(new THREE.Vector3(this.options.cameraTarget.x, this.options.cameraTarget.y, this.options.cameraTarget.z));
            this._cameraObject.lookAt(this._viewCenter.clone());
            //alert("rotation:" + this._cameraObject.rotation.x * 180 / Math.PI + "," + this._cameraObject.rotation.y * 180 / Math.PI + "," + this._cameraObject.rotation.z * 180 / Math.PI
            //    + ";up:" + this._cameraObject.up.x + "," + this._cameraObject.up.y + "," + this._cameraObject.up.z);
            this._cameraObject.updateMatrix();
            this._cameraObject.updateMatrixWorld();
            this._cameraObject.updateProjectionMatrix();
            //this._cameraObject.matrixWorldNeedsUpdate = true;
        }
    },

    getCameraDirection: function(){
        var vector = this._cameraObject.getWorldDirection();

        return new Z.Point(vector.x, vector.y, vector.z);
    },

    /*参数rotate为相对旋转角，单位为度*/
    rotateByEuler: function(rotate){
        if(rotate && (typeof rotate.x === "number") && (typeof rotate.y === "number") && (typeof rotate.z === "number")){
            var newRotate = {};
            newRotate.x = rotate.x * Math.PI / 180;
            newRotate.y = rotate.y * Math.PI / 180;
            newRotate.z = rotate.z * Math.PI / 180;

            this.rotateByRad(newRotate);
        }
    },

    /*参数为水平和垂直相对旋转角(欧拉角)*/
    rotateByVH: function(v, h){
        v = v || 0;
        h = h || 0;

        if(v === 0 && h === 0){
            return;
        }

        var centerPoint = this.webGLPointToScreen(new Z.Point(0, 0, 0));
        var leftPoint = new Z.Point(0, centerPoint.y),
            rightPoint = new Z.Point(this.options.width, centerPoint.y);
        var leftGlPoint = this.screenPointToWebGL(leftPoint),
            rightGlPoint = this.screenPointToWebGL(rightPoint);

        if(!leftGlPoint || !rightGlPoint){
            return;
        }

        var horizontalVector = new THREE.Vector3(rightGlPoint.x - leftGlPoint.x,
            rightGlPoint.y - leftGlPoint.y,
            rightGlPoint.z - leftGlPoint.z).normalize();
        var vMatrix = new THREE.Matrix4(),
            hMatrix = new THREE.Matrix4();
        vMatrix.makeRotationAxis(horizontalVector, -Math.PI * v / 180);
        hMatrix.makeRotationZ(Math.PI * h / 180);

        vMatrix.multiply(hMatrix);

        var translate = new THREE.Vector3(),
            quaternion = new THREE.Quaternion(),
            scale = new THREE.Vector3();
        vMatrix.decompose(translate, quaternion, scale);

        this.rotateByRad(quaternion);
    },

    /**
     *
     * @param lightAngle     {h:h, v:v}   h：水平方位角（与x轴正方向夹角，逆时针方向），v：与x、y平面的夹角
     */
    setLightPosition: function(lightAngle){
        if(!lightAngle){
            return;
        }

        var lightDistance = this._getLightDistance();
        var lightPosition = this._getLightPosition(lightAngle, lightDistance);
        //lightPosition = lightPosition || this.options.lightPosition;
        this._lightObject.position.set(lightPosition.x, lightPosition.y, lightPosition.z);
        this._reverseLightObject.position.set(-lightPosition.x, -lightPosition.y, -lightPosition.z);
    },

    setLightShadow: function(){
        var lightDistance = this._getLightDistance() * 2;
        this._lightObject.castShadow = true;
        //this._lightObject.shadowCameraNear = 0.1;
        //this._lightObject.shadowCameraFar = lightDistance;//500;
        //this._lightObject.shadowCameraLeft = -lightDistance;//-500;
        //this._lightObject.shadowCameraRight = lightDistance;//500;
        //this._lightObject.shadowCameraTop = lightDistance;//500;
        //this._lightObject.shadowCameraBottom = -lightDistance;//-500;
        //this._lightObject.shadowMapWidth = 5120;
        //this._lightObject.shadowMapHeight = 5120;
        ////this._lightObject.shadowCameraVisible = true;
        this._lightObject.shadow.camera.near = 0.1;
        this._lightObject.shadow.camera.far = lightDistance;//500;
        this._lightObject.shadow.camera.left = -lightDistance;//-500;
        this._lightObject.shadow.camera.right = lightDistance;//500;
        this._lightObject.shadow.camera.top = lightDistance;//500;
        this._lightObject.shadow.camera.bottom = -lightDistance;//-500;
        this._lightObject.shadow.mapSize.width = 5120;
        this._lightObject.shadow.mapSize.height = 5120;
        //this._lightObject.shadowCameraVisible = true;
    },

    setAmbientColor: function(ambientColor){
        this._ambientLightObject.color = new THREE.Color(ambientColor);
    },

    setLightColor: function(lightColor){
        this._lightObject.color = new THREE.Color(lightColor);
        this._reverseLightObject.color = new THREE.Color(lightColor);
    },

    setBgColor: function(bgColor){
        this.options.bgColor = bgColor;
        //this.render();
    },

    /*将三维对象添加到场景中。此处未做重复对象监测，允许同一对象反复添加，每次添加都视为一个不同的对象*/
    addObject: function(object, index){
        this._addObject(object, index);
        //this.render();
    },

    removeObject: function(object){
        this._removeObject(object);
        //this.render();
    },

    reorderObject: function(object, index){
        this._removeObject(object);
        this._addObject(object, index);
        //this.render();
    },

    //屏幕坐标转换为webgl坐标（计算与xy平面的交点）
    screenPointToWebGL: function(screenPoint){
        if(!screenPoint || Z.Util.isNull(screenPoint.x) || Z.Util.isNull(screenPoint.y)){
            return null;
        }

        var halfWidth = this.options.width / 2,
            halfHeight = this.options.height / 2,
            raycaster = new THREE.Raycaster(),
            vector = new THREE.Vector2((screenPoint.x - halfWidth) / halfWidth, (halfHeight - screenPoint.y) / halfHeight);      //视平面的x和y坐标范围都是-1到1，左手系
        var intersetPoint = this._getIntersectPoint(raycaster, this._xyPlane, vector, this._cameraObject);

        if(intersetPoint){
            return Z.Point.create(intersetPoint.x, intersetPoint.y, intersetPoint.z);
        }else{
            return null;
        }
    },

    //WebGL坐标（世界坐标）转换为屏幕坐标
    webGLPointToScreen: function(glPoint){
        if(!glPoint || Z.Util.isNull(glPoint.x) || Z.Util.isNull(glPoint.y) || Z.Util.isNull(glPoint.z)){
            return null;
        }

        var world_vector = new THREE.Vector3(glPoint.x, glPoint.y, glPoint.z);
        var vector = world_vector.project(this._cameraObject);

        var halfWidth = this.options.width / 2;
        var halfHeight = this.options.height / 2;

        return {
            x: Math.round(vector.x * halfWidth + halfWidth),
            y: Math.round(-vector.y * halfHeight + halfHeight)
        };
    },

    /*垂直俯视且无z轴旋转情况下在z=0平面上的正射范围（世界坐标）*/
    getOrthoGLBounds: function(){
        // var distance = new THREE.Vector3(this.options.cameraPosition.x,
        //     this.options.cameraPosition.y,
        //     this.options.cameraPosition.z).length();
        var centerPoint = this._viewCenter;
        //var distance = this._cameraObject.position.clone().sub(centerPoint).length();
        var distance = this._cameraObject.position.distanceTo(centerPoint);

        var halfHeight = distance * Math.tan(Math.PI * this._cameraObject.fov / (2 * 180));
        var halfWidth = halfHeight * this.options.width / this.options.height;
        // var topLeft = new Z.Point(this.options.cameraPosition.x - halfWidth, this.options.cameraPosition.y + halfHeight);
        // var bottomRight = new Z.Point(this.options.cameraPosition.x + halfWidth, this.options.cameraPosition.y - halfHeight);
        
        var topLeft = new Z.Point(centerPoint.x - halfWidth, centerPoint.y + halfHeight);
        var bottomRight = new Z.Point(centerPoint.x + halfWidth, centerPoint.y - halfHeight);

        return Z.GLBounds.create(topLeft, bottomRight);
    },

    /*当前z=0平面的可视范围（世界坐标）*/
    getVisibleGLBounds: function(){
        var raycaster = new THREE.Raycaster();
        console.info("Z.SceneRender3D.getVisibleGLBounds:_cameraObject.position: x=" + this._cameraObject.position.x + ", y=" + this._cameraObject.position.y 
            + ", z=" + this._cameraObject.position.z);
        //_getIntersectPoint: function(raycaster, targetGeometry, viewPoint, camera){
        var leftUp = this._getIntersectPoint(raycaster, this._xyPlane, new THREE.Vector2(-1, 1), this._cameraObject);
        var leftBottom = this._getIntersectPoint(raycaster, this._xyPlane, new THREE.Vector2(-1, -1), this._cameraObject);
        var rightUp = this._getIntersectPoint(raycaster, this._xyPlane, new THREE.Vector2(1, 1), this._cameraObject);
        var rightBottom = this._getIntersectPoint(raycaster, this._xyPlane, new THREE.Vector2(1, -1), this._cameraObject);
        var points = [leftUp, leftBottom, rightBottom, rightUp];

        //xy平面与近面或远面相交
        if(!leftUp || !leftBottom || !rightUp || !rightBottom){
            var planeBsp = new ThreeBSP(this._xyPlane);
            var cameraBoxBsp = new ThreeBSP(this._getCameraBox(this._cameraObject));
            var intersect = planeBsp.intersect(cameraBoxBsp).toGeometry();
            //this._sceneObject.add(new THREE.Mesh(intersect, new THREE.MeshBasicMaterial({color:'#555555'})));
            var intersetVertex = intersect.vertices;

            for(var i = 0; i < intersetVertex.length; i++){
                points.push(intersetVertex[i]);
            }
        }

        return Z.Util.getVectorBounds(points);
    },

    getMaxAnisotropy: function(){
        return this._renderObject.getMaxAnisotropy();
    },

    getRotateByRad: function(){
        var qua = this._cameraObject.quaternion.clone();

        return {
            x: qua.x,
            y: qua.y,
            z: qua.z,
            w: qua.w
        };
    },

    getVHRotateByRad: function(){
        var absoluteRotate = this.getRotateByRad();
        var zNormal = new THREE.Vector3(0, 0, 1),
            cameraPosition = this._cameraObject.position;
        var projctToCamera = zNormal.project(this._cameraObject),
            cameraVAngle = Math.atan(Math.abs(cameraPosition.z) / Math.sqrt(Math.pow(cameraPosition.x, 2) + Math.pow(cameraPosition.y, 2)));

        var vAngle = cameraVAngle, hAngle = absoluteRotate.z;

        if(projctToCamera.y < 0){
            vAngle = Math.PI - vAngle;
        }

        if(cameraPosition.z < 0){
            vAngle = -vAngle;
        }

        return {
            v: vAngle,
            h: hAngle
        };
    },

    calculateVHRotation: function(fromScreenPoint, toScreenPoint){
        if(!fromScreenPoint || !toScreenPoint){
            return null;
        }

        var startPoint = this.screenPointToWebGL(fromScreenPoint);
        var newPoint = this.screenPointToWebGL(new Z.Point(toScreenPoint.x, fromScreenPoint.y, fromScreenPoint.z));
        var angle_h = 0, angle_v = 0;

        if(startPoint && newPoint){
            var vec_h1 = new THREE.Vector3(startPoint.x, startPoint.y, 0),
                vec_h2 = new THREE.Vector3(newPoint.x, newPoint.y, 0);

            var cross_h = vec_h1.clone().cross(vec_h2);

            angle_h = (cross_h.z > 0 ? -1 : 1) * vec_h1.angleTo(vec_h2) * 180 / Math.PI;
        }

        var raycaster1 = new THREE.Raycaster(),
            raycaster2 = new THREE.Raycaster(),
            halfWidth = this.options.width / 2,
            halfHeight = this.options.height / 2,
            vector1 = new THREE.Vector3((fromScreenPoint.x - halfWidth) / halfWidth, (halfHeight - fromScreenPoint.y) / halfHeight, 0),
            vector2 = new THREE.Vector3((fromScreenPoint.x - halfWidth) / halfWidth, (halfHeight - toScreenPoint.y) / halfHeight, 0);
        raycaster1.setFromCamera(vector1, this._cameraObject);
        raycaster2.setFromCamera(vector2, this._cameraObject);

        var cameraPosition = this._cameraObject.position;
        var cameraDistance = cameraPosition.distanceTo(new THREE.Vector3(0, 0, 0));
        var nearPlane = new THREE.Plane(cameraPosition, -(cameraDistance - this._cameraObject.near));
        var intersect_p1 = raycaster1.ray.intersectPlane(nearPlane),
            intersect_p2 = raycaster2.ray.intersectPlane(nearPlane);

        if(intersect_p1 && intersect_p2){
            var cross_v = intersect_p1.clone().cross(intersect_p2);

            angle_v = (toScreenPoint.y > fromScreenPoint.y ? -1 : 1) * intersect_p1.angleTo(intersect_p2) * 180 / Math.PI;
        }
//console.info("angle_h:" + angle_h + ", angle_v:" + angle_v);
        return {h: angle_h, v: angle_v};
    },

    getIntersectObjects: function(screenPoint){
        var halfWidth = this.options.width / 2,
            halfHeight = this.options.height / 2,
            //raycaster = new THREE.Raycaster(),
            vector = new THREE.Vector3((screenPoint.x - halfWidth) / halfWidth, (halfHeight - screenPoint.y) / halfHeight, 0);

        //raycaster.setFromCamera( vector, this._cameraObject);
        var raycaster = this._getNearFarRayCaster(vector, this._cameraObject);
        var intersects = raycaster.intersectObjects( this._sceneObject.children, true),
            graphics = [], j = 0;
        // console.info("intersectObjects:" + intersects.length);

        if(intersects.length === 3){
            var sss = 0;
        }else if(intersects.length === 4){
            var sfsfsjk = 8;
        }

        for ( var i = 0; i < intersects.length; i++ ) {
            if(intersects[i].object._graphicObj){
                var exist = false;

                for(var m = 0; m < graphics.length; m++){
                    if(graphics[m].graphic === intersects[i].object._graphicObj){
                        exist = true;
                        break;
                    }
                }

                if(!exist){
                    graphics[j] ={graphic: intersects[i].object._graphicObj, rawIntersection: intersects[i]};
                    j++;
                }
            }
        }

        return graphics;
    },

    //计算geometry在当前视空间的填充率（在geometry的中心点位于（0,0,0）的情况下），如果填充率小于1，则全部位于当前视空间内，如果超过1，则说明geometry的大小超过当前视空间，无法全部显示
    // @glBounds: {min: {x: 1, y: 1, z: 1}, max: {x: 1, y: 1, z: 1}}
    getFillScale: function(glBounds){
        if(!glBounds){
            return;
        }

        var radius = new THREE.Vector3(glBounds.max.x - glBounds.min.x, glBounds.max.y - glBounds.min.y, glBounds.max.z - glBounds.min.z).length() / 2,
            // cameraDistance = new THREE.Vector3(this.options.cameraPosition.x,
            //     this.options.cameraPosition.y,
            //     this.options.cameraPosition.z).length();
            //cameraDistance = this._cameraObject.position.sub(this._viewCenter).length();
            cameraDistance = this._cameraObject.distanceTo(this._viewCenter);

        var minVerticalDistance = cameraDistance * Math.sin(Math.PI * this._cameraObject.fov / (2 * 180)),
            cameraWidth = this._cameraObject.aspect * cameraDistance * Math.tan(Math.PI * this._cameraObject.fov / (2 * 180)),
            cameraDepth = this._cameraObject.far - this._cameraObject.near;
        var minHorizontalDistance = cameraWidth * cameraDistance / Math.sqrt((Math.pow(cameraWidth, 2) + Math.pow(cameraDistance, 2)));
        var minCameraSpaceDistance = Math.min(cameraDepth, minVerticalDistance, minHorizontalDistance);

        return radius / minCameraSpaceDistance;
    },

    _initCameraPosition: function(){
        this._cameraObject.position.x = this.options.cameraPosition.x;
        this._cameraObject.position.y = this.options.cameraPosition.y;
        this._cameraObject.position.z = this.options.cameraPosition.z;
        //this._cameraObject.lookAt(new THREE.Vector3(this.options.cameraTarget.x, this.options.cameraTarget.y, this.options.cameraTarget.z));
        this._cameraObject.lookAt(this._viewCenter.clone());
        this._cameraObject.updateMatrixWorld();
        this._rawCameraObject = this._cameraObject.clone();
    },

    _getLightPosition: function(lightAngle, lightDistance){
        if(!lightAngle){
            return null;
        }

        lightDistance = lightDistance || 1;
        var xyProject =   lightDistance * Math.cos(lightAngle.v * Math.PI / 180),
            x = xyProject * Math.cos(lightAngle.h * Math.PI / 180),
            y = xyProject * Math.sin(lightAngle.h * Math.PI / 180),
            z = lightDistance * Math.sin(lightAngle.v * Math.PI / 180);

        return {x:x, y: y, z: z};
    },

    _getLightDistance: function(){
        var halfHeight = this._cameraObject.far * Math.tan(Math.PI * this._cameraObject.fov/(2 * 180));
        var edgeLength = this._cameraObject.far / Math.cos(Math.PI * this._cameraObject.fov/(2 * 180));
        var distance = Math.max(halfHeight * 2, edgeLength) * 1.1;    //适度放大，确保平面大于视域范围

        return distance;
    },

    _getRotationMatrix: function(rotation, rawRotation){
        var x_r = rawRotation ? (rawRotation.x * Math.PI / 180 + rotation.x) : rotation.x,
            y_r = rawRotation ? (rawRotation.y * Math.PI / 180 + rotation.y) : rotation.y,
            z_r = rawRotation ? (rawRotation.z * Math.PI / 180 + rotation.z) : rotation.z,
            m = new THREE.Matrix4(),
            m1 = new THREE.Matrix4(),
            m2 = new THREE.Matrix4(),
            m3 = new THREE.Matrix4();

        m1.makeRotationX( x_r );
        m2.makeRotationY( y_r );
        m3.makeRotationZ( z_r );

        m.multiplyMatrices( m1, m2 );
        m.multiply( m3 );

        return m;
    },

    _createXYPlane: function(cameraFov, cameraHeight, WHRatio){
        var halfHeight = cameraHeight * Math.tan(Math.PI * cameraFov/(2 * 180));
        var edgeLength = cameraHeight / Math.cos(Math.PI * cameraFov/(2 * 180));
        var height = Math.max(halfHeight * 2, edgeLength) * 1000000;    //适度放大，确保平面大于视域范围
        var width = height * WHRatio * 1000000;
        var plane = new THREE.PlaneGeometry(width, height);
        plane.computeVertexNormals();
        // plane.normalizeNormals();
        var meterial = new THREE.MeshBasicMaterial({color:'#ffffff'});//var meterial = new THREE.MeshBasicMaterial({color:'#888800'});
        meterial.polygonOffset = true;
        meterial.polygonOffsetFactor = -1;
        meterial.polygonOffsetUnits = -1;
        meterial.side = THREE.DoubleSide;
        var mesh = new THREE.Mesh(plane, meterial);
        mesh.visible = false;
        return mesh;
    },

    _addObject: function(object, index){
        this._removeFromScene(this._objects);
        Z.Util.addToArray(this._objects, object, index);
        this._appendToScene(this._objects);
    },

    _removeFromScene: function(objects){
        var length = objects.length;

        for(var i = 0; i < length; i++){
            this._sceneObject.remove(objects[i]);
        }
    },

    _appendToScene: function(objects){
        var length = objects.length;

        for(var i = 0; i < length; i++){
            this._sceneObject.add(objects[i]);
        }
    },

    _removeObject: function(object){
        var _object = (object instanceof Array) ? object: [object];
        this._removeFromScene(_object);
        Z.Util.removeFromArray(this._objects, object);
    },

    _getIntersectPoint: function(raycaster, targetGeometry, viewPoint, camera){
        // raycaster.setFromCamera( viewPoint, camera );
        this._getNearFarRayCaster(viewPoint, camera, raycaster);

        var intersects = [];
        targetGeometry.raycast(raycaster, intersects);

        if(intersects.length > 0){
            return intersects[0].point;
        }

        return null;
    },

    //获得相机可视区域的外围框（凌锥形）
    _getCameraBox: function(camera){
        var viewPortVertex = [[-1,1,-1], [-1,-1,-1], [1,-1,-1], [1,1,-1], [-1,1,-1], 
            [-1,1,1], [-1,-1,1], [1,-1,1], [1,1,1], [-1,1,1], [-1,1,-1]],
            worldVertex = [],
            vector,
            vertexLength = viewPortVertex.length;

        // camera.updateMatrix();
        // camera.updateMatrixWorld();

        for(var i = 0; i < vertexLength; i++){
            vector = new THREE.Vector3(viewPortVertex[i][0], viewPortVertex[i][1], viewPortVertex[i][2]);
            worldVertex[i] = vector.unproject(camera);
        }

        //return new THREE.ConvexGeometry(worldVertex);
        var geometry = new THREE.ConvexGeometry(worldVertex);
        geometry.computeVertexNormals ();
        // geometry.normalizeNormals();

        return geometry;
    },

    _getNearFarRayCaster: function(viewPoint, camera, targetRayCaster){
        var raycaster = targetRayCaster || new THREE.Raycaster();
        raycaster.setFromCamera( viewPoint, camera);

        var nearDistance = this._getCameraDistance(camera.near, camera);
        var farDistance = this._getCameraDistance(camera.far, camera);
        raycaster.near = nearDistance;
        raycaster.far = farDistance;

        return raycaster;
    },

    _getCameraDistance: function(verticalDis, camera){
        var x = verticalDis;
        var y = x * Math.tan(camera.fov * Math.PI/ 180);
        var z = y * camera.aspect;

        return Math.sqrt(x * x + y * y + z * z);
    }
}