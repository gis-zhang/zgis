function Map(container, mapOptions) {
    var _options = mapOptions ? this._initOptions(mapOptions) : (MapConfig || {});
    var options = Util.cloneObject(_options);
    options.crs = options.crs ? options.crs.toLowerCase() : "epsg3857";

    if (options.crs == "epsg3857") { 
        options.crs = L.CRS.EPSG3857;
    }else if(options.crs == "epsg4326"){
        options.crs = L.CRS.EPSG4326;
    }else if(options.crs == "simple"){
        options.crs = L.CRS.Simple;
    } else if (options.crs == "perspective") {
        options.crs = L.CRS.Perspective.clone();

        if (options.levelDefine) {
            options.crs.origin = new L.LatLng(options.levelDefine.origin.lat, options.levelDefine.origin.lng);
            options.crs.levelDefine = options.levelDefine.lod;
        }
    } else {
        options.crs = L.CRS.CustomLevel.clone();

        if (options.levelDefine) {
            options.crs.origin = new L.LatLng(options.levelDefine.origin.lat, options.levelDefine.origin.lng);
            options.crs.levelDefine = options.levelDefine.lod;
        }
    }

    if (options.crs === L.CRS.CustomLevel || options.crs === L.CRS.Perspective) {
        var maxDefLevel = options.crs.levelDefine[options.crs.levelDefine.length - 1].level;

        if (options.maxZoom > maxDefLevel) {
            options.maxZoom = maxDefLevel;
        }

        if (options.minZoom > maxDefLevel) {
            options.minZoom = maxDefLevel;
        }

        if (options.zoom > maxDefLevel) {
            options.zoom = maxDefLevel;
        }
    }

    if (options.center) {
        options.center = L.latLng(parseFloat(options.center.lat), parseFloat(options.center.lng));
    } else if (options.maxBounds) {
        var centerLat = (options.maxBounds[0][0] + options.maxBounds[1][0]) / 2;
        var centerLng = (options.maxBounds[0][1] + options.maxBounds[1][1]) / 2;
        options.center = L.latLng(centerLat, centerLng);
    } else {
        options.center = L.latLng(parseFloat(30), parseFloat(100));
    }

    if (options.maxBounds) {
        var southWest = L.latLng(options.maxBounds[0][0], options.maxBounds[0][1]),
        northEast = L.latLng(options.maxBounds[1][0], options.maxBounds[1][1]);

        options.maxBounds = L.latLngBounds(southWest, northEast);
    }

    //add default zoomControl
    if (options.zoomSlider) {
        var zoomCtrlType = options.zoomSlider.type.toLowerCase();

        if (zoomCtrlType == "small") {
            options.zoomControl = true;
        } else {
            options.zoomControl = false;
        }
    }

    //disable doubleclickzoom
    options.doubleClickZoom = false;
    options.attributionControl = false;

    this.map = L.map(container, options); //.setView([33, 119.2], 13);
    this.options = options;
    //this.showEagle();

    this.attributionControl = new L.Control.Attribution({prefix: "天地图"});
    this.map.addControl(this.attributionControl);

    //add plugin zoomControl
    if (options.zoomSlider) {
        var zoomCtrlType = options.zoomSlider.type.toLowerCase();

        if (zoomCtrlType == "slider") {
            this.map.addControl(new L.Control.Zoomslider()) ;
        }
    }

    //disable context menu
    this.map.on("contextmenu", function () { return false; }, this);

    this.viewFactor = 1;
    this.zAngle = 90;
}

Map.prototype._initOptions = function(options){
    var mapOptions = MapConfig || {};
    
    for (var i in options) {
        mapOptions[i] = options[i];
    }

    return mapOptions;
};

Map.prototype._createLayer = function (layerConfig) {
    if (!layerConfig) {
        return;
    }

    layerConfig = layerConfig instanceof Array ? layerConfig : [layerConfig];
    //var l = L.layerGroup();
    var layerGroup = [];

    for (var i = 0; i < layerConfig.length; i++) {
        var curLyr;
        var lyrType = layerConfig[i].type ? layerConfig[i].type.toLowerCase() : "";

        if (lyrType == "wms") {
            curLyr = L.tileLayer.wms(layerConfig[i].url, layerConfig[i].params);
        } else if (lyrType == "wmts") {
            curLyr = new L.TileLayer.WMTS(layerConfig[i].url, layerConfig[i].params);
        } else if (lyrType == "tdtvector") {
            curLyr = new L.TileLayer.TDT.Vector();
        } else if (lyrType == "tdtvectoranno") {
            curLyr = new L.TileLayer.TDT.VectorAnno();
        } else if (lyrType == "tdtraster") {
            curLyr = new L.TileLayer.TDT.Raster();
        } else if (lyrType == "tdtrasteranno") {
            curLyr = new L.TileLayer.TDT.RasterAnno();
        }

        if (curLyr) {
            //l.addLayer(curLyr);
            layerGroup.push(curLyr);
        }
    }

    return layerGroup;
};

//显示鹰眼
Map.prototype.showEagle = function () {
    if (this.options.miniMap) {
        if (this.options.miniMap.show) {
            var el = this.eagleLayer = this._createLayer(this.options.miniMap.layer);

            if (el && el.length > 0) {
                this.eagle = new L.Control.MiniMap(el[0], { toggleDisplay: true }).addTo(this.map);
            }
        }
    }
};

//显示底图切换按钮
Map.prototype.showLayerSwitch = function () {
    var baseLayers = {};
    var layerAddedToMap = false, i, j, k, lyrsloop, key;

    for (i = 0; i < this.options.baseLayers.length; i++) {
        var curLayers = this.options.baseLayers[i];

        if (curLayers.layer) {
            var layerArray = new Array();

            for (j = 0; j < curLayers.layer.length; j++) {
                var lyrs = this._createLayer(curLayers.layer[j]);

                for (lyrsloop = 0; lyrsloop < lyrs.length; lyrsloop++) {
                    layerArray.push(lyrs[lyrsloop]);
                }
            }

            baseLayers[curLayers.label] = layerArray;

            //add layer to map
            if (curLayers.show && !layerAddedToMap) {
                for (k = 0; k < layerArray.length; k++) {
                    this.map.addLayer(layerArray[k]);
                }

                layerAddedToMap = true;
            }
        }
    }

    //if no layer added, add first layer to map
    if (!layerAddedToMap) {
        for (key in baseLayers) {
            layerArray = baseLayers[key];

            for (k = 0; k < layerArray.length; k++) {
                this.map.addLayer(layerArray[k]);
            }

            break;
        }
    }

    var overlays = {};

    this.layerSwitch = (new L.Control.Layers.Custom(baseLayers, overlays)).addTo(this.map);
};

//Map.prototype._measure = function (type) {
//    
//}

/**
 * options{
        baseLayers:true,
        overLayers:true,
        overlays:false
    }
 */
//Map.prototype.reset = function (options) {

//}

//将平面距离(单位：米)转换为坐标距离
Map.prototype.distanceTranslate = function (distance) {
    var zoom = this.map.getZoom();
    var lod = this.options.levelDefine.lod, i;
    var resolution;
    var dpi = 96;

    for (i = 0; i < lod.length; i++) {
        if (lod[i].level == zoom) {
            resolution = lod[i].resolution;
            break;
        }
    }

    if (resolution) {
        return distance * resolution * dpi / 0.0254;
    } else {
        return distance;
    }
}


/******************************************地图事件*************************************/

Map.prototype.on = function (event, fun, scope) {
    if (this.map) {
        this.map.on(event, fun, scope);
    }
}

Map.prototype.off = function (event, fun, scope) {
    if (this.map) {
        this.map.off(event, fun, scope);
    }
}

/******************************************图层*************************************/

Map.prototype.addLayer = function (layer) {
    if (this.map) {
        this.map.addLayer(layer);
    }
}

Map.prototype.removeLayer = function (layer) {
    if (this.map) {
        this.map.removeLayer(layer);
    }
}

Map.prototype.hasLayer = function (layer) {
    var result = false;

    if (this.map) {
        result = this.map.hasLayer(layer);
    }

    return result;
}

/******************************************俯视角*************************************/
//angle:俯视角度，默认为90度
Map.prototype.changeViewAngle = function (angle) {
    if ((typeof angle) != "number") {
        angle = 90;
    } else if (angle < 10 || angle > 90) {
        return;
    }

    var factor = 1;

    if (angle != 90) {
        var radians = Math.PI * (90 - angle) / 180;
        factor = Math.abs(Math.cos(radians));
    }

    var mapCenter = this.map.getCenter();
    var mapZoom = this.map.getZoom();

    this.viewFactor = factor;
    this.zAngle = angle;
    this.map.options.crs.yFactor = this.viewFactor;
    var thisObj = this;

    this.map.setView(mapCenter, mapZoom, { animate: false });
    //this.map.panTo(mapCenter);
    this.map.eachLayer(function (layer) {
        if (layer instanceof L.CustomTileLayer) {
            //layer.options.tileHeight *= thisObj.viewFactor;
            layer.yFactor = thisObj.viewFactor;
        }

        if (Util.functionExist(layer.redraw)) {
            layer.redraw();
        }

        if (layer instanceof L.Marker) {
            layer.update();
        }
    });
}


/***************************************要素加载与控制**********************************/

/*
    options:{
        idProp:'',         //FeatureOption.featureIndex
        nameProp:'',
        geoProp:'',
        geoType:'',        //point、polyline、polygon
        markerPic:'',
        markerOffset:['',''],
        symbolType:'',     //text、picture、
        symbol:'',         //text:{content:'',foneSize:'',font:'',fontColor:''}.picture:{url:'',width:'',height:'',xOffset:'',yOffset:''}
        hoverSymbol:'',
        highSymbol:'',
        tips:'',
        popupTitle:'',
        popupBottom:'',
        popupContent:''

    }
*/
Map.prototype.loadFeatures = function(data, options, callback){   //options里包括infowindow内容、infowindow的top和bottom（是否要周边查询）、名称字段、要素样式（图标、文字、点、线、面）、是否要清空地图

}

Map.prototype.markFeatures = function (features, options, callback) { 

}

/*
    options:{
        zoom:'',
        highSymbol:''
    }
*/
Map.prototype.selectFeatures = function (features, options, callback) {

}

Map.prototype.removeFeatures = function (features, callback) {

}

Map.prototype.clearAllFeatures = function (callback) {

}

/*************************************图层加载与控制*******************************************/

//Map.prototype.loadLayers = function (layers, callback) {
//    
//}

//Map.prototype.removeLayers = function (layers, callback) {

//}

//Map.prototype.addPane = function () {

//}

//Map.prototype.removePane = function () {

//}

/****************************************要素编辑************************************************/

/*
    options:{
        propEnabled:true,
        geoEnabled:true 
    }
*/
Map.prototype.enableEdit = function (features, onFeatureEditEnd, options) {

}

Map.prototype.saveEditedFeatures = function (callback) {

}

Map.prototype.stopEdit = function (callback) {

}