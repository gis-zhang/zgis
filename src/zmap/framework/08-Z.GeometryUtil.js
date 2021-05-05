/**
 * Created by Administrator on 2015/10/30.
 */
Z.GeometryUtil = {
    transformPaths: function(pathArray, transformation){
        if(Z.Util.isArray(pathArray)){
            var notArray2 = !(pathArray instanceof Array) || !(pathArray[0] instanceof Array),  //判断shape是否为二维数组
                notArray3 = notArray2 || !(pathArray[0][0] instanceof Array),        //判断shape是否为三维数组
                notArray4 = notArray3 || !(pathArray[0][0][0] instanceof Array),     //判断shape是否为四维数组
                paths = [], shapes = [];

            if(!notArray4){     //四维数组
                paths = pathArray;
            }else if(!notArray3){     //三维数组
                paths = [pathArray];
            }else if(!notArray2){     //二维数组
                paths = [[pathArray]];
            }

            var pathCount = paths.length, pathLength, subPathLength, minx, miny, maxx, maxy, minz, maxz;
            var newPath = new Array(pathCount);

            for(var i = 0; i < pathCount; i++){
                pathLength = paths[i].length;
                newPath[i] = new Array(pathLength);

                for(var j = 0; j < pathLength; j++){
                    subPathLength = paths[i][j].length;
                    newPath[i][j] = new Array(subPathLength);

                    for(var k = 0; k < subPathLength; k++){
                        if(paths[i][j][k].length > 1){
                            //newPath[i][j][k] = [];
                            var curPoint = paths[i][j][k];
                            var newPoint = new Array(3);
                            var x = curPoint[0],
                                y = curPoint[1],
                                z = curPoint.length > 2 ? curPoint[2] : undefined;

                            var transformPoint = transformation.transform(x, y, z);
                            //newPath[i][j][k][0] = transformPoint.x;
                            //newPath[i][j][k][1] = transformPoint.y;
                            //newPath[i][j][k][2] = transformPoint.z;
                            newPoint[0] = transformPoint.x;
                            newPoint[1] = transformPoint.y;
                            newPoint[2] = transformPoint.z;
                            newPath[i][j][k] = newPoint;
                        }
                    }
                }
            }

            if(!notArray4){     //四维数组
                return newPath;
            }else if(!notArray3){     //三维数组
                return newPath[0];
            }else if(!notArray2){     //二维数组
                return newPath[0][0];
            }
        }else{
            return null;
        }
    },

    /**
     * 交换坐标顺序， 假如要交换x轴和y轴， 则xIndex为1， yIndex为0， zIndex为2表示z不变： transposePathsAxis: function(pathArray, 1, 0, 2)
     * @param pathArray
     * @param xIndex  新的x坐标与原来的哪个坐标交换， 分别用0，1，2表示原来坐标的x、y和z值
     * @param yIndex
     * @param zIndex
     * @returns {*}
     */
    transposePathsAxis: function(pathArray, xIndex, yIndex, zIndex){
        if(pathArray === undefined || xIndex === undefined || yIndex === undefined || zIndex === undefined){
            return pathArray;
        }

        if(Z.Util.isArray(pathArray)){
            var notArray2 = !(pathArray instanceof Array) || !(pathArray[0] instanceof Array),  //判断shape是否为二维数组
                notArray3 = notArray2 || !(pathArray[0][0] instanceof Array),        //判断shape是否为三维数组
                notArray4 = notArray3 || !(pathArray[0][0][0] instanceof Array),     //判断shape是否为四维数组
                paths = [], shapes = [];

            if(!notArray4){     //四维数组
                paths = pathArray;
            }else if(!notArray3){     //三维数组
                paths = [pathArray];
            }else if(!notArray2){     //二维数组
                paths = [[pathArray]];
            }

            var pathCount = paths.length, pathLength, subPathLength, minx, miny, maxx, maxy, minz, maxz;
            var newPath = new Array(pathCount);

            for(var i = 0; i < pathCount; i++){
                pathLength = paths[i].length;
                newPath[i] = new Array(pathLength);

                for(var j = 0; j < pathLength; j++){
                    var curSubPath = paths[i][j];
                    subPathLength = paths[i][j].length;
                    newPath[i][j] = new Array(subPathLength);

                    for(var k = 0; k < subPathLength; k++){
                        //if(paths[i][j][k].length > 1){
                            //newPath[i][j][k] = [];
                            //newPath[i][j][k][0] = paths[i][j][k][xIndex];
                            //newPath[i][j][k][1] = paths[i][j][k][yIndex];
                            //newPath[i][j][k][2] = paths[i][j][k][zIndex];
                        var curPoint = paths[i][j][k];

                        if(curPoint.length > 1){
                            var newPoint = new Array(3);
                            newPoint[0] = curPoint[xIndex];
                            newPoint[1] = curPoint[yIndex];
                            newPoint[2] = curPoint.length > 2 ? curPoint[zIndex] : undefined;
                            newPath[i][j][k] = newPoint;
                        }
                    }
                }
            }

            if(!notArray4){     //四维数组
                return newPath;
            }else if(!notArray3){     //三维数组
                return newPath[0];
            }else if(!notArray2){     //二维数组
                return newPath[0][0];
            }
        }else{
            return null;
        }
    },

    transformPoint: function(point, transformation){
        if(!point){
            return null;
        }

        if(Array.isArray(point)){
            var transformPoint = transformation.transform(point[0], point[1], point[2]);
            return [transformPoint.x, transformPoint.y, transformPoint.z];
        }else{
            var transformPoint = transformation.transform(point.x, point.y, point.z);
            return {x:transformPoint.x, y:transformPoint.y, z:transformPoint.z};
        }
    },

    getPathBounds: function(pathArray, lngStart){     //paths为三维数组，lngStart为true表示坐标顺序为经度在前、维度在后。默认为lngStart为false表示纬度在前、经度在后，例如：[[[80,120], [80,121], [78, 110]], [[98,101], [79,100], [89,110]]]
        if(Z.Util.isArray(pathArray)){
            var notArray2 = !(pathArray instanceof Array) || !(pathArray[0] instanceof Array),  //判断shape是否为二维数组
                notArray3 = notArray2 || !(pathArray[0][0] instanceof Array),        //判断shape是否为三维数组
                notArray4 = notArray3 || !(pathArray[0][0][0] instanceof Array),     //判断shape是否为四维数组
                paths = [], shapes = [];

            if(!notArray4){     //四维数组
                paths = pathArray;
            }else if(!notArray3){     //三维数组
                paths = [pathArray];
            }else if(!notArray2){     //二维数组
                paths = [[pathArray]];
            }

            var pathCount = paths.length, pathLength, subPathLength, minx, miny, maxx, maxy, minz, maxz;

            for(var i = 0; i < pathCount; i++){
                pathLength = paths[i].length;

                for(var j = 0; j < pathLength; j++){
                    subPathLength = paths[i][j].length;

                    for(var k = 0; k < subPathLength; k++){
                        //if(paths[i][j][k].length > 1){
                        //    if(minx === undefined){
                        //        minx = maxx = paths[i][j][k][0];
                        //        miny = maxy = paths[i][j][k][1];
                        //        minz = maxz = paths[i][j][k][2];
                        //    }else{
                        //        minx = Math.min(minx, paths[i][j][k][0]);
                        //        maxx = Math.max(maxx, paths[i][j][k][0]);
                        //        miny = Math.min(miny, paths[i][j][k][1]);
                        //        maxy = Math.max(maxy, paths[i][j][k][1]);
                        //        minz = Math.min(minz, paths[i][j][k][2]);
                        //        maxz = Math.max(maxz, paths[i][j][k][2]);
                        //    }
                        //}

                        var curPoint = paths[i][j][k];

                        if(curPoint.length > 1){
                            if(minx === undefined){
                                minx = maxx = curPoint[0];
                                miny = maxy = curPoint[1];
                                minz = maxz = curPoint[2];
                            }else{
                                minx = Math.min(minx, curPoint[0]);
                                maxx = Math.max(maxx, curPoint[0]);
                                miny = Math.min(miny, curPoint[1]);
                                maxy = Math.max(maxy, curPoint[1]);
                                minz = Math.min(minz, curPoint[2]);
                                maxz = Math.max(maxz, curPoint[2]);
                            }
                        }
                    }
                }
            }

            if(minx !== undefined){
                if(lngStart){
                    return Z.LatLngBounds.create(Z.LatLng.create(miny, minx, minz), Z.LatLng.create(maxy, maxx, maxz));
                }else{
                    return Z.LatLngBounds.create(Z.LatLng.create(minx, miny, minz), Z.LatLng.create(maxx, maxy, maxz));
                }
            }else{
                return null;
            }
        }else{
            return null;
        }
    },

    convertPathToGeometry: function(paths, convertFun, scope, lngStart){     //paths为三维数组，坐标顺序为纬度在前、经度在后，例如：[[[80,120], [80,121], [78, 110]], [[98,101], [79,100], [89,110]]]
        var geoms = [], geometry;//geometry = new THREE.Geometry();

        if(Z.Util.isArray(paths)){
            var pathLength = paths.length, subPathLength, i, j, vec;

            for(i = 0; i < pathLength; i++){
                if(paths[i] instanceof Array){
                    subPathLength = paths[i].length;
                    geometry = new THREE.Geometry();

                    for(j = 0; j < subPathLength; j++){
                        //if((paths[i][j] instanceof Array) && paths[i][j].length > 1){
                        //    if(lngStart){
                        //        vec = new THREE.Vector3( paths[i][j][0], paths[i][j][1], paths[i][j][2]);
                        //    }else{
                        //        vec = new THREE.Vector3( paths[i][j][1], paths[i][j][0], paths[i][j][2]);
                        //    }

                        var curPoint = paths[i][j];

                        if((curPoint instanceof Array) && curPoint.length > 1){
                            if(lngStart){
                                vec = new THREE.Vector3(curPoint[0], curPoint[1], curPoint[2]);
                            }else{
                                vec = new THREE.Vector3(curPoint[1], curPoint[0], curPoint[2]);
                            }

                            if(convertFun){
                                if(scope){
                                    vec = convertFun.call(scope, vec);
                                }else{
                                    vec = convertFun(vec);
                                }
                            }

                            if(vec instanceof THREE.Vector3){
                                geometry.vertices.push(vec);
                            }
                        }
                    }

                    if(Z.GeometryUtil.isClockWise(geometry.vertices)){
                        geometry.vertices.reverse();
                    }

                    geoms.push(geometry);
                }
            }
        }

        return geoms;
    },

    /**
     *
     * @param pathArray  pathArray为多维数组(可为二维、三维或思维)，坐标顺序为纬度在前、经度在后，例如：[[[80,120], [80,121], [78, 110]], [[98,101], [79,100], [89,110]]]
     * @param convertFun
     * @param cw   pathArray的坐标正序。1:正序为顺时针；-1：正序逆时针；0：忽略时针顺序，第一条路径为外轮廓，后面的皆为hole
     * @param scope
     * @param offsetX
     * @param offsetY
     * @param lngStart
     * @returns {Array}
     */
    convertPathToShapes: function(pathArray, convertFun, cw, scope, offsetX, offsetY, lngStart){
        var notArray2 = !(pathArray instanceof Array) || !(pathArray[0] instanceof Array),  //判断shape是否为二维数组
            notArray3 = notArray2 || !(pathArray[0][0] instanceof Array),        //判断shape是否为三维数组
            notArray4 = notArray3 || !(pathArray[0][0][0] instanceof Array),     //判断shape是否为四维数组
            coords = [], shapes = [];

        offsetX = offsetX || 0;
        offsetY = offsetY || 0;

        if(!notArray4){     //四维数组
            coords = pathArray;
        }else if(!notArray3){     //三维数组
            coords = [pathArray];
        }else if(!notArray2){     //二维数组
            coords = [[pathArray]];
        }

        for(var pLength = 0; pLength < coords.length; pLength++){
            var bounds = [], holes = [], points, paths = coords[pLength],
                pathLength = paths.length, subPathLength, i, j, vec;

            for(i = 0; i < pathLength; i++){
                subPathLength = paths[i].length;
                points = [];
                var pointCollection = {};

                for(j = 0; j < subPathLength; j++){
                    var curPoint = paths[i][j];

                    if(curPoint.length <= 1) {
                        continue;
                    }

                    //var curPoint = paths[i][j],
                    //    lastPoint = j === 0 ? paths[i][subPathLength-1] : paths[i][j-1];
                    //
                    //if(Z.GeometryUtil.isSamePoint(curPoint[0], curPoint[1], lastPoint[0], lastPoint[1])
                    //    || Z.GeometryUtil.isDuplicatePoint(pointCollection, curPoint[0], curPoint[1])){
                    //    continue;
                    //}

                    //var zValue = (isNaN(paths[i][j][2]) ? 0 : paths[i][j][2]) + (isNaN(baseHeight) ? 0 : baseHeight);

                    if(lngStart){
                        vec = new THREE.Vector3( curPoint[0] + offsetX, curPoint[1] + offsetY);
                    }else{
                        vec = new THREE.Vector3( curPoint[1] + offsetX, curPoint[0] + offsetY);
                    }

                    if(convertFun){
                        if(scope){
                            vec = convertFun.call(scope, vec);
                        }else{
                            vec = convertFun(vec);
                        }
                    }

                    if(vec instanceof THREE.Vector3){
                        points.push(vec);
                    }
                }

                if(points.length > 2){
                    var isClockWise = Z.GeometryUtil.isClockWise(points);

                    if(cw === 0){
                        if(bounds.length <= 0){
                            if(isClockWise){
                                points.reverse();
                            }

                            bounds.push(points);
                        }else{
                            if(!isClockWise){
                                points.reverse();
                            }

                            holes.push(new THREE.Path(points));
                        }
                    }else{
                        if(cw === 1){
                            points.reverse();
                        }

                        if(Z.GeometryUtil.isClockWise(points)){
                            holes.push(new THREE.Path(points));
                        }else{
                            bounds.push(points);
                        }
                    }
                }
            }

            if(bounds.length < 1){
                if(holes.length > 0){
                    console.info("请检查多边形的坐标顺序是否为顺时针");
                    console.info("bound：" + JSON.stringify(bounds));
                    console.info("holes：" + JSON.stringify(holes));
                    debugger;
                }

                continue;
            }else{
                var geom = new THREE.Shape(bounds[0]);

                for(var i = 0; i < holes.length; i++){
                    geom.holes.push(holes[i]);
                }

                shapes.push(geom);
            }
        }

        return shapes;
    },

    //isDuplicatePoint: function(collection, x1, y1){
    //    var key = x1 + ":" + y1;
    //
    //    if(collection[key]){
    //        return true;
    //    }else{
    //        collection[key] = true;
    //        return false;
    //    }
    //},
    //
    //isSamePoint: function(x1, y1, x2, y2, tolerence){
    //    tolerence = tolerence || 0.0000008;
    //
    //    if(x1 - x2 < tolerence &&
    //        y1 - y2 < tolerence){
    //        return true;
    //    }else{
    //        return false;
    //    }
    //},

    //判断坐标串是否为顺时针
    isClockWise: function(path){
        return Z.GeometryUtil.areaByCoordArray(path) < 0;
    },

    areaByCoordArray: function(path){
        var n = path.length,
            a = 0.0,
            pointA, pointB;

        for ( var p = n - 1, q = 0; q < n; p = q ++ ) {
            if(path[p].x && path[p].y && path[q].x && path[q].y){
                a += path[ p ].x * path[ q ].y - path[ q ].x * path[ p ].y;
            }else if((path[p] instanceof Array) && path[p].length > 0){
                a += path[ p ][1] * path[ q ][0] - path[ q ][1] * path[ p ][0];
            }
        }

        return a * 0.5;
    }
}