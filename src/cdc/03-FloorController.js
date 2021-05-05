/**
 * Created by Administrator on 2017/4/29.
 */

var FloorController = Z.Class.extend({
    includes: Z.EventManager,

    initialize: function(containerId){
        //this._buildingContainer = null;
        //this._floorContainer = null;
        //this._toolsContainer = null;
        //this._createContainer(containerId);
        this._widget = new FloorWidget(containerId);

        this._currentBuilding = null;
        this._floorTips = null;
        this.uid = IDGenerator.getUUID();

        this._buildingNameCfg = {
            "Rectangle03": "实验楼"
        };

        this._applyWidgetEvent("on");
    },

    addTo: function(mapView){
        if(!mapView || mapView === this._mapView){
            return;
        }

        if(this._mapView){
            this._applyMapViewEvent("off");
        }

        this._mapView = mapView;
        this._applyMapViewEvent("on");
    },

    bindToBuilding: function(building){
        if(!building || building === this._currentBuilding){
            return;
        }

        if(this._currentBuilding){
            building.off("componentsadd", this._updateFloorPanel, this);
            building.off("componentsremove", this._updateFloorPanel, this);
        }

        this._currentBuilding = building;

        building.on("componentsadd", this._updateFloorPanel, this);
        building.on("componentsremove", this._updateFloorPanel, this);

        this._updateFloorPanel();
    },

    show: function(){
        //this._container.style.display = "block";
        this._widget.show();
    },

    hide: function(){
        //this._container.style.display = "none";
        this._widget.hide();
    },

    /**
     *
     * @param floorTips : [
     *   {floorIndex: 1, content: ''},
     *   {floorIndex: 2, content: ''}
     * ]
     */
    setFloorTip: function(floorTips){
        floorTips = floorTips || [];
        floorTips = Array.isArray(floorTips) ? floorTips : [floorTips];
        this._floorTips = floorTips;
        //this._refreshFloorTips(this._floorTips);
        this._widget.setFloorTip(this._floorTips);
    },

    clearFloorTip: function(){
        this._floorTips = null;
        //this._refreshFloorTips(this._floorTips);
        this._widget.setFloorTip(this._floorTips);
    },

    reset: function(){
        this._currentBuilding = null;
        this._floorTips = null;
        //this._rebuildFloorPanel([]);
        //this.clearFloorTip();
        this._widget.reset();
        this._mapView.fullMap();
    },

    //_createContainer: function(containerId){
    //    var parentNode = Z.DomUtil.isDom(containerId) ? containerId : (document.getElementById(containerId) || document.body);
    //    var container = document.createElement("div");
    //    parentNode.appendChild(container);
    //    container.className = "zmap-floor-container zmap-floor-card zmap-floor-card-shadow";
    //
    //    //var parentHeight = parentNode.offsetHeight || parentNode.clientHeight,
    //    //    barHeight = container.offsetHeight || container.clientHeight,
    //    //    top = 0;
    //    //top = (parentHeight - barHeight) / 2;
    //    //container.style.top = top + "px";
    //
    //    this._container = container;
    //
    //    this._buildingContainer = document.createElement("ul");
    //    this._container.appendChild(this._buildingContainer);
    //    this._floorContainer = document.createElement("ul");
    //    this._container.appendChild(this._floorContainer);
    //    this._toolsContainer = document.createElement("ul");
    //    this._container.appendChild(this._toolsContainer);
    //
    //    this._reposition();
    //},
    //
    //_reposition: function(){
    //    if(!this._container){
    //        return;
    //    }
    //
    //    var parentNode = this._container.parentNode;
    //
    //    if(!parentNode){
    //        return;
    //    }
    //
    //    var oldDisplayValue = this._container.style.display;
    //
    //    if(oldDisplayValue != "block"){
    //        this._container.style.display = "block";
    //    }
    //
    //    var parentHeight = parentNode.offsetHeight || parentNode.clientHeight,
    //        barHeight = this._container.offsetHeight || this._container.clientHeight,
    //        top = 0;
    //    top = (parentHeight - barHeight) / 2;
    //    this._container.style.top = top + "px";
    //
    //    if(oldDisplayValue != "block"){
    //        this._container.style.display = oldDisplayValue;
    //    }
    //},

    _applyWidgetEvent: function(onOff){
        if(!this._widget){
            return;
        }

        this._widget[onOff]("floorSelect", this._onFloorSelect, this);
        this._widget[onOff]("quitFloors", this._onQuitFloors, this);
    },

    _onFloorSelect: function(event){
        if(!this._mapView){
            return;
        }

        this._mapView.showFloorInner(this._currentBuilding.name, event.floorIndex);
    },

    _onQuitFloors: function(event){
        if(this._mapView){
            this._mapView.showBuilding("Rectangle04");
            this._mapView.showBuilding("Rectangle05");

            if(this._currentBuilding){
                this._mapView.quitInnerMode(this._currentBuilding.name);
            }

            this._mapView.cancelBuildingSelect();
        }

        this._widget.hide();
        this.reset();
    },

    _applyMapViewEvent: function(onOff){
        if(!this._mapView){
            return;
        }

        this._mapView[onOff]("buildingselect", this._onBuildingSelect, this);
    },

    _onBuildingSelect: function(event){
        if(!event){
            return;
        }

        var building = event.object;

        if(!building){
            return;
        }

        var mode = building.getMode();

        if(mode === BuildingMode.INNER){
            this.bindToBuilding(building);
        }
    },

    _updateFloorPanel: function(){
        if(!this._currentBuilding){
            return;
        }

        var floorInfo = this._currentBuilding.getFloorsInfo(),
            buildingName = this._currentBuilding.name;
        //this._rebuildFloorPanel(floorInfo);
        //this._refreshFloorTips(this._floorTips);
        //this._reposition();
        var widgetFloorInfo = this._getWidgetFloorInfo(floorInfo, this._buildingNameCfg[buildingName] || buildingName);
        this._widget.setFloorInfo(widgetFloorInfo);
        this._widget.reposition();
    },

    _getWidgetFloorInfo: function(buildingFloorInfo, buildingName){
        var widgetFloorInfo = [];

        for(var i = 0; i < buildingFloorInfo.length; i++){
            var item = {
                index: buildingFloorInfo[i].index,
                text: this._getFloorItemText(buildingFloorInfo[i].index),
                data: buildingFloorInfo[i]
            };

            widgetFloorInfo[i] = item;
        }

        return {floors: widgetFloorInfo, buildingName: buildingName};
    },

    _getFloorItemText: function(floorIndex){
        if(floorIndex < 0){
            return "B" + floorIndex;
        }else{
            return "F" + floorIndex;
        }
    }

    //_rebuildFloorPanel: function(floorInfo){
    //    var elementContainerElement = this._floorContainer,
    //        groupId = this.uid + "_floors",
    //        floorInfo = floorInfo || (Array.isArray(floorInfo) ? floorInfo : [floorInfo]),
    //        thisObj = this;
    //    elementContainerElement.innerHTML = "";
    //    floorInfo.sort(function(a, b){
    //        return b.index - a.index
    //    });
    //
    //    for(var i = 0; i < floorInfo.length; i++){
    //        var item = floorInfo[i];
    //        this._createFloorItem(elementContainerElement, groupId, item);
    //    }
    //
    //    this._toolsContainer.innerHTML = "";
    //    this._createQuitBtn(this._toolsContainer, groupId);
    //}//,

    //_createFloorItem: function(containerNode, groupId, itemCfg){
    //    var element = document.createElement("li");
    //    element.id = groupId + "_" + itemCfg.index;
    //    element.floorIndex = itemCfg.index;
    //    //element.className = itemCfg.style;
    //    var thisObj = this;
    //    element.onclick = function(){
    //        var floorElements = thisObj._floorContainer.childNodes;
    //
    //        for(var i = 0; i < floorElements.length; i++){
    //            if(floorElements[i].className){
    //                floorElements[i].className = "";
    //            }
    //        }
    //
    //        element.className = "zmap-floor-active";
    //
    //        //var floorsInfo = thisObj._currentBuilding.getFloorsInfo(),
    //        //    floorIndexForShow = [];
    //        //
    //        //for(var i = 0; i < floorsInfo.length; i++){
    //        //    if(floorsInfo[i].index <= itemCfg.index){
    //        //        floorIndexForShow.push(floorsInfo[i].index);
    //        //    }
    //        //}
    //        //
    //        //thisObj._currentBuilding.showFloorsByIndex(floorIndexForShow);
    //        thisObj.fire("floorSelect", {buildingName: thisObj._currentBuilding.getHull().feature.props["name"], floorIndex: element.floorIndex});
    //    };
    //    //element.innerHTML = "<a href='#'>" + ("F" + itemCfg.index) + "</a>";
    //    element.innerHTML = this._getFloorItemText(itemCfg.index);
    //    containerNode.appendChild(element);
    //
    //    return element;
    //},
    //
    //_getFloorItemText: function(floorIndex, tip){
    //    var text = "<a href='#'>";
    //
    //    if(floorIndex < 0){
    //        text += ("B" + floorIndex);
    //    }else{
    //        text += ("F" + floorIndex);
    //    }
    //
    //    if(tip){
    //        text += "(" + tip + ")";
    //    }
    //
    //    text += "</a>";
    //
    //    return text;
    //},
    //
    //_createQuitBtn: function(containerNode, groupId){
    //    var element = document.createElement("li");
    //    element.id = groupId + "_quit";
    //    var thisObj = this;
    //    element.onclick = function(){
    //        thisObj.fire("quitFloors", {buildingName: thisObj._currentBuilding.getHull().feature.props["name"]});
    //    };
    //    //element.innerHTML = "<a href='#'>" + ("F" + itemCfg.index) + "</a>";
    //    element.innerHTML = "<a href='#'>退出</a>";
    //    containerNode.appendChild(element);
    //
    //    return element;
    //},
    //
    //_refreshFloorTips: function(floorTips){
    //    if(!floorTips){
    //        return;
    //    }
    //
    //    for(var i = 0; i < floorTips.length; i++){
    //        this._refreshTipItem(floorTips[i].floorIndex, floorTips[i].content);
    //    }
    //},
    //
    //_refreshTipItem: function(floorIndex, content){
    //    var liElements = this._floorContainer.getElementsByTagName("li");
    //
    //    for(var i = 0; i < liElements.length; i++){
    //        if(liElements[i].floorIndex === floorIndex){
    //            liElements[i].innerHTML = this._getFloorItemText(floorIndex, content);
    //            break;
    //        }
    //    }
    //}

    //_createFloorsPanel: function(floorInfo){
    //    var elementContainerElement = this._container,
    //        groupId = this.uid + "_elementGroup",
    //        thisObj = this;
    //    elementContainerElement.innerHTML = "";
    //
    //    for(var i = 0; i < floorInfo.length; i++){
    //        var elementNode = this._createCheckBox(elementContainerElement, groupId, "F" + floorInfo[i].index);
    //        elementNode.checked = true;
    //        elementNode.floorIndex = floorInfo[i].index;
    //        elementNode.onclick = function(){
    //            var selectedFloors = thisObj._getSelectFloors();
    //            thisObj._currentBuilding.showFloorsByIndex(selectedFloors);
    //        };
    //    }
    //},
    //
    //_createCheckBox: function(containerNode, name, text){
    //    var element = document.createElement("input");
    //    element.type="checkbox";
    //    element.name=name;
    //    containerNode.appendChild(element);
    //    containerNode.appendChild(document.createTextNode(text));
    //    containerNode.appendChild(document.createElement("br"));
    //
    //    return element;
    //},
    //
    //_getSelectFloors: function(){
    //    var elementCheckBoxes = document.getElementsByName(this.uid + "_elementGroup"),
    //        floorIndexes = [];
    //
    //    for(var j = 0; j < elementCheckBoxes.length; j++){
    //        if(elementCheckBoxes[j].checked){
    //            //elementTypes[elementCheckBoxes[j].elementType] = "1";
    //            floorIndexes.push(elementCheckBoxes[j].floorIndex);
    //        }
    //    }
    //
    //    return floorIndexes;
    //}
});