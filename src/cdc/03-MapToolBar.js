/**
 * Created by Administrator on 2017/4/29.
 */

var MapToolBar = Z.Class.extend({
    initialize: function(containerId){
        this._createContainer(containerId);

        this.uid = IDGenerator.getUUID();
        this._mapView = null;
        var thisObj = this;
        this._imgLibPath = "../src/cdc/image/";
        this._iconCfg = {};

        this._items = [{
            id: thisObj.uid + '_plus',
            key: 'plus',
            style: 'zmap-toolbar-icon zmap-toolbar-icon-plus-round',
            text: '放大',
            //image: 'fangda.png',
            onclick: function(){
                if(thisObj._mapView){
                    thisObj._mapView.zoomIn();
                }
            }
        },{
            id: thisObj.uid + '_minus',
            key: 'minus',
            style: 'zmap-toolbar-icon zmap-toolbar-icon-minus-round',
            text: '缩小',
            //image: 'suoxiao.png',
            onclick: function(){
                if(thisObj._mapView){
                    thisObj._mapView.zoomOut();
                }
            }
        },{
            id: thisObj.uid + '_turnleft',
            key: 'turnleft',
            style: 'zmap-toolbar-icon zmap-toolbar-icon-minus-round',
            text: '左旋',
            //image: 'zuozhuan.png',
            onclick: function(){
                if(thisObj._mapView){
                    thisObj._mapView.offsetRotateByEuler({x: 0, y: 0, z: -5});
                }
            }
        },{
            id: thisObj.uid + '_turnright',
            key: 'turnright',
            style: 'zmap-toolbar-icon zmap-toolbar-icon-minus-round',
            text: '右旋',
            image: 'youzhuan.png',
            onclick: function(){
                if(thisObj._mapView){
                    thisObj._mapView.offsetRotateByEuler({x: 0, y: 0, z: 5});
                }
            }
        },{
            id: thisObj.uid + '_down',
            key: 'down',
            style: 'zmap-toolbar-icon zmap-toolbar-icon-minus-round',
            text: '下旋',
            //image: 'xiayi.png',
            onclick: function(){
                if(thisObj._mapView){
                    thisObj._mapView.offsetRotateByEuler({x: -5, y: 0, z: 0});
                }
            }
        },{
            id: thisObj.uid + '_up',
            key: 'up',
            style: 'zmap-toolbar-icon zmap-toolbar-icon-minus-round',
            text: '上旋',
            //image: 'shangyi.png',
            onclick: function(){
                if(thisObj._mapView){
                    thisObj._mapView.offsetRotateByEuler({x: 5, y: 0, z: 0});
                }
            }
        },{
            id: thisObj.uid + '_fullmap',
            key: 'fullmap',
            style: 'zmap-toolbar-icon zmap-toolbar-icon-minus-round',
            text: '全图',
            //image: 'quanpin.png',
            onclick: function(){
                if(thisObj._mapView){
                    thisObj._mapView.fullMap();
                }
            }
        }];
    },

    setImgLibPath: function(path){
        if(path !== undefined){
            this._imgLibPath = path;
            this._createPanel();
        }
    },

    setIcons: function(iconCfg){
        if(iconCfg){
            this._iconCfg = iconCfg;
            this._createPanel();
        }
    },

    addTo: function(mapView){
        if(!mapView || mapView === this._mapView){
            return;
        }

        //if(this._mapView){
        //    this._applyMapViewEvent("off");
        //}

        this._mapView = mapView;
        //this._applyMapViewEvent("on");

        this._createPanel();
    },

    //setBuilding: function(building){
    //    if(!building || building === this._currentBuilding){
    //        return;
    //    }
    //
    //    if(this._currentBuilding){
    //        building.off("componentsadd", this._updateFloorPanel, this);
    //        building.off("componentsremove", this._updateFloorPanel, this);
    //    }
    //
    //    this._currentBuilding = building;
    //
    //    building.on("componentsadd", this._updateFloorPanel, this);
    //    building.on("componentsremove", this._updateFloorPanel, this);
    //
    //    this._updateFloorPanel();
    //},

    show: function(){
        this.container.style.display = "block";
    },

    hide: function(){
        this.container.style.display = "none";
    },

    _createContainer: function(containerId){
        var parentNode = Z.DomUtil.isDom(containerId) ? containerId : (document.getElementById(containerId) || document.body);
        var container = document.createElement("div");
        parentNode.appendChild(container);
        container.className = "zmap-toolbar-container zmap-toolbar-card zmap-toolbar-card-shadow";

        var parentWidth = parentNode.offsetWidth || parentNode.clientWidth,
            barWidth = container.offsetWidth || container.clientWidth,
            left = 0;
        left = (parentWidth - barWidth) / 2;
        container.style.left = left + "px";

        this._container = container;
    },

    _createPanel: function(){
        var elementContainerElement = this._container,
            groupId = this.uid + "_elementGroup",
            thisObj = this;
        elementContainerElement.innerHTML = "";

        for(var i = 0; i < this._items.length; i++){
            var item = this._items[i];
            this._createToolItem(elementContainerElement, item);
        }
    },

    _createToolItem: function(containerNode, itemCfg){
        var element = document.createElement("i");
        element.id = itemCfg.id;
        element.className = itemCfg.style;
        element.onclick = itemCfg.onclick;
        containerNode.appendChild(element);

        var image = this._iconCfg[itemCfg.key];

        if(image){
            //element.innerHTML = "<img src='" + (this._imgLibPath + itemCfg.image) + "'/>";
            element.innerHTML = "<div style='background: url(\"" + image + "\") no-repeat center center'></div>";
        }
        else{
            element.innerHTML = "<span>" + (itemCfg.text || "") + "</span>";
        }

        return element;
    }
});