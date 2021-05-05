Util = {};

//Util.tolerance = 0.000000001;
Util.tolerance = 1e-15;

//unit: if ture, unin options, else only use toOptions prop
Util.applyOptions = function (toOptions, fromOptions, unin) {
    if (toOptions && fromOptions) {
        var prop;

        if (unin) {
            for (prop in fromOptions) {
                toOptions[prop] = fromOptions[prop];
            }
        } else {
            for (prop in toOptions) {
                if (fromOptions[prop] != undefined) {
                    toOptions[prop] = fromOptions[prop];
                }
            }
        }
    }

    return toOptions;
}

//判断对象是否为空或者属性为空
Util.objectIsNull = function (obj) {
    var isNull = true;

    if (obj) {
        for (prop in obj) {
            if (obj[prop]) {
                isNull = false;
                break;
            }
        }
    }

    return isNull;
}

//判断对象是否为空或者属性为空
Util.functionExist = function (func) {
    var exist = false;

    try {
        if (func && typeof (func) == "function") {
            exist = true;
        }
    } catch (e) { }

    return exist;
}

//判断对象是否为数字
Util.isNumber = function (obj) {
    var result = false;

    if (obj) {
        try {
            parseFloat(obj);
            result = true;
        } catch (e) { }
    }

    return result;
}

//获得外接矩形
Util.getBounds = function (dataArray) {
    if (!(dataArray instanceof Array)) {
        return;
    }

    if (dataArray.length == 0) {
        return;
    }

    var minx, maxx, miny, maxy, loop;

    if (dataArray[0] instanceof Array) {
        minx = maxx = dataArray[0][0], miny = maxy = dataArray[0][1];

        for (loop = 0; loop < dataArray.length; loop++) {
            if (dataArray[loop][0] < minx) {
                minx = dataArray[loop][0];
            } else if (dataArray[loop][0] > maxx) {
                maxx = dataArray[loop][0];
            }

            if (dataArray[loop][1] < miny) {
                miny = dataArray[loop][1];
            } else if (dataArray[loop][1] > maxy) {
                maxy = dataArray[loop][1];
            }
        }
    } else if (dataArray.length >= 2) {
        minx = maxx = dataArray[0], miny = maxy = dataArray[1];
    } else {
        return;
    }

    return [[minx, miny], [maxx, maxy]];
}

//字符串str是否以sub开始
Util.stringBeginsWith = function (str, sub) {
    if (typeof str != "string") {
        return false;
    }

    if (str.length == 0) {
        return false;
    }

    sub = sub || ' ';
    
    return str.substring(0, sub.length) === sub;
};

//字符串str是否以sub结尾
Util.stringEndsWith = function (str, sub) {
    if (typeof str != "string") {
        return false;
    }

    if (str.length == 0) {
        return false;
    }

    sub = sub || ' ';

    return str.substring(str.length - sub.length) === sub;
};

//去除字符串str首尾的sub字符串
Util.stringTrim = function (str, sub) {
    if (typeof str != "string") {
        return;
    }

    if (str.length == 0) {
        return;
    }

    sub = sub || ' '; // Defaults to trimming spaces

    // Trim beginning spaces
    while (Util.stringBeginsWith(str, sub)) {
        str = str.substring(1);
    }

    // Trim ending spaces
    while (Util.stringEndsWith(str, sub)) {
        str = str.substring(0, str.length - 1);
    }

    return str;
};

//点viewpoint是否在直线（fromPoint, toPoint）的右边，如果在右边返回1，在左边返回-1，在线上返回0
//fromPoint：[39.2,119.9],toPoint：[40.3,128.6],viewpoint：[20.2,118]
Util.pointOnRight = function (fromPoint, toPoint, viewpoint) {
    if (!(fromPoint instanceof Array) || !(toPoint instanceof Array) || !(viewpoint instanceof Array)) {
        return;
    }

    if (fromPoint.length < 2 || toPoint.length < 2 || viewpoint.length < 2) {
        return;
    }

    var a = toPoint[1] - fromPoint[1];
    var b = fromPoint[0] - toPoint[0];
    var c = toPoint[0] * fromPoint[1] - toPoint[1] * fromPoint[0];
    var d = viewpoint[0] * a + viewpoint[1] * b + c;

    if (Math.abs(d) < Util.tolerance) {
        d = 0;
    }

    return d;
}

//将一个凹多边形切分成多个凸多边形
//latlngs：[[39,116], [34, 137], [22, 118]]
Util.splitConcavePolygon = function (latlngs) {
    var convexPolygons = [],    //已确认的凸多边形
        readyPolygons = [];     //待切割多边形

    if (!(latlngs instanceof Array)) {
        return convexPolygons;
    }

    if (latlngs.length > 1) {
        if ((latlngs[0][0] == latlngs[latlngs.length - 1][0]) &&
            (latlngs[0][1] == latlngs[latlngs.length - 1][1])) {
            latlngs.splice(latlngs.length - 1, 1);
        }
    }

    if (latlngs.length < 4) {     //少于4个顶点的多边形不可能是凹多边形
        return [latlngs];
    }

    var i, j, k, m, fromPoint, toPoint, anchor, isRight, replay = false;
    readyPolygons = [latlngs];

    for (i = 0; i < readyPolygons.length; i++) {
        if (replay) {
            replay = false;
        }

        var curLatlngs = readyPolygons[i];

        if (curLatlngs.length < 4) {
            convexPolygons.push(curLatlngs);
            readyPolygons.splice(i, 1);
            i--;
            continue;
        }

        for (j = 0; j < curLatlngs.length; j++) {
            fromPoint = curLatlngs[j];
            toPoint = curLatlngs[j + 1];
            anchor = curLatlngs[j + 2];

            if (j == curLatlngs.length - 2) {
                anchor = curLatlngs[0];
            } else if (j == curLatlngs.length - 1) {
                toPoint = curLatlngs[0];
                anchor = curLatlngs[1];
            }

            //由于leaflet坐标是纬度在前经度在后[36.7, 112.8]，所有多边形的正方形为顺时针方向，而不是通常的逆时针方向
            isRight = Util.pointOnRight(fromPoint, toPoint, anchor);

            //找到凹点，切割多边形
            if (isRight < 0) {
                //                var j_plus_1 = (j + 1) % curLatlngs.length,
                //                            j_plus_2 = (j + 2) % curLatlngs.length;
                var j_plus_1 = j + 1,
                            j_plus_2 = j + 2;

                for (k = j + 3; k < curLatlngs.length + j; k++) {
                    m = k % curLatlngs.length;

                    if (Util.pointOnRight(fromPoint, toPoint, curLatlngs[m]) > 0) {
                        var _poly1, _poly2;

                        if (m > j) {
                            _poly1 = curLatlngs.slice(j_plus_1, m);
                            _poly1 = _poly1.concat([curLatlngs[m]]);

                            _poly2 = curLatlngs.slice(k, curLatlngs.length).concat(curLatlngs.slice(0, j_plus_2));
                        } else {
                            if (j == curLatlngs.length - 1) {
                                _poly1 = curLatlngs.slice(m, j_plus_1);
                                _poly1 = _poly1.concat([curLatlngs[0]]);
                                _poly2 = curLatlngs.slice(0, m + 1);
                            } else {
                                _poly1 = curLatlngs.slice(m, j_plus_1);
                                _poly1 = _poly1.concat([curLatlngs[j_plus_1]]);
                                _poly2 = curLatlngs.slice(j_plus_1, curLatlngs.length).concat(curLatlngs.slice(0, m + 1));
                            }
                        }
                        readyPolygons.splice(i, 1);
                        readyPolygons.push(_poly1);
                        readyPolygons.push(_poly2);
                        i = -1;
                        replay = true;

                        break;
                    }
                }
            }

            if (replay) {
                break;
            }
        }

        if (replay) {
            continue;
        }

        if (j >= readyPolygons[i].length) {
            convexPolygons.push(readyPolygons[i]);
            readyPolygons.splice(i, 1);
            i--;
        }
    }

    return convexPolygons;
}

//从anchor到endPoints各个点的连线组成的线段，是否与lines中各条线段有相交
//2：相交；1:与[anchor, endPoints[i]]延长线相交；-1：不相交；0：相邻
Util.crossLines = function (anchor, endPoints, lines) {
    var i, j, intersectTest, hasAdjacentLine = false;

    for (i = 0; i < endPoints.length; i++) {
        for (j = 0; j < lines.length; j++) {
            intersectTest = Util.lineIntersect([anchor, endPoints[i]], lines[j]);
            if (intersectTest.intersect == 1) {
                return 2;
            } else if (intersectTest.intersect == -1
                    && intersectTest.cd_on_ab_ext) {
                return 1;
            } else if (intersectTest.intersect == 0) {
                hasAdjacentLine = true;

                if (intersectTest.c_on_ab == 2) {  //交点为lines中的其中一个顶点
                    if (!Util.isEndPoint(lines[j][0], lines)) { 
                        return 2;
                    }
                } else if (intersectTest.d_on_ab == 2) {  //交点为lines中的其中一个顶点
                    if (!Util.isEndPoint(lines[j][1], lines)) {
                        return 2;
                    }
                }
            }
        }
    }

    if (hasAdjacentLine) {
        return 0;
    } else {
        return -1;
    }
}

//point是否是lines组成的折线段的端点
Util.isEndPoint = function (point, lines) {
    var findCount = 0, i;

    for (i = 0; i < lines.length; i++) {
        if (Util.floatEquals(point[0], lines[i][0][0])
            && Util.floatEquals(point[1], lines[i][0][1])) {
            findCount++;
        } else if (Util.floatEquals(point[0], lines[i][1][0])
            && Util.floatEquals(point[1], lines[i][1][1])) {
            findCount++;
        }

        if (findCount > 1) {
            return false;
        }
    }

    return true;
}

//从anchor与lines中各条线段的起点和终点的连线组成的多边形，是否包含多边形polygon
//true：包含；false：不包含
Util.coverPolygon = function (anchor, lines, polygonBounds) {
    var i, tempBounds;

    for (i = 0; i < lines.length; i++) {
        if (Util.isOnLine(anchor, lines[i][0], lines[i][1])) {
            return false;
        }

        tempBounds = (new L.Polygon([anchor, lines[i][0], lines[i][1]])).getBounds();

        if (Util.rectangleContains(tempBounds, polygonBounds)) {
            return true;
        }
    }

    return false;
}

//判断两条线段是否相交
//假设line1的端点为ab，line2的端点为cd
//return: 1:相交；0：相邻；-1：相离
Util.lineIntersect = function (line1, line2) {
    var a = line1[0],
        b = line1[1],
        c = line2[0],
        d = line2[1];

    var result = {
        intersect: -1,               //两线段总体拓扑关系。1:相交；0：相邻（包含也做邻接关系处理）；-1：相离
        cd_on_ab_ext: false,           //线段cd与ab的延长线相交（不包括相邻的情况）
        ab_on_cd_ext: false,           //线段ab与cd的延长线相交（不包括相邻的情况）
        c_on_ab: 0,           //c在直线ab上，2：在线段ab上；1：与a点或b点重合；0：不在直线ab上；-1：在ab的延长线上靠近a的一端；-2：在ab的延长线上靠近b的一端
        d_on_ab: 0,           //d在直线ab上
        a_on_cd: 0,           //a在直线cd上
        b_on_cd: 0            //b在直线cd上
    };

    // 三角形abc 面积的2倍  
    var area_abc = Util.getArea(a, b, c); // (a[0] - c[0]) * (b[1] - c[1]) - (a[1] - c[1]) * (b[0] - c[0]);

    // 三角形abd 面积的2倍  
    //(a.x - d.x) * (b.y - d.y) - (a.y - d.y) * (b.x - d.x)
    var area_abd = Util.getArea(a, b, d); //(a[0] - d[0]) * (b[1] - d[1]) - (a[1] - d[1]) * (b[0] - d[0]);

    var c_on_line_ab = Math.abs(area_abc) < Util.tolerance;   //c是否在直线ab上
    var d_on_line_ab = Math.abs(area_abd) < Util.tolerance;   //d是否在直线ab上
    //    result.c_on_ab = c_on_line_ab && (Util.floatBigger(c[0], Math.min(a[0], b[0]))
    //                                        && Util.floatBigger(Math.max(a[0], b[0]), c[0]));      //c是否在线段ab上
    //    result.d_on_ab = d_on_line_ab && (Util.floatBigger(d[0], Math.min(a[0], b[0]))
    //                                        && Util.floatBigger(Math.max(a[0], b[0]), d[0]));      //d是否在线段ab上
    //    result.a_on_cd = c_on_line_ab && (Util.floatBigger(a[0], Math.min(c[0], d[0]))
    //                                        && Util.floatBigger(Math.max(c[0], d[0]), a[0]));      //a是否在线段cd上
    //    result.b_on_cd = d_on_line_ab && (Util.floatBigger(b[0], Math.min(c[0], d[0]))
    //                                        && Util.floatBigger(Math.max(c[0], d[0]), b[0]));      //b是否在线段cd上
    result.c_on_ab = c_on_line_ab ? Util._getAdjacentRelation(c, line1) : 0;
    result.d_on_ab = d_on_line_ab ? Util._getAdjacentRelation(d, line1) : 0;
    //    result.a_on_cd = a_on_line_ab ? Util._getAdjacentRelation(a, line1) : 0;
    //    result.b_on_cd = b_on_line_ab ? Util._getAdjacentRelation(b, line1) : 0;

    //(对点在线段上的情况,单独标识出来);  
    if (c_on_line_ab || d_on_line_ab) {

        if (c_on_line_ab && d_on_line_ab) {     //两条线段包含、重合或部分重合
            result.intersect = 0;
            result.a_on_cd = Util._getAdjacentRelation(a, line2);
            result.b_on_cd = Util._getAdjacentRelation(b, line2);
        } else if (c_on_line_ab) {
            if (result.c_on_ab == 2 || result.c_on_ab == 1) {
                result.intersect = 0;
            }

            if (result.c_on_ab == 1) {
                if (Util.floatEquals(c, a)) {
                    result.a_on_cd = 1;
                } else {
                    result.b_on_cd = 1;
                }
            }
        } else if (d_on_line_ab) {
            if (result.c_on_ab == 2 || result.c_on_ab == 1) {
                result.intersect = 0;
            }

            if (result.d_on_ab == 1) {
                if (Util.floatEquals(d, a)) {
                    result.a_on_cd = 1;
                } else {
                    result.b_on_cd = 1;
                }
            }
        }

        return result;

        //        if (!result.c_on_ab && !result.d_on_ab && !result.a_on_cd && !result.b_on_cd) {
        //            result.intersect = -1;
        //            return result;
        //        } else {
        //            result.intersect = 0;
        //            return result;
        //        }
    } else if ((area_abc > 0 && area_abd > 0)
            || (area_abc < 0 && area_abd < 0)) {   // 面积符号相同则两点在线段同侧,不相交
        result.intersect = -1;

        if ((a[0] - b[0]) * (c[1] - d[1]) == (c[0] - d[0]) * (a[1] - b[1])) {    //两线段平行
            return result;
        }
        //        else {
        //            result.ab_on_cd_ext = true;
        //        }
    }

    // 三角形cda 面积的2倍  
    //(c.x - a.x) * (d.y - a.y) - (c.y - a.y) * (d.x - a.x)
    var area_cda = Util.getArea(c, d, a); //(c[0] - a[0]) * (d[1] - a[1]) - (c[1] - a[1]) * (d[0] - a[0]);
    // 三角形cdb 面积的2倍  
    // 注意: 这里有一个小优化.不需要再用公式计算面积,而是通过已知的三个面积加减得出.  
    var area_cdb = area_cda + area_abc - area_abd;

    var a_on_line_cd = Math.abs(area_cda) < Util.tolerance;   //a是否在直线cd上
    var b_on_line_cd = Math.abs(area_cdb) < Util.tolerance;   //b是否在直线cd上

    if (a_on_line_cd || b_on_line_cd) {
        if (a_on_line_cd) {
            result.a_on_cd = Util._getAdjacentRelation(a, line2);

            if (result.a_on_cd == 2 || result.a_on_cd == 1) {
                result.intersect = 0;
                result.ab_on_cd_ext = false;
            } else if (result.a_on_cd == -1 || result.a_on_cd == -2) {
                result.intersect = -1;
                result.ab_on_cd_ext = true;
            }
        }

        if (b_on_line_cd) {
            result.b_on_cd = Util._getAdjacentRelation(b, line2);

            if (result.b_on_cd == 2 || result.b_on_cd == 1) {
                result.intersect = 0;
                result.ab_on_cd_ext = false;
            } else if (result.b_on_cd == -1 || result.b_on_cd == -2) {
                result.intersect = -1;
                result.ab_on_cd_ext = true;
            }
        }
    } else if ((area_cda > 0 && area_cdb > 0)
            || (area_cda < 0 && area_cdb < 0)) {   // 面积符号相同则两点在线段同侧,不相交
        result.intersect = -1;

        if ((area_abc < 0 && area_abd > 0)
            || (area_abc > 0 && area_abd < 0)) {
            result.cd_on_ab_ext = true;
        }
    } else if ((area_abc > 0 && area_abd > 0)
            || (area_abc < 0 && area_abd < 0)) {
        result.intersect = -1;
        result.ab_on_cd_ext = true;
    } else {
        result.intersect = 1;
    }

    return result;
}

//计算abc三点组成的三角形的面积
//(a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x)
Util.getArea = function (a, b, c) {
    return (a[0] - c[0]) * (b[1] - c[1]) - (a[1] - c[1]) * (b[0] - c[0]);
}

//判断点和线段的连接关系。假设点point在直线line上
//2：在线段line上；1：与线段line端点重合；0：不在直线line上；-1：在线段line的延长线上靠近起点一端；-2：在线段line的延长线上靠近终点一端
Util._getAdjacentRelation = function (point, line) {
    if ((Util.floatEquals(point[0], line[0][0]) && Util.floatEquals(point[1], line[0][1]))
         || (Util.floatEquals(point[0], line[1][0]) && Util.floatEquals(point[1], line[1][1]))) {
        return 1;
    } else if ((Util.floatBiggerOrEquals(point[0], Math.min(line[0][0], line[1][0])) && Util.floatBiggerOrEquals(point[1], Math.min(line[0][1], line[1][1])))
        && (Util.floatBiggerOrEquals(Math.max(line[0][0], line[1][0]), point[0]) && Util.floatBiggerOrEquals(Math.max(line[0][1], line[1][1]), point[1]))) {
        return 2;
    } else {
        var anchorIndex = 0;

        if (Util.floatEquals(line[0][0], line[1][0])) {    //line与x轴平行
            anchorIndex = 1;
        }

        if (line[0][anchorIndex] < line[1][anchorIndex]) {
            if (Util.floatBigger(point[anchorIndex], line[1][anchorIndex])) {
                return -2;
            } else {
                return -1;
            }
        } else {
            if (Util.floatBigger(line[1][anchorIndex], point[anchorIndex])) {
                return -2;
            } else {
                return -1;
            }
        }
    }
}

//判断三个点是否在同一条直线上
Util.isOnLine = function (point1, point2, point3) {
    var area = (point1[0] - point3[0]) * (point2[1] - point3[1]) - (point1[1] - point3[1]) * (point2[0] - point3[0]);

    return Util.floatEquals(area, 0);
}

//判断两个浮点数是否相等
Util.floatEquals = function (float1, float2) {
    return Math.abs(float1 - float2) < Util.tolerance;
}

Util.floatBiggerOrEquals = function (float1, float2) {
    if(Math.abs(float1 - float2) < Util.tolerance){
        return true;
    }else if(float1 > float2){
        return true;
    }else{
        return false;
    }
}

Util.floatBigger = function (float1, float2) {
    if (Math.abs(float1 - float2) < Util.tolerance) {
        return false;
    } else if (float1 > float2) {
        return true;
    } else {
        return false;
    }
}

//判断矩形rect1是否包含矩形rect2
Util.rectangleContains = function (rect1, rect2) {
    var left = rect1.getEast() - rect2.getEast(),
        right = rect2.getWest() - rect1.getWest(),
        up = rect1.getNorth() - rect2.getNorth(),
        bottom = rect2.getSouth() - rect1.getSouth();

    if (Util.floatBiggerOrEquals(left, 0) &&
        Util.floatBiggerOrEquals(right, 0) &&
        Util.floatBiggerOrEquals(up, 0) &&
        Util.floatBiggerOrEquals(bottom, 0)) {
        return true;
    } else {
        return false;
    }
}

//获取坐标串的几何中心点
Util.getCenter = function (latLngs) {
    var totle = [0, 0], i;

    if (latLngs instanceof Array) {
        for (i = 0; i < latLngs.length; i++) {
            totle[0] += latLngs[i][0];
            totle[1] += latLngs[i][1];
        }
    }

    var center = [totle[0] / latLngs.length, totle[1] / latLngs.length];

    return center;
}

//转换非标准坐标值为坐标数组
Util.translateDataFormat = function (data, format) {
    var result = data;

    if (format == "wkt") {
        //var parser = new WktParser();
        //result = parser.wkt2Array(data);
        var geoObj = MyWktParser.wkt2Array(data);

        //        if (geoObj) {
        //            result = (geoObj.type === "Polygon" || geoObj.type === "MultiPolygon") ? geoObj.coords : null;
        //        } else {
        //            result = null;
        //        }
        result = geoObj;
    }

    return result;
}

Util.cloneObject = function (object) {
    if (!object) {
        return object;
    }

    var newObj = {}, prop;

    for (prop in object) {
        if (!prop) {
            continue;
        }

        newObj[prop] = object[prop];
    }

    newObj.prototype = object.prototype;

    return newObj;
}