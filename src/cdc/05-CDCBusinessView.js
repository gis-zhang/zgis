/**
 * Created by Administrator on 2017/4/29.
 */

var CDCBusinessView = Z.Class.extend({
    includes: Z.EventManager,

    initialize: function(mapView, options){
        options = options || {};
        this._mapView = mapView;
        this._eventCountList = {};
        this._eventItemList = [];

        this._spaceCountList = {};
        this._spaceItemList = [];

        this._deviceCountList = {};
        this._deviceItemList = [];

        this._eventStyle = {
            urgentStyle: new Z.TextSymbol({
                fillSymbol: new Z.FillSymbol({bgColor: "#aa0000"}),
                color: "#ffffff",
                font: {size: "0.8"},
                border: false,
                anchor: true
            }),
            todoStyle: new Z.TextSymbol({
                fillSymbol: new Z.FillSymbol({bgColor: "#6666cc"}),
                color: "#ffffff",
                font: new Z.Font({size: "0.8"}),
                border: false,
                anchor: true
            }),
            noneStyle: new Z.TextSymbol({
                font: new Z.Font({size: "0.8"}),
                border: false,
                anchor: true
            }),
            mouseoverStyle: new Z.TextSymbol({
                fillSymbol: new Z.FillSymbol({bgColor: "#666600"}),
                color: "#ffffff",
                font: new Z.Font({size: "0.9"}),
                anchor: true
            }),
            selectStyle: new Z.TextSymbol({
                fillSymbol: new Z.FillSymbol({bgColor: "#e9967a"}),
                color: "#ffffff",
                font: new Z.Font({size: "0.9"}),
                anchor: true
            }),
            urgentSymbol: new Z.ExtrudeSymbol({
                topColor: "#aa0055",
                wallColor: "#ffffff",
                opacity: 0.9
            }),
            todoSymbol: new Z.TextSymbol({
                topColor: "#aaaa00",
                wallColor: "#f00ff0",
                opacity: 0.9
            })
        };

        this._spaceStyle = new Z.TextSymbol({
            fillSymbol: new Z.FillSymbol({bgColor: "#6666cc"}),
            color: "#ffffff",
            font: new Z.Font({size: "0.8"}),
            anchor: true
        });

        this._images = {
            detailArrow: "../src/cdc/image/yuanjiantouxiao_white.png"
        };

        this._buildingNameCfg = {
            "Rectangle03": "实验楼",
            "Rectangle04": "实验楼附楼",
            "Rectangle05": "实验楼附楼",
            "Object07": "综合楼"
        };

        if(options.images){
            for(var imageKey in options.images){
                this._images[imageKey] = options.images[imageKey];
            }
        }
    },

    changeEventCount: function(eventCountList){
        this._eventCountList = eventCountList || {};
        this.reset();
        this._showBuildingEventTips();
    },

    changeEventList: function(eventItemList){
        this._eventItemList = eventItemList || [];
    },

    selectEventItem: function(eventItem){
        if(!this._mapView){
            return;
        }

        var buildingName = eventItem.buildingRefName,
            floorIndex = eventItem.floorIndex,
            roomId = eventItem.roomRefId,
            equipmentId = eventItem.instrumentRefId;

        this._showOneEquipmentTip(buildingName, floorIndex, roomId, equipmentId);
    },

    doEventItemMouseOver: function(eventItem){
        if(!this._mapView){
            return;
        }

        var buildingName = eventItem.buildingRefName,
            floorIndex = eventItem.floorIndex,
            roomId = eventItem.roomRefId,
            equipmentId = eventItem.instrumentRefId;

        this._mapView.doMouseOver(buildingName, floorIndex, roomId, equipmentId);
    },

    doEventItemMouseOut: function(eventItem){
        if(!this._mapView){
            return;
        }

        var buildingName = eventItem.buildingRefName,
            floorIndex = eventItem.floorIndex,
            roomId = eventItem.roomRefId,
            equipmentId = eventItem.instrumentRefId;

        this._mapView.doMouseOut(buildingName, floorIndex, roomId, equipmentId);
    },

    reset: function(){
        if(this._mapView){
            this._mapView.quitInnerMode("Rectangle3");
        }
    },

    changeSpaceCount: function(spaceCountList){
        this._spaceCountList = spaceCountList || {};
        this.reset();
        this._showBuildingEventTips();
    },

    _showBuildingEventTips: function(){
        //var event = {"Rectangle03":{"overdue":0,"toDo":0,"urgent":1},"Rectangle04":{"overdue":0,"toDo":1,"urgent":0},"Object07":{"overdue":0,"toDo":1,"urgent":0}};

        if(!this._mapView){
            return;
        }

        var buildingTips = {},
            map = this._mapView,
            event = this._eventCountList;

        for(var key in event){
            var eventCount = event[key]['toDo'] + event[key]['overdue'] + event[key]['urgent'];
            //var contentNode = this._createBuildingTitleContent(map, key, eventCount, "../src/cdc/image/yuanjiantouxiao.png");   //this._images
            var contentNode = this._createBuildingTitleContent(map, key, eventCount, this._images.detailArrow);
            var curStyle = null;

            if(event[key]['overdue'] > 0){
                curStyle = this._eventStyle.urgentStyle;
            }else if(event[key]['urgent'] > 0){
                curStyle = this._eventStyle.urgentStyle;
            }else if(event[key]['toDo'] > 0){
                curStyle = this._eventStyle.todoStyle;
            }else{
                curStyle = this._eventStyle.noneStyle;
            }

            var mouseOverStyle = this._eventStyle.mouseoverStyle,
                selectStyle = this._eventStyle.selectStyle;
            buildingTips[key] = {content: contentNode, symbol: curStyle, mouseoverSymbol: mouseOverStyle, selectSymbol: selectStyle};
        }

        if(map.hasLoaded()){
            map.showBuildingTips(buildingTips);
        }else{
            map.on("load", function(){
                map.showBuildingTips(buildingTips);
            });
        }
    },

    _showRoomEventTips: function(buildingName, floorIndex){
        var roomTips = {},
            roomSymbols = {},
            eventCount = {};

        for(var i = 0; i < this._eventItemList.length; i++){
            var curEventItem = this._eventItemList[i];

            //if(curEventItem.floorIndex !==floorIndex){
            if(curEventItem.floorIndex !== 2){    //为了匹配示例数据，此处用写死的方式，需要在正式数据出来后修改
                continue;
            }

            var roomId = curEventItem.roomRefId,
                roomName = curEventItem.roomName;

            if(!roomName){
                var roomInfo = this._mapView.getRoomInfo(roomId) || {};//alert(JSON.stringify(roomInfo));
                roomName = roomInfo["房间名称"] || curEventItem.roomno;
            }

            if(!eventCount[roomId]){
                eventCount[roomId] = {
                    roomName: roomName, //curEventItem.roomName,
                    totle: 1,
                    status: curEventItem.eventStatus            //事件的紧急程度
                };
            }else{
                eventCount[roomId].totle++;
            }

            if(curEventItem.eventStatus > eventCount[roomId].status){
                eventCount[roomId].status = curEventItem.eventStatus;
            }
        }

        for(var key in eventCount){
            var contentNode = this._createRoomTitleContent(this._mapView, buildingName, floorIndex, key,
                //eventCount[key].roomName, eventCount[key].totle, "../src/cdc/image/yuanjiantouxiao.png");
                eventCount[key].roomName, eventCount[key].totle, this._images.detailArrow);
            var curStyle = null;

            if(eventCount[key].status >= 2){
                curStyle = this._eventStyle.urgentStyle;
                roomSymbols[key] = this._eventStyle.urgentSymbol;
            }else if(eventCount[key].status === 1){
                curStyle = this._eventStyle.urgentStyle;
                roomSymbols[key] = this._eventStyle.urgentSymbol;
            }else if(eventCount[key].status === 0 && eventCount[key].total > 0){
                curStyle = this._eventStyle.todoStyle;
                roomSymbols[key] = this._eventStyle.todoSymbol;
            }else{
                curStyle = this._eventStyle.noneStyle;
            }

            var mouseOverStyle = this._eventStyle.mouseoverStyle,
                selectStyle = this._eventStyle.selectStyle;
            roomTips[key] = {content: contentNode, symbol: curStyle, mouseoverSymbol: mouseOverStyle, selectSymbol: selectStyle};
        }

        var map = this._mapView;
        this._mapView.showRoomTips(buildingName, floorIndex, roomTips, {}, function(){map.updateRoomSymbols(roomSymbols);});
        //map.updateRoomSymbols(roomSymbols);
    },

    _showEquipmentTips: function(buildingName, floorIndex, roomId){
        var equipmentTips = {},
            equipmentSymbols = {},
            eventList = this._eventItemList;

        for(var key in eventList){
            var contentNode = eventList[key].eventName;
            var curStyle = null;

            if(eventList[key].eventStatus >= 2){
                curStyle = this._eventStyle.urgentStyle;
                equipmentSymbols[key] = this._eventStyle.urgentSymbol;
            }else if(eventList[key].eventStatus === 1){
                curStyle = this._eventStyle.urgentStyle;
                equipmentSymbols[key] = this._eventStyle.urgentSymbol;
            }else if(eventList[key].eventStatus === 0){
                curStyle = this._eventStyle.todoStyle;
                equipmentSymbols[key] = this._eventStyle.todoSymbol;
            }else{
                curStyle = this._eventStyle.noneStyle;
            }

            //var itemKey = eventList[key].roomRefId + "_" + eventList[key].targetId;
            var mouseOverStyle = this._eventStyle.mouseoverStyle,
                selectStyle = this._eventStyle.selectStyle;
            //roomTips[key] = {content: contentNode, symbol: curStyle, mouseoverSymbol: mouseOverStyle, selectSymbol: selectStyle};
            var itemKey = eventList[key].roomRefId + "_" + eventList[key].instrumentRefId;
            equipmentTips[itemKey] = {content: contentNode, symbol: curStyle, mouseoverSymbol: mouseOverStyle, selectSymbol: selectStyle};
        }

        var map = this._mapView;
        //map.showEquipmentTips("Rectangle03", 1, "03002050", equipmentTips, {}, function(){map.updateEquipmentSymbols(equipmentSymbols);});
        map.showEquipmentTips(buildingName, floorIndex, roomId, equipmentTips, {}, function(){map.updateEquipmentSymbols(equipmentSymbols);});
    //			map.updateEquipmentSymbols(equipmentSymbols);
    },

    _showOneEquipmentTip: function(buildingName, floorIndex, roomId, equipmentId){
        var equipmentTips = {},
            equipmentSymbols = {},
            eventList = this._eventItemList;

        for(var key in eventList){
            if(equipmentId !== eventList[key].instrumentRefId){
                continue;
            }

            var contentNode = eventList[key].eventName;
            var curStyle = null;

            if(eventList[key].eventStatus >= 2){
                curStyle = this._eventStyle.urgentStyle;
                equipmentSymbols[key] = this._eventStyle.urgentSymbol;
            }else if(eventList[key].eventStatus === 1){
                curStyle = this._eventStyle.urgentStyle;
                equipmentSymbols[key] = this._eventStyle.urgentSymbol;
            }else if(eventList[key].eventStatus === 0){
                curStyle = this._eventStyle.todoStyle;
                equipmentSymbols[key] = this._eventStyle.todoSymbol;
            }else{
                curStyle = this._eventStyle.noneStyle;
            }

            //var itemKey = eventList[key].roomRefId + "_" + eventList[key].targetId;
            var itemKey = eventList[key].roomRefId + "_" + eventList[key].instrumentRefId;
            equipmentTips[itemKey] = {content: contentNode, symbol: curStyle};
        }

        var map = this._mapView;
        //map.showEquipmentTips("Rectangle03", 1, "03002050", equipmentTips, {}, function(){map.updateEquipmentSymbols(equipmentSymbols);});
        map.showEquipmentTips(buildingName, floorIndex, roomId, equipmentTips, {}, function(){map.updateEquipmentSymbols(equipmentSymbols);});
        //			map.updateEquipmentSymbols(equipmentSymbols);
    },

    _createImgButton: function(imgUrl, onclick){
        var aNode = document.createElement("a");
        aNode.href = "#";
        var imgNode = document.createElement("img");
        imgNode.src = imgUrl;
        //var imgNode = document.createElement("div");
        //imgNode.style.background = "url(\"" + imgUrl + "\") no-repeat center center";
        imgNode.style.height = "18px";
        imgNode.style.width = "18px";
        imgNode.style.marginLeft = "10px";
        imgNode.style.marginRight = "10px";
        aNode.appendChild(imgNode);

        if(typeof onclick === "function"){
            aNode.onclick = onclick;
        }

        return aNode;
    },

    _createBuildingTitleContent: function(map, buildingName, eventCount, imgUrl){
        var thisObj = this;
        var onclick = function(){
            //map.showBuildingInner(buildingName);
            thisObj._showRoomEventTips(buildingName, 2);
            thisObj._mapView.zoomToBuilding(buildingName);
        };

        var contentNode = document.createElement("div"),
            textNode = document.createElement("span"),
            buttonNode = this._createImgButton(imgUrl, onclick),
            buildingText = this._buildingNameCfg[buildingName] || buildingName;

        contentNode.style.padding = "1px 5px";
        contentNode.style.display = "flex";
        textNode.innerHTML = buildingText + " 事件数:" + eventCount;

        contentNode.appendChild(textNode);

        if(buildingName === "Rectangle03"){
            contentNode.appendChild(buttonNode);
        }

        return contentNode;
    },

    _createRoomTitleContent: function(map, buildingName, floorIndex, roomId, roomName, eventCount, imgUrl){
        var thisObj = this;
        var onclick = function(){
            //map.showRoomInner(buildingName, floorIndex, roomId);
            thisObj._showEquipmentTips(buildingName, floorIndex, roomId);
            thisObj._mapView.zoomToRoom(buildingName, floorIndex, roomId);
        };

        var contentNode = document.createElement("div"),
            textNode = document.createElement("span"),
            buttonNode = this._createImgButton(imgUrl, onclick);

        contentNode.style.padding = "1px 5px";
        contentNode.style.display = "flex";
        textNode.innerHTML = roomName + " 事件数:" + eventCount;

        contentNode.appendChild(textNode);

        //if(buildingName === "Rectangle03"){
        contentNode.appendChild(buttonNode);
        //}

        return contentNode;
    },

    _showBuildingSpaceTips: function() {
        //var event = {"Rectangle03":{"overdue":0,"toDo":0,"urgent":1},"Rectangle04":{"overdue":0,"toDo":1,"urgent":0},"Object07":{"overdue":0,"toDo":1,"urgent":0}};

        if (!this._mapView) {
            return;
        }

        var buildingTips = {},
            map = this._mapView,
            event = this._eventCountList;

        for (var key in event) {
            //var contentNode = this._createBuildingTitleContent_space(map, key, event[key]['count'], "../src/cdc/image/yuanjiantouxiao.png");
            var contentNode = this._createBuildingTitleContent_space(map, key, event[key]['count'], this._images.detailArrow);
            var curStyle = this._spaceStyle;

            //if (event[key]['overdue'] > 0) {
            //    curStyle = this._eventStyle.urgentStyle;
            //} else if (event[key]['urgent'] > 0) {
            //    curStyle = this._eventStyle.urgentStyle;
            //} else if (event[key]['toDo'] > 0) {
            //    curStyle = this._eventStyle.todoStyle;
            //} else {
            //    curStyle = this._eventStyle.noneStyle;
            //}
            //
            buildingTips[key] = {content: contentNode, symbol: curStyle};
        }

        if (map.hasLoaded()) {
            map.showBuildingTips(buildingTips);
        } else {
            map.on("load", function () {
                map.showBuildingTips(buildingTips);
            });
        }
    },

    _showRoomSpaceTips: function(buildingName, floorIndex){
        var roomTips = {},
            roomSymbols = {},
            eventCount = {};

        for(var i = 0; i < this._spaceItemList.length; i++){
            var curSpaceItem = this._spaceItemList[i];

            //if(curEventItem.floorIndex !==floorIndex){
            if(curSpaceItem.floorIndex !== 2){    //为了匹配私示例数据，此处用写死的方式，需要在正式数据出来后修改
                continue;
            }

            var roomId = curSpaceItem.roomRefId,
                roomName = curSpaceItem.roomName;

            if(!roomName){
                var roomInfo = this._mapView.getRoomInfo(roomId) || {};
                roomName = roomInfo["房间名称"] || curSpaceItem.roomno;
            }

            //if(!eventCount[roomId]){
            //    eventCount[roomId] = {
            //        roomName: curSpaceItem.roomName,
            //        totle: 1,
            //        status: curSpaceItem.eventStatus            //事件的紧急程度
            //    };
            //}else{
            //    eventCount[roomId].totle++;
            //}

            //if(curSpaceItem.eventStatus > eventCount[roomId].status){
            //    eventCount[roomId].status = curSpaceItem.eventStatus;
            //}
            eventCount[roomId] = roomName;
        }

        for(var key in eventCount){
            var contentNode = this._createRoomTitleContent_space(this._mapView, buildingName, floorIndex, key, eventCount[key]);
            var curStyle = this._spaceStyle;
            //var curStyle = null;
            //
            //if(eventCount[key].status >= 2){
            //    curStyle = this._eventStyle.urgentStyle;
            //    roomSymbols[key] = this._eventStyle.urgentSymbol;
            //}else if(eventCount[key].status === 1){
            //    curStyle = this._eventStyle.urgentStyle;
            //    roomSymbols[key] = this._eventStyle.urgentSymbol;
            //}else if(eventCount[key].status === 0 && eventCount[key].total > 0){
            //    curStyle = this._eventStyle.todoStyle;
            //    roomSymbols[key] = this._eventStyle.todoSymbol;
            //}else{
            //    curStyle = this._eventStyle.noneStyle;
            //}

            roomTips[key] = {content: contentNode, symbol: curStyle};
        }

        var map = this._mapView;
        this._mapView.showRoomTips(buildingName, floorIndex, roomTips, {}, function(){map.updateRoomSymbols(roomSymbols);});
        //map.updateRoomSymbols(roomSymbols);
    },

    _createBuildingTitleContent_space: function(map, buildingName, spaceCount, imgUrl){
        var thisObj = this;
        var onclick = function(){
            //map.showBuildingInner(buildingName);
            thisObj._showRoomSpaceTips(buildingName, 1);
        };

        var contentNode = document.createElement("div"),
            textNode = document.createElement("span"),
            buttonNode = this._createImgButton(imgUrl, onclick);

        contentNode.style.padding = "1px 5px";
        contentNode.style.display = "flex";
        textNode.innerHTML = buildingName + " 空间数:" + spaceCount;

        contentNode.appendChild(textNode);

        if(buildingName === "Rectangle03"){
            contentNode.appendChild(buttonNode);
        }

        return contentNode;
    },

    _createRoomTitleContent_space: function(map, buildingName, floorIndex, roomId, roomName){
        var thisObj = this;
        //var onclick = function(){
        //    //map.showRoomInner(buildingName, floorIndex, roomId);
        //    thisObj._showEquipmentTips(buildingName, floorIndex, roomId);
        //};

        var contentNode = document.createElement("div"),
            textNode = document.createElement("span");
            //buttonNode = this._createImgButton(imgUrl, onclick);

        contentNode.style.padding = "1px 5px";
        contentNode.style.display = "flex";
        //textNode.innerHTML = roomName + " 事件数:" + eventCount;
        textNode.innerHTML = roomName;

        contentNode.appendChild(textNode);

        //if(buildingName === "Rectangle03"){
        //contentNode.appendChild(buttonNode);
        //}

        return contentNode;
    },
});


