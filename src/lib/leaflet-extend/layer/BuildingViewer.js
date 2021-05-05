BuildingViewer = function (buildingContainerDiv, floorContainerDiv, tableDiv) {
    
}

/*****************************************************************************************************/

BuildingFaceViewer = function (containerDiv) {
    var containerObj = document.getElementById(containerDiv);

    if (!containerObj) {
        return;
    }

    //    containerObj.innerHTML = "";

    this.map = new Map(containerDiv, { zoomSlider: { type: 'false'} });
    this.map.changeViewAngle(20);
    this.buildingContainer = new L.LayerGroup();
    this.map.addLayer(this.buildingContainer);

    this.camera = new Camera();
    this.camera.viewDistance *= 0.5;
    this.camera.setMap(this.map);

    this.map.on("viewreset", this._onMapViewReset, this);
    this.map.on("move", this._onMapViewReset, this);

    if (!BuildingFaceViewer.Instance) {
        BuildingFaceViewer.Instance = this;
    }

    this.selectedFloorIndex;
    this.selectedFloor;
}

BuildingFaceViewer.prototype._onMapViewReset = function (baseLatLngs, properties, buildingOptions) {
    var tempCamera = this.camera.getFitCamera();

    if (this.building) {
        this.building.changeCamera(tempCamera);
        this.building.showFloors();
    }
}

BuildingFaceViewer.prototype.showBuilding = function (baseLatLngs, properties, propValues, buildingOptions) {
    this.buildingContainer.clearLayers();
    var baseBounds = Util.getBounds(baseLatLngs);

    //this.camera.x = (baseBounds[0][1] + baseBounds[1][1]) * 0.5;
    var camera = this.camera.getFitCamera();
    //camera.x = (baseBounds[0][1] + baseBounds[1][1]) * 0.5;

    this.building = new Building3D(baseLatLngs, properties, propValues, buildingOptions, camera);
    var buildingBounds = this.building.getBounds();
    //    var baseBounds = this.building.getBaseBounds();
    //    var fitBounds = [baseBounds[0], [buildingBounds[1][0], baseBounds[1][1]]];
    this.map.map.fitBounds(buildingBounds);

    var parts = this.building.getBuildingParts();

    for (j = 0; j < parts.length; j++) {
        this.buildingContainer.addLayer(parts[j].getBuildingObj());
    }

    //    camera = this.camera.getFitCamera();
    //    this.building.changeCamera(camera);

    this.building.showFloors();
    var thisObj = this;
    //if   , idProp, nameProp, floorIndexProp, cellNumProp
    var buildingId = "";

    if (buildingOptions.idProp) {
        buildingId = properties[buildingOptions.idProp];
    }

    function floorClick(floor) {
        var floorViewer = BuildingFloorViewer.Instance;

        if (!floorViewer) {
            floorViewer = new BuildingFloorViewer("floor");
        }

        //        this.buingdingBaseLatLngs = buingdingBaseLatLngs;   //建筑基底坐标
        //        this.floorLevel = floorLevel;   //楼层数
        //        this.minFloorHeight = minFloorHeight;   //地板相对于整个建筑基底的高
        //        this.floorHeight = floorHeight;   //楼层高

        //function (baseLatLngs, properties,
        //  buildingOptions, floorIndex, floorBaseHeight, floorCellHeight)
        floorViewer.showFloor(floor.buingdingBaseLatLngs, properties, buildingOptions, floor.floorLevel, floor.minFloorHeight, floor.floorHeight);

        var listViewer = BuildiingCellListViewer.getInstance("cellList");
        listViewer.requestData(buildingId, floor.floorLevel, buildingOptions.idProp, buildingOptions.nameProp, buildingOptions.floorIndexProp, buildingOptions.cellNumProp);

        thisObj.selectedFloorIndex = floor.floorLevel;
    }

    this.building.addFloorClickListener(floorClick);

    if (buildingId !== "" && buildingId) {
        var listViewer = BuildiingCellListViewer.getInstance("cellList");
        var cellParams = {
            idProp: "JZWBM",
            nameProp: "HMC",
            floorIndexProp: "SZLC",
            cellNumProp: "FJH"
        };
        listViewer.requestData(buildingId, null, cellParams.idProp, cellParams.nameProp, cellParams.floorIndexProp, cellParams.cellNumProp);
        listViewer.onSelect = function (rowIndex, rowData, floorIndex, cellNum) {
            //var cellNum = rowData[this.cellNumProp];
            var floorViewer = BuildingFloorViewer.getInstance("floor");
            thisObj.selectFloor(floorIndex, function () {
                floorViewer.selectCell(floorIndex, cellNum);
            });

        }
    }

    $("#employeeWindow").window({ closed: true });
}

BuildingFaceViewer.prototype.selectFloor = function (floorIndex, callback) {
    if (this.selectedFloorIndex == floorIndex) {
        return;
    }

    var floorCollection = this.building.getFloor(floorIndex);
    var floor = floorCollection[0];

    if (this.selectedFloor) {
        this.selectedFloor.unselect();
    }

    this.selectedFloor = floor;
    floor.select();
    var floorViewer = BuildingFloorViewer.getInstance();
    var buildingOptions = this.building.options;
    var properties = this.building.properties;
    floorViewer.showFloor(floor.buingdingBaseLatLngs, properties, buildingOptions, floor.floorLevel, floor.minFloorHeight, floor.floorHeight, callback);
}

BuildingFaceViewer.Instance;

/************************************************************************************************/
BuildingFloorViewer = function (containerDiv) {
    var containerObj = document.getElementById(containerDiv);

    if (!containerObj) {
        return;
    }

    this.map = new Map(containerDiv, {
        zoomSlider: { type: 'false' },
        crs: "epsg4326",
        minZoom: 16,
        maxZoom: 23
    });
    //this.map.changeViewAngle(20);
    this.floorContainer = new L.LayerGroup();
    this.map.addLayer(this.floorContainer);

    this.camera = new Camera();
    this.camera.setMap(this.map);

    if (!BuildingFloorViewer.Instance) {
        BuildingFloorViewer.Instance = this;
    }

    this.dataLoader = new BuildingDataLoader();
    this._cells = [];
    this.floor;
    this.floorIndex;
    this.cellMapping = {};
    this.buildingOptions;
}

BuildingFloorViewer.prototype.showFloor = function (baseLatLngs, buildingProperties,
        buildingOptions, floorIndex, floorBaseHeight, floorCellHeight, callback) {
    this.floorContainer.clearLayers();

    this.floor = new Building3DFloor(baseLatLngs, 0, 0, floorCellHeight, this.camera);
    this.floor.showBase();
    this.floorContainer.addLayer(this.floor.getFloorObj());

    var floorBounds = this.floor.getBounds();
    this.map.map.fitBounds(floorBounds);

    this.camera.refresh();

    buildingProperties = buildingProperties || {};
    this.buildingOptions = buildingOptions || {};
    var buildingId = "";

    if (buildingOptions.idProp) {
        buildingId = buildingProperties[buildingOptions.idProp];
    }

    this.loadCellData(buildingId, floorIndex, 0, floorCellHeight, callback);

    //    this.building.select();
}

BuildingFloorViewer.prototype.loadCellData = function (buildingId, floorIndex, floorBaseHeight, floorCellHeight, callback) {
    var thisObj = this;

    this.dataLoader.loadBuildingFloor(buildingId, floorIndex, function (data) {
        var dataOptions = {
            geoProp: 'SHAPE',
            //floorProp: 'FLOOR',
            idProp: 'FJH',
            nameProp: 'HMC'
        }
        var cellData = data, i, cellLatLngs, cellProperties, cellObj, cellId;

        for (i = 0; i < cellData.length; i++) {
            cellLatLngs = thisObj._getCellLatLngs(cellData[i], dataOptions, "wkt");
            cellProperties = thisObj._getCellProperties(cellData[i], dataOptions);
            thisObj._cells[i] = new Building3DCell(cellLatLngs, cellProperties, floorIndex, floorBaseHeight, floorCellHeight, thisObj.camera);
            cellId = cellProperties[dataOptions.idProp];
            thisObj.cellMapping[cellId] = thisObj._cells[i];

            thisObj._cells[i].enableClick(function (obj) {
                var k;

                for (k = 0; k < thisObj._cells.length; k++) {
                    thisObj._cells[k].unselect();
                }
            });

            thisObj._cells[i].addButton([{
                title: "法人信息",
                func: function (properties) {
                    //alert("法人信息");
                    var id = properties["DABM"];

                    if (!id) {
                        alert("无法人信息");
                    } else {
                        //openFarenWindow
                        thisObj.dataLoader.queryFaren(id, thisObj.openFarenWindow, thisObj);
                    }

                }
            }, {
                title: "员工信息",
                func: function (properties) {
                    //alert("员工信息");
                    var id = properties["DABM"];

                    if (!id) {
                        alert("无员工信息");
                    } else {
                        thisObj.dataLoader.queryEmployee(id, thisObj.openEmployeeWindow, thisObj);
                    }
                }
            }]);

            //thisObj._cells[i].showPlane();
            cellObj = thisObj._cells[i].getCellObj();

            if (!thisObj.floorContainer.hasLayer(cellObj)) {
                thisObj.floorContainer.addLayer(cellObj);
            }
        }

        if (callback) {
            callback();
        }
    });
}

BuildingFloorViewer.prototype._getCellLatLngs = function (data, options, format) {
    if (!options) {
        return;
    }

    if (!options.geoProp) {
        return;
    }

    var latLngs = data[options.geoProp];
    latLngs = Util.translateDataFormat(latLngs, format);

    if (latLngs.coords instanceof Array) {
        return latLngs;
    } else {
        return;
    }
}

//提取户的属性信息
BuildingFloorViewer.prototype._getCellProperties = function (data, options) {
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

//选中单元
BuildingFloorViewer.prototype.selectCell = function (floorIndex, cellNum) {
    var cellObj = this.cellMapping[cellNum];

    if (cellObj) {
        cellObj.select();
    }
}

BuildingFloorViewer.prototype.openFarenWindow = function (dataList) {
    if (!(dataList instanceof Array) || dataList.length <= 0) {
        return;
    }

    var data = dataList[0], columns = [], prop, propContent = "<table>";

    for (prop in data) {
        propContent += "<tr><td width=80 style='text-align:left;'>" + prop + ":</td><td width=100 style='text-align:left;'>" + data[prop] + "</td></tr>";
    }

    propContent += "</table>";

    this.farenWindows = $("#farenWindow");
    this.farenWindows.window({
        width: 600,
        height: 400,
        content:propContent,
        title: "法人详细信息",
        modal: true
    }); 

    this.farenWindows.window("open");
}

BuildingFloorViewer.prototype.openEmployeeWindow = function (dataList) {
    if (!(dataList instanceof Array) || dataList.length <= 0) {
        return;
    }

    if (!this.employeeContainerObj) {
        this.employeeWindows = $("#employeeWindow");
        this.employeeWindows.window({
            width: 600,
            height: 450,
            title: '员工信息',
            modal: true
        });
        this.employeeContainerObj = $("#employeeTable");

        var data = dataList[0], columns = [], prop;
        columns.push({ field: 'ck', checkbox: true });

        for (prop in data) {
            columns.push({
                field: prop,
                title: prop,
                width: 80
            });
        }

        //        columns.push({
        //            field: prop,
        //            title: "",
        //            width: 80
        //        });

        this.employeeContainerObj.datagrid({
            //rownumbers: true,
            singleSelect: true,
            toolbar: "#employeeWindow_tb",
            columns: [columns]
        });

        var thisObj = this;

        $("#employeeWindow_a").on("click", function () {
            var selectedRow = thisObj.employeeContainerObj.datagrid("getSelected");
            var id = selectedRow["身份证号"];
            thisObj.dataLoader.queryRenkou(id, thisObj.openRenkouWindow, thisObj);
        });
    }

    var gridData = {
        total: dataList.length,
        rows: dataList
    };
    this.employeeContainerObj.datagrid("loadData", gridData);
    this.employeeWindows.window("open");
}

BuildingFloorViewer.prototype.openRenkouWindow = function (dataList) {
    if (!(dataList instanceof Array) || dataList.length <= 0) {
        return;
    }

    var data = dataList[0], columns = [], prop, propContent = "<table>";

    for (prop in data) {
        propContent += "<tr><td width=80 style='text-align:left;'>" + prop + ":</td><td width=100 style='text-align:left;'>" + data[prop] + "</td></tr>";
    }

    propContent += "</table>";

    this.renkouWindows = $("#renkouWindow");
    this.renkouWindows.window({
        width: 600,
        height: 400,
        content: propContent,
        title: "详细个人信息",
        modal: true
    });

    this.renkouWindows.window("open");
}

BuildingFloorViewer.Instance;

BuildingFloorViewer.getInstance = function (containerDiv) {
    if (!BuildingFloorViewer.Instance) {
        if (containerDiv) {
            return new BuildingFloorViewer(containerDiv);
        }
    } else {
        return BuildingFloorViewer.Instance;
    }
}

/********************************************************************************************************/

//BuildingFloorContentViewer = function (containerDiv) {
//    var containerObj = document.getElementById(containerDiv);

//    if (!containerObj) {
//        return;
//    }

//    this.map = new Map(containerDiv, {
//        zoomSlider: { type: 'false' },
//        crs: "epsg4326",
//        minZoom: 16,
//        maxZoom: 23
//    });
//    //this.map.changeViewAngle(20);
//    this.floorContainer = new L.LayerGroup();
//    this.map.addLayer(this.floorContainer);

//    this.camera = new Camera();
//    this.camera.setMap(this.map);

//    if (!BuildingFloorViewer.Instance) {
//        BuildingFloorViewer.Instance = this;
//    }

//    this.dataLoader = new BuildingDataLoader();
//    this._cells = [];
//}

/**************************************************************************************************************/
BuildiingCellListViewer = function (containerDiv) {
    var containerObj = $("#" + containerDiv); //document.getElementById(containerDiv);

    if (!containerObj) {
        return;
    }

    this.containerObj = containerObj;

    //    var tableObj = document.createElement("table");
    //    tableObj.style.borderColor = "#00F";
    //    tableObj.style.marginLeft = "10px";
    //    tableObj.style.marginRight = "10px";
    //    tableObj.cellspacing = "0";
    //    tableObj.cellpadding = "0";
    //    tableObj.width = containerObj.width;
    //containerObj.appendChild(tableObj);
    //    var tableObj = $('<table border="1" cellspacing="0" cellpadding="0" width="315px" style="border-color:#00F;margin-left:10px;margin-right:10px"></table>');
    //    containerObj.append(tableObj);
    //    this.tableObj = tableObj;

    if (!BuildiingCellListViewer.Instance) {
        BuildiingCellListViewer.Instance = this;
    }

    this.dataLoader = new BuildingDataLoader();

    this.idProp = "JZWBM";
    this.nameProp = "HMC";
    this.floorIndexProp = "SZLC";
    this.cellNumProp = "FJH";

    this.gridInitialled = false;
}

BuildiingCellListViewer.prototype.requestData = function (buildingId, floorIndex, idProp, nameProp, floorIndexProp, cellNumProp) {
    this.idProp = idProp || this.idProp || "";
    this.nameProp = nameProp || this.nameProp || "";
    this.floorIndexProp = floorIndexProp || this.floorIndexProp || "";
    this.cellNumProp = cellNumProp || this.cellNumProp || "";

    this.dataLoader.loadBuildingFloor(buildingId, floorIndex, this.loadData, this);
}

/**
 * dataList:数组，房间数据
 * nameProp：名称字段
 * floorIndexProp：楼层字段
 * cellNumProp：房间号字段
 */
BuildiingCellListViewer.prototype.loadData = function (dataList, idProp, nameProp, floorIndexProp, cellNumProp) {
    if (!this.gridInitialled) {
        idProp = idProp || this.idProp;
        nameProp = nameProp || this.nameProp;
        floorIndexProp = floorIndexProp || this.floorIndexProp;
        cellNumProp = cellNumProp || this.cellNumProp;
        var thisObj = this;
        //this.tableObj.innerHTML = "";
        this.containerObj.datagrid({
            idField: idProp,
            singleSelect: true,
            columns: [[
            { field: idProp, title: '序号', width: 30, formatter: function (value, row, index) { return index } },
            { field: nameProp, title: '名称', width: 100 },
            { field: floorIndexProp, title: '楼层', width: 100 },
            { field: cellNumProp, title: '房间', width: 100 }
        ]],
            onSelect: function (rowIndex, rowData) {
                var cellNum = rowData[thisObj.cellNumProp];
                var floorIndex = rowData[thisObj.floorIndexProp];
                thisObj.onSelect(rowIndex, rowData, floorIndex, cellNum);
            }
        });

        this.gridInitialled = true;
    }

    var gridData = {
        total: dataList.length,
        rows: dataList
    };
    this.containerObj.datagrid("loadData", gridData);
}

BuildiingCellListViewer.prototype.onSelect = function (rowIndex, rowData, cellNum) {

}

BuildiingCellListViewer.prototype.selectRecord = function (recordId) {
    this.containerObj.datagrid("selectRecord", recordId);
}

BuildiingCellListViewer.Instance;

BuildiingCellListViewer.getInstance = function (containerDiv) {
    if (!BuildiingCellListViewer.Instance) {
        if (containerDiv) {
            return new BuildiingCellListViewer(containerDiv);
        }
    } else {
        return BuildiingCellListViewer.Instance;
    }
}
