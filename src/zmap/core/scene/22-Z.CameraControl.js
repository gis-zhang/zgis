/**
 * Created by Administrator on 2015/10/29.
 */
Z.CameraControl = function(options){
    this.options = {
        whRatio: 1,
        cameraFov: 45,    //相机视场,单位为角度
        cameraNear: 1,  //相机近面
        cameraFar: 150,   //相机远面
        cameraPosition: {x: 0, y: 0, z:50},
        cameraRotation:{x:0, y: 0, z: 0},
        cameraTarget:{x:0, y: 0, z: 0}
    };

    Z.Util.applyOptions(this.options, options, false);
    this._cameraObject = null;
    //this._scale = 1;
    //this._position = new THREE.Vector3(0, 0, 0);
    //this._rotation = new THREE.Vector3(0, 0, 0);

    this._createCamera();
    this._initCameraPosition();
}

/*参数rotate为相对于当前位置的旋转角，单位为弧度*/
Z.CameraControl.prototype.rotateByRad = function(rotate){
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
        this._cameraObject.lookAt(new THREE.Vector3(this.options.cameraTarget.x, this.options.cameraTarget.y, this.options.cameraTarget.z));
        //alert("rotation:" + this._cameraObject.rotation.x * 180 / Math.PI + "," + this._cameraObject.rotation.y * 180 / Math.PI + "," + this._cameraObject.rotation.z * 180 / Math.PI
        //    + ";up:" + this._cameraObject.up.x + "," + this._cameraObject.up.y + "," + this._cameraObject.up.z);
        this._cameraObject.updateMatrix();
        this._cameraObject.updateMatrixWorld();
        this._cameraObject.updateProjectionMatrix();
        //this._cameraObject.matrixWorldNeedsUpdate = true;
    }
}

Z.CameraControl.prototype.scale = function(scale){}

Z.CameraControl.prototype._createCamera = function(){
    this._cameraObject = new THREE.PerspectiveCamera(this.options.cameraFov,
        this.options.width/this.options.height, this.options.cameraNear,
        this.options.cameraFar);
}

Z.CameraControl.prototype._initCameraPosition = function(){
    this._cameraObject.position.x = this.options.cameraPosition.x;
    this._cameraObject.position.y = this.options.cameraPosition.y;
    this._cameraObject.position.z = this.options.cameraPosition.z;
    this._cameraObject.lookAt(new THREE.Vector3(this.options.cameraTarget.x, this.options.cameraTarget.y, this.options.cameraTarget.z));
}

Z.CameraControl.prototype._getRotationMatrix = function(rotation, rawRotation){
    //var rad = Math.PI / 180,
    //    x_r = rawRotation.x + rotation.x * rad,
    //    y_r = rawRotation.y + rotation.y * rad,
    //    z_r = rawRotation.z + rotation.z * rad;
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
}


