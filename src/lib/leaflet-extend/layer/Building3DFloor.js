/**
 * ceiling:[[,],[,],[,]]
 * floor:[[,],[,],[,]]
 * walls:[[[,],[,],[,],[,]], [[,],[,],[,],[,]]]
 *
 */
function Building3DFloor(buingdingBaseLatLngs, floorLevel, minFloorHeight, floorHeight, camera, options) {
    this.buingdingBaseLatLngs = buingdingBaseLatLngs;   //建筑基底坐标
    this.floorLevel = floorLevel;   //楼层数
    this.minFloorHeight = minFloorHeight;   //地板相对于整个建筑基底的高
    this.floorHeight = floorHeight;   //楼层高
    this.camera = camera;

    this._ceiling = null;  //天花板对象(L.Polygon)
    this._ceilingLatLngs = [];  //天花板坐标
    this._floorBase = null; //地板对象(L.Polygon)
    this._floorBaseLatLngs = []; //地板坐标
    this._walls = [];      //墙壁坐标
    this._wallVisibility = [];    //墙壁可见性
    this._wallColor = ['#888', '#aaa'];
    this._cells = [];
    this._cellShowing = false;
    this._building = new L.FeatureGroup();

    this._baseStyle = { weight: 1, fillColor: MaterialColors.stone, fillOpacity: 1 };
    this._ceilingStyle = { weight: 0, fillColor: MaterialColors.gold, fillOpacity: 0.2 };
    this._wallStyle_visible = { weight: 0, fillColor: MaterialColors.metal, fillOpacity: 1 };
    this._wallStyle_notVisible = { weight: 0, fillColor: MaterialColors.stone, fillOpacity: 1 };
    this._baseStyle_selected = { weight: 0, fillColor: '#f00', fillOpacity: 1 };
    this._ceilingStyle_selected = { weight: 0, fillColor: '#f00', fillOpacity: 0.1 };
    this._wallStyle_visible_selected = { weight: 0, fillColor: '#f00', fillOpacity: 0.5 }; //MaterialColors.silver
    this._wallStyle_notVisible_selected = { weight: 0, fillColor: MaterialColors.stone, fillOpacity: 1 };

    this.normalStyle = {
        ceilingStyle: this._ceilingStyle,
        baseStyle: this._baseStyle,
        wallStyle_visible: this._wallStyle_visible,
        wallStyle_notVisible: this._wallStyle_notVisible
    };

    this.selectedStyle = {
        ceilingStyle: this._ceilingStyle_selected,
        baseStyle: this._baseStyle_selected,
        wallStyle_visible: this._wallStyle_visible_selected,
        wallStyle_notVisible: this._wallStyle_notVisible_selected
    };

    this.baseZIndex = 10000;
    this._selected = false;
    this._clickEnabled = false;

    this.options = {
        visibleWall: true,
        notVisibleWall: false,
        base: true,
        ceiling: true
    };

    this._listenerInitialied = false;
}

/**
 * options = {
     visibleWall:true,
     notVisibleWall: false,
     base: true,
     ceiling: true
   }
 */
Building3DFloor.prototype._draw = function (options) {
    this.options = Util.applyOptions(this.options, options);

    this._drawBase();
    this._drawCeiling();
    this._drawWall();
    this._compose();

    if (!this._listenerInitialied) {
        this.enableMouseOver();
        this.enableMouseOut();
        //this.enablePopup();
        this._listenerInitialied = true;
    }
}

Building3DFloor.prototype._drawBase = function () {
    if (!(this.buingdingBaseLatLngs instanceof Array)) {
        return;
    }

    var baseLatLngs = new Array(this.buingdingBaseLatLngs.length), i;

    for (i = 0; i < this.buingdingBaseLatLngs.length; i++) {
        baseLatLngs[i] = PerspectiveTransform.TransformLatlng(this.buingdingBaseLatLngs[i], this.minFloorHeight, this.camera);
    }

    this._floorBaseLatLngs = baseLatLngs;

    if (!this._floorBase) {
        //this.roof = new L.Polygon(this.roofLatLngs, this.roofStyle);
        //this._floorBase = new BuildingPolygon(this._floorBaseLatLngs, this._baseStyle);
        this._floorBase = new BuildingPolygon(this._floorBaseLatLngs);
    } else {
        this._floorBase.setLatLngs(this._floorBaseLatLngs);
    }

    //this._floorBase.bindPopup("<p>第" + this.floorLevel + "楼</p>");
}

Building3DFloor.prototype._drawCeiling = function () {
    if (!(this.buingdingBaseLatLngs instanceof Array)) {
        return;
    }

    var ceilingLatLngs = new Array(this.buingdingBaseLatLngs.length), i;

    for (i = 0; i < this.buingdingBaseLatLngs.length; i++) {
        ceilingLatLngs[i] = PerspectiveTransform.TransformLatlng(this.buingdingBaseLatLngs[i], this.minFloorHeight + this.floorHeight, this.camera);
    }

    this._ceilingLatLngs = ceilingLatLngs;

    if (!this._ceiling) {
        //this.roof = new L.Polygon(this.roofLatLngs, this.roofStyle);
        this._ceiling = new BuildingPolygon(this._ceilingLatLngs, this._ceilingStyle);
    } else {
        this._ceiling.setLatLngs(this._ceilingLatLngs);
    }
}

Building3DFloor.prototype._drawWall = function () {
    if (!(this.buingdingBaseLatLngs instanceof Array)) {
        return;
    }

    if ((this._floorBaseLatLngs.length == this._ceilingLatLngs.length) && this._floorBaseLatLngs.length >= 3) {
        for (i = 1; i <= this._floorBaseLatLngs.length; i++) {
            var wallLatlngArray = [];

            if (i == this._floorBaseLatLngs.length) {
                wallLatlngArray = [this._floorBaseLatLngs[i - 1], this._floorBaseLatLngs[0],
                this._ceilingLatLngs[0], this._ceilingLatLngs[i - 1]];
            } else {
                wallLatlngArray = [this._floorBaseLatLngs[i - 1], this._floorBaseLatLngs[i],
                this._ceilingLatLngs[i], this._ceilingLatLngs[i - 1]];
            }

            if (!this._walls[i - 1]) {
                if (wallLatlngArray[1][0] - wallLatlngArray[0][0] > 0 && wallLatlngArray[1][1] - wallLatlngArray[0][1] > 0) {
                    this._wallStyle_visible.fillColor = this._wallColor[0];
                } else {
                    this._wallStyle_visible.fillColor = this._wallColor[1];
                }

                //this.walls[i - 1] = new L.Polygon(wallLatlngArray, this.wallStyle);
                this._walls[i - 1] = new BuildingPolygon(wallLatlngArray, this._wallStyle_visible);
            } else {
                this._walls[i - 1].setLatLngs(wallLatlngArray);
            }

            //判断此面墙壁是否可见，并标记到this.wallVisibility。多边形坐标沿逆时针方向为正方向
            this._wallVisibility[i - 1] = this._wallIsVisible(wallLatlngArray[0], wallLatlngArray[1], [this.camera.y, this.camera.x]);
        }
    }
}

Building3DFloor.prototype._wallIsVisible = function (fromPoint, toPoint, viewpoint) {
    return Util.pointOnRight(fromPoint, toPoint, viewpoint) < 0;
}

/*visibleWall:true,
notVisibleWall: false,
base: true,
ceiling: true*/
Building3DFloor.prototype._compose = function () {
    if (this._floorBase) {
        if (this.options.base) {
            if (!this._building.hasLayer(this._floorBase)) {
                this._building.addLayer(this._floorBase);
            }
        } else {
            if (this._building.hasLayer(this._floorBase)) {
                this._building.removeLayer(this._floorBase);
            }
        }
    }

    var loop;

    for (loop = 0; loop < this._walls.length; loop++) {
        if (this._wallVisibility[loop] && this._walls[loop]) {
            if (this.options.visibleWall) {
                if (!this._building.hasLayer(this._walls[loop])) {
                    this._building.addLayer(this._walls[loop]);
                }
            } else {
                if (this._building.hasLayer(this._walls[loop])) {
                    this._building.removeLayer(this._walls[loop]);
                }
            }
        } else if (!this._wallVisibility[loop] && this._walls[loop]) {
            if (this.options.notVisibleWall) {
                if (!this._building.hasLayer(this._walls[loop])) {
                    this._building.addLayer(this._walls[loop]);
                }
            } else {
                if (this._building.hasLayer(this._walls[loop])) {
                    this._building.removeLayer(this._walls[loop]);
                }
            }
        }
    }

    if (this._ceiling) {
        if (this.options.ceiling) {
            if (!this._building.hasLayer(this._ceiling)) {
                this._building.addLayer(this._ceiling);
            }
        } else {
            if (this._building.hasLayer(this._ceiling)) {
                this._building.removeLayer(this._ceiling);
            }
        }
    }
}

Building3DFloor.prototype.setZIndex = function (index) {
    var offset = 0, floorOffset = 0;

    if (index == 0 || Util.isNumber(index)) {
        index = parseInt(index);

        //        if (index != this.baseZIndex) {
        this.baseZIndex = index;
        var i = 0;

        if (this.options.base) {
            this._floorBase.setZIndex(this.baseZIndex + offset++);
        }

        for (i = 0; i < this._walls.length; i++) {
            if (this._walls[i]) {
                //                if (this._wallVisibility[i] && this.options.visibleWall) {
                //                    this._walls[i].setZIndex(this.baseZIndex + offset++);
                //                } else 
                if (!this._wallVisibility[i] && this.options.notVisibleWall) {
                    this._walls[i].setZIndex(this.baseZIndex + offset++);
                }
            }
        }

        if (this._cellShowing) {
            for (i = 0; i < this._cells.length; i++) {
                if (this._cells[i]) {
                    floorOffset = this._cells[i].setZIndex(this.baseZIndex + offset);
                    offset += floorOffset;
                }
            }
        }

        for (i = 0; i < this._walls.length; i++) {
            if (this._walls[i]) {
                if (this._wallVisibility[i] && this.options.visibleWall) {
                    this._walls[i].setZIndex(this.baseZIndex + offset++);
                }
                //                 else if (!this._wallVisibility[i] && this.options.notVisibleWall) {
                //                    this._walls[i].setZIndex(this.baseZIndex + offset++);
                //                }
            }
        }

        if (this.options.ceiling) {
            this._ceiling.setZIndex(this.baseZIndex + offset++);
        }
    }

    return offset;
}

//显示普通外观
Building3DFloor.prototype.showSurface = function () {
    this.hideCells();

    var options = {
        visibleWall: true,
        notVisibleWall: false,
        base: true,
        ceiling: false
    }

    this._draw(options);

    if (this._selected) {
        this._setStyle(this.selectedStyle);
    } else {
        this._setStyle(this.normalStyle);
    }
}

//显示楼层透视效果
Building3DFloor.prototype.showPerspecive = function () {
    var options = {
        visibleWall: false,
        notVisibleWall: true,
        base: true,
        ceiling: false
    }

    this._draw(options);
    this.showCells();
}

//只显示地板
Building3DFloor.prototype.showBase = function () {
    this.hideCells();

    var options = {
        visibleWall: false,
        notVisibleWall: false,
        base: true,
        ceiling: false
    }

    this._draw(options);
    this._setStyle(this.normalStyle);
}

Building3DFloor.prototype._loadCells = function () {
    //this._cells
    var dataOptions = {
        geoProp: 'SHAPE',
        //floorProp: 'FLOOR',
        idProp: 'OBJECTID',
        nameProp: 'OBJECTID'
    }
    var cellData = testCellWktData, i, cellLatLngs, cellProperties, thisObj = this;

    for (i = 0; i < cellData.length; i++) {
        cellLatLngs = this._getCellLatLngs(cellData[i], dataOptions, "wkt");
        cellProperties = this._getCellProperties(cellData[i], dataOptions);

        this._cells[i] = new Building3DCell(cellLatLngs, cellProperties, this.floorLevel, this.minFloorHeight, this.floorHeight, this.camera);

        this._cells[i].enableClick(function (obj) {
            var k;

            for (k = 0; k < thisObj._cells.length; k++) {
                thisObj._cells[k].unselect();
            }
        });
    }
}

//提取建筑物坐标值
Building3DFloor.prototype._getCellLatLngs = function (data, options, format) {
    if (!options) {
        return;
    }

    if (!options.geoProp) {
        return;
    }

    var latLngs = data[options.geoProp];
//    latLngs = Util.translateDataFormat(latLngs, format);

//    if (latLngs instanceof Array) {
//        return latLngs;
//    } else {
//        return;
    //    }

    return Util.translateDataFormat(latLngs, format);
}

//提取户的属性信息
Building3DFloor.prototype._getCellProperties = function (data, options) {
    if (!options) {
        return;
    }

    var prop, properties = {};

    for (prop in data) {
        if (prop != options['geoProp']) {
            properties[prop] = data[prop];
        }
    }

    return properties;
}

Building3DFloor.prototype.showCells = function () {
    if (this._cells.length <= 0) {
        this._loadCells();
    }

    var thisObj = this;
    this._cellShowing = true;
    var i = 0, cellObj;

    for (; i < this._cells.length; i++) {
        this._cells[i].showPlane();
        cellObj = this._cells[i].getCellObj();

        if (!this._building.hasLayer(cellObj)) {
            this._building.addLayer(cellObj);
        }
    }
}

Building3DFloor.prototype.hideCells = function () {
    var i = 0, cellObj;
    this._cellShowing = false;

    for (; i < this._cells.length; i++) {
        cellObj = this._cells[i].getCellObj();

        if (this._building.hasLayer(cellObj)) {
            this._building.removeLayer(cellObj);
        }
    }
}

Building3DFloor.prototype._onMouseOver = function () {
    if (this._selected) {
        return;
    }

    this._setStyle(this.selectedStyle);
}

Building3DFloor.prototype._onMouseOut = function () {
    if (this._selected) {
        return;
    }

    this._setStyle(this.normalStyle);
}

Building3DFloor.prototype._onClick = function () {
    this.select();
}

Building3DFloor.prototype.select = function () {
    if (this._selected) {
        return;
    }

    this._selected = true;
    this._setStyle(this.selectedStyle);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
}

Building3DFloor.prototype.unselect = function () {
    if (!this._selected) {
        return;
    }

    this._selected = false;
    this._setStyle(this.normalStyle);
}

Building3DFloor.prototype._setStyle = function (style) {
    if (!style) {
        return;
    }

    this._ceiling.setStyle(style.ceilingStyle);
    this._floorBase.setStyle(style.baseStyle);
    var i = 0;

    for (i = 0; i < this._walls.length; i++) {
        if (this._walls[i]) {
            if (this._wallVisibility[i]) {
                this._walls[i].setStyle(style.wallStyle_visible);
            } else if (!this._wallVisibility[i]) {
                this._walls[i].setStyle(style.wallStyle_notVisible);
            }
        }
    }
}

Building3DFloor.prototype.enableClick = function (func) {
    if (this._clickEnabled) {
        return;
    }

    var thisObj = this;
    var onClick = function () {
        try {
            if (func) {
                func(thisObj);
            }
        } catch (e) { }

        thisObj._onClick();
        //thisObj._floorBase.openPopup();
        //thisObj.enablePopup();
    }

    var i = 0;

    for (i = 0; i < this._walls.length; i++) {
        this._walls[i].on("click", onClick);
    }

    this._clickEnabled = true;
    //    this._floorBase.on("click", function () {
    //        thisObj._floorBase.openPopup();
    //    });
}

Building3DFloor.prototype.enableMouseOver = function () {
    var i = 0;

    for (i = 0; i < this._walls.length; i++) {
        this._walls[i].on("mouseover", this._onMouseOver, this);
    }
}

Building3DFloor.prototype.enableMouseOut = function () {
    var i = 0;

    for (i = 0; i < this._walls.length; i++) {
        this._walls[i].on("mouseout", this._onMouseOut, this);
    }
}

Building3DFloor.prototype.enablePopup = function () {
    this._floorBase.bindPopup("<p>第" + this.floorLevel + "楼</p>");
}

Building3DFloor.prototype.getFloorObj = function () {
    return this._building;
}

Building3DFloor.prototype.getBounds = function () {
    var bbox = this._floorBase.getBounds();

    return [
        [bbox.getSouth(), bbox.getWest()],
        [bbox.getNorth(), bbox.getEast()]
        ];
}