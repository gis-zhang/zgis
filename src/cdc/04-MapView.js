/**
 * Created by Administrator on 2017/4/29.
 */

var MapView = Z.Class.extend({
    includes: Z.EventManager,

    initialize: function(containerId, options){
        this.containerId = containerId;
        this._mapViewRoot = null;
        this._mapContainer = null;
        //this.controllerContainer = null;
        options = options || {};
        this.options = options;
        //this._resourceLibPath = options.resourceLibPath;
        this._loaded = false;
        this._map = null;
        this._mapConfig = {
            sceneType: '3D',
            center:{x:114.264451, y:30.582994},
            initZoom: 20,
            maxZoom: 25
        };
        Z.Util.applyOptions(this._mapConfig, options, true);
        this._baseLayerCfg = [{name: "天地图矢量底图", type: "TDTVector", index: 1}, {name: "天地图矢量注记", type: "TDTVectorAnno", index: 2}];
        this._baseData = options.baseData || ["data/cdc_outdoor_bg1/outdoor_bg"];
        this._buildingData = options.buildingData || ["data/cdc_outdoor_building1/outdoor_building"];

        this._buildings = [];
        this._floors = {};
        this._rooms = {};
        this._equipments = {};
        this._buildingLayer = null;
        this._roomLayer = null;
        this._equipmentLayer = null;
        this._viewController = null;
        this._floorController = null;
        this._buildingConfig = null;
        this._roomConfig = null;
        this._selectedBuilding = null;
        this._selectedRoom = null;
        this._currentInnerModeRoom = null;

        this._initLayout(this.containerId);
        this._initMap();

        this._initController();
        this._initLoadStatus = {
            //baseData: false,
            building: false
        };
        this._initBaseLayer();
        this._loadBaseData();
        this._loadBuildings();
    },

    setResourceLibPath: function(path){
        //this._resourceLibPath = path;
        this._toolBar.setImgLibPath(path);
    },

    setToolBarIcons: function(iconCfg){
        if(this._toolBar){
            this._toolBar.setIcons(iconCfg);
        }
    },

    zoomIn: function(){
        if(this._map){
            this._map.zoomIn();
        }
    },

    zoomOut: function(){
        if(this._map){
            this._map.zoomOut();
        }
    },

    fullMap: function(){
        if(this._map){
            this._map.fullMap();
        }
    },

    resize: function(){
        if(this._map){
            this._map.resize();
        }
    },

    reposition: function(){
        if(this._map){
            this._map.reposition();
        }
    },

    rotateByEuler: function(rotate){
        if(this._map){
            this._map.rotateByEuler(rotate);
        }
    },

    offsetRotateByEuler: function(rotateOffset){
        if(this._map){
            //this._map.rotateByEuler(rotate);
            rotateOffset = rotateOffset || {};
            var curRotate = this._map.getRotateByEuler();
            var x = curRotate.x + (rotateOffset.x || 0),
                y = curRotate.y + (rotateOffset.y || 0),
                z = curRotate.z + (rotateOffset.z || 0);
            this._map.rotateByEuler({x:x, y: y, z:z});
        }
    },

    panTo: function(center){
        if(this._map){
            this._map.panTo(center);
        }
    },

    hideBuilding: function(buildingName){
        var building = this._getBuildingByName(buildingName);

        if(!building){
            return;
        }

        building.hide();
        this.fire("buildinghide", {building: building});
    },

    showBuilding: function(buildingName){
        var building = this._getBuildingByName(buildingName);

        if(!building){
            return;
        }

        building.show();
        this.fire("buildingshow", {building: building});
    },

    /**
     *
     * @param buildingTips {
     *  buildingName1: tipContent1,
     *  buildingName2: tipContent2
     * }
     */
    showBuildingTips: function(buildingTips, options){
        if(!buildingTips){
            return;
        }

        options = options || {};

        for(var i = 0, buildingLength = this._buildings.length; i < buildingLength; i++){
            var curBuilding =  this._buildings[i],
                buildingName = this._buildings[i].name;

            if(buildingTips[buildingName]){
                curBuilding.updateTitle(buildingTips[buildingName].content, buildingTips[buildingName].symbol,
                    buildingTips[buildingName].mouseoverSymbol, buildingTips[buildingName].selectSymbol);
                curBuilding.showTitle();
            }else if(!options.excludeOthers){
                curBuilding.updateTitle();
                curBuilding.showTitle();
            }
        }
    },

    setBuildingMode: function(buildingName, mode, callback){
        var building = this._getBuildingByName(buildingName),
            callbackExecuted = false;

        if(!building){
            return;
        }

        if(building.getMode() === mode){
            if(callback){
                callback();
            }

            return;
        }

        //building.setMode(mode);
        //
        //if(mode === BuildingMode.INNER){
        //    if(building.getComponents().length <= 0){
        //        this._loadFloors(building, callback);
        //        callbackExecuted = true;
        //    }
        //}
        //
        ////building.setMode(mode);
        //this.fire("buildingmodechange", {buildingId: buildingName, mode: mode});
        //
        //if(!callbackExecuted && callback){
        //    callback();
        //}

        var thisObj = this;

        if(mode === BuildingMode.INNER){
            if(building.getComponents().length <= 0){
                this._loadFloors(building, function(){
                    building.setMode(mode);
                    thisObj.fire("buildingmodechange", {buildingId: buildingName, mode: mode});

                    if(callback){
                        callback();
                    }
                });
                callbackExecuted = true;
            }else{
                building.setMode(mode);
                thisObj.fire("buildingmodechange", {buildingId: buildingName, mode: mode});

                if(callback){
                    callback();
                }
            }
        }else{
            building.setMode(mode);
            thisObj.fire("buildingmodechange", {buildingId: buildingName, mode: mode});

            if(callback){
                callback();
            }
        }
    },

    selectBuilding: function(buildingName){
        var building = this._getBuildingByName(buildingName);

        if(!building || this._selectedBuilding === building){
            return;
        }

        if(this._selectedBuilding){
            this._selectedBuilding.unselect();
            this._selectedBuilding = null;
        }

        building.select();
        this._selectedBuilding = building;
        //this.fire("buildingshow", {building: building});

        //if(this._floorController){
        //    this._floorController.show();
        //
        //    //this.showFloorTips("Rectangle03", [{floorIndex:1, content: "3"}, {floorIndex:5, content: "9"}]);
        //}
    },

    cancelBuildingSelect: function(){
        if(this._selectedBuilding){
            this._selectedBuilding.unselect();
            this._selectedBuilding = null;
        }
    },

    showBuildingInner: function(buildingName, callback){
        if(buildingName !== "Rectangle03"){
            return;
        }

        this.hideBuilding("Rectangle04");
        this.hideBuilding("Rectangle05");
        //this.setBuildingMode(buildingName, BuildingMode.INNER, function(){callback();});
        //this.selectBuilding(buildingName);
        //this._floorController.show();
        var thisObj = this;
        this.setBuildingMode(buildingName, BuildingMode.INNER, function(){
            thisObj.selectBuilding(buildingName);
            thisObj._floorController.show();

            if(callback){
                callback();
            }
        });
    },

    showFloorInner: function(buildingName, floorIndex, callback){
        var targetBuilding = this._getBuildingByName(buildingName);

        if(!targetBuilding){
            return;
        }

        //var floorsInfo = targetBuilding.getFloorsInfo(),
        //    floorIndexForShow = [];
        //
        //for(var i = 0; i < floorsInfo.length; i++){
        //    if(floorsInfo[i].index <= floorIndex){
        //        floorIndexForShow.push(floorsInfo[i].index);
        //    }
        //}
        //
        //targetBuilding.showFloorsByIndex(floorIndexForShow);
        //
        //if(floorIndex === 1 || floorIndex === 2){
        //    this.showRoomsOfFloor(buildingName, floorIndex, callback);
        //}
        //
        //this.fire("showfloor", {buildingId: buildingName, floorIndex: floorIndex});

        var thisObj = this;
        this.showBuildingInner(buildingName, function(){
            var floorsInfo = targetBuilding.getFloorsInfo(),
                floorIndexForShow = [];

            for(var i = 0; i < floorsInfo.length; i++){
                if(floorsInfo[i].index <= floorIndex){
                    floorIndexForShow.push(floorsInfo[i].index);
                }
            }

            targetBuilding.showFloorsByIndex(floorIndexForShow);

            var floor = thisObj._floors[buildingName + "_" + floorIndex];

            if(floor.getMode() === BuildingMode.HULL){
                if(floorIndex === 1 || floorIndex === 2){
                    thisObj.showRoomsOfFloor(buildingName, floorIndex, callback);
                }
            }

            thisObj.fire("showfloor", {buildingId: buildingName, floorIndex: floorIndex});

            if(callback){
                callback();
            }
        });
    },

    quitInnerMode: function(buildingName){
        var targetBuilding = this._getBuildingByName(buildingName);

        if(!targetBuilding){
            return;
        }

        if(targetBuilding.getMode() === BuildingMode.HULL){
            return;
        }

        targetBuilding.setMode(BuildingMode.HULL);
    },

    showFloorTips: function(buildingName, floorTips){
        var targetBuilding = this._getBuildingByName(buildingName);

        if(targetBuilding !== this._selectedBuilding){
            return;
        }

        this._floorController.setFloorTip(floorTips);
    },

    showRoomsOfFloor: function(buildingName, floorIndex, callback){
        var modelUrl = "data/kongjianceng.txt",
            thisObj = this,
            transformation = this._getRoomTransformation(),
            floor = this._floors[buildingName + "_" + floorIndex];

        if(!floor){
            return;
        }

        if(!this._roomLayer){
            this._roomLayer = new Z.GraphicLayer({enableInfoWindow: true, enableTip: true});
            this._map.addLayer(this._roomLayer);
        }else{
            this._roomLayer.clear();
        }

        //Z.AjaxRequest.getJSON(modelUrl, function(json){
        //    if(!Array.isArray(json)){
        //        return;
        //    }
        //
        //    //var graphics = [];
        //
        //    for(var i = 0; i < json.length; i++){
        //        var roomInfo = json[i];
        //        var graphic = ExtrudeGraphicBuilder.buildGraphic(roomInfo, {
        //            shape:'#{the_geom}',
        //            //title: '#{房间名称}(#{房间编号})',
        //            desc: '#{房间名称}(#{房间编号})',
        //            //title:'#{ID}_id',
        //            //icon: 'http://localhost:8080/zmap/src/zmap/image/marker-icon.png',
        //            height:function(props){
        //                if(props['空间类型'] === '休闲用房'){
        //                    return 0;
        //                }else{
        //                    //return parseFloat(props['高度'])
        //                    return parseFloat(props['离地高度']) + parseFloat(props['高度']);
        //                }
        //            },
        //            baseHeight:function(props){return parseFloat(props['离地高度'])},//function(props){return parseFloat(props['离地高度'])},
        //            cw: true,
        //            selectSymbol: new Z.ExtrudeSymbol({topColor: "#aa0000", wallColor: "#aaaa00"}),
        //            mouseoverSymbol: new Z.ExtrudeSymbol({topColor: "#aa00aa", wallColor: "#00aaaa"}),
        //            topColor:'#ff0000'
        //        });
        //        //graphic.feature.shape.transformation = transformation;
        //        graphic.feature.shape = thisObj._transformExtrudeShape(graphic.feature.shape, transformation, 0.00032);
        //        //graphic.feature.shape.lngStart = true;
        //
        //        //graphics.push(graphic);
        //        //var roomId = graphic.feature.props['编码'];
        //        var room = thisObj._createRoom(buildingName, floorIndex, graphic);
        //        room.addToLayer(thisObj._roomLayer);
        //        floor.addRooms(room);
        //        //thisObj._applyBuildingUnitEvent(building, "on");
        //        //thisObj._buildings.push(building);
        //        //var roomId = room.getHull().feature.props['编码'];
        //        //thisObj._rooms[roomId] = room;
        //        thisObj._rooms[room.roomId] = room;
        //    }
        //
        //    //thisObj._roomLayer.addGraphics(graphics);
        //    if(callback){
        //        callback();
        //    }
        //});

        this._rooms = {};    //未释放资源，可能存在内存泄露隐患
        BuildingLoader.loadRooms(modelUrl, {
            infoTemplate: function(roomObj){return thisObj._createRoomInfoTemplate(buildingName, floorIndex, roomObj)},
            transformation: transformation,
            //heightScale: 0.00032,
            heightScale: 0.00064,
            enableTitle: false
        }, function(rooms){
            var ownerBuilding = thisObj._getBuildingByName(buildingName);

            for(var i = 0; i < rooms.length; i++){
                var curRoom = rooms[i];
                curRoom.floorIndex = floorIndex;
                curRoom.ownerBuilding = ownerBuilding;
                curRoom.addToLayer(thisObj._roomLayer);
                floor.addRooms(curRoom);
                thisObj._rooms[curRoom.roomId] = curRoom;
            }

            if(callback){
                callback();
            }
        });
    },

    showRoomInner: function(buildingName, floorIndex, roomId, callback){
        //var room = this._getRoomById(roomId);
        //
        //if(!room){
        //    return;
        //}

        //var thisObj = this;
        //this.setRoomMode(roomId, BuildingMode.INNER, function(){
        //    thisObj.fire("showroom", {buildingId: room.ownerBuilding.name, floorIndex: room.floorIndex, roomId: roomId});
        //
        //    if(callback){
        //        callback();
        //    }
        //});

        var room = this._getRoomById(roomId);
        var thisObj = this;

        if(room){
            var mode = room.getMode();

            if(mode === BuildingMode.INNER){
                if(callback){
                    callback();
                }
            }else{
                this.setRoomMode(roomId, BuildingMode.INNER, function(){
                    thisObj.fire("showroom", {buildingId: room.ownerBuilding.name, floorIndex: room.floorIndex, roomId: roomId});

                    if(callback){
                        callback();
                    }
                });
            }
        }else{
            this.showFloorInner(buildingName, floorIndex, function(){
                var room = thisObj._getRoomById(roomId);

                if(!room){
                    if(callback){
                        callback();
                    }

                    return;
                }

                thisObj.setRoomMode(roomId, BuildingMode.INNER, function(){
                    thisObj.fire("showroom", {buildingId: room.ownerBuilding.name, floorIndex: room.floorIndex, roomId: roomId});

                    if(callback){
                        callback();
                    }
                });
            });
        }
    },

    setRoomMode: function(roomId, mode, callback){
        var room = this._getRoomById(roomId);

        if(!room){
            return;
        }

        if(this._currentInnerModeRoom === room){
            if(mode !== BuildingMode.INNER){
                this._currentInnerModeRoom.setMode(mode);
                this._currentInnerModeRoom = null;
            }

            if(callback){
                callback();
            }
        }else{
            if(this._currentInnerModeRoom){
                this._currentInnerModeRoom.setMode(BuildingMode.HULL);
            }

            var thisObj = this;

            if(mode === BuildingMode.INNER){
                if(room.getComponents().length <= 0){
                    this._loadEquipments(room, function(){
                        this._currentInnerModeRoom = room;
                        room.setMode(mode);

                        if(callback){
                            callback();
                        }
                    });
                }else{
                    this._currentInnerModeRoom = room;
                    room.setMode(mode);

                    if(callback){
                        callback();
                    }
                }
            }else{
                room.setMode(mode);

                if(callback){
                    callback();
                }
            }
        }

        //if(mode === BuildingMode.INNER){
        //    if(room.getComponents().length <= 0){
        //        this._loadEquipments(room);
        //    }
        //
        //    this._currentInnerModeRoom = room;
        //}
        //
        //room.setMode(mode);

        //this._floorController.setBuilding(building);
        //mode === BuildingMode.INNER ? this._floorController.show() : this._floorController.hide();
    },

    /**
     *
     * @param roomTips {
     *  roomId1: tipContent1,
     *  roomId2: tipContent2
     * }
     */
    showRoomTips: function(buildingName, floorIndex, roomTips, options, callback){
        if(!roomTips){
            return;
        }

        options = options || {};

        //for(var key in this._rooms){
        //    var curRoom=  this._rooms[key];
        //
        //    if(roomTips[key]){
        //        curRoom.updateTitle(roomTips[key].content, roomTips[key].symbol);
        //        curRoom.showTitle();
        //    }else if(!options.excludeOthers){
        //        curRoom.updateTitle();
        //        curRoom.showTitle();
        //    }
        //}

        var thisObj = this;
        this.showFloorInner(buildingName, floorIndex, function(){
            for(var key in thisObj._rooms){
                var curRoom=  thisObj._rooms[key];

                if(roomTips[key]){
                    curRoom.updateTitle(roomTips[key].content, roomTips[key].symbol,
                        roomTips[key].mouseoverSymbol, roomTips[key].selectSymbol);
                    curRoom.showTitle();
                }else if(!options.excludeOthers){
                    curRoom.updateTitle();
                    curRoom.showTitle();
                }
            }

            if(callback){
                callback();
            }
        });
    },

    updateRoomSymbols: function(symbols){
        for(var key in symbols){
            if(this._rooms[key]){
                this._rooms[key].getHull().updateSymbol(symbols[key]);
            }
        }
    },

    selectRoom: function(roomId){
        var room = this._getRoomById(roomId);

        if(!room || this._selectedRoom === room){
            return;
        }

        if(this._selectedRoom){
            this._selectedRoom.unselect();
            this._selectedRoom = null;
        }

        this._selectedRoom = room;
        room.select();
        //this.fire("buildingshow", {building: building});
    },

    cancelRoomSelect: function(){
        if(this._selectedRoom){
            this._selectedRoom.unselect();
            this._selectedRoom = null;
        }
    },

    showEquipment: function(equipmentId){},

    showEquipmentTips: function(buildingName, floorIndex, roomId, equipmentTips, options, callback){
        if(!equipmentTips){
            return;
        }

        options = options || {};
        var room = this._rooms[roomId];

        if(room && room.getMode() === BuildingMode.INNER){
            for(var key in this._equipments){
                var curEquipment =  this._equipments[key];

                if(equipmentTips[key]){
                    curEquipment.updateTitle(equipmentTips[key].content, equipmentTips[key].symbol,
                        equipmentTips[key].mouseoverSymbol, equipmentTips[key].selectSymbol);
                    curEquipment.showTitle();
                }else if(!options.excludeOthers){
                    curEquipment.updateTitle();
                    curEquipment.showTitle();
                }
            }

            if(callback){
                callback();
            }
        }else{
            var thisObj = this;

            this.showRoomInner(buildingName, floorIndex, roomId, function(){
                for(var key in thisObj._equipments){
                    var curEquipment =  thisObj._equipments[key];

                    if(equipmentTips[key]){
                        curEquipment.updateTitle(equipmentTips[key].content, equipmentTips[key].symbol,
                            equipmentTips[key].mouseoverSymbol, equipmentTips[key].selectSymbol);
                        curEquipment.showTitle();
                    }else if(!options.excludeOthers){
                        curEquipment.updateTitle();
                        curEquipment.showTitle();
                    }
                }

                if(callback){
                    callback();
                }
            });
        }
    },

    updateEquipmentSymbols: function(symbols){
        for(var key in symbols){
            if(this._equipments[key]){
                this._equipments[key].getHull().updateSymbol(symbols[key]);
            }
        }
    },

    doMouseOver: function(buildingName, floorIndex, roomId, equipmentId){
        if(!buildingName){
            return;
        }
        //alert(buildingName + "," + floorIndex + "," + roomId + "," + equipmentId);
        var building = this._getBuildingByName(buildingName);

        if(!building){
            return;
        }
//alert("1");
        var buildingMode = building.getMode();

        if(buildingMode === BuildingMode.HULL){
            building.getHull().doMouseOver();
            return;
        }
        //alert("2");
        var room = this._getRoomById(roomId),
            roomMode = room.getMode();

        if(roomMode === BuildingMode.HULL){
            room.getHull().doMouseOver();
            return;
        }
        //alert("3");
        var equipment = this._getEquipmentById(roomId, equipmentId),
            equipmentMode = equipment.getMode();

        if(equipmentMode === BuildingMode.HULL){
            equipment.getHull().doMouseOver();
            return;
        }
        //alert("4");
    },

    doMouseOut: function(buildingName, floorIndex, roomId, equipmentId){
        if(!buildingName){
            return;
        }

        var building = this._getBuildingByName(buildingName);

        if(!building){
            return;
        }

        var buildingMode = building.getMode();

        if(buildingMode === BuildingMode.HULL){
            building.getHull().doMouseOut();
            return;
        }

        var room = this._getRoomById(roomId),
            roomMode = room.getMode();

        if(roomMode === BuildingMode.HULL){
            room.getHull().doMouseOut();
            return;
        }

        var equipment = this._getEquipmentById(roomId, equipmentId),
            equipmentMode = equipment.getMode();

        if(equipmentMode === BuildingMode.HULL){
            equipment.getHull().doMouseOut();
            return;
        }
    },

    hasLoaded: function(){
        return this._loaded;
    },

    getBuildingInfo: function(buildingName){
        return this._buildings[buildingName];
    },

    getFloorInfo: function(buildingName, floorIndex){
        return this._floors[buildingName + "_" + floorIndex];
    },

    getRoomInfo: function(roomId){
        return this._rooms[roomId];
    },

    getEquipmentInfo: function(roomId, equipmentId){
        return this._equipments[roomId + "_" + equipmentId];
    },

    zoomToBuilding: function(buildingName){
        var building = this._getBuildingByName(buildingName);

        if(!building){
            return;
        }

        var bounds = building.getHull().feature.shape.getBounds();
        this._map.fitBounds(bounds);
    },

    zoomToRoom: function(buildingName, floorIndex, roomId){
        var room = this._getRoomById(roomId);

        if(!room){
            return;
        }

        var bounds = room.getHull().feature.shape.getBounds();
        this._map.fitBounds(bounds);
    },

    _initLayout: function(containerParent){
        var parentNode = Z.DomUtil.isDom(containerParent) ? containerParent : document.getElementById(containerParent);

        var mapViewRoot = document.createElement("div"),
            left = parentNode.offsetLeft || parentNode.clientLeft,
            top = parentNode.offsetTop || parentNode.clientTop,
            width = parentNode.offsetWidth || parentNode.clientWidth,
            height = parentNode.offsetHeight || parentNode.clientHeight;
        //alert("left=" + left + ";top=" + top + ";width=" + width + ";height=" + height);
        mapViewRoot.style.position = "absolute";
        mapViewRoot.style.zIndex = 0;
        mapViewRoot.style.left = left + "px";
        mapViewRoot.style.top = top + "px";
        mapViewRoot.style.width = width + "px";
        mapViewRoot.style.height = height + "px";
        parentNode.appendChild(mapViewRoot);

        var mapContainer = document.createElement("div");
        mapContainer.style.position = "absolute";
        mapContainer.style.zIndex = 0;
        mapContainer.style.width = width + "px";
        mapContainer.style.height = height + "px";
        mapViewRoot.appendChild(mapContainer);

        //var controllerContainer = document.createElement("div");
        //controllerContainer.style.position = "absolute";
        //controllerContainer.style.zIndex = 1;
        //controllerContainer.style.left = left + "px";
        //controllerContainer.style.top = top + "px";
        //controllerContainer.style.width = width + "px";
        //controllerContainer.style.height = height + "px";
        //parentNode.appendChild(controllerContainer);

        this._mapViewRoot = mapViewRoot;
        this._mapContainer = mapContainer;
        //this._controllerContainer = controllerContainer;
    },

    _initMap: function(){
        var map = new ZMap(this._mapContainer, this._mapConfig);   //32.1181, 118.9038, 0
        //var map = new ZMap(this.containerId, this._mapConfig);   //32.1181, 118.9038, 0
        map.rotateByEuler({x: 45, y:0, z:0});

        this._map = map;

        var geom = new Z.LatLng(30.582994, 114.264451, 0);
        this._map.panTo(geom);
    },

    _initController: function(){
        this._initToolBar();
        this._initFloorController();
    },

    _initToolBar: function(){
        this._toolBar = new MapToolBar(this._mapViewRoot);

        if(this.options.resourceLibPath !== undefined){
            this._toolBar.setImgLibPath(this.options.resourceLibPath);
        }

        this._toolBar.addTo(this);
    },

    _initFloorController: function(){
        this._floorController = new FloorController(this._mapViewRoot);
        this._floorController.addTo(this);
        this._floorController.hide();
        var thisObj = this;

        //this._floorController.on("floorSelect", function(event){
        //    //if(event.floorIndex === 1 || event.floorIndex === 2){
        //    //    thisObj.showRoomsOfFloor(event.buildingName, event.floorIndex);
        //    //}
        //    thisObj.showFloorInner(event.buildingName, event.floorIndex);
        //});
        //
        //this._floorController.on("quitFloors", function(event){
        //    thisObj.showBuilding("Rectangle04");
        //    thisObj.showBuilding("Rectangle05");
        //    thisObj.quitInnerMode(event.buildingName);
        //    thisObj._floorController.hide();
        //    thisObj._floorController.reset();
        //});
    },

    _initBaseLayer: function(){
        for(var i = 0; i < this._baseLayerCfg.length; i++){
            var type = this._baseLayerCfg[i].type,
                index = this._baseLayerCfg[i].index;

            var layer = null;

            if(type === "TDTVector"){
                layer = new Z.TDTVectorLayer();
            }else if(type === "TDTVectorAnno"){
                layer = new Z.TDTVectorAnnoLayer();
            }

            this._map.addLayer(layer, index);
        }
    },

    _loadBaseData: function(){
        var modelUrls = this._baseData;//"data/cdc_outdoor_bg/outdoor_bg";

        if(!modelUrls){
            return;
        }

        modelUrls = Array.isArray(modelUrls) ? modelUrls : [modelUrls];

        if(!this._baseLayer){
            this._baseLayer = new Z.ThreeDMaxModelLayer();
            this._map.addLayer(this._baseLayer);
        }

        var transformation = this._getTransformation();
        var baseLayer = this._baseLayer;

        var thisObj = this,
            modelCount  = modelUrls.length,
            loaded = 0;

        for(var i = 0; i < modelUrls.length; i++) {
            var modelUrl = modelUrls[i];

            ObjLoader.loadObjModel(modelUrl, function (loadedModels) {
                //var modelGraphics = [];
                //
                //for(var key in loadedModels){
                //    var curGraphic =  loadedModels[key];
                //    curGraphic.feature.shape.transformation = transformation;
                //    modelGraphics.push(curGraphic);
                //}
                //
                //thisObj._baseLayer.addGraphics(modelGraphics);
                for (var key in loadedModels) {
                    var curGraphic = loadedModels[key];
                    curGraphic.feature.shape.transformation = transformation;
                    var building = thisObj._createBuilding(curGraphic);
                    building.addToLayer(thisObj._baseLayer);
                }

                loaded++;

                if(loaded >= modelCount){
                    thisObj._initLoadStatus.baseData = true;
                    thisObj._checkLoadStatus();
                }

                thisObj.on("basedataload");
            }, this);
        }
    },

    _loadBuildings: function(){
        //var modelUrls = this._buildingData;//"data/cdc_outdoor_building/outdoor_building";
        //
        //if(!this._buildingLayer){
        //    this._buildingLayer = new Z.ThreeDMaxModelLayer({enableInfoWindow: true});
        //    this._map.addLayer(this._buildingLayer);
        //}
        //
        //modelUrls = Array.isArray(modelUrls) ? modelUrls : [modelUrls];
        //
        //var transformation = this._getTransformation();
        //var buildingLayer = this._buildingLayer;
        //
        //var thisObj = this,
        //    modelCount  = modelUrls.length,
        //    loaded = 0;
        //
        //for(var i = 0; i < modelUrls.length; i++) {
        //    var modelUrl = modelUrls[i];
        //
        //    ObjLoader.loadObjModel(modelUrl, function (loadedModels) {
        //        //var modelGraphics = [];
        //        //
        //        //for(var key in loadedModels){
        //        //    var curGraphic =  loadedModels[key];
        //        //    curGraphic.feature.shape.transformation = transformation;
        //        //    curGraphic.enableTitle();
        //        //    modelGraphics.push(curGraphic);
        //        //}
        //        //
        //        //thisObj._buildingLayer.addGraphics(modelGraphics);
        //        for (var key in loadedModels) {
        //            var curGraphic = loadedModels[key];
        //            curGraphic.feature.shape.transformation = transformation;
        //            curGraphic.enableTitle();
        //            //var infoTemplate = thisObj._createBuildingInfoTemplate();
        //            //curGraphic.setInfoTemplate();
        //            var building = thisObj._createBuilding(curGraphic);
        //            building.addToLayer(thisObj._buildingLayer);
        //            thisObj._applyBuildingUnitEvent(building, "on");
        //            thisObj._buildings.push(building);
        //        }
        //
        //        //thisObj._initLoadStatus.building = true;
        //        //thisObj._checkLoadStatus();
        //        loaded++;
        //
        //        if(loaded >= modelCount){
        //            thisObj._initLoadStatus.building = true;
        //            thisObj._checkLoadStatus();
        //        }
        //
        //        thisObj.on("buildingsload");
        //    }, this);
        //}

        var transformation = this._getTransformation();
        //var buildingLayer = this._buildingLayer;
        //var infoTemplate = this._createBuildingInfoTemplate();
        var thisObj = this;
        this._buildings = [];      //未释放资源，可能存在内存泄露隐患

        if(!this._buildingLayer){
            this._buildingLayer = new Z.ThreeDMaxModelLayer({enableInfoWindow: false});
            this._map.addLayer(this._buildingLayer);
        }

        BuildingLoader.loadBuildings(this._buildingData, {
            infoTemplate: function(buildingObj){return thisObj._createBuildingInfoTemplate(buildingObj)},
            transformation: transformation,
            enableTitle: true
        }, function(buildings){
            for(var i = 0; i < buildings.length; i++){
                var curBuilding = buildings[i];
                curBuilding.addToLayer(thisObj._buildingLayer);
                thisObj._applyBuildingUnitEvent(curBuilding, "on");
                thisObj._buildings.push(curBuilding);

                thisObj._setFloorConfig(curBuilding);
            }

            thisObj._initLoadStatus.building = true;
            thisObj._checkLoadStatus();
            thisObj.on("buildingsload");
        });
    },

    _getTransformation: function(){
        var transformation = new Z.Transformation();
        transformation.doScale(0.0000030, 0.0000030, 0.5);
        transformation.doRotation(0, 0, Math.PI * 21 / 180);
        transformation.doTranslation(114.264451, 30.582994, 0);

        return transformation;
    },

    _getInnerTransformation: function(){
        var transformation = new Z.Transformation();
        transformation.doScale(0.00000027, 0.00000027, 0.046);
        transformation.doRotation(0, 0, Math.PI * 26 / 180);
        transformation.doTranslation(114.264521, 30.582944, 0);

        return transformation;
    },

    _getRoomTransformation: function(){
        var transformation = new Z.Transformation();
        transformation.doScale(0.0000000027, 0.0000000027, 2);
        transformation.doRotation(0, 0, -Math.PI * 26 / 180);
        //transformation.doTranslation(114.263936425, 30.5825722978, 0);
        transformation.doTranslation(30.5826512978, 114.2643852233, 0);

        return transformation;
    },

    _createBuilding: function(graphic){
        var building = new Building(graphic);
        var template = this._createBuildingInfoTemplate(building);
        var name = graphic.feature.props['name'];
        building.name = name;

        if(name === "Rectangle03"){
            graphic.setInfoTemplate(template);
            this._setFloorConfig(building);
        }

        return building;
    },

    _createBuildingInfoTemplate: function(building){
        var buildingName = building.getHull().feature.props.name;
        var templateNode = document.createElement("input");
        templateNode.type = "button";
        templateNode.value = "进入室内";
        var thisObj = this;
        templateNode.onclick = function(){
            ////building.setMode(BuildingMode.INNER);
            //thisObj.hideBuilding("Rectangle04");
            //thisObj.hideBuilding("Rectangle05");
            //thisObj.setBuildingMode(buildingName, BuildingMode.INNER);
            //thisObj.selectBuilding(buildingName);
            //thisObj._floorController.show();
            thisObj.showBuildingInner(buildingName);
        };
        var template = new Z.SimpleInfoTemplate();
        template.setTitle(buildingName);
        template.setContent(templateNode);

        return template;
    },

    //_createRoom: function(buildingName, floorIndex, graphic){
    //    var roomId = graphic.feature.props['编码'];
    //    var room = new Room(graphic);
    //    room.roomId = roomId;
    //    room.floorIndex = floorIndex;
    //    room.ownerBuilding = this._getBuildingByName(buildingName);
    //    var template = this._createRoomInfoTemplate(room);
    //    graphic.setInfoTemplate(template);
    //    //this._setFloorConfig(building);
    //
    //    return room;
    //},

    _createRoomInfoTemplate: function(buildingName, floorIndex, room){
        var roomName = room.getHull().feature.props['房间名称'];
        var roomId = room.getHull().feature.props['编码'];
        //var buildingName = room.ownerBuilding.name;
        //var floorIndex = room.floorIndex;
        var templateNode = document.createElement("input");
        templateNode.type = "button";
        templateNode.value = "进入房间";
        var thisObj = this;
        templateNode.onclick = function(){
            ////building.setMode(BuildingMode.INNER);
            //thisObj.setRoomMode(roomId, BuildingMode.INNER);
            ////thisObj.selectRoom(roomId);
            thisObj.showRoomInner(buildingName, floorIndex, roomId);
        };
        var template = new Z.SimpleInfoTemplate();
        template.setTitle(roomName);
        template.setContent(templateNode);

        return template;
    },

    _applyBuildingUnitEvent: function(buildingUnit, onOff){
        if(!buildingUnit){
            return;
        }

        var buildingMouseEvents = ['dblclick', 'click', 'mousedown', 'mouseup', 'mouseover',
                'mouseout', 'mousemove', 'contextmenu','select', 'unselect'],
            i, len;

        for (i = 0, len = buildingMouseEvents.length; i < len; i++) {
            buildingUnit[onOff](buildingMouseEvents[i], this._onBuildingUnitEvent, this);
        }

        var buildingVisibleEvents = ['show', 'hide'];

        for (i = 0, len = buildingVisibleEvents.length; i < len; i++) {
            buildingUnit[onOff](buildingVisibleEvents[i], this._onBuildingUnitEvent, this);
        }
    },

    _onBuildingUnitEvent: function(event){
        var eType = event.type,
            obj = event.object;

        if(obj instanceof Building){
            eType = "building" + eType;
        }else if(obj instanceof Floor){
            eType = "floor" + eType;
        }else if(obj instanceof Room){
            eType = "room" + eType;
        }
console.info("mapview fire:" + eType);
        this.fire(eType, {
            latlng: event.latlng,
            containerPoint: event.containerPoint,
            object: obj
        });
    },

    _checkLoadStatus: function(){
        var loaded = true;

        for(var key in this._initLoadStatus){
            if(this._initLoadStatus[key] === false){
                loaded = false;
                break;
            }
        }

        if(loaded){
            this._loaded = true;
            this.fire("load");
        }
    },

    _setFloorConfig: function(building){
        var graphicName = building.getHull().feature.props.name;

        if(graphicName === "Rectangle03"){
            //var floorConfig = {
            //    top: "屋顶",
            //    f7: "Object473",
            //    f6: "Object28",
            //    f6_base: "Object29",
            //    f5: "Object22",
            //    f5_base: "Object23",
            //    f4: "Object334",
            //    f3: "Line25",
            //    f2: "Rectangle01",
            //    f2_base: "Object08",
            //    f1: "Rectangle03",
            //    f1_base: "Object01"
            //};
            var floorConfig = [
                {index: 8, objectId: "屋顶"},
                {index: 7, objectId: "Object473"},
                {index: 6, objectId: "Object28"},
                //{index: 1, objectId: "Object29"},
                {index: 5, objectId: "Object22"},
                //{index: 1, objectId: "Object23"},
                {index: 4, objectId: "Object334"},
                {index: 3, objectId: "Line25"},
                {index: 2, objectId: "Rectangle01"},
                //{index: 1, objectId: "Object08"},
                {index: 1, objectId: "Rectangle03"},
                //{index: 1, objectId: "Object01"}
            ];

            building.updateFloorConfig(floorConfig);
        }
    },

    _loadFloors: function(building, callback){
        var modelUrl = "data/cdc_inner_shiyanlou_floor/shiyanlou_floor";

        if(!this._buildingLayer){
            this._buildingLayer = new Z.ThreeDMaxModelLayer();
            this._map.addLayer(this._buildingLayer);
        }

        var transformation = this._getInnerTransformation();
        var buildingLayer = this._buildingLayer;
        var floorsInfo = building.getFloorsInfo();

        var thisObj = this;
        //ObjLoader.loadObjModel(modelUrl, function(loadedModels){
        //    var floors = [];
        //    thisObj._floors = {};
        //    for(var key in loadedModels){
        //        var curGraphic =  loadedModels[key];
        //        curGraphic.feature.shape.transformation = transformation;
        //        //curGraphic.enableTitle();
        //        var floor = thisObj._createFloor(curGraphic, building, floorsInfo);
        //        floors.push(floor);
        //        thisObj._floors[building.name + "_" + floor.floorIndex] = floor;
        //    }
        //
        //    building.addFloors(floors);
        //    thisObj.fire("floorsload", {building: building});
        //
        //    if(callback){
        //        callback();
        //    }
        //}, this);
        this._floors = {};     //未释放资源，可能存在内存泄露隐患
        BuildingLoader.loadFloors(modelUrl, {
            transformation: transformation
        }, function(floors){
            for(var i = 0; i < floors.length; i++){
                var curFloor = floors[i];
                var floorId = floors[i].floorId;

                for (var j = 0; j < floorsInfo.length; j++) {
                    if (floorsInfo[j].objectId === floorId) {
                        floors[i].floorIndex = floorsInfo[j].index;
                    }
                }

                curFloor.ownerBuilding = building;
                thisObj._floors[building.name + "_" + curFloor.floorIndex] = curFloor;
            }

            building.addFloors(floors);
            thisObj.fire("floorsload", {building: building});

            if(callback){
                callback();
            }
        });
    },

    //_createFloor: function(graphic, ownerBuilding, floorsInfo){
    //    var floor = new Floor(graphic);
    //    floor.ownerBuilding = ownerBuilding;
    //    var graphicId = graphic.feature.props['name'];
    //    //floor.floorIndex = graphic
    //
    //    for(var i = 0; i < floorsInfo.length; i++){
    //        if(floorsInfo[i].objectId === graphicId){
    //            floor.floorIndex = floorsInfo[i].index;
    //        }
    //    }
    //
    //    return floor;
    //},

    _getBuildingByName: function(buildingName){
        var targetBuilding = null;

        for(var i = 0; i < this._buildings.length; i++){
            if(this._buildings[i].getHull().feature.props["name"] === buildingName){
                targetBuilding = this._buildings[i];
                break;
            }
        }

        return targetBuilding;
    },

    _loadEquipments: function(room, callback){
        var modelUrl = "data/shebeiall.txt",
            transformation = this._getRoomTransformation(),
            //buildingLayer = this._equipmentLayer,
            roomId = room.getHull().feature.props['编码'],
            thisObj = this;

        //Z.AjaxRequest.getJSON(modelUrl, function(json){
        //    if(!Array.isArray(json)){
        //        return;
        //    }
        //
        //    //if(!thisObj._equipmentLayer){
        //    //    thisObj._equipmentLayer = new Z.GraphicLayer();
        //    //    thisObj._map.addLayer(thisObj._equipmentLayer);
        //    //}else{
        //    //    thisObj._equipmentLayer.clear();
        //    //}
        //    thisObj._equipmentLayer = thisObj._roomLayer;
        //
        //    //var graphics = [];
        //
        //    for(var i = 0; i < json.length; i++){
        //        var roomInfo = json[i];
        //        var ownerId = roomInfo["空间编码"];
        //
        //        if(ownerId !== roomId){
        //            continue;
        //        }
        //
        //        var graphic = ExtrudeGraphicBuilder.buildGraphic(roomInfo, {
        //            shape:'#{the_geom}',
        //            //title:'#{ID}_id',
        //            desc: '#{名称}(#{类型})',
        //            //icon: 'http://localhost:8080/zmap/src/zmap/image/marker-icon.png',
        //            height:function(props){
        //                return parseFloat(props['离地高度']) + parseFloat(props['自身高度']);
        //            },
        //            baseHeight:function(props){return parseFloat(props['离地高度']);},
        //            cw: true,
        //            selectSymbol: new Z.ExtrudeSymbol({topColor: "#aa0000", wallColor: "#aaaa00"}),
        //            mouseoverSymbol: new Z.ExtrudeSymbol({topColor: "#aa00aa", wallColor: "#00aaaa"}),
        //            topColor:'#ffff00'
        //        });
        //        //graphic.feature.shape.transformation = transformation;
        //        graphic.feature.shape = thisObj._transformExtrudeShape(graphic.feature.shape, transformation, 0.0004);
        //        //graphic.feature.shape.lngStart = true;
        //
        //        //graphics.push(graphic);
        //        var equipment = thisObj._createEquipment(graphic);
        //        equipment.addToLayer(thisObj._equipmentLayer);
        //        //thisObj._applyBuildingUnitEvent(building, "on");
        //        //thisObj._buildings.push(building);
        //        //var roomId = room.getHull().feature.props['编码'];
        //        //this._rooms[roomId] = room;
        //        room.addEquipments(equipment);
        //    }
        //
        //    //thisObj._roomLayer.addGraphics(graphics);
        //});

        this._equipments = {};
        BuildingLoader.loadEquipments(roomId, modelUrl, {
            //infoTemplate: function(roomObj){return thisObj._createRoomInfoTemplate(roomObj)},
            transformation: transformation,
            heightScale: 0.00064,
            enableTitle: false
        }, function(equipments){
            //var ownerBuilding = thisObj._getBuildingByName(buildingName);

            for(var i = 0; i < equipments.length; i++){
                var curEquipment = equipments[i];
                curEquipment.addToLayer(thisObj._equipmentLayer);
                room.addEquipments(curEquipment);
                curEquipment.ownerRoom = room;
                curEquipment.equipmentId = curEquipment.getHull().feature.props['编码'],
                thisObj._equipments[room.roomId + "_" + curEquipment.equipmentId] = curEquipment;
            }

            if(callback){
                callback();
            }
        });
    },

    //_createEquipment: function(graphic){
    //    var equipment = new Equipment(graphic);
    //
    //    return equipment;
    //},

    _getRoomById: function(roomId){
        return this._rooms[roomId];
    },

    _getEquipmentById: function(roomId, equipmentId){
        return this._equipments[roomId + "_" + equipmentId];
    }//,

    //_transformExtrudeShape: function(shape, pathTransformation, heightScale){
    //    var paths = Z.GeometryUtil.transformPaths(shape.paths, pathTransformation),
    //        height = shape.height * heightScale,
    //        baseHeight = shape.baseHeight * heightScale;
    //    shape.paths = paths;
    //    shape.height = height;
    //    shape.baseHeight = baseHeight;
    //
    //    return shape;
    //}
});


