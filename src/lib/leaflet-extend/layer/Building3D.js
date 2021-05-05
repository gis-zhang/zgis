function Camera(x, y, z, map) {
    this.x = x ? x : 0;
    this.y = y ? y : 0;
    this.z = z ? z : 900;       //默认高度

    this.viewDistance = 0.03;    //默认眼睛与屏幕垂直且到屏幕的距离为0.5米

    this.viewFactor_x = 1;
    this.viewFactor_y = 1;

    if (map) {
        this.setMap(map);
    }
}

Camera.prototype.setMap = function (map) {
    this.map = map;
    this._reset();
}

Camera.prototype._reset = function(){
    if (this.map) {
        var zoomLevel = this.map.map.getZoom();

        if (this.map.options.levelDefine.lod) {
            this.z = this.viewDistance * this.map.options.levelDefine.lod[zoomLevel].scale;     
        }

        var mapBounds = this.map.map.getBounds();
        this.x = mapBounds.getCenter().lng;
        this.y = mapBounds.getSouth();

        this.viewFactor_y = this.map.viewFactor;
    }
}

Camera.prototype.refresh = function () {
    this._reset();
}

Camera.prototype.getFitCamera = function () {
    this._reset();
    return this._fitMapViewAngle();
}

Camera.prototype._fitMapViewAngle = function () {
    var tempCamera = new Camera();
    tempCamera.x = this.x;
    //tempCamera.y = this.y - map.distanceTranslate(this.z * Math.cos(Math.PI * (this.map.zAngle) / 180));
    //tempCamera.y = this.y - this.z * Math.cos(Math.PI * (90 - this.map.zAngle) / 180);
    tempCamera.y = this.y;
    tempCamera.z = this.z * Math.sin(Math.PI * (this.map.zAngle) / 180);
    tempCamera.viewFactor_x = this.viewFactor_x;
    tempCamera.viewFactor_y = this.viewFactor_y;

    return tempCamera;
}

//视角转换器，根据相机的位置计算出指定高度的点在地面的投影点坐标
function PerspectiveTransform() { }

PerspectiveTransform.TransformLatlng = function (latlng, height, camera) {
    camera = camera || new Camera();
    var viewFactor_y = camera.viewFactor_y || 1;
    var result = latlng;

    if ((latlng instanceof L.LatLng) && (camera instanceof Camera)) {
        var xValue = (camera.z * latlng.lng - height * camera.x) / (camera.z - height);
        var yValue = (camera.z * latlng.lat - height * camera.y) / (camera.z - height);
        //var yValue = (camera.z * latlng.lat - height * camera.y) / ((camera.z - height) * viewFactor_y);

        //result = new L.LatLng(yValue, xValue);
        result = [yValue, xValue];
    } else if ((latlng instanceof Array) && (camera instanceof Camera)) {
        if (latlng.length >= 2) {
            var yValue = (camera.z * latlng[0] - height * camera.y) / (camera.z - height);
            //var yValue = (camera.z * latlng[0] - height * camera.y) / ((camera.z - height) * viewFactor_y);
            var xValue = (camera.z * latlng[1] - height * camera.x) / (camera.z - height);

            //result = new L.LatLng(xValue, yValue);
            result = [yValue, xValue];
        }
    }

    return result;
}

var MaterialColors = {
    brick: '#cc7755',   //砖色（土黄）
    bronze: '#ffeecc',  //青铜色（浅黄）
    canvas: '#fff8f0',  //帆布色（更浅的黄）
    concrete: '#999999',  //混凝土色（灰黑）
    copper: '#a0e0d0',    //铜绿色
    glass: '#e8f8f8',     //玻璃绿色（浅绿）
    gold: '#ffcc00',     //金黄色
    plants: '#009933',    //叶绿色
    metal: '#aaaaaa',     //金属色（灰黑）
    panel: '#fff8f0',     //面板色（浅粉）
    plaster: '#999999',   //石膏色（灰黑）
    roof_tiles: '#f08060',  //瓦片红（中度红）
    silver: '#cccccc',      //银色（浅灰）
    slate: '#666666',       //板岩色（深度灰）
    stone: '#996666',       //石头色（红黑）
    tar_paper: '#333333',   //
    wood: '#deb887'        //木材黄
};

/******************************************************************************************/
/***
 * latLngs：建筑基底多边形
 * properties：建筑属性
 * propValues：根据options从建筑属性中提取出的值
 * options：
 * camera：视点
 ***/
function Building3D(latLngs, properties, propValues, options, camera) {
    latLngs = latLngs || [];
    //this.partsLatLngs = Util.splitConcavePolygon(latLngs);
    this.baseLatLngs = latLngs;
    this.partsLatLngs = [latLngs];
    this.parts = [];
    this.properties = properties || {};
    this.propValues = propValues || {};
    this.options = options || {};
    this._building = new L.FeatureGroup();
    this.selected = false;
    //this.camera = camera || new Camera();
    this.buttonArray = [];
    var i = 0;

    for (i = 0; i < this.partsLatLngs.length; i++) {
        this.parts.push(new Building3DPart(this.partsLatLngs[i], this.propValues, camera));
    }
}

Building3D.prototype._getPopupContent = function (properties) {
    //JZWBM,JZMC,BZDZ,BZDZBM,SYQX,JZND,JZCSDS,JZCSDX,CG,JZGD,DMTCW,DXTCW,JDMJ,ZJZMJ,
    //GGJZLX, JZRJL, LDL, JZFGL, PK_UID, STATUS
    var buildingFieldName = {
        JZWBM: '建筑物编码',
        JZMC: '建筑名称',
        BZDZ: '标准地址',
        BZDZBM: '标准地址编码',
        SYQX: '使用期限',
        JZND: '建造年代',
        JZCSDS: '建筑层数（地上）',
        JZCSDX: '建筑层数（地下）',
        CG: '层高',
        JZGD: '建筑高度',
        DMTCW: '地面停车位',
        DXTCW: '地下停车位',
        JDMJ: '基底面积',
        ZJZMJ: '总建筑面积',
        GGJZLX: '公共建筑类型',
        JZRJL: '建筑容积率',
        LDL: '绿地率',
        JZFGL: '建筑覆盖率'//,
        //PK_UID: '',
        //STATUS: ''
    };

    var nameField = "JZMC";
    var popupContent = document.createElement("p");
    var prop, hasProperty = false, propContent = "<h2>" + properties[nameField] + "</h2><hr/>";
    propContent += "<table>";
    
//    var prop, hasProperty = false, propContent = "<table>";
//    var popupContent = document.createElement("p");

    for (prop in properties) {
        if (!prop) {
            continue;
        }

        propContent += "<tr><td width=80 style='text-align:left;'>" + (buildingFieldName[prop] || prop) + ":</td><td width=100 style='text-align:left;'>" + properties[prop] + "</td></tr>";
        hasProperty = true;
    }

    //var timestamp = (new Date()).valueOf();
    //popupContent += "<tr><td colspan='2'><input type='button' value='进入室内' id='" + timestamp + "'></td></tr>";
    propContent += "</table>";
    popupContent.innerHTML = propContent;

    var button = document.createElement("input");
    button.type = "button";
    button.value = "进入室内";
    //button.onclick = this._openBuildingDetail;
    L.DomEvent.addListener(button, "click", this._openBuildingDetail, this);
    popupContent.appendChild(button);

    var thisObj = this;

    if (this.buttonArray instanceof Array) {
        var i = 0;

        for (; i < this.buttonArray.length; i++) {
            if (this.buttonArray[i].title) {
                var button = document.createElement("input");
                button.type = "button";
                button.value = this.buttonArray[i].title;
                button.btnParams = this.buttonArray[i];

                if (this.buttonArray[i].func) {
                    L.DomEvent.addListener(button, "click", function (e) {
                        var target = e.target || e.currentTarget;

                        if (target.btnParams) {
                            target.btnParams.func(properties);
                        }
                    }, this);
                }

                popupContent.appendChild(button);
            }
        }
    }

    return popupContent;
}

Building3D.prototype._openBuildingDetail = function () {
    //alert("点击");
    var faceViewer = BuildingFaceViewer.Instance;

    if (!faceViewer) {
        //faceViewer = new BuildingFaceViewer("building");
        $("#room").window("open");
        faceViewer = new BuildingFaceViewer("building");
    } else {
        $("#room").window("open");
    }

    faceViewer.showBuilding(this.baseLatLngs, this.properties, this.propValues, this.options);
}

//buttonArray:[{title:'', func:func}]
Building3D.prototype.addButton = function (buttonArray) {
    this.buttonArray = buttonArray;

    var popupContent = this._getPopupContent(this.properties);
    this.parts[0].roof.bindPopup(popupContent);
}

Building3D.prototype.changeCamera = function (camera) {
    var i = 0;

    for (i = 0; i < this.parts.length; i++) {
        this.parts[i].changeCamera(camera);
    }
}

Building3D.prototype.redraw = function () {
    var i = 0;

    for (i = 0; i < this.parts.length; i++) {
        this.parts[i].redraw();
    }
}

Building3D.prototype.getBuildingBases = function () {
    var i = 0, bases = [];

    for (i = 0; i < this.parts.length; i++) {
        bases.push(this.parts[i].getBuildingBase());
    }

    return bases;
}

Building3D.prototype.getBuildingParts = function () {
    return this.parts;
}

Building3D.prototype.showFloors = function () {
    var i = 0;

    for (i = 0; i < this.parts.length; i++) {
        this.parts[i].showAllFloors();
    }
}

Building3D.prototype.getFloor = function (floorIndex) {
    var i = 0, result = [];

    for (i = 0; i < this.parts.length; i++) {
        result.push(this.parts[i].getFloor(floorIndex));
    }

    return result;
}

Building3D.prototype.select = function () {
    var i = 0;
    this.selected = true;

    for (i = 0; i < this.parts.length; i++) {
        this.parts[i].select();
    }
}

Building3D.prototype.unselect = function () {
    var i = 0;
    this.selected = false;

    for (i = 0; i < this.parts.length; i++) {
        this.parts[i].unselect();
    }
}

Building3D.prototype.enableClick = function (func) {
    var thisObj = this;
    var onClick = function () {
        if (thisObj.selected) {
            return;
        }

        FloorPerspectiveControl.Instance.hide();

        try {
            if (func) {
                func(thisObj);
            }
        } catch (e) { }

        thisObj.select();
    }

    var i = 0;

    for (i = 0; i < this.parts.length; i++) {
        this.parts[i].on("click", onClick);
    }

    if (this.parts.length > 0) {
        //this.parts[0].roof.bindPopup("<p>建筑物</p>");
        //var popupPoint = Util.getCenter(this.parts[0].roofLatLngs);
        //this._popup.setLatLng(popupPoint);
        //this.parts[0].roof.bindPopup(this._popup);
        var popupContent = this._getPopupContent(this.properties);
        this.parts[0].roof.bindPopup(popupContent);
    }
}

Building3D.prototype.addFloorClickListener = function (func) {
    if (!(func instanceof Function)) {
        return;
    }

    this.onFloorClick = func;
    var i = 0;

    for (i = 0; i < this.parts.length; i++) {
        this.parts[i].onFloorClick = this.onFloorClick;
    }
}

//获得建筑的外接矩形
Building3D.prototype.getBounds = function () {
    var i = 0, boundsPointArray = [], partBounds;

    for (i = 0; i < this.parts.length; i++) {
        partBounds = this.parts[i].getBbox();
        //boundsPointArray.push([partBounds.minx, partBounds.miny]);
        //boundsPointArray.push([partBounds.maxx, partBounds.maxy]);
        boundsPointArray.push(partBounds[0]);
        boundsPointArray.push(partBounds[1]);
    }

    return Util.getBounds(boundsPointArray);
}

//获得建筑基底的外接矩形
Building3D.prototype.getBaseBounds = function () {
    var i = 0, boundsPointArray = [], partBounds;

    for (i = 0; i < this.parts.length; i++) {
        partBounds = this.parts[i].getBaseBbox();
        //boundsPointArray.push([partBounds.minx, partBounds.miny]);
        //boundsPointArray.push([partBounds.maxx, partBounds.maxy]);
        boundsPointArray.push(partBounds[0]);
        boundsPointArray.push(partBounds[1]);
    }

    return Util.getBounds(boundsPointArray);
}

Building3D.prototype.onFloorClick = function () {
    
}

/**
 * 建筑物图层
 */
function BuildingLayer(map) {
    if (!map) {
        return;
    }

    this.options = {
        heightProp:'height',
        minHeightProp:'minHeight',
        floorProp:'floor',
        minFloorProp:'minFloor',
        roofColorProp: 'roofColor',
        geoProp: 'SHAPE',
        idProp: 'OBJECTID',
        nameProp: 'NAME',
        roofColor:'#aaa',                 //屋顶的默认颜色
        wallColor:'#555'                  //墙壁的默认颜色
    };

    this._map = map;

//    this._initContainer();

    this.buildings = [];
    this.buildingContainer = new L.LayerGroup();

    if (this._map) {
        this._map.addLayer(this.buildingContainer);

        this._map.on("viewreset", this._onMapViewReset, this);
        this._map.on("move", this._onMapMove, this);
    }

    this.camera = new Camera();

    if (this._map) {
        this.camera.setMap(this._map);
    }

    this._lastZoomLevel = this._map.map.getZoom();
    //this._refreshCamera();
    this.baseZIndex = 1000000;

    BuildingLayer.prototype._tempAllBase = [];

    this.dataLoader = new BuildingDataLoader();
}

//BuildingLayer.prototype._initContainer = function () {
//    var tilePanelIndex = this._map.map._panes.tilePane.style.zIndex;

//    this._map.map._panes.objectsPane.style.zIndex += 1;

//    this._container = L.DomUtil.create('div');
//    this._container.style.zIndex = tilePanelIndex + 1;
//}

/****
    * 加载数据
    * options = {
    geoProp: 'SHAPE',
    idProp:'OBJECTID',
    nameProp: 'OBJECTID',
    heightProp:'height',
    minHeightProp:'minHeight',
    floorProp:'floor',
    minFloorProp:'minFloor',
    roofColorProp:'roofColor'
    }
    *
    */
BuildingLayer.prototype.loadData = function (dataList, options, format) {
    if (!dataList) {
        return;
    }

    this._reset();
    this.options = Util.applyOptions(this.options, options);
    var i, j, thisObj = this;

    for (i = 0; i < dataList.length; i++) {
        var propValues = this._getBuildingOptions(dataList[i], this.options);
        var latlngs = this._getLatLngs(dataList[i], this.options, format);
        var propeties = this._getProperties(dataList[i], this.options);

        if (latlngs) {
            var building = new Building3D(latlngs, propeties, propValues, this.options, this.camera);
            this.buildings.push(building);
            var parts = building.getBuildingParts();

            for (j = 0; j < parts.length; j++) {
                this.buildingContainer.addLayer(parts[j].getBuildingObj());
            }

            building.enableClick(function (clickedBuilding) {
                var k;

                for (k = 0; k < thisObj.buildings.length; k++) {
                    if (thisObj.buildings[k].selected) {
                        thisObj.buildings[k].unselect();
                    }
                }
            });

            building.addButton([{
                title: "招商引资信息",
                func: function (properties) {
                    var id = properties["JZWBM"];

                    if (!id) {
                        //alert("无法人信息");
                    } else {
                        //openFarenWindow
                        thisObj.dataLoader.queryZhaoshang(id, thisObj.openZhaoshangWindow, thisObj);
                    }

                }
            }]);
        }
    }

    this.reorder();
}

BuildingLayer.prototype.openZhaoshangWindow = function (dataList) {
    if (!(dataList instanceof Array) || dataList.length <= 0) {
        return;
    }

    var zhaoshangFieldName = {
        JZMJ: '建筑面积',
        JZWBM: '建筑物编码',
        LB: '类别',
        LXDH: '联系电话',
        LYDZ: '楼宇地址',
        LYMC: '楼宇名称',
        RZJ: '日租金',
        SCJD: '所处街道',
        XZMJ: '限制面积',
        ZSXX: '招商信息'
    };
    var data = dataList[0], columns = [], prop, propContent = "<table>";

    for (prop in data) {
        propContent += "<tr><td width=80 style='text-align:left;'>" + (zhaoshangFieldName[prop] || prop) + ":</td><td width=100 style='text-align:left;'>" + data[prop] + "</td></tr>";
    }

    propContent += "</table>";

    this.zhaoshangWindows = $("#zhaoshangWindow");
    this.zhaoshangWindows.window({
        width: 600,
        height: 400,
        content: propContent,
        title: "招商引资信息",
        modal: true
    });

    this.zhaoshangWindows.window("open");
}

BuildingLayer.prototype._reset = function () {
    var i;

    for (i < 0; i < this.buildings.length; i++) {
        delete this.buildings[i];
    }

    this.buildings = [];
    this.buildingContainer.clearLayers();
    //this._resetCamera();
    this.camera.refresh();
}

//提取建筑物参数值
BuildingLayer.prototype._getBuildingOptions = function (data, options) {
    var buildingOptions = {};

    if (!options) {
        return;
    }

    if (options.heightProp) {
        var hValue = data[options.heightProp];

        if (Util.isNumber(hValue)) {
            buildingOptions.height = parseFloat(hValue);
        }
    }

    if (options.minHeightProp) {
        var mhValue = data[options.minHeightProp];

        if (Util.isNumber(mhValue)) {
            buildingOptions.minHeight = parseFloat(mhValue);
        }
    }

    if (options.floorProp) {
        var fValue = data[options.floorProp];

        if (Util.isNumber(fValue)) {
            buildingOptions.floor = parseInt(fValue);
        }
    }

    if (options.minFloorProp) {
        var mfValue = data[options.minFloorProp];

        if (Util.isNumber(mfValue)) {
            buildingOptions.minFloor = parseInt(mfValue);
        }
    }

    return buildingOptions;
}

//提取建筑物坐标值
BuildingLayer.prototype._getLatLngs = function (data, options, format) {
    if (!options) {
        return;
    }

    if (!options.geoProp) {
        return;
    }

    var latLngs = data[options.geoProp];
    //latLngs = this._translateDataFormat(latLngs, format);
    latLngs = Util.translateDataFormat(latLngs, format);

    if (latLngs.coords instanceof Array) {
        return latLngs.coords;
    } else {
        return;
    }
}

BuildingLayer.prototype._getProperties = function (data, options) {
    if (!options) {
        return;
    }

    var prop, properties = {};

    for(prop in data){
        if(prop != options['geoProp']){
            properties[prop] = data[prop];
        }
    }

    return properties;
}

////转换非标准坐标值为坐标数组
//BuildingLayer.prototype._translateDataFormat = function (data, format) {
//    var result = data;

//    if (format == "wkt") {
//        //var parser = new WktParser();
//        //result = parser.wkt2Array(data);
//        var geoObj = MyWktParser.wkt2Array(data);

//        if (geoObj) {
//            result = geoObj.type == "Polygon" ? geoObj.coords : null;
//        } else {
//            result = null;
//        }
//    }

//    return result;
//}

//重绘所有建筑
BuildingLayer.prototype.redraw = function () {
    var i;

    for (i < 0; i < this.buildings.length; i++) {
        if (this.buildings[i] instanceof Building3D) {
            this.buildings[i].redraw();
        }
    }
}

BuildingLayer.prototype.changeCamera = function (camera) {
    var i;

    for (i = 0; i < this.buildings.length; i++) {
        if (this.buildings[i] instanceof Building3D) {
            this.buildings[i].changeCamera(camera);
        }
    }
}

BuildingLayer.prototype._onMapViewReset = function (e) {

//    this._refreshCamera();

////    var tempCamera = new Camera();
////    tempCamera.x = this.camera.x;
////    tempCamera.y = this.camera.y - this._map.distanceTranslate(this.camera.z * Math.cos(Math.PI * (this._map.zAngle) / 180));
////    //tempCamera.y = this.camera.y - this.camera.z * Math.cos(Math.PI * (90 - this._map.zAngle) / 180);
////    tempCamera.z = this.camera.z * Math.sin(Math.PI * (this._map.zAngle) / 180);

    //    var tempCamera = this._fitMapViewAngle(this.camera, this._map);
    var tempCamera = this.camera.getFitCamera();
    this.changeCamera(tempCamera);
    this.reorder();
}

BuildingLayer.prototype._onMapMove = function (e) {
    //this.redraw();
    //    this._refreshCamera();

    ////    var tempCamera = new Camera();
    ////    tempCamera.x = this.camera.x;
    ////    //tempCamera.y = this.camera.y;
    ////    tempCamera.y = this.camera.y - this._map.distanceTranslate(this.camera.z * Math.cos(Math.PI * (this._map.zAngle) / 180));
    ////    tempCamera.z = this.camera.z * Math.sin(Math.PI * (this._map.zAngle) / 180);
    //    var tempCamera = this._fitMapViewAngle(this.camera, this._map);
    var tempCamera = this.camera.getFitCamera();
    this.changeCamera(tempCamera);
    this.reorder();
}

////根据地图视角倾度调整相机的位置
//BuildingLayer.prototype._fitMapViewAngle = function (camera, map) {
//    var tempCamera = new Camera();
//    tempCamera.x = camera.x;
//    //tempCamera.y = camera.y - map.distanceTranslate(camera.z * Math.cos(Math.PI * (map.zAngle) / 180));
//    tempCamera.y = camera.y;
//    tempCamera.z = camera.z * Math.sin(Math.PI * (map.zAngle) / 180);
//    tempCamera.viewFactor_x = camera.viewFactor_x;
//    tempCamera.viewFactor_y = camera.viewFactor_y;

//    return tempCamera;
//}

////更新相机位置，默认为底图可视区域的底部中心点，并根据级别更新相机高度（此处写死为2倍缩放，如果不是这样的话需要修改缩放倍率）
//BuildingLayer.prototype._refreshCamera = function () {
//    if (this._map) {
//        var zoomLevel = this._map.map.getZoom();

//        if (zoomLevel != this._lastZoomLevel) {
//            if (this._map.options.levelDefine.lod) {
//                this.camera.z = 2 * this._map.options.levelDefine.lod[zoomLevel].scale;     //默认眼睛与屏幕垂直且到屏幕的距离为0.5米
//            } else {
//                this.camera.z /= Math.pow(2, zoomLevel - this._lastZoomLevel);
//            }
//            this._lastZoomLevel = zoomLevel;
//        }

//        var mapBounds = this._map.map.getBounds();
//        this.camera.x = mapBounds.getCenter().lng;
//        this.camera.y = mapBounds.getSouth();

//        this.camera.viewFactor_y = this._map.viewFactor;
//    }
//}

////重置相机位置
//BuildingLayer.prototype._resetCamera = function () {
//    if (this._map) {
//        var zoomLevel = this._map.map.getZoom();

//        if (this._map.options.levelDefine.lod) {
//            this.camera.z = 0.5 * this._map.options.levelDefine.lod[zoomLevel].scale;     //默认眼睛与屏幕垂直且到屏幕的距离为0.5米
//        } else {
//            this.camera.z /= Math.pow(2, zoomLevel - this._lastZoomLevel);
//        }
//        this._lastZoomLevel = zoomLevel;

//        var mapBounds = this._map.map.getBounds();
//        this.camera.x = mapBounds.getCenter().lng;
//        this.camera.y = mapBounds.getSouth();

//        this.camera.viewFactor_y = this._map.viewFactor;
//    }
//}

//重排序所有建筑的zIndex值
BuildingLayer.prototype.reorder = function () {
    var i, j, buildingBases, allBases = [];

    for (i = 0; i < this.buildings.length; i++) {
        if (this.buildings[i] instanceof Building3D) {
            buildingBases = this.buildings[i].getBuildingBases();

            for (j = 0; j < buildingBases.length; j++) {
                if (buildingBases[j]) {
                    allBases.push(buildingBases[j]);
                }
            }
        }
    }

    BuildingLayer.prototype._tempAllBase = allBases;
    //allBases.sort(this._reorderBuilding);
    allBases.sort(function (building1, building2) {
        var bounds1 = Util.getBounds(building1.latLngs);
        var bounds2 = Util.getBounds(building2.latLngs);
        var _center1 = [(bounds1[0][0] + bounds1[1][0]) * 0.5, (bounds1[0][1] + bounds1[1][1]) * 0.5];
        var _center2 = [(bounds2[0][0] + bounds2[1][0]) * 0.5, (bounds2[0][1] + bounds2[1][1]) * 0.5];

        var _cam = building1.camera;

        var distance1 = Math.pow(_center1[0] - _cam.y, 2) + Math.pow(_center1[1] - _cam.x, 2);
        var distance2 = Math.pow(_center2[0] - _cam.y, 2) + Math.pow(_center2[1] - _cam.x, 2);

        if (Util.floatEquals(distance1, distance2)) {
            var center1 = Util.getCenter(building1.latLngs);
            var center2 = Util.getCenter(building2.latLngs);
            distance1 = Math.pow(center1[0] - _cam.y, 2) + Math.pow(center1[1] - _cam.x, 2);
            distance2 = Math.pow(center2[0] - _cam.y, 2) + Math.pow(center2[1] - _cam.x, 2);
        }

        return distance2 - distance1;


    });
    var count = 0, zIndex = 0;

    for (i = 0; i < allBases.length; i++) {
        count = allBases[i].baseObj.setZIndex(zIndex);
        zIndex += count;
    }

    //    document.getElementById("p1").value = (allBases[0].baseObj.walls.length) + "边形。" + "visiblePoint:" + allBases[0].baseObj.getVisibleBasePoint().length +
    //                                            ";    visibleLines:" + allBases[0].baseObj.getVisibleBaseLine().length + 
    //                                            ";    zIndex:";
    //    var loop;
    //    for (loop = 0; loop < allBases[0].baseObj.walls.length; loop++) {
    //        if (allBases[0].baseObj.wallVisibility[loop] && allBases[0].baseObj.walls[loop]) {
    //            document.getElementById("p1").value += allBases[0].baseObj.walls[loop].getZIndex() + ",";
    //        }
    //    }

    //    document.getElementById("p1").value += allBases[0].baseObj.roof.getZIndex() + ";";


    //    document.getElementById("p2").value = (allBases[1].baseObj.walls.length) + "边形。" + "visiblePoint:" + allBases[1].baseObj.getVisibleBasePoint().length +
    //                                            ";    visibleLines:" + allBases[1].baseObj.getVisibleBaseLine().length +
    //                                            ";    zIndex:";
    //    var loop;
    //    for (loop = 0; loop < allBases[1].baseObj.walls.length; loop++) {
    //        if (allBases[1].baseObj.wallVisibility[loop] && allBases[1].baseObj.walls[loop]) {
    //            document.getElementById("p2").value += allBases[1].baseObj.walls[loop].getZIndex() + ",";
    //        }
    //    }

    //    document.getElementById("p2").value += allBases[1].baseObj.roof.getZIndex() + ";";

    //    document.getElementById("p3").value = (allBases[2].baseObj.walls.length) + "边形。" + "visiblePoint:" + allBases[2].baseObj.getVisibleBasePoint().length +
    //                                            ";    visibleLines:" + allBases[2].baseObj.getVisibleBaseLine().length +
    //                                            ";    zIndex:";
    //    var loop;
    //    for (loop = 0; loop < allBases[2].baseObj.walls.length; loop++) {
    //        if (allBases[2].baseObj.wallVisibility[loop] && allBases[2].baseObj.walls[loop]) {
    //            document.getElementById("p3").value += allBases[2].baseObj.walls[loop].getZIndex() + ",";
    //        }
    //    }

    //    document.getElementById("p3").value += allBases[2].baseObj.roof.getZIndex() + ";";

    //    document.getElementById("features").value = "features:" + allBases[0].baseObj.roof._container.parentNode.childNodes.length;
}

BuildingLayer.prototype._reorderBuilding = function (building1, building2) {
    var result = -1, i;

    var camera = building1.camera;
    var b1_min_x = Math.min(building1.bounds.getEast(), building1.bounds.getWest());
    var b1_max_x = Math.max(building1.bounds.getEast(), building1.bounds.getWest());
    var b1_min_y = Math.min(building1.bounds.getSouth(), building1.bounds.getNorth());
    var b1_max_y = Math.max(building1.bounds.getSouth(), building1.bounds.getNorth());
    var b2_min_x = Math.min(building2.bounds.getEast(), building2.bounds.getWest());
    var b2_max_x = Math.max(building2.bounds.getEast(), building2.bounds.getWest());
    var b2_min_y = Math.min(building2.bounds.getSouth(), building2.bounds.getNorth());
    var b2_max_y = Math.max(building2.bounds.getSouth(), building2.bounds.getNorth());

//    if (Util.floatBiggerOrEquals(b1_min_x, camera.x) && Util.floatBiggerOrEquals(camera.x, b2_max_x)) {
//        return -1;
//    } else if (Util.floatBiggerOrEquals(camera.x, b1_max_x) && Util.floatBiggerOrEquals(b2_min_x, camera.x)) {
//        return 1;
//    }

    var valueBox = BuildingLayer.prototype._getValueBox(building1, building2);

    if (Util.floatBiggerOrEquals(valueBox.building1_dy_min, valueBox.building2_dy_max)) {     //build1与build2在y方向相离且build1比build2在y方向上离得更远
        if (Util.floatBiggerOrEquals(valueBox.building2_dx_min, valueBox.building1_dx_max)) { //build1与build2在x方向相离且build2比build1在x方向上离得更远
            var inner_max_x, inner_min_x, inner_max_y, inner_min_y;

            if (Util.floatBiggerOrEquals(b1_min_x, b2_max_x)) {
                inner_max_x = b1_min_x;
                inner_min_x = b2_max_x;
            } else {
                inner_max_x = b2_min_x;
                inner_min_x = b1_max_x;
            }

            if (Util.floatBiggerOrEquals(b1_min_y, b2_max_y)) {
                inner_max_y = b1_min_y;
                inner_min_y = b2_max_y;
            } else {
                inner_max_y = b2_min_y;
                inner_min_y = b1_max_y;
            }

            var buildingList = BuildingLayer.prototype._tempAllBase;

            for (i = 0; i < buildingList.length; i++) {
                if (buildingList[i] == building1 || buildingList[i] == building2) {
                    continue;
                }

                var bb = Util.getBounds(buildingList[i].latLngs);

                if (Util.floatBigger(inner_min_x, bb[0][1]) && Util.floatBigger(bb[1][1], inner_max_x)    //x超出innerbbox
                        && Util.floatBiggerOrEquals(bb[0][0], inner_min_y) && Util.floatBiggerOrEquals(inner_max_y, bb[1][0])) {   //y在innerbox中
                    return -1;
                } else if (Util.floatBigger(inner_min_y, bb[0][0]) && Util.floatBigger(bb[1][0], inner_max_y)    //y超出innerbbox
                        && Util.floatBiggerOrEquals(bb[0][1], inner_min_x) && Util.floatBiggerOrEquals(inner_max_x, bb[1][1])) {  //y在innerbox中
                    return 1;
                }
            }

            result = -1;
        } else {
            result = -1;
        }
    } else if (Util.floatBiggerOrEquals(valueBox.building2_dy_min, valueBox.building1_dy_max)) {   //build1与build2在y方向相离且build1比build2在y方向上离得更近
        //result = 1;
        if (Util.floatBiggerOrEquals(valueBox.building1_dx_min, valueBox.building2_dx_max)) { //build1与build2在x方向相离且build1比build2在x方向上离得更远
            var inner_max_x, inner_min_x, inner_max_y, inner_min_y;

            if (Util.floatBiggerOrEquals(b1_min_x, b2_max_x)) {
                inner_max_x = b1_min_x;
                inner_min_x = b2_max_x;
            } else {
                inner_max_x = b2_min_x;
                inner_min_x = b1_max_x;
            }

            if (Util.floatBiggerOrEquals(b1_min_y, b2_max_y)) {
                inner_max_y = b1_min_y;
                inner_min_y = b2_max_y;
            } else {
                inner_max_y = b2_min_y;
                inner_min_y = b1_max_y;
            }

            var buildingList = BuildingLayer.prototype._tempAllBase;

            for (i = 0; i < buildingList.length; i++) {
                if (buildingList[i] == building1 || buildingList[i] == building2) {
                    continue;
                }

                var bb = Util.getBounds(buildingList[i].latLngs);

                if (Util.floatBigger(inner_min_x, bb[0][1]) && Util.floatBigger(bb[1][1], inner_max_x)    //x超出innerbbox
                        && Util.floatBiggerOrEquals(bb[0][0], inner_min_y) && Util.floatBiggerOrEquals(inner_max_y, bb[1][0])) {  //y在innerbbox中
                    return 1;
                } else if (Util.floatBigger(inner_min_y, bb[0][0]) && Util.floatBigger(bb[1][0], inner_max_y)    //y超出innerbbox
                        && Util.floatBiggerOrEquals(bb[0][1], inner_min_x) && Util.floatBiggerOrEquals(inner_max_x, bb[1][1])) { //x在innerbbox中
                    return -1;
                }
            }

            result = 1;
        } else {
            result = 1;
        }
    } else if (Util.floatBiggerOrEquals(valueBox.building1_dx_min, valueBox.building2_dx_max)) {   //build1与build2在y方向相交、在x方向相离，且build1比build2在x方向上离得更远
        result = -1;
    } else if (Util.floatBiggerOrEquals(valueBox.building2_dx_min, valueBox.building1_dx_max)) {   //build1与build2在y方向相交、在x方向相离，且build1比build2在x方向上离得更近
        result = 1;
    } else {          //build1与build2相交或包含
        var building1_points = building1.baseObj.getVisibleBasePoint();
        var building1_lines = building1.baseObj.getVisibleBaseLine();
        var building2_points = building2.baseObj.getVisibleBasePoint();
        var building2_lines = building2.baseObj.getVisibleBaseLine();

        if (building1_lines.length == 0) {
            return 1;
        }

        if (building2_lines.length == 0) {
            return -1;
        }

        var corssTest_crossb2 = Util.crossLines([camera.y, camera.x], building1_points, building2_lines);
        var corssTest_crossb1 = Util.crossLines([camera.y, camera.x], building2_points, building1_lines);

        if (corssTest_crossb2 == 2) {     //building2遮挡building1
            result = -1;
        } else if (corssTest_crossb2 == 1) {     //building1遮挡building2
            result = 1;
        } else if (corssTest_crossb1 == 2) {  //building1遮挡building2
            result = 1;
        } else if (corssTest_crossb1 == 1) {     //building2遮挡building1
            result = -1;
            //        } else if (Util.coverPolygon([camera.y, camera.x], building2_lines, building1.bounds)) {   //building1遮挡building2
            //            result = 1;
            //        } else if (Util.coverPolygon([camera.y, camera.x], building1_lines, building2.bounds)) {   //building2遮挡building1
            //            result = -1;
        } else {
            var building1_notVisible_lines = building1.baseObj.getNotVisibleBaseLine();
            var corssTest_crossb1_back = Util.crossLines([camera.y, camera.x], building2_points, building1_notVisible_lines);

            if (corssTest_crossb1_back == 2) {     //building1遮挡building2
                result = 1;
            } else if (corssTest_crossb1_back == 1) {     //building2遮挡building1
                result = -1;
            } else {
                var building2_notVisible_lines = building2.baseObj.getNotVisibleBaseLine();
                var corssTest_crossb2_back = Util.crossLines([camera.y, camera.x], building1_points, building2_notVisible_lines);

                if (corssTest_crossb2_back == 2) {     //building2遮挡building1
                    result = -1;
                } else if (corssTest_crossb2_back == 1) {     //building1遮挡building2
                    result = 1;
                }
            }
        }
    }

    return result;
}

BuildingLayer.prototype._getValueBox = function (building1, building2) {
    var building1_width = building1.bounds.getEast() - building1.bounds.getWest();
    var building1_height = building1.bounds.getNorth() - building1.bounds.getSouth();
    var building2_width = building2.bounds.getEast() - building2.bounds.getWest();
    var building2_height = building2.bounds.getNorth() - building2.bounds.getSouth();
    
    var building1_dy_min = Math.abs(building1.dy);

    if(building1.dy == 0){
        if(building2.dy >= 0){
            building1_dy_min = building1.dy_south;
        }else if(building2.dy < 0){
            building1_dy_min = -building1.dy_north;
        }
    }

    var building1_dy_max = building1_dy_min + building1_height;
    var building1_dx_min = Math.abs(building1.dx);

    if(building1.dx == 0){
        if(building2.dx >= 0){
            building1_dx_min = building1.dx_west;
        }else if(building2.dx < 0){
            building1_dx_min = -building1.dx_east;
        }
    }

    var building1_dx_max = building1_dx_min + building1_width;
    var building2_dy_min = Math.abs(building2.dy);

    if(building2.dy == 0){
        if(building1.dy >= 0){
            building2_dy_min = building2.dy_south;
        }else if(building1.dy < 0){
            building2_dy_min = -building2.dy_north;
        }
    }

    var building2_dy_max = building2_dy_min + building2_height;
    var building2_dx_min = Math.abs(building2.dx);

    if(building2.dx == 0){
        if(building1.dx >= 0){
            building2_dx_min = building2.dx_west;
        }else if(building1.dx < 0){
            building2_dx_min = -building2.dx_east;
        }
    }

    var building2_dx_max = building2_dx_min + building2_width;

    return {
        building1_dy_min: building1_dy_min,
        building1_dy_max: building1_dy_max,
        building1_dx_min: building1_dx_min,
        building1_dx_max: building1_dx_max,
        building2_dy_min: building2_dy_min,
        building2_dy_max: building2_dy_max,
        building2_dx_min: building2_dx_min,
        building2_dx_max: building2_dx_max
    };
}
