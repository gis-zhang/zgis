Z.WktParser = function () { }

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
Z.WktParser.wkt2Array = function (wkt) {
    if (!wkt) {
        return;
    }

    wkt = wkt.toLowerCase().replace(/\s+/, " ");  //将多空格替换为单空格
    var matchesFor3d = wkt.match(/\-?[\d\.]+\s\-?[\d\.]+\s\-?[\d\.]+/);
    var reg = null;

    if(matchesFor3d && (matchesFor3d instanceof Array && matchesFor3d.length > 0)){
        reg = /(\-?[\d\.]+)\s(\-?[\d\.])+\s(\-?[\d\.])+/g;    //匹配三维坐标组
        wkt = wkt.replace(reg, "[$2, $1, $3]");                      //将116.993225097656 36.892822265625 1000转变为[36.892822265625, 116.993225097656, 1000]
    }else{
        reg = /(\-?[\d\.]+)\s(\-?[\d\.]+)/g;    //匹配二维坐标组
        wkt = wkt.replace(reg, "[$2, $1]");              //将116.993225097656 36.892822265625转变为[36.892822265625, 116.993225097656]
    }

    var result = {};

    if (wkt.indexOf("multipoint") >= 0) {
        result.type = "MultiPoint";
    } else if (wkt.indexOf("point") >= 0) {
        result.type = "Point";
    } else if (wkt.indexOf("multipolyline") >= 0) {
        result.type = "MultiPolyline";
    } else if (wkt.indexOf("polyline") >= 0) {
        result.type = "Polyline";
    } else if (wkt.indexOf("multipolygon") >= 0) {
        result.type = "MultiPolygon";
    } else if (wkt.indexOf("polygon") >= 0) {
        result.type = "Polygon";
    }

    if (result.type) {
        result.coords = Z.WktParser._getCoords(wkt.substring(result.type.length));

        //if (result.coords.length == 1) {
        //    result.coords = result.coords[0];
        //}
    } else {
        result = null;
    }

    return result;
}

Z.WktParser._getCoords = function (wkt) {
    wkt = wkt.replace(/\(/g, "[");
    wkt = wkt.replace(/\)/g, "]");
    wkt = Z.Util.stringTrim(wkt);

    //return eval('(' + wkt + ')');
    return JSON.parse(wkt);
}