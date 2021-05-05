FloorPerspectiveControl = function (map) {
    this.map = map;
    this.floorPanelContainer; // = L.DomUtil.create('div');
    this.floorClickListener;
    this.floorCellList = [];
    this.building;
    this.options = {
        floorList: {
            width: 50,
            height: 30,
            left: 0
        },
        cellList: {
            width: 50,
            right: 5
        }
    }
}

FloorPerspectiveControl.prototype.addTo = function (map) {
    this.map = map;
}

//building:Building3DPart
FloorPerspectiveControl.prototype.showBuilding = function (building) {
    if (!(building instanceof Building3DPart)) {
        return;
    }

    this._showFloorList(building.floorLevels);

    this.floorClickListener = function (floorIndex) {
        building.showFloors(floorIndex);
    }
}

//选择指定楼层
FloorPerspectiveControl.prototype.select = function (floorIndex) {
    if (this.building) {
        if (floorIndex < 1 || floorIndex > building.floorLevels) {
            return;
        }
    }

    var i = 0;

    for (; i < this.floorCellList.length; i++) {
        if (this.floorCellList[i].floorIndex == floorIndex) {
            this.floorCellList[i].style.backgroundColor = "#ff0000";
        } else {
            this.floorCellList[i].style.backgroundColor = "#f8f8f9";
        }
    }

    if (this.floorClickListener) {
        this.floorClickListener(floorIndex);
    }
}

FloorPerspectiveControl.prototype.hide = function () {
    if (this.floorPanelContainer) {
        this.floorPanelContainer.parentNode.removeChild(this.floorPanelContainer);
        this.floorPanelContainer = null;
        this.floorListPanel = null;
        this.floorClickListener = null;
        this.floorCellList = [];
        this.building = null;
    }
}

//显示楼层列表
FloorPerspectiveControl.prototype._showFloorList = function (floorCount) {
    if (this.map) {
        var MapContainerElem = this.map.map.getContainer();
        var mcTop = MapContainerElem.offsetTop > 0 ? MapContainerElem.offsetTop : MapContainerElem.scrollTop;
        var mcLeft = MapContainerElem.offsetLeft > 0 ? MapContainerElem.offsetLeft : MapContainerElem.scrollLeft;
        var mcHeight = MapContainerElem.offsetHeight > 0 ? MapContainerElem.offsetHeight : MapContainerElem.scrollHeight;

        if (!this.floorPanelContainer) {
            this.floorPanelContainer = L.DomUtil.create('div', "floorperspectivecontrol_floorlist", MapContainerElem);
            this.floorPanelContainer.style.width = this.options.floorList.width + "px";
            //this.floorPanelContainer.style.height = mcHeight ? (mcHeight + "px") : (this.options.floorList.height + "px");
            this.floorPanelContainer.style.top = '250px';
            this.floorPanelContainer.style.height = mcHeight ? ((mcHeight - 250) + "px") : ((this.options.floorList.height - 250) + "px");
            this.floorPanelContainer.style.zIndex = 10000;
            this.floorPanelContainer.style.position = "absolute";
            this.floorPanelContainer.autoScroll = true;
        } else {
            this.floorPanelContainer.style.display = "block";
        }

        if (!this.floorListPanel) {
            this.floorListPanel = L.DomUtil.create('div', "", this.floorPanelContainer);
            this.floorListPanel.style.width = this.floorPanelContainer.width + "px";
        } else {
            this.floorListPanel.style.width = this.floorPanelContainer.width + "px";
            this.floorListPanel.innerHTML = "";
        }

        var i = 0, thisObj = this;
        this.floorCellList = new Array(floorCount);

        for (; i < floorCount; i++) {
            this._createFloorCell(this.floorListPanel, floorCount, i + 1);
        }
    }
}

FloorPerspectiveControl.prototype._createFloorCell = function (container, floorCount, floorIndex) {
    var floorCell = L.DomUtil.create('div', "floorperspectivecontrol_cell", container);
    floorCell.style.width = container.width + "px";
    floorCell.style.lineHeight = floorCell.style.height = "15px";
    floorCell.innerHTML = "<p style='margin-top: 2px;margin-bottom:2px;'>" + (floorCount - floorIndex + 1) + "</p>";
    floorCell.floorIndex = floorCount - floorIndex + 1;
    this.floorCellList[floorIndex - 1] = floorCell;
    var thisObj = this;

    L.DomEvent.addListener(floorCell, "click", function (e) {
        var target = e.currentTarget || e.target;

        if (target == floorCell) {
            //thisObj._floorClick(target);
            thisObj.select(target.floorIndex);
        }
    });
}

////楼层div单击响应
//FloorPerspectiveControl.prototype._floorClick = function (element) {
//    var i = 0;

//    for (; i < this.floorCellList.length; i++) {
//        if (this.floorCellList[i] == element) {
//            this.floorCellList[i].style.backgroundColor = "#ff0000";
//        } else {
//            this.floorCellList[i].style.backgroundColor = "#f8f8f9";
//        }
//    }

//    if (this.floorClickListener) {
//        this.floorClickListener(element.floorIndex);
//    }
//}

FloorPerspectiveControl.Instance = new FloorPerspectiveControl();