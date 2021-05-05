FeatureRenderer = function () {}

//默认样式
FeatureRenderer.prototype._getDefaultStyle = function (type) {
    type = type ? type.toLowerCase() : 'icon';
    var style = {};

    if (FeatureStyleConfig[type]) {
        style = FeatureStyleConfig[type];
    }

    return style;
}

//获取空间点对象，默认定位到[0,0]
FeatureRenderer.prototype._getLatlngShape = function (latlngArray) {
    var point = new L.LatLng(0, 0);
    latlngArray = latlngArray || [];

    if (latlngArray.length >= 2) {
        point = new L.LatLng(latlngArray[0], latlngArray[1]);
    }

    return point;
}

//如果featureObj参数为空则创建新要素，否则更新featureObj对象的坐标和样式
FeatureRenderer.prototype.getPolygon = function (latlngArray, options, featureObj) {
    var defaultStyle = this._getDefaultStyle("polygon");
    options = options ? Util.applyOptions(defaultStyle, options) : defaultStyle;

    var shp = featureObj;

    if (featureObj) {
        if (featureObj instanceof L.Polygon) {
            featureObj.setStyle(options);

            if (latlngArray instanceof Array) {
                featureObj.setLatLngs(latlngArray);
            }
        }
    } else {
        latlngArray = latlngArray || [];
        shp = new L.Polygon(latlngArray, options);
    }

    return shp;
}

FeatureRenderer.prototype.getPolyline = function (latlngArray, options, featureObj) {
    var defaultStyle = this._getDefaultStyle("polyline");
    options = options ? Util.applyOptions(defaultStyle, options) : defaultStyle;

    var shp = featureObj;

    if (featureObj) {
        if (featureObj instanceof L.Polyline) {
            featureObj.setStyle(options);

            if (latlngArray instanceof Array) {
                featureObj.setLatLngs(latlngArray);
            }
        }
    } else {
        latlngArray = latlngArray || [];
        var shp = new L.Polyline(latlngArray, options);
    }
    

    return shp;
}

FeatureRenderer.prototype.getTextMarker = function (latlngArray, options, featureObj) {
    var defaultStyle = this._getDefaultStyle("text");

    var _iconStyle = options.iconStyle ? Util.applyOptions(defaultStyle.iconStyle, options.iconStyle) : defaultStyle.iconStyle;
    var _markerStyle = options.markerStyle ? Util.applyOptions(defaultStyle.markerStyle, options.markerStyle) : defaultStyle.markerStyle;
    var textContent = _iconStyle.html ? (_iconStyle.html + '') : '';
    _iconStyle.text = textContent;
    var textIcon = new L.TextIcon(_iconStyle);

    _markerStyle.icon = textIcon;
    var point = this._getLatlngShape(latlngArray);

    var shp = featureObj;

    if (featureObj) {
        if (featureObj instanceof MeasureMarker) {
            featureObj.setIcon(textIcon);

            if (latlngArray && point.lat != 0 && point.lng != 0) {
                featureObj.setLatLng(point);
            }
        }
    } else {
        shp = new MeasureMarker(point, _markerStyle);
    }

    //return new MeasureMarker(point, _markerStyle);
    return shp;
}

FeatureRenderer.prototype.getPictureMarker = function (latlngArray, options, featureObj) {
    var defaultStyle = this._getDefaultStyle("picture");
    options = options || {};
    var _iconStyle = Util.applyOptions(defaultStyle.iconStyle, options.iconStyle);

    if (options.iconStyle) {
        if (!options.iconStyle.shadowUrl) {
            _iconStyle.shadowUrl = _iconStyle.shadowRetinaUrl = _iconStyle.shadowSize = _iconStyle.shadowAnchor = null;
        }
    }

    var picIcon;

    if (Util.objectIsNull(options.iconStyle)) {
        picIcon = new L.Icon.Default();
    } else {
        picIcon = new L.Icon(_iconStyle);
    }

    var point = this._getLatlngShape(latlngArray);

    var shp = featureObj;

    if (featureObj) {
        if (featureObj instanceof L.Marker) {
            featureObj.setIcon(picIcon);

            if (latlngArray && point.lat != 0 && point.lng != 0) {
                featureObj.setLatLng(point);
            }
        }
    } else {
        var _markerStyle = options.markerStyle ? Util.applyOptions(defaultStyle.markerStyle, options.markerStyle) : defaultStyle.markerStyle;
        _markerStyle.icon = picIcon;
        shp = new L.Marker(point, _markerStyle);
    }

    //return new L.Marker(point, _markerStyle);
    return shp;
}

FeatureRenderer.prototype.getRectMarker = function (latlngArray, options, featureObj) {
    var defaultStyle = this._getDefaultStyle("rect");
    options = options || {};
    var _iconStyle = options.iconStyle ? Util.applyOptions(defaultStyle.iconStyle, options.iconStyle) : defaultStyle.iconStyle;
    var _markerStyle = options.markerStyle ? Util.applyOptions(defaultStyle.markerStyle, options.markerStyle) : defaultStyle.markerStyle;
    _iconStyle.html = "";

    var divIcon = new L.DivIcon(_iconStyle);
    _markerStyle.icon = divIcon;

    var point = this._getLatlngShape(latlngArray);

    var shp = featureObj;

    if (featureObj) {
        if (featureObj instanceof MeasureMarker) {
            featureObj.setIcon(divIcon);

            if (latlngArray && point.lat != 0 && point.lng != 0) {
                featureObj.setLatLng(point);
            }
        }
    } else {
        shp = new MeasureMarker(point, _markerStyle);
    }

    //return new MeasureMarker(point, _markerStyle);
    return shp;
}

FeatureRenderer.prototype.getCircleMarker = function (latlngArray, options, featureObj) {
    var defaultStyle = this._getDefaultStyle("circle");
    var _style = options ? Util.applyOptions(defaultStyle, options) : defaultStyle;
    var point = this._getLatlngShape(latlngArray);

    var shp = featureObj;

    if (featureObj) {
        if (featureObj instanceof L.CircleMarker) {
            featureObj.setStyle(_style);

            if (latlngArray && point.lat != 0 && point.lng != 0) {
                featureObj.setLatLng(point);
            }
        }
    } else {
        shp = new L.CircleMarker(point, _style);
    }

    //return new L.CircleMarker(point, _style);
    return shp;
}

//生成的每个要素赋予一个shapeType属性，说明此要素的类型
FeatureRenderer.prototype.getShape = function (shapeType, latlngArray, options, featureObj) {
    var shp = null;

    if (shapeType == "text") {
        shp = this.getTextMarker(latlngArray, options, featureObj);
    } else if (shapeType == "rect") {
        shp = this.getRectMarker(latlngArray, options, featureObj);
    } else if (shapeType == "circle") {
        shp = this.getCircleMarker(latlngArray, options, featureObj);
    } else if (shapeType == "picture") {
        shp = this.getPictureMarker(latlngArray, options, featureObj);
    } else if (shapeType == "polyline") {
        shp = this.getPolyline(latlngArray, options, featureObj);
    } else if (shapeType == "polygon") {
        shp = this.getPolygon(latlngArray, options, featureObj);
    }

    if (shp) {
        shp.shapeType = shapeType;
    }

    return shp;
}

FeatureRenderer.prototype.refreshShape = function (featureObj, latlngArray, options) {
    if (!featureObj) {
        return;
    }

    //    var shapeType = featureObj.shapeType;

    //    if (!shapeType) {
    //        if (featureObj instanceof L.Polygon) {
    //            shapeType = "polygon";
    //        } else if (featureObj instanceof L.Polyline) {
    //            shapeType = "polyline";
    //        } else if (featureObj instanceof L.CircleMarker) {
    //            shapeType = "circle";
    //        } else if (featureObj instanceof L.Marker) {
    //            shapeType = "picture";
    //        } else if (featureObj instanceof MeasureMarker) {
    //            var icon = featureObj.options.icon;

    //            if (icon instanceof L.Icon) {
    //                shapeType = "picture";
    //            } else if (icon instanceof L.DivIcon) {
    //                shapeType = "rect";
    //            } else if (icon instanceof L.TextIcon) {
    //                shapeType = "text";
    //            }
    //        }
    //    }
    var shapeType = this.getShapeType(featureObj);

    if (!shapeType) {
        return;
    }

    return this.getShape(shapeType, latlngArray, options, featureObj);
}

FeatureRenderer.prototype.getShapeType = function (featureObj) {
    var shapeType = featureObj.shapeType;

    if (!shapeType) {
        if (featureObj instanceof L.Polygon) {
            shapeType = "polygon";
        } else if (featureObj instanceof L.Polyline) {
            shapeType = "polyline";
        } else if (featureObj instanceof L.CircleMarker) {
            shapeType = "circle";
        } else if (featureObj instanceof L.Marker) {
            shapeType = "picture";
        } else if (featureObj instanceof MeasureMarker) {
            var icon = featureObj.options.icon;

            if (icon instanceof L.Icon) {
                shapeType = "picture";
            } else if (icon instanceof L.DivIcon) {
                shapeType = "rect";
            } else if (icon instanceof L.TextIcon) {
                shapeType = "text";
            }
        }
    }

    return shapeType;
}