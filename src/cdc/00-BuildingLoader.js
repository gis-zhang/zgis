/**
 * Created by Administrator on 2015/12/2.
 */
var BuildingLoader = (function(){
    function applyGraphicOptions(graphic, options){
        if(options.transformation){
            if(typeof options.transformation === "function"){
                graphic.feature.shape.transformation = options.transformation(building);
            }else if(options.transformation){
                graphic.feature.shape.transformation = options.transformation;
            }
        }

        if(options.enableTitle){
            graphic.enableTitle();
        }

        if(typeof options.infoTemplate === "function"){
            var template = options.infoTemplate(building);
            graphic.setInfoTemplate(template);
        }else if(options.infoTemplate){
            graphic.setInfoTemplate(options.infoTemplate);
        }
    }

    function createBuilding (graphic, options){
        var building = new Building(graphic);
        //var template = this._createBuildingInfoTemplate(building);
        var name = graphic.feature.props['name'];
        building.name = name;
        var templateContent = null;

        if(name === "Rectangle03"){
            if(typeof options.infoTemplate === "function"){
                templateContent = options.infoTemplate(building);
            }else if(options.infoTemplate){
                templateContent = options.infoTemplate;
            }
        }

        applyGraphicOptions(graphic, {
            transformation: options.transformation,
            enableTitle: options.enableTitle,
            infoTemplate: templateContent
        });

        return building;
    }

    function createFloor(graphic, options){
        //floor.floorIndex = graphic

        //for(var i = 0; i < floorsInfo.length; i++){
        //    if(floorsInfo[i].objectId === graphicId){
        //        floor.floorIndex = floorsInfo[i].index;
        //    }
        //}

        var floor = new Floor(graphic);
        //floor.ownerBuilding = ownerBuilding;
        var graphicId = graphic.feature.props['name'];
        floor.floorId = graphicId;

        var templateContent = null;

        if(typeof options.infoTemplate === "function"){
            templateContent = options.infoTemplate(floor);
        }else if(options.infoTemplate){
            templateContent = options.infoTemplate;
        }

        applyGraphicOptions(graphic, {
            transformation: options.transformation,
            enableTitle: options.enableTitle,
            infoTemplate: templateContent
        });

        return floor;
    }

    function transformExtrudeShape(shape, pathTransformation, heightScale){
        var paths = Z.GeometryUtil.transformPaths(shape.paths, pathTransformation),
            height = shape.height * heightScale,
            baseHeight = shape.baseHeight * heightScale;
        shape.paths = paths;
        shape.height = height;
        shape.baseHeight = baseHeight;

        return shape;
    }

    function createRoom(graphic, options){
        graphic.feature.shape = transformExtrudeShape(graphic.feature.shape, options.transformation, options.heightScale);
        //room.floorIndex = floorIndex;
        //room.ownerBuilding = this._getBuildingByName(buildingName);
        //var template = this._createRoomInfoTemplate(room);
        //graphic.setInfoTemplate(template);
        //this._setFloorConfig(building);

        var roomId = graphic.feature.props['编码'];
        var room = new Room(graphic);
        room.roomId = roomId;

        var templateContent = null;

        if(typeof options.infoTemplate === "function"){
            templateContent = options.infoTemplate(room);
        }else if(options.infoTemplate){
            templateContent = options.infoTemplate;
        }

        applyGraphicOptions(graphic, {
            //transformation: options.transformation,
            enableTitle: options.enableTitle,
            infoTemplate: templateContent
        });

        return room;
    }

    function createEquipment(graphic, options){
        var equipment = new Equipment(graphic);

        graphic.feature.shape = transformExtrudeShape(graphic.feature.shape, options.transformation, options.heightScale);

        var templateContent = null;

        if(typeof options.infoTemplate === "function"){
            templateContent = options.infoTemplate(equipment);
        }else if(options.infoTemplate){
            templateContent = options.infoTemplate;
        }

        applyGraphicOptions(equipment, {
            //transformation: options.transformation,
            enableTitle: options.enableTitle,
            infoTemplate: templateContent
        });

        return equipment;
    }

    return {
        loadBuildings: function(urls, options, callback, scope){
            var modelUrls = Array.isArray(urls) ? urls : [urls];

            //var transformation = this._getTransformation();
            //var buildingLayer = this._buildingLayer;

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
                    //    curGraphic.enableTitle();
                    //    modelGraphics.push(curGraphic);
                    //}
                    //
                    //thisObj._buildingLayer.addGraphics(modelGraphics);
                    var buildings = [];
                    for (var key in loadedModels) {
                        var curGraphic = loadedModels[key];
                        //curGraphic.feature.shape.transformation = transformation;
                        //curGraphic.enableTitle();
                        ////var infoTemplate = thisObj._createBuildingInfoTemplate();
                        ////curGraphic.setInfoTemplate();
                        //var building = thisObj._createBuilding(curGraphic);
                        //building.addToLayer(thisObj._buildingLayer);
                        //thisObj._applyBuildingUnitEvent(building, "on");
                        //thisObj._buildings.push(building);
                        var building = createBuilding(curGraphic, options);
                        buildings.push(building);
                    }

                    ////thisObj._initLoadStatus.building = true;
                    ////thisObj._checkLoadStatus();
                    //loaded++;
                    //
                    //if(loaded >= modelCount){
                    //    thisObj._initLoadStatus.building = true;
                    //    thisObj._checkLoadStatus();
                    //}
                    //
                    //thisObj.on("buildingsload");

                    loaded++;

                    if(loaded >= modelCount){
                        if(callback){
                            callback.call(scope, buildings);
                        }
                    }
                }, this);
            }
        },

        loadFloors: function(url, options, callback, scope){
            ObjLoader.loadObjModel(url, function(loadedModels){
                var floors = [];
                //thisObj._floors = {};
                for(var key in loadedModels){
                    var curGraphic =  loadedModels[key];
                    //curGraphic.feature.shape.transformation = transformation;
                    //curGraphic.enableTitle();
                    var floor = createFloor(curGraphic, options);
                    floors.push(floor);
                    //thisObj._floors[building.name + "_" + floor.floorIndex] = floor;
                }

                //building.addFloors(floors);
                //thisObj.fire("floorsload", {building: building});

                if(callback){
                    callback.call(scope, floors);
                }
            }, this);
        },

        loadRooms: function(url, options, callback, scope){
            Z.AjaxRequest.getJSON(url, function(json){
                if(!Array.isArray(json)){
                    return;
                }

                //if(!thisObj._roomLayer){
                //    thisObj._roomLayer = new Z.GraphicLayer({enableInfoWindow: true, enableTip: true});
                //    thisObj._map.addLayer(thisObj._roomLayer);
                //}else{
                //    thisObj._roomLayer.clear();
                //}

                var rooms = [];

                for(var i = 0; i < json.length; i++){
                    var roomInfo = json[i];
                    var graphic = ExtrudeGraphicBuilder.buildGraphic(roomInfo, {
                        shape:'#{the_geom}',
                        //title: '#{房间名称}(#{房间编号})',
                        desc: '#{房间名称}(#{房间编号})',
                        //title:'#{ID}_id',
                        //icon: 'http://localhost:8080/zmap/src/zmap/image/marker-icon.png',
                        height:function(props){
                            if(props['空间类型'] === '休闲用房'){
                                return 0;
                            }else{
                                //return parseFloat(props['高度'])
                                return parseFloat(props['离地高度']) + parseFloat(props['高度']);
                            }
                        },
                        baseHeight:function(props){return parseFloat(props['离地高度'])},//function(props){return parseFloat(props['离地高度'])},
                        cw: true,
                        selectSymbol: new Z.ExtrudeSymbol({topColor: "#aa0000", wallColor: "#aaaa00"}),
                        mouseoverSymbol: new Z.ExtrudeSymbol({topColor: "#aa00aa", wallColor: "#00aaaa"}),
                        topColor:'#aaaaaa',
                        opacity: 0.01
                    });
                    //graphic.feature.shape.transformation = transformation;
                    //graphic.feature.shape = thisObj._transformExtrudeShape(graphic.feature.shape, transformation, 0.00032);
                    //graphic.feature.shape.lngStart = true;

                    //graphics.push(graphic);
                    //var roomId = graphic.feature.props['编码'];
                    var room = createRoom(graphic, options);
                    //room.addToLayer(thisObj._roomLayer);
                    //floor.addRooms(room);
                    ////thisObj._applyBuildingUnitEvent(building, "on");
                    ////thisObj._buildings.push(building);
                    ////var roomId = room.getHull().feature.props['编码'];
                    ////thisObj._rooms[roomId] = room;
                    //thisObj._rooms[room.roomId] = room;
                    rooms.push(room);
                }

                //thisObj._roomLayer.addGraphics(graphics);
                if(callback){
                    callback.call(scope, rooms);
                }
            });
        },

        loadEquipments: function(roomId, url, options, callback, scope){
            Z.AjaxRequest.getJSON(url, function(json){
                if(!Array.isArray(json)){
                    return;
                }

                //if(!thisObj._equipmentLayer){
                //    thisObj._equipmentLayer = new Z.GraphicLayer();
                //    thisObj._map.addLayer(thisObj._equipmentLayer);
                //}else{
                //    thisObj._equipmentLayer.clear();
                //}
                //thisObj._equipmentLayer = thisObj._roomLayer;

                var equipments = [];

                for(var i = 0; i < json.length; i++){
                    var roomInfo = json[i];
                    var ownerId = roomInfo["空间编码"];

                    if(ownerId !== roomId){
                        continue;
                    }

                    var graphic = ExtrudeGraphicBuilder.buildGraphic(roomInfo, {
                        shape:'#{the_geom}',
                        //title:'#{ID}_id',
                        desc: '#{名称}(#{类型})',
                        //icon: 'http://localhost:8080/zmap/src/zmap/image/marker-icon.png',
                        height:function(props){
                            return parseFloat(props['离地高度']) + parseFloat(props['自身高度']);
                        },
                        baseHeight:function(props){return parseFloat(props['离地高度']);},
                        cw: true,
                        selectSymbol: new Z.ExtrudeSymbol({topColor: "#aa0000", wallColor: "#aaaa00"}),
                        mouseoverSymbol: new Z.ExtrudeSymbol({topColor: "#aa00aa", wallColor: "#00aaaa"}),
                        topColor:'#ffff00'
                    });
                    //graphic.feature.shape.transformation = transformation;
                    //graphic.feature.shape = thisObj._transformExtrudeShape(graphic.feature.shape, transformation, 0.0004);
                    //graphic.feature.shape.lngStart = true;

                    //graphics.push(graphic);
                    var equipment = createEquipment(graphic, options);
                    //equipment.addToLayer(thisObj._equipmentLayer);
                    //thisObj._applyBuildingUnitEvent(building, "on");
                    //thisObj._buildings.push(building);
                    //var roomId = room.getHull().feature.props['编码'];
                    //this._rooms[roomId] = room;
                    //room.addEquipments(equipment);
                    equipments.push(equipment);
                }

                if(callback){
                    callback.call(scope, equipments);
                }
                //thisObj._roomLayer.addGraphics(graphics);
            });
        }
    }
})();
