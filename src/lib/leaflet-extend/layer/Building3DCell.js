//latLngs: {type:"Polygon", coords:[[],[]]}
Building3DCell = function (latLngs, properties, floorLevel, minFloorHeight, floorHeight, camera) {
    this.latLngs = latLngs;
    this.properties = properties;
    this._cellBaseLatLngs = [];
    this._cellBase;
    this.floorLevel = floorLevel;
    this.minFloorHeight = minFloorHeight;
    this.floorHeight = floorHeight;   //楼层高
    this.camera = camera;
    this.baseZIndex = 10000;
    this._building = new L.FeatureGroup();
    this._selected = false;
    this.buttonArray = [];

    this.normalStyle = {
        ceilingStyle: { weight: 0, fillColor: MaterialColors.gold, fillOpacity: 0.2 },
        baseStyle: { weight: 1, fillColor: '#0f0', fillOpacity: 1 },
        wallStyle: { weight: 0, fillColor: MaterialColors.metal, fillOpacity: 1 }
    };

    this.selectedStyle = {
        ceilingStyle: { weight: 0, fillColor: '#f80', fillOpacity: 0.1 },
        baseStyle: { weight: 1, fillColor: '#f80', fillOpacity: 1 },
        wallStyle: { weight: 0, fillColor: '#f40', fillOpacity: 0.5 }
    };

    this.options = {
        visibleWall: true,
        invisibleWall: false,
        base: true,
        ceiling: true
    };

    this.showPlane();
}

Building3DCell.prototype._drawBase = function () {
    if (!(this.latLngs.coords instanceof Array)) {
        return;
    }

    var baseLatLngs = new Array(this.latLngs.coords.length), i, j;

    for (i = 0; i < this.latLngs.coords.length; i++) {
        if (this.latLngs.type === "Polygon") {
            baseLatLngs[i] = PerspectiveTransform.TransformLatlng(this.latLngs.coords[i], this.minFloorHeight, this.camera);
        } else if (this.latLngs.type === "MultiPolygon") {
            baseLatLngs[i] = [];

            for (j = 0; j < this.latLngs.coords[i].length; j++) {
                baseLatLngs[i][j] = PerspectiveTransform.TransformLatlng(this.latLngs.coords[i][j], this.minFloorHeight, this.camera);
            }
        }
    }

    this._cellBaseLatLngs = baseLatLngs;

    if (!this._cellBase) {
        if (this.latLngs.type === "Polygon") {
            this._cellBase = new BuildingPolygon(this._cellBaseLatLngs);
        } else if (this.latLngs.type === "MultiPolygon") {
            this._cellBase = new BuildingMultiPolygon(this._cellBaseLatLngs);
        }
    } else {
        this._cellBase.setLatLngs(this._cellBaseLatLngs);
    }
}

Building3DCell.prototype._compose = function () {
    if (this._cellBase) {
        if (this.options.base) {
            if (!this._building.hasLayer(this._cellBase)) {
                this._building.addLayer(this._cellBase);
            }
        } else {
            if (this._building.hasLayer(this._cellBase)) {
                this._building.removeLayer(this._cellBase);
            }
        }
    }

//    var loop;

//    for (loop = 0; loop < this._walls.length; loop++) {
//        if (this._wallVisibility[loop] && this._walls[loop]) {
//            if (this.options.visibleWall) {
//                if (!this._building.hasLayer(this._walls[loop])) {
//                    this._building.addLayer(this._walls[loop]);
//                }
//            } else {
//                if (this._building.hasLayer(this._walls[loop])) {
//                    this._building.removeLayer(this._walls[loop]);
//                }
//            }
//        } else if (!this._wallVisibility[loop] && this._walls[loop]) {
    //            if (this.options.invisibleWall) {
//                if (!this._building.hasLayer(this._walls[loop])) {
//                    this._building.addLayer(this._walls[loop]);
//                }
//            } else {
//                if (this._building.hasLayer(this._walls[loop])) {
//                    this._building.removeLayer(this._walls[loop]);
//                }
//            }
//        }
//    }

//    if (this._ceiling) {
//        if (this.options.ceiling) {
//            if (!this._building.hasLayer(this._ceiling)) {
//                this._building.addLayer(this._ceiling);
//            }
//        } else {
//            if (this._building.hasLayer(this._ceiling)) {
//                this._building.removeLayer(this._ceiling);
//            }
//        }
//    }
}

Building3DCell.prototype._draw = function (options) {
    this.options = Util.applyOptions(this.options, options);

    this._drawBase();
//    this._drawCeiling();
//    this._drawWall();
    this._compose();

//    if (!this._listenerInitialied) {
//        this.enableMouseOver();
//        this.enableMouseOut();
//        this.enablePopup();
//        this._listenerInitialied = true;
//    }
}
Building3DCell.prototype._setStyle = function (style) {
    if (!style) {
        return;
    }

    //this._ceiling.setStyle(style.ceilingStyle);
    this._cellBase.setStyle(style.baseStyle);
//    var i = 0;

//    for (i = 0; i < this._walls.length; i++) {
//        if (this._walls[i]) {
//            if (this._wallVisibility[i]) {
//                this._walls[i].setStyle(style.wallStyle_visible);
//            } else if (!this._wallVisibility[i]) {
//                this._walls[i].setStyle(style.wallStyle_notVisible);
//            }
//        }
//    }
}


Building3DCell.prototype.showPlane = function () {
    var options = {
        visibleWall: false,
        invisibleWall: false,
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

Building3DCell.prototype.setZIndex = function (index) {
    var offset = 0;

    if (index == 0 || Util.isNumber(index)) {
        index = parseInt(index);
        this.baseZIndex = index;
        var i = 0;

        if (this.options.base) {
            this._cellBase.setZIndex(this.baseZIndex + offset++);
        }

//        for (i = 0; i < this._walls.length; i++) {
//            if (this._walls[i]) {
//                if (this._wallVisibility[i] && this.options.visibleWall) {
//                    this._walls[i].setZIndex(this.baseZIndex + offset++);
//                } else if (!this._wallVisibility[i] && this.options.notVisibleWall) {
//                    this._walls[i].setZIndex(this.baseZIndex + offset++);
//                }
//            }
//        }

//        if (this.options.ceiling) {
//            this._ceiling.setZIndex(this.baseZIndex + offset++);
//        }
    }

    return offset;
}

Building3DCell.prototype.getCellObj = function () {
    return this._building;
}

Building3DCell.prototype.enableClick = function (func) {
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

    //    var i = 0;

    //    for (i = 0; i < this._walls.length; i++) {
    //        this._walls[i].on("click", onClick);
    //    }

    //this._cellBase.bindPopup("房间");
    var popupContent = this._getPopupContent(this.properties);
    this._cellBase.bindPopup(popupContent);

    this._cellBase.on("click", onClick);
}

Building3DCell.prototype._getPopupContent = function (properties) {
    //JZWBM,LCBM,SZDY,SZLC,FJH,HX,HMC,HLX,HZP,DABM
    var cellFieldName = {
        JZWBM: '建筑物编码',
        LCBM: '楼层编码',
        SZDY: '单元',
        SZLC: '楼层',
        FJH: '房间号',
        HX: '户型',
        HMC: '户名称',
        HLX: '户类型',
        HZP: '户照片',
        DABM: '档案编码'
    };

    var nameField = "HMC";
    var popupContent = document.createElement("p");
    var prop, hasProperty = false, propContent = "<h2>" + properties[nameField] + "</h2><hr/>";
    propContent += "<table>";

    for (prop in properties) {
        if (!prop) {
            continue;
        }

        propContent += "<tr><td width=50>" + (cellFieldName[prop] || prop) + ":</td><td width=100>" + properties[prop] + "</td></tr>";
        hasProperty = true;
    }

    propContent += "</table>";
    popupContent.innerHTML = propContent;
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

//buttonArray:[{title:'', func:func}]
Building3DCell.prototype.addButton = function (buttonArray) {
    this.buttonArray = buttonArray;

    var popupContent = this._getPopupContent(this.properties);
    this._cellBase.bindPopup(popupContent);
}

Building3DCell.prototype._onClick = function () {
    this.select();
}

Building3DCell.prototype.select = function () {
    this._selected = true;
    var bounds = this._cellBase.getBounds();
    this._cellBase.openPopup(bounds.getCenter());
    this._setStyle(this.selectedStyle);
}

Building3DCell.prototype.unselect = function () {
    this._selected = false;

    if (this._cellBase.closePopup) {
        this._cellBase.closePopup();
    }

    this._setStyle(this.normalStyle);
}