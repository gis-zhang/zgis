FeatureLayer = function (map) {
    this._map = map;
    this._renderer = new FeatureRenderer();
    this._group = new L.LayerGroup();
    this._features = {};
    //this._markers = {};
    this._markedFeatures = [];
    this._selectedFeatures = [];

    this.clickCallback;

    if (this._map) {
        this._map.addLayer(this._group);
    }
}

FeatureLayer.prototype._getDefaultOptions = function () {
    return {
        idProp: 'id',         //FeatureOption.featureIndex
        nameProp: 'name',
        geoProp: 'shape',
        geoType: 'point',        //point、polyline、polygon
        //markType: 'marker',          //marker、raw
        normalMarkSymbol: '',               //marker:{iconUrl:'', iconSize:[10,10], iconAnchor:[0,0]}
        hoverMarkSymbol: '',
        highlightMarkSymbol: '',
        symbolType: '',     //text、picture、polyline、polygon
        normalSymbol: '',         //text:{content:'',foneSize:'',font:'',fontColor:''}.picture:{url:'',width:'',height:'',xOffset:'',yOffset:''}
        hoverSymbol: '',
        highlightSymbol: '',
        //tips:'',
        popup: 'form',              //simple（只显示标题）、form（以表单形式列举出所有属性）、custom（自定义）、no（不显示popup）
        popupHook: null             //function (data) { }
    };
}

FeatureLayer.prototype.applyOptions = function (options) {
    var defaultOptions = this._getDefaultOptions();
    defaultOptions = Util.applyOptions(defaultOptions, options);

    return defaultOptions;
}

//加载数据
FeatureLayer.prototype.loadData = function (data, options, clickCallback) {
    if (!data) {
        return;
    }

    options = this.applyOptions(options);
    var temp = {
        normalSymbol:options.normalSymbol,
        hoverSymbol:options.hoverSymbol,
        highlightSymbol:options.highlightSymbol
    };
    var dataLoop;

    for (dataLoop = 0; dataLoop < data.length; dataLoop++) {
        var markerPoint = this._getMarkerPoint(options.symbolType, data[dataLoop][options.geoProp]);
        var marker = this._renderer.getShape("picture", markerPoint, options.normalSymbol);

        options.normalSymbol = this._replaceIndex(temp.normalSymbol, dataLoop + 1);
        options.hoverSymbol = this._replaceIndex(temp.hoverSymbol, dataLoop + 1);
        options.highlightSymbol = this._replaceIndex(temp.highlightSymbol, dataLoop + 1);
        var shape = this._renderer.getShape(options.symbolType, data[dataLoop][options.geoProp], options.normalSymbol);

        var featureOptions = {
            normalSymbol: options.normalSymbol,
            hoverSymbol: options.hoverSymbol,
            highlightSymbol: options.highlightSymbol,
            shape: shape,
            marker: marker,
            renderer: this._renderer,
            normalMarkSymbol: options.normalMarkSymbol,
            hoverMarkSymbol: options.hoverMarkSymbol,
            highlightMarkSymbol: options.highlightMarkSymbol
        }

        //设置popup内容
        featureOptions.popup = options.popup;
        featureOptions.popupContent = this._getPopupContent(data[dataLoop], options);

        var featureObj = new RenderedFeature(this._group, featureOptions);

        //featureObj.mark();
        shape.featureObj = {
            data: data[dataLoop],
            feature: featureObj
        };
        shape.on("click", this._onFeatureClick, this);
        marker.featureObj = featureObj;
        marker.on("click", this._onFeatureClick, this);

        //如果id为空，则自动忽略，后继无法利用mark和select方法来选中
        if (data[dataLoop][options.idProp]) {
            this._features[data[dataLoop][options.idProp]] = {
                data: data[dataLoop],
                feature: featureObj
            };
        }
    }

    if (clickCallback) {
        this._clickCallback = clickCallback;
    } else {
        this._clickCallback = null;
    }
}

//空间对象的定位点。线对象取中间点，面对象取中心点
FeatureLayer.prototype._getMarkerPoint = function (geoType, geoData) {
    var point = [];

    if (geoType == "polyline") {
        var index = Math.floor(geoData.length / 2);
        point = geoData[index];
    } else if (geoType == "polygon") {
        var bounds = Util.getBounds(geoData);

        if (bounds) {
            var centerx = (bounds[0][0] + bounds[1][0]) / 2;
            var centery = (bounds[0][1] + bounds[1][1]) / 2;
            point = [centerx, centery];
        }
    } else {
        if (geoData instanceof Array && geoData.length >= 2) {
            point = [geoData[0], geoData[1]];
        }
    }

    return point;
}

//将属性中的#{index}替换成索引值
FeatureLayer.prototype._replaceIndex = function (propCollection, index) {
    if (!propCollection) {
        return;
    }

    var prop, newObj = {};

    for (prop in propCollection) {
        if (prop == "iconStyle" || prop == "markerStyle") {
            newObj[prop] = this._replaceIndex(propCollection[prop], index);
        } else {
            if ((typeof propCollection[prop]) == "string") {
                var propValue = propCollection[prop] + "";
                propValue = propValue.replace("#{index}", index + '');
                newObj[prop] = propValue;
                //newObj[prop] = (propCollection[prop] + "").replace("#{index}", index + '');
            } else if (prop) {
                newObj[prop] = propCollection[prop];
            }
        }
    }

    return newObj;
}

FeatureLayer.prototype._onFeatureClick = function (e) {
    if (e.target.featureObj) {
        var i, length = this._selectedFeatures.length;
        for (i = 0; i < length; i++) {
            this._selectedFeatures[i].feature.unselect();
        }

        //e.target.featureObj.select();
        this._selectedFeatures = [e.target.featureObj];

        try {
            if (this._clickCallback) {
                this._clickCallback(e.target.featureObj);
            }
        } catch (e) { }
    }
}

FeatureLayer.prototype._getPopupContent = function (data, options) {
    var popupContent = "";

    if (!options.popup) {
        return popupContent;
    } else if (options.popup == "no") {
        return popupContent;
    }

    if (options.popupHook) {
        popupContent = options.popupHook(data);

        if (!popupContent) {
            popupContent = data[options.nameProp];
        }
    } else if (options.popup == "simple") {
        popupContent = data[options.nameProp];
    } else if (options.popup == "form") {
        var propLoop, cont = '<table><tbody>';

        for (propLoop in data) {
            if (propLoop == options.geoProp) {
                continue;
            }

            cont += "<tr><td>" + propLoop + "：</td><td>" + data[propLoop] + "</td></tr>";
        }

        cont += '</tbody></table>';
        popupContent = "<span>" + data[options.nameProp] + "</span><hr/>" + cont;
    }

    return popupContent;
}

FeatureLayer.prototype.markData = function (idArray) {
    if (idArray instanceof Array) {
        var i, length = this._markedFeatures.length;

        for (i = 0; i < length; i++) {
            this._markedFeatures[i].feature.unmark();
        }

        this._markedFeatures = [];

        for (i = 0; i < idArray.length; i++) {
            if (this._features[idArray[i]]) {
                this._features[idArray[i]].feature.mark();
                this._markedFeatures.push(this._features[idArray[i]]);
            }
        }
    }
}

FeatureLayer.prototype.selectData = function (idArray) {
    if (idArray instanceof Array) {
        var i, length = this._selectedFeatures.length;

        for (i = 0; i < length; i++) {
            this._selectedFeatures[i].feature.unselect();
        }

        this._selectedFeatures = [];

        for (i = 0; i < idArray.length; i++) {
            if (this._features[idArray[i]]) {
                this._features[idArray[i]].feature.select();
                this._selectedFeatures.push(this._features[idArray[i]]);
            }
        }
    }
}

/**
 * 渲染的要素
 *
 */
RenderedFeature = function (containerLayer, options) {
    options = options || {};

    this.containerLayer = containerLayer;

    this.normalSymbol = options.normalSymbol;
    this.hoverSymbol = options.hoverSymbol;
    this.highlightSymbol = options.highlightSymbol;

    this.normalMarkSymbol = options.normalMarkSymbol;
    this.hoverMarkSymbol = options.hoverMarkSymbol;
    this.highlightMarkSymbol = options.highlightMarkSymbol;

    this.marker = options.marker;
    this.shape = options.shape;

    if (options.popup && options.popup != "no") {
        this._popup = new L.Popup();
    }

    this._selected = false;
    this._marked = false;
    this._markerPopupBinded = false;
    this._renderer = options.renderer ? options.renderer : new FeatureRenderer();

    this._shapeType = this._renderer.getShapeType(this.shape);

    if (this.containerLayer && this.shape) {
        this.containerLayer.addLayer(this.shape);

        if (this._popup) {
            this._initPopupContent(options);
            this.shape.bindPopup(this._popup);
        }
    }

    this._enableShapeStyleWitch();
}

RenderedFeature.prototype._initPopupContent = function (options) {
    var html = "";

    if (options.popupContent) {
        html = options.popupContent;
    }else {
        var popupTitle = options.popupTitle, popupContent = options.popupContent;
        popupTitle = popupTitle || "";
        popupContent = popupContent || "";

        html = "<span>";
        html += "<p>" + popupTitle + "</p>";
        html += "<hr/>";
        html += "<p>" + popupContent + "</p>";
        html += "</span>";
    }

    this._popup.setContent(html);
}

RenderedFeature.prototype._enableShapeStyleWitch = function () {
    var thisObj = this;

    if (thisObj.shape) {
        thisObj.shape.on("mouseover", thisObj._onMouseover, thisObj);
        thisObj.shape.on("mouseout", thisObj._onMouseout, thisObj);
        thisObj.shape.on("click", thisObj._onClick, thisObj);
    }
}

RenderedFeature.prototype._enableMarkerStyleWitch = function () {
    var thisObj = this;

    if (thisObj.marker) {
        thisObj.marker.on("mouseover", thisObj._onMarkerMouseover, thisObj);
        thisObj.marker.on("mouseout", thisObj._onMarkerMouseout, thisObj);
        thisObj.marker.on("click", thisObj._onMarkerClick, thisObj);
    }
}

RenderedFeature.prototype._disableShapeStyleWitch = function () {
    var thisObj = this;

    if (thisObj.shape) {
        thisObj.shape.off("mouseover", thisObj._onMouseover);
        thisObj.shape.off("mouseout", thisObj._onMouseout);
        thisObj.shape.off("click", thisObj._onClick);
    }
}

RenderedFeature.prototype._disableMarkerStyleWitch = function () {
    var thisObj = this;

    if (thisObj.marker) {
        thisObj.marker.off("mouseover", thisObj._onMarkerMouseover);
        thisObj.marker.off("mouseout", thisObj._onMarkerMouseout);
        thisObj.marker.off("click", thisObj._onMarkerClick);
    }
}

RenderedFeature.prototype._onMarkerMouseover = function (e) {
    //this.marker.setStyle(this.hoverMarkerSymbol);
    this._setFeatureStyle(this.marker, this.hoverMarkerSymbol);
}

RenderedFeature.prototype._onMarkerMouseout = function (e) {
    //this.marker.setStyle(this.normalMarkerSymbol);
    if (this._marked) {
        this._setFeatureStyle(this.marker, this.hightlightMarkerSymbol);
    } else {
        this._setFeatureStyle(this.marker, this.normalMarkerSymbol);
    }
}

RenderedFeature.prototype._onMarkerClick = function (e) {
    this.select();
}





RenderedFeature.prototype._onMouseover = function (e) {
    if (!this._selected && e.target == this.shape) {
        //this.shape.setStyle(this.hoverSymbol);
        this._setFeatureStyle(this.shape, this.hoverSymbol);
    }
}

RenderedFeature.prototype._onMouseout = function (e) {
    if (!this._selected && e.target == this.shape) {
        //this.shape.setStyle(this.normalSymbol);
        this._setFeatureStyle(this.shape, this.normalSymbol);
    }
}

RenderedFeature.prototype._onClick = function (e) {
    if (e.target == this.shape) {
        this.select();
    }
}

//要素置为选中状态
RenderedFeature.prototype.select = function () {
    var thisObj = this;
    this._selected = true;

    if (thisObj.marker) {
        thisObj._setFeatureStyle(thisObj.marker, thisObj.highlightMarkerSymbol);
    }

    if (thisObj.shape) {
        thisObj._setFeatureStyle(thisObj.shape, thisObj.highlightSymbol);
    }

    if (this._popup) {
        thisObj.openPopup();
    }
}

RenderedFeature.prototype.openPopup = function () {
    var thisObj = this;

    if (thisObj._marked) {
        thisObj.marker.openPopup();
    } else if (thisObj.shape) {
        thisObj.shape.openPopup(thisObj.marker.getLatLng());
    }
    //this._popup.update();
}


//要素置为未选中状态
RenderedFeature.prototype.unselect = function () {
    var thisObj = this;
    this._selected = false;

    if (thisObj.marker) {
        thisObj._setFeatureStyle(thisObj.marker, thisObj.normalMarkerSymbol);
    }

    if (thisObj.shape) {
        thisObj._setFeatureStyle(thisObj.shape, thisObj.normalSymbol);
    }
}

RenderedFeature.prototype.mark = function (normalMarkerSymbol, hoverMarkerSymbol, highlightMarkerSymbol) {
    if (this.containerLayer && this.marker) {
        if (!this.containerLayer.hasLayer(this.marker)) {
            this.containerLayer.addLayer(this.marker);

            if (!this._markerPopupBinded) {
                this.marker.bindPopup(this._popup);
                this._markerPopupBinded = true;
            }
        }

        if (normalMarkerSymbol) {
            this.normalMarkerSymbol = normalMarkerSymbol;
        }

        if (hoverMarkerSymbol) {
            this.hoverMarkerSymbol = hoverMarkerSymbol;
        }

        if (highlightMarkerSymbol) {
            this.highlightMarkerSymbol = highlightMarkerSymbol;
        }

        this._setFeatureStyle(this.marker, this.normalMarkerSymbol);

        this._enableMarkerStyleWitch();
        this._marked = true;

        //将图片标注的图标替换为mark图标
        if (this._shapeType == "picture") {
            if (this.containerLayer.hasLayer(this.shape)) {
                this.containerLayer.removeLayer(this.shape);
            }
        }
    }
}

RenderedFeature.prototype._setFeatureStyle = function (feature, style) {
    this._renderer.refreshShape(feature, null, style);
}

RenderedFeature.prototype.unmark = function () {
    if (this.containerLayer && this.marker) {
        if (this.containerLayer.hasLayer(this.marker)) {
            this.containerLayer.removeLayer(this.marker);
            this._disableMarkerStyleWitch();
        }

        this._marked = false;

        //将mark图标替换为普通图片标注
        if (this._shapeType == "picture") {
            if (!this.containerLayer.hasLayer(this.shape)) {
                this.containerLayer.addLayer(this.shape);
            }
        }
    }
}
