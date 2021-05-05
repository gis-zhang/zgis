/**
*
options = {
height:100,         //楼高
minHeight:0,        //基底高
floors:5,           //楼层
minFloors:0,        //基底楼层
wallColor:'',
roofColor:''
}

*/
function Building3DPart(latLngs, options, camera) {
    this.latLngs = latLngs || [];
    //this.latlngSections = Util.splitConcavePolygon(this.latLngs);
    this.base = new BuildingPolygon(this.latLngs);
    this.baseBounds = this.base.getBounds();
    this.height = options.height || 10;
    this.floorHeight = options.floorHeight || 3;

    if (options.floor && !options.height) {
        this.height = options.floor * this.floorHeight;
    }

    this.floorLevels = options.floor || 1;
    this.roofLatLngs = this.latLngs;
    this.camera = camera || new Camera();
    this.roof;
    this.floors = [];               //所有楼层对象[obj, obj, obj]
    this.floorsIndex4show = [];          //当前显示的楼层序号[index, index, index]
    this.floorsShowing = [];        //当前显示的楼层对象[{index: , floorObj: }]
    this.walls = [];
    this.wallVisibility = [];
    this.wallColor = ['#888', '#aaa'];
    this.baseZIndex = 1000000;
    this.selected = false;

    this._baseStyle = { weight: 0, fillColor: "#333", fillOpacity: 1 };
    //this._roofStyle = { weight: 0, fillColor: "#c00", fillOpacity: 1 };  //MaterialColors.gold
    this._roofStyle = { weight: 0, fillColor: MaterialColors.wood, fillOpacity: 1 };
    this._wallStyle_visible = { weight: 0, fillColor: MaterialColors.silver, fillOpacity: 1 };
    this._wallStyle_invisible = { weight: 0, fillColor: MaterialColors.metal, fillOpacity: 1 };

    this._baseStyle_selected = { weight: 0, fillColor: "#333", fillOpacity: 1 };
    this._roofStyle_selected = { weight: 0, fillColor: MaterialColors.roof_tiles, fillOpacity: 1 };
    this._wallStyle_visible_selected = { weight: 0, fillColor: MaterialColors.bronze, fillOpacity: 1 };
    this._wallStyle_invisible_selected = { weight: 0, fillColor: "#666", fillOpacity: 1 };

    this._baseStyle_perspective = { weight: 0, fillColor: "#333", fillOpacity: 1 };
    this._roofStyle_perspective = { weight: 0, fillColor: '#f00', fillOpacity: 0.2 };
    this._wallStyle_visible_perspective = { weight: 0, fillColor: MaterialColors.silver, fillOpacity: 0.2 };
    this._wallStyle_invisible_perspective = { weight: 0, fillColor: "#666", fillOpacity: 1 };

    this.normalStyle = {
        roofStyle: this._roofStyle,
        baseStyle: this._baseStyle,
        wallStyle_visible: this._wallStyle_visible,
        wallStyle_invisible: this._wallStyle_invisible
    };

    this.selectedStyle = {
        roofStyle: this._roofStyle_selected,
        baseStyle: this._baseStyle_selected,
        wallStyle_visible: this._wallStyle_visible_selected,
        wallStyle_invisible: this._wallStyle_invisible_selected
    };

    this.perspectiveStyle = {
        roofStyle: this._roofStyle_perspective,
        baseStyle: this._baseStyle_perspective,
        wallStyle_visible: this._wallStyle_visible_perspective,
        wallStyle_invisible: this._wallStyle_invisible_perspective
    };


    this._building = new L.FeatureGroup();

    this.displayMode = "surface";  //surface、floor、perspective
    this.enablePerspective = false;

    this.surfaceOptions = {
        visibleWall: true,
        notVisibleWall: false,
        base: false,
        roof: true
    };

    this.redraw();
}

Building3DPart.prototype._drawRoof = function (style) {
    if (!(this.latLngs instanceof Array)) {
        return;
    }

    style = style || this.normalStyle;

    var roofLatLngs = new Array(this.latLngs.length), i;

    for (i = 0; i < this.latLngs.length; i++) {
        roofLatLngs[i] = PerspectiveTransform.TransformLatlng(this.latLngs[i], this.height, this.camera);
    }

    this.roofLatLngs = roofLatLngs;

    if (!this.roof) {
        //this.roof = new L.Polygon(this.roofLatLngs, this.roofStyle);
        this.roof = new BuildingPolygon(this.roofLatLngs, style.roofStyle);
    } else {
        this.roof.setLatLngs(this.roofLatLngs);
        this.roof.setStyle(style.roofStyle);
    }
}

Building3DPart.prototype._drawWall = function (style) {
    if (!(this.latLngs instanceof Array)) {
        return;
    }

    style = style || this.normalStyle;

    if ((this.latLngs.length == this.roofLatLngs.length) && this.latLngs.length >= 3) {
        for (i = 1; i <= this.latLngs.length; i++) {
            var wallLatlngArray = [];

            if (i == this.latLngs.length) {
                wallLatlngArray = [this.latLngs[i - 1], this.latLngs[0], this.roofLatLngs[0], this.roofLatLngs[i - 1]];
            } else {
                wallLatlngArray = [this.latLngs[i - 1], this.latLngs[i], this.roofLatLngs[i], this.roofLatLngs[i - 1]];
            }

            //判断此面墙壁是否可见，并标记到this.wallVisibility。多边形坐标沿逆时针方向为正方向
            this.wallVisibility[i - 1] = this._wallIsVisible(wallLatlngArray[0], wallLatlngArray[1], [this.camera.y, this.camera.x]);
            var wallStyle = this.wallVisibility[i - 1] ? style.wallStyle_visible : style.wallStyle_invisible;

            if (!this.walls[i - 1]) {
                if (wallLatlngArray[1][0] - wallLatlngArray[0][0] > 0 && wallLatlngArray[1][1] - wallLatlngArray[0][1] > 0) {
                    wallStyle.fillColor = this.wallColor[0];
                } else {
                    wallStyle.fillColor = this.wallColor[1];
                }

                //this.walls[i - 1] = new L.Polygon(wallLatlngArray, this.wallStyle);
                this.walls[i - 1] = new BuildingPolygon(wallLatlngArray, wallStyle);
            } else {
                this.walls[i - 1].setLatLngs(wallLatlngArray);
                this.walls[i - 1].setStyle(wallStyle);
            }
        }
    }
}

//判断墙壁是否可见
Building3DPart.prototype._wallIsVisible = function (fromPoint, toPoint, viewpoint) {
    return Util.pointOnRight(fromPoint, toPoint, viewpoint) < 0;

}

//将基底、屋顶与墙壁组合成建筑
Building3DPart.prototype._compose = function (options, style) {
    this._composeBase(options, style);
    this._composeInvisibleWall(options, style);
    this._composeVisibleWall(options, style);
    this._composeRoof(options, style);
}

Building3DPart.prototype._composeBase = function (options, style) {
    if (this.base) {
        if (options.base) {
            if (!this._building.hasLayer(this.base)) {
                this._building.addLayer(this.base);
            }
        } else {
            if (this._building.hasLayer(this.base)) {
                this._building.removeLayer(this.base);
            }
        }

        this.base.setStyle(style.baseStyle);
    }
}

Building3DPart.prototype._composeVisibleWall = function (options, style) {
    var loop;

    for (loop = 0; loop < this.walls.length; loop++) {
        if (this.wallVisibility[loop] && this.walls[loop]) {
            if (options.visibleWall) {
                if (!this._building.hasLayer(this.walls[loop])) {
                    this._building.addLayer(this.walls[loop]);
                }
            } else {
                if (this._building.hasLayer(this.walls[loop])) {
                    this._building.removeLayer(this.walls[loop]);
                }
            }
        }
    }
}

Building3DPart.prototype._composeInvisibleWall = function (options, style) {
    var loop;

    for (loop = 0; loop < this.walls.length; loop++) {
        if (!this.wallVisibility[loop] && this.walls[loop]) {
            if (options.notVisibleWall) {
                if (!this._building.hasLayer(this.walls[loop])) {
                    this._building.addLayer(this.walls[loop]);
                }
            } else {
                if (this._building.hasLayer(this.walls[loop])) {
                    this._building.removeLayer(this.walls[loop]);
                }
            }
        }
    }
}

Building3DPart.prototype._composeRoof = function (options, style) {
    if (this.roof) {
        if (options.roof) {
            if (!this._building.hasLayer(this.roof)) {
                this._building.addLayer(this.roof);
            }
        } else {
            if (this._building.hasLayer(this.roof)) {
                this._building.removeLayer(this.roof);
            }
        }
    }
}

//重绘建筑外轮廓
Building3DPart.prototype.drawSurface = function (options, style) {
    style = style || this.normalStyle;
    options = options || this.surfaceOptions;
    this._drawRoof(style);
    this._drawWall(style);
    this._compose(options, style);

//    if (this.roof) {
//        this.roof.setStyle(this.roofStyle);
//    }
}

//改变相机位置
Building3DPart.prototype.changeCamera = function (camera) {
    if (camera) {
        this.camera = camera;
    }

    this.redraw();
}

//获取房屋基底的可见顶点
Building3DPart.prototype.getVisibleBasePoint = function () {
    var loop, points = [], length = 0, curStartPoint, curEndPoint;

    for (loop = 0; loop < this.walls.length; loop++) {
        if (this.wallVisibility[loop] && this.walls[loop]) {
            var wallLatlngs = this.walls[loop].getLatLngs();
            curStartPoint = [wallLatlngs[0].lat, wallLatlngs[0].lng];
            curEndPoint = [wallLatlngs[1].lat, wallLatlngs[1].lng];

            if (length > 0) {
                if (Math.abs(curStartPoint[0] - points[length - 1][0]) > Util.tolerance
                        || Math.abs(curStartPoint[1] - points[length - 1][1]) > Util.tolerance) {
                    points.push(curStartPoint);
                    //length++;
                }

                //if (curEndPoint != points[0]) {
                if (Math.abs(curEndPoint[0] - points[0][0]) > Util.tolerance
                        || Math.abs(curEndPoint[1] - points[0][1]) > Util.tolerance) {
                    points.push(curEndPoint);
                    //length++;
                }
            } else {
                points.push(curStartPoint);
                points.push(curEndPoint);
                length += 2;
            }
        }
    }

    return points;
}

//获取房屋基底的可见边
Building3DPart.prototype.getVisibleBaseLine = function () {
    var loop, lines = [];

    for (loop = 0; loop < this.walls.length; loop++) {
        if (this.wallVisibility[loop] && this.walls[loop]) {
            var wallLatlngs = this.walls[loop].getLatLngs();
            lines.push([
                [wallLatlngs[0].lat, wallLatlngs[0].lng],
                [wallLatlngs[1].lat, wallLatlngs[1].lng]
            ]);
        }
    }

    return lines;
}

//获取房屋基底的不可见边
Building3DPart.prototype.getNotVisibleBaseLine = function () {
    var loop, lines = [];

    for (loop = 0; loop < this.walls.length; loop++) {
        if (!this.wallVisibility[loop] && this.walls[loop]) {
            var wallLatlngs = this.walls[loop].getLatLngs();
            lines.push([
                [wallLatlngs[0].lat, wallLatlngs[0].lng],
                [wallLatlngs[1].lat, wallLatlngs[1].lng]
            ]);
        }
    }

    return lines;
}

Building3DPart.prototype.getBuildingObj = function () {
    return this._building;
}

Building3DPart.prototype.setZIndex = function (index) {
    var offset = 0;

    if (index == 0 || Util.isNumber(index)) {
        index = parseInt(index);

        this.baseZIndex = index;

        if (this.displayMode == "surface") {
            if (this.surfaceOptions.base) {
                this.base.setZIndex(this.baseZIndex + offset++);
            }

            var i = 0;

            for (i = 0; i < this.walls.length; i++) {
                if (this.walls[i]) {
                    if (this.wallVisibility[i] && this.surfaceOptions.visibleWall) {
                        this.walls[i].setZIndex(this.baseZIndex + offset++);
                    } else if (!this.wallVisibility[i] && this.surfaceOptions.notVisibleWall) {
                        this.walls[i].setZIndex(this.baseZIndex + offset++);
                    }
                }
            }

            if (this.surfaceOptions.roof) {
                this.roof.setZIndex(this.baseZIndex + offset++);
            }
        } else if (this.displayMode == "floor") {
            var i = 0, floorOffset = 0;

            for (i = 0; i < this.floors.length; i++) {
                floorOffset = this.floors[i].setZIndex(this.baseZIndex + offset);
                offset += floorOffset;
            }
        } else if (this.displayMode == "perspective") {
            //楼基
            if (this.surfaceOptions.base) {
                this.base.setZIndex(this.baseZIndex + offset++);
            }

            var i = 0, floorOffset = 0;

            //不可见墙壁
            for (i = 0; i < this.walls.length; i++) {
                if (this.walls[i]) {
                    if (!this.wallVisibility[i] && this.surfaceOptions.notVisibleWall) {
                        this.walls[i].setZIndex(this.baseZIndex + offset++);
                    }
                }
            }

            //楼层详情
            for (i = 0; i < this.floorsShowing.length; i++) {
                floorOffset = this.floorsShowing[i].floorObj.setZIndex(this.baseZIndex + offset);
                offset += floorOffset;
            }

            //可见墙壁
            for (i = 0; i < this.walls.length; i++) {
                if (this.walls[i]) {
                    if (this.wallVisibility[i] && this.surfaceOptions.visibleWall) {
                        this.walls[i].setZIndex(this.baseZIndex + offset++);
                    }
                }
            }

            //屋顶
            if (this.surfaceOptions.roof) {
                this.roof.setZIndex(this.baseZIndex + offset++);
            }
        }
    }

    return offset;
}

Building3DPart.prototype.getBuildingBase = function () {
    var bounds = this.baseBounds;
    var dx_east = bounds.getEast() - this.camera.x;
    dx_east = Math.abs(dx_east) < Util.tolerance ? 0 : dx_east;

    var dx_west = bounds.getWest() - this.camera.x;
    dx_west = Math.abs(dx_west) < Util.tolerance ? 0 : dx_west;

    var dy_south = bounds.getSouth() - this.camera.y;
    dy_south = Math.abs(dy_south) < Util.tolerance ? 0 : dy_south;

    var dy_north = bounds.getNorth() - this.camera.y;
    dy_north = Math.abs(dy_north) < Util.tolerance ? 0 : dy_north;

    var dx = (dx_west >= 0 && dx_east > 0) ? dx_west : ((dx_west < 0 && dx_east <= 0) ? dx_east : 0);
    var dy = (dy_south >= 0 && dy_north > 0) ? dy_south : ((dy_south < 0 && dy_north <= 0) ? dy_north : 0);

    return {
        bounds: bounds,
        dx: dx,
        dy: dy,
        dx_east: dx_east,
        dx_west: dx_west,
        dy_south: dy_south,
        dy_north: dy_north,
        camera: this.camera,
        latLngs: this.latLngs,
        baseObj: this
    };

}

Building3DPart.prototype.select = function () {
    if (this.displayMode == "perspective") {
        return;
    }
    //this.displayMode = "floor";
    this.displayMode = "surface";
    this.selected = true;
    this.redraw();

}

Building3DPart.prototype.unselect = function () {
    var floors = this.getFloors();
    this.selected = false;
    var i = 0;

    for (i = 0; i < floors.length; i++) {
        floors[i].showSurface();
        floors[i].unselect();
    }

    this.displayMode = "surface";
    this.redraw();
}

Building3DPart.prototype.on = function (event, func, scope) {
    var i = 0;

    for (i = 0; i < this.walls.length; i++) {
        if (this.walls[i]) {
            this.walls[i].on(event, func, scope);
        }
    }

    this.roof.on(event, func, scope);
}
//function Building3DFloor(buingdingBase, floorLevel, minFloorHeight, floorHeight, camera, options) {
Building3DPart.prototype._initFloors = function () {
    var i = 0;

    for (i = 0; i < this.floorLevels; i++) {
        this.floors[i] = new Building3DFloor(this.latLngs, i + 1, i * this.floorHeight, this.floorHeight, this.camera);
    }
}

Building3DPart.prototype.getFloors = function () {
    if (this.floors.length == 0) {
        this._initFloors();
    }

    return this.floors;
}

Building3DPart.prototype.getFloor = function (floorIndex) {
    var floors = this.getFloors();

    return floors[floorIndex - 1];
}

//显示指定楼层
Building3DPart.prototype.showFloors = function (floorsIndex4show) {
    this.floorsIndex4show = floorsIndex4show || [];
    this.displayMode = "perspective";
    this.redraw();
}

//显示所有楼层
Building3DPart.prototype.showAllFloors = function () {
    this.clear();
    this.drawAllFloors();

    //显示屋顶
    this._drawRoof();

    if (this.roof) {
        if (!this._building.hasLayer(this.roof)) {
            this._building.addLayer(this.roof);
        }

        //this.roof.setStyle({ fillOpacity: 0.3 });
    }
}

//
Building3DPart.prototype.drawAllFloors = function () {
    var floors = this.getFloors();

    var i = 0, thisObj = this;

    for (i = 0; i < floors.length; i++) {
        floors[i].camera = this.camera;
        floors[i].showSurface();
        var floorObj = floors[i].getFloorObj();

        if (!this._building.hasLayer(floorObj)) {
            this._building.addLayer(floorObj);

            function  _floorClick(obj) {
                var k;

                for (k = 0; k < floors.length; k++) {
                    floors[k].unselect();
                }

                if (thisObj.enablePerspective) {
                    FloorPerspectiveControl.Instance.showBuilding(thisObj);
                    FloorPerspectiveControl.Instance.select(obj.floorLevel);
                    //thisObj.showFloors(obj.floorLevel);
                }

                if (thisObj.onFloorClick) {
                    thisObj.onFloorClick(obj);
                }
            }

            floors[i].enableClick(_floorClick);
        }
    }
}

Building3DPart.prototype.onFloorClick = function (floor) {
    
}

//显示建筑外观（不显示楼层）
Building3DPart.prototype.showSurface = function () {
    this.clear();

    this.surfaceOptions = {
        visibleWall: true,
        notVisibleWall: false,
        base: false,
        roof: true
    };

    var style = this.selected ? this.selectedStyle : this.normalStyle;

    this.drawSurface(this.surfaceOptions, style);
}

//显示建筑外观透视图（显示指定楼层的详细分布图）
Building3DPart.prototype.showPerspective = function (floorsIndex4show) {
    if (!this.enablePerspective) {
        return;
    }

    this.clear();

    //显示建筑外轮廓
    this.surfaceOptions = {
        visibleWall: false,
        notVisibleWall: true,
        base: true,
        roof: false
    };

    //this.drawSurface(this.surfaceOptions, this.perspectiveStyle);
    var style = this.perspectiveStyle;
    var options = this.surfaceOptions;
    this._drawRoof(style);
    this._drawWall(style);

    this._composeBase(options, style);
    this._composeInvisibleWall(options, style);

    //显示指定楼层详细分布图
    floorsIndex4show = floorsIndex4show || this.floorsIndex4show || [1];

    if (!(floorsIndex4show instanceof Array)) {
        floorsIndex4show = [floorsIndex4show];
    }

    this.floorsIndex4show = floorsIndex4show;
    var i = 0, curFloorIndex, curFloor, floorCount = this.floorLevels, floors = this.getFloors();
    this.floorsShowing = [];

    for (; i < floorsIndex4show.length; i++) {
        curFloorIndex = floorsIndex4show[i];

        if (!Util.isNumber(curFloorIndex)) {
            continue;
        }

        curFloorIndex = curFloorIndex < 1 ? 1 : (curFloorIndex > floorCount ? floorCount : curFloorIndex);
        curFloor = floors[curFloorIndex - 1];
        curFloor.showPerspecive();
        curFloor.select();

        var floorObj = curFloor.getFloorObj();

        if (!this._building.hasLayer(floorObj)) {
            this._building.addLayer(floorObj);
        }

        this.floorsShowing.push({ index: curFloorIndex, floorObj: curFloor });
    }

    //按楼层顺序排序
    this.floorsShowing.sort(function (a, b) {
        return a.index - b.index;
    });


    this._composeVisibleWall(options, style);
    this._composeRoof(options, style);
}

Building3DPart.prototype.clear = function () {
    this._building.clearLayers();
    //this.floorsShowing = [];
    //this.floorsIndex4show = [];
}

Building3DPart.prototype.redraw = function (displayMode) {
    if (displayMode) {
        if (displayMode != "surface" && displayMode != "floor" && displayMode != "perspective") {
            return;
        } else if (displayMode == this.displayMode) {
            return;
        } else {
            this.displayMode = displayMode;
        }
    }

    if (!this.enablePerspective && this.displayMode == "perspective") {
        this.displayMode = "floor";
    }

    if (this.displayMode == "surface") {
        this.showSurface();
    } else if (this.displayMode == "perspective") {
        this.showPerspective();
    } else if (this.displayMode == "floor") {
        this.showAllFloors();
    }
}

Building3DPart.prototype.getBbox = function () {
    //var baseBounds = Util.getBounds(this.latLngs);
    var baseBounds = this.baseBounds;
    var roofBounds = this.roof.getBounds();
    var buildingBounds = Util.getBounds([
        [baseBounds.getSouth(), baseBounds.getWest()],
        [baseBounds.getNorth(), baseBounds.getEast()],
        [roofBounds.getSouth(), roofBounds.getWest()],
        [roofBounds.getNorth(), roofBounds.getEast()]
        ]);

    return buildingBounds;
}

Building3DPart.prototype.getBaseBbox = function () {
    //var baseBounds = Util.getBounds(this.latLngs);
    var baseBounds = this.baseBounds;
    var buildingBounds = Util.getBounds([
        [baseBounds.getSouth(), baseBounds.getWest()],
        [baseBounds.getNorth(), baseBounds.getEast()]
        ]);

    return buildingBounds;
}