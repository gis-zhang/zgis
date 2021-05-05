function MyWktParser() { }

/**将wkt转换为坐标数组，例如：
//POLYGON ((116.993225097656 36.892822265625, 
//    116.993225097656 36.8926391601563, 
//    116.993408203125 36.8926391601563, 
//    116.993408203125 36.892822265625, 
//    116.993225097656 36.892822265625))
//转换为：[[36.892822265625, 116.993225097656], 
//    [36.8926391601563, 116.993225097656], 
//    [36.8926391601563, 116.993408203125], 
//    [36.892822265625, 116.993408203125], 
//    [36.892822265625, 116.993225097656]]
 */
MyWktParser.wkt2Array = function (wkt) {
    if (!wkt) {
        return;
    }

    wkt = wkt.toLowerCase().replace(/\s+/, " ");  //将多空格替换为单空格
    //var reg = /[\s,\(]([\b\.]+)\s([\b\.])+[\s,\)]/;    //匹配坐标组
    var reg = /([\d\.]+)\s([\d\.])+\s([\d\.])+/g;    //匹配三维坐标组
    wkt = wkt.replace(reg, "[$2, $1, $3]");              //将116.993225097656 36.892822265625 1000转变为[36.892822265625, 116.993225097656, 1000]
    reg = /([\d\.]+)\s+([\d\.]+)/g;    //匹配二维坐标组
    wkt = wkt.replace(reg, "[$2, $1]");              //将116.993225097656 36.892822265625转变为[36.892822265625, 116.993225097656]

    var result = {};

    if (wkt.indexOf("multipoint") >= 0) {
        result.type = "MultiPoint";
        //result.coords = this.parseWktMultiPoint(wkt.substring(result.type.length));
    } else if (wkt.indexOf("point") >= 0) {
        result.type = "Point";
        //result.coords = this.parseWktPoint(wkt.substring(result.type.length));
    } else if (wkt.indexOf("multipolyline") >= 0) {
        result.type = "MultiPolyline";
        //result.coords = this.parseWktMultiPolyline(wkt.substring(result.type.length));
    } else if (wkt.indexOf("polyline") >= 0) {
        result.type = "Polyline";
        //result.coords = this.parseWktPolyline(wkt.substring(result.type.length));
    } else if (wkt.indexOf("multipolygon") >= 0) {
        result.type = "MultiPolygon";
        //result.coords = this.parseWktMultiPolygon(wkt.substring(result.type.length));
    } else if (wkt.indexOf("polygon") >= 0) {
        result.type = "Polygon";
        //result.coords = this.parseWktPolygon(wkt.substring(result.type.length));
    }

    if (result.type) {
        result.coords = MyWktParser._getCoords(wkt.substring(result.type.length));

        if (result.coords.length == 1) {
            result.coords = result.coords[0];
        }
    } else {
        result = null;
    }

    return result;
}

//WktParser.prototype.parseWktPoint = function (wkt) {
//    var coords = this._getCoords(wkt);
//    var result;

//    if (coords instanceof Array) {
//        if (coords.length > 0) {
//            var section = Util.trim(coords[0]).split(" ");

//            if (section.length >= 2) {
//                result = [parseFloat(section[0]), parseFloat(section[1])];
//            }
//        }
//    }

//    return result;
//}

//WktParser.prototype.parseWktMultiPoint = function (wkt) {

//}

//WktParser.prototype.parseWktPolyline = function (wkt) {

//}

//WktParser.prototype.parseWktMultiPolyline = function (wkt) {

//}

//WktParser.prototype.parseWktPolygon = function (wkt) {

//}

//WktParser.prototype.parseWktMultiPolygon = function (wkt) {

//}

MyWktParser._getCoords = function (wkt) {
    wkt = wkt.replace(/\(/g, "[");
    wkt = wkt.replace(/\)/g, "]");
    wkt = Util.stringTrim(wkt);

    return eval('(' + wkt + ')');
}