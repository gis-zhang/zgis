/**
 * Created by gaimeng on 14/12/27.
 */

var System={};
var js=document.scripts;
js=js[js.length-1].src.substring(0,js[js.length-1].src.lastIndexOf("/"));
System.path = js;
System.libPath = System.path.substring(0,System.path.lastIndexOf("/"));
System.imgPath = System.libPath+"/img";

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik M ller. fixes from Paul Irish and Tino Zijdel
// MIT license
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] +
            'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame) window.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() {
            callback(currTime + timeToCall);
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };
    if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
    };
}());

//IDM namespace
var IDM = {}
IDM.Browser = {};
//Browser detection
(function() {
    var a = "ActiveXObject" in window,
        c = a && !document.addEventListener,
        e = navigator.userAgent.toLowerCase(),
        f = -1 !== e.indexOf("webkit"),
        m = -1 !== e.indexOf("chrome"),
        p = -1 !== e.indexOf("phantom"),
        isAndroid = -1 !== e.indexOf("android"),
        r = -1 !== e.search("android [23]"),
        gecko = -1 !== e.indexOf("gecko"),
        isIphone = -1 !== e.indexOf("iphone"),
        isSymbianOS = -1 !== e.indexOf("symbianos"),
        isWinPhone = -1 !== e.indexOf("windows phone"),
        isIpad =  -1 !== e.indexOf("ipad"),
        k = isIphone || isWinPhone || isSymbianOS || isAndroid ||isIpad,
        q = window.navigator && window.navigator.msPointerEnabled && window.navigator.msMaxTouchPoints && !window.PointerEvent,
        t = window.PointerEvent && window.navigator.pointerEnabled && window.navigator.maxTouchPoints || q,
        y = "devicePixelRatio" in window && 1 < window.devicePixelRatio || "matchMedia" in window && window.matchMedia("(min-resolution:144dppi)") &&
            window.matchMedia("(min-resolution:144dppi)").matches,
        l = document.documentElement,
        A = a && "transition" in l.style,
        x = "WebKitCSSMatrix" in window && "m11" in new window.WebKitCSSMatrix && !r,
        B = "MozPerspective" in l.style,
        z = "OTransition" in l.style,
        G = !window.L_DISABLE_3D && (A || x || B || z) && !p,
        p = !window.L_NO_TOUCH && !p && function() {
                if (t || "ontouchstart" in l) return !0;
                var a = document.createElement("div"),
                    c = !1;
                if (!a.setAttribute) return !1;
                a.setAttribute("ontouchstart", "return;");
                "function" === typeof a.ontouchstart && (c = !0);
                a.removeAttribute("ontouchstart");
                return c
            }();
    IDM.Browser = {
        ie: a,
        ielt9: c,
        webkit: f,
        gecko: gecko && !f && !window.opera && !a,
        android: isAndroid,
        android23: r,
        iphone: isIphone,
        ipad: isIpad,
        symbian: isSymbianOS,
        winphone: isWinPhone,
        chrome: m,
        ie3d: A,
        webkit3d: x,
        gecko3d: B,
        opera3d: z,
        any3d: G,
        mobile: k,
        mobileWebkit: k && f,
        mobileWebkit3d: k && x,
        mobileOpera: k && window.opera,
        touch: p,
        msPointer: q,
        pointer: t,
        retina: y
    }
}());

//---------------------the IDM.GeomUtil class--------------------
//get the bounding Rect of the points
function Rect(minx,miny,maxx,maxy){
    this.tl = [minx || 0, miny || 0]; //top left point
    this.br = [maxx || 0, maxy || 0]; //bottom right point
}

Rect.prototype.isCollide = function(rect){
    if(rect.br[0] < this.tl[0] || rect.tl[0] > this.br[0] ||
        rect.br[1] < this.tl[1] || rect.tl[1] > this.br[1]){
        return false;
    }
    return true;
}

IDM.GeomUtil = {

    getBoundingRect: function (points) {
        var rect = new Rect();
        //if there are less than 1 point
        if (points.length < 2) {
            return rect;
        }
        var minX = 9999999, minY = 9999999, maxX = -9999999, maxY = -9999999;
        for (var i = 0; i < points.length - 1; i += 2) {

            if (points[i] > maxX) {
                maxX = points[i];
            }
            if (points[i] < minX) {
                minX = points[i];
            }
            if (points[i + 1] > maxY) {
                maxY = points[i + 1];
            }
            if (points[i + 1] < minY) {
                minY = points[i + 1];
            }
        }
        rect.tl = [minX, minY];
        rect.br = [maxX, maxY];
        return rect;
    }
}
//---------------------the IDM.DomUtil class--------------------
IDM.DomUtil = {

    getElementLeft: function (element) {
        var actualLeft = element.offsetLeft;
        var current = element.offsetParent;
        while (current !== null) {
            actualLeft += current.offsetLeft;
            current = current.offsetParent;
        }
        return actualLeft;
    },

    getElementTop: function (element) {

        var actualTop = element.offsetTop;
        var current = element.offsetParent;
        while (current !== null) {
            actualTop += current.offsetTop;
            current = current.offsetParent;
        }
        return actualTop;
    },

    getTranslateString: function(point) {
        var dim = IDM.Browser.webkit3d;
        return "translate" + (dim ? "3d" : "") + "(" + point[0] + "px," + point[1] + "px" + ((dim ? ",0" : "") + ")");
    },

    getPos: function (element) {
        return element._idm_pos ? element._idm_pos : [IDM.DomUtil.getElementLeft(element), IDM.DomUtil.getElementTop(element)];
    },
    setPos: function (element, point) {
        element._idm_pos = point;
        IDM.Browser.any3d ? element.style[IDM.DomUtil.TRANSFORM] = IDM.DomUtil.getTranslateString(point) : (element.style.left = point[0] + "px", element.style.top = point[1] + "px")
        //element.style.left = point[0] + "px";
        //element.style.top = point[1] + "px";
    },

    testProp: function(props) {
        for (var c =
            document.documentElement.style, i = 0; i < props.length; i++)
            if (props[i] in c) return props[i];
        return false;
    }
}

IDM.DomUtil.TRANSFORM = IDM.DomUtil.testProp(["transform", "WebkitTransform", "OTransform", "MozTransform", "msTransform"]);
IDM.DomUtil.TRANSITION = IDM.DomUtil.testProp(["webkitTransition", "transition", "OTransition", "MozTransition", "msTransition"]);
IDM.DomUtil.TRANSITION_END = "webkitTransition" === IDM.DomUtil.TRANSITION || "OTransition" === IDM.DomUtil.TRANSITION ? IDM.DomUtil.TRANSITION + "End" : "transitionend";

//---------------------the Mall class--------------------
function Mall(){
    var _this = this;
    this.floors = [];   //the floors
    this.building = null; //the building
    this.root = null; //the root scene
    this.is3d = true;
    this.jsonData = null; //original json data

    var _curFloorId;

    //get building id
    this.getBuildingId = function(){
        var mallid = _this.jsonData.data.building.Mall;
        return mallid? mallid : -1;
    }

    //get default floor id
    this.getDefaultFloorId = function(){
        return _this.jsonData.data.building.DefaultFloor;
    }
    //get current floor id
    this.getCurFloorId = function() {
        return _curFloorId;
    }

    //get floor num
    this.getFloorNum = function(){
        return _this.jsonData.data.floors.length;
    }

    //get floor by id
    this.getFloor = function(id) {
        for(var i = 0; i < _this.floors.length; i++) {
            if(_this.floors[i]._id == id) {
                return _this.floors[i];
            }
        }
        return null;
    }

    //get floor by name
    this.getFloorByName = function(name){
        for(var i = 0; i < _this.floors.length; i++) {
            if(_this.floors[i].Name == name) {
                return _this.floors[i];
            }
        }
        return null;
    }

    //get current floor
    this.getCurFloor = function() {
        return _this.getFloor(_curFloorId);
    }

    //get Floor's json data
    this.getFloorJson = function(fid){
        var floorsJson = _this.jsonData.data.Floors;
        for(var i = 0; i < floorsJson.length; i++){
            if(floorsJson[i]._id == fid) {
                return floorsJson[i];
            }
        }
        return null;
    }

    //show floor by id
    this.showFloor = function(id){
        if(_this.is3d) {
            //set the building outline to invisible
            _this.root.remove(_this.building);
            //set all the floors to invisible
            for (var i = 0; i < _this.floors.length; i++) {
                if (_this.floors[i]._id == id) {
                    //set the specific floor to visible
                    _this.floors[i].position.set(0, 0, 0);
                    _this.root.add(_this.floors[i]);
                } else {
                    _this.root.remove(_this.floors[i]);
                }
            }
        }
        _curFloorId = id;
    }

    //show the whole building
    this.showAllFloors = function(){
        if(!_this.is3d){ //only the 3d map can show all the floors
            return;
        }

        _this.root.add(_this.building);

        var offset = 4;
        for(var i=0; i<_this.floors.length; i++){
            _this.floors[i].position.set(0,0,i*_this.floors[i].height*offset);
//            if(i == 4){
//                _this.floors[i].position.set(0,-300,i*_this.floors[i].height*offset);
//            }else{
//
//            }
            _this.root.add(this.floors[i]);
        }
        this.building.scale.set(1,1,offset);

        _curFloorId = 0;

        return _this.root;
    }
}

//----------------------------theme--------------------------------------

var default2dTheme = {
    name: "test", //theme's name
    background: "#F2F2F2", //background color

    //building's style
    building: {
        color: "#000000",
        opacity: 0.1,
        transparent: true,
        depthTest: false
    },

    //floor's style
    floor: {
        color: "#E0E0E0",
        opacity: 1,
        transparent: false
    },

    //selected room's style
    selected: "#ffff55",

    //rooms' style
    room: function (type, category) {
        var roomStyle;
        if(!category) {
            switch (type) {

                case 100: //hollow. u needn't change this color. because i will make a hole on the model in the final version.
                    return {
                        color: "#F2F2F2",
                        opacity: 0.8,
                        transparent: true
                    }
                case 300: //closed area
                    return {
                        color: "#AAAAAA",
                        opacity: 0.7,
                        transparent: true
                    };
                case 400: //empty shop
                    return {
                        color: "#D3D3D3",
                        opacity: 0.7,
                        transparent: true
                    };
                default :
                    break;
            }
        }

        switch(category) {
            case 101: //food
                roomStyle = {
                    color: "#1f77b4",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 102: //retail
                roomStyle = {
                    color: "#aec7e8",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 103: //toiletry
                roomStyle = {
                    color: "#ffbb78",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 104: //parent-child
                roomStyle = {
                    color: "#98df8a",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 105: //life services
                roomStyle = {
                    color: "#bcbd22",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 106: //education
                return {
                    color: "#2ca02c",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 107: //life style
                roomStyle = {
                    color: "#dbdb8d",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 108: //entertainment
                roomStyle = {
                    color: "#EE8A31",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 109: //others
                roomStyle = {
                    color: "#8c564b",
                    opacity: 0.7,
                    transparent: true
                };
            default :
                roomStyle = {
                    color: "#c49c94",
                    opacity: 0.7,
                    transparent: true
                };
                break;
        }
        return roomStyle;
    },

    //room wires' style
    strokeStyle: {
        color: "#666666",
        opacity: 0.5,
        transparent: true,
        linewidth: 1
    },

    fontStyle:{
        opacity: 1,
        textAlign: "center",
        textBaseline: "middle",
        color: "#333333",
        fontsize: 13,
        fontface: "'Lantinghei SC', 'Microsoft YaHei', 'Hiragino Sans GB', 'Helvetica Neue', Helvetica, STHeiTi, Arial, sans-serif  "
    },

    pubPointImg: {

        "11001": System.imgPath+"/toilet.png",
        "11002": System.imgPath+"/ATM.png",
        "21001": System.imgPath+"/stair.png",
        "22006": System.imgPath+"/entry.png",
        "21002": System.imgPath+"/escalator.png",
        "21003": System.imgPath+"/lift.png"
    }
}
var default3dTheme = {
    name: "test", //theme's name
    background: "#F2F2F2", //background color

    //building's style
    building: {
        color: "#000000",
        opacity: 0.1,
        transparent: true,
        depthTest: false
    },

    //floor's style
    floor: {
        color: "#E0E0E0",
        opacity: 1,
        transparent: false
    },

    //selected room's style
    selected: "#ffff55",

    //rooms' style
    room: function (type, category) {
        var roomStyle;
        if(!category) {
            switch (type) {

                case 100: //hollow. u needn't change this color. because i will make a hole on the model in the final version.
                    return {
                        color: "#F2F2F2",
                        opacity: 0.8,
                        transparent: true
                    }
                case 300: //closed area
                    return {
                        color: "#AAAAAA",
                        opacity: 0.7,
                        transparent: true
                    };
                case 400: //empty shop
                    return {
                        color: "#D3D3D3",
                        opacity: 0.7,
                        transparent: true
                    };
                default :
                    break;
            }
        }

        switch(category) {
            case 101: //food
                roomStyle = {
                    color: "#1f77b4",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 102: //retail
                roomStyle = {
                    color: "#aec7e8",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 103: //toiletry
                roomStyle = {
                    color: "#ffbb78",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 104: //parent-child
                roomStyle = {
                    color: "#98df8a",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 105: //life services
                roomStyle = {
                    color: "#bcbd22",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 106: //education
                return {
                    color: "#2ca02c",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 107: //life style
                roomStyle = {
                    color: "#dbdb8d",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 108: //entertainment
                roomStyle = {
                    color: "#EE8A31",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 109: //others
                roomStyle = {
                    color: "#8c564b",
                    opacity: 0.7,
                    transparent: true
                };
            default :
                roomStyle = {
                    color: "#c49c94",
                    opacity: 0.7,
                    transparent: true
                };
                break;
        }
        return roomStyle;
    },

    //room wires' style
    strokeStyle: {
        color: "#5C4433",
        opacity: 0.5,
        transparent: true,
        linewidth: 2
    },

    fontStyle:{
        color: "#231815",
        fontsize: 40,
        fontface: "Helvetica, MicrosoftYaHei "
    },

    pubPointImg: {

        "11001": System.imgPath+"/toilet.png",
        "11002": System.imgPath+"/ATM.png",
        "21001": System.imgPath+"/stair.png",
        "22006": System.imgPath+"/entry.png",
        "21002": System.imgPath+"/escalator.png",
        "21003": System.imgPath+"/lift.png"
    }
}

//----------------------------the Loader class --------------------------
IndoorMapLoader= function ( is3d, options) {
    THREE.Loader.call( this, is3d );

    this.withCredentials = false;
    this.is3d = is3d;
    this.options = options || {};
};

IndoorMapLoader.prototype = Object.create( THREE.Loader.prototype );

IndoorMapLoader.prototype.load = function ( url, callback, texturePath) {

    var scope = this;

    this.onLoadStart();
    this.loadAjaxJSON( this, url, callback);

};

IndoorMapLoader.prototype.loadAjaxJSON = function ( context, url, callback, callbackProgress) {

    var xhr = new XMLHttpRequest();

    var length = 0;

    xhr.onreadystatechange = function () {

        if ( xhr.readyState === xhr.DONE ) {

            if ( xhr.status === 200 || xhr.status === 0 ) {

                if ( xhr.responseText ) {

                    var json = JSON.parse( xhr.responseText );

                    var result = context.parse( json );
                    callback( result );

                } else {

                    console.error( 'IndoorMapLoader: "' + url + '" seems to be unreachable or the file is empty.' );

                }

                // in context of more complex asset initialization
                // do not block on single failed file
                // maybe should go even one more level up

                context.onLoadComplete();

            } else {

                console.error( 'IndoorMapLoader: Couldn\'t load "' + url + '" (' + xhr.status + ')' );

            }

        } else if ( xhr.readyState === xhr.LOADING ) {

            if ( callbackProgress ) {

                if ( length === 0 ) {

                    length = xhr.getResponseHeader( 'Content-Length' );

                }

                callbackProgress( { total: length, loaded: xhr.responseText.length } );

            }

        } else if ( xhr.readyState === xhr.HEADERS_RECEIVED ) {

            if ( callbackProgress !== undefined ) {

                length = xhr.getResponseHeader( 'Content-Length' );

            }

        }

    };

    xhr.open( 'GET', url, true );
    xhr.withCredentials = this.withCredentials;
    xhr.send( null );

};

IndoorMapLoader.prototype.parse = function ( json ) {
    return ParseModel(json, this.is3d, null, this.options.sceneSize);
};

//-----------------------------the Parser class ---------------------------------------
function ParseModel(json, is3d, theme, sceneSize){

    var mall = new Mall();
    var sceneRealRatio, baseCenter;

    function parse() {

        mall.jsonData = json;
        mall.is3d = is3d;

        if(theme == undefined) {
            if (is3d) {
                theme = default3dTheme;
            } else {
                theme = default2dTheme;
            }
        }

        var building,shape, extrudeSettings, geometry, material, mesh, wire, points, basePoints;
        var scale = 0.1, floorHeight, buildingHeight = 0;

        json.data.building.FrontAngle = -0.43707926489717713;
        json.data.building.FloorsId = json.data.building.floorsId;
        json.data.building.DefaultFloor = json.data.building.defaultFloor;
        json.data.Floors = json.data.floors;

        if(is3d) {
            mall.FrontAngle = json.data.building.FrontAngle;
            building = json.data.building;
            //var baseRect = getRect(basePoints);
            //baseCenter = {x: (baseRect.minx + baseRect.maxx)/2, y: (baseRect.miny + baseRect.maxy)/2};

            var pointArray = getWKTPoints(building.shape);

            var coordsLength = pointArray.length,
                rect = getRect(pointArray),
                center = {x: (rect.minx + rect.maxx)/2, y: (rect.miny + rect.maxy)/2};

            if(!sceneRealRatio){
                //var rect = getRect(pointArray);
                sceneRealRatio = getSceneRealRatio(rect, sceneSize);
            }

            if(!baseCenter){
                baseCenter = {x: (rect.minx + rect.maxx)/2, y: (rect.miny + rect.maxy)/2};
            }


            basePoints = parseWKT(building.shape);
        }

        //floor geometry
        for(var i=0; i<json.data.floors.length; i++){
            var floor = json.data.floors[i];
            floor._id = floor.id;

            floor.Name = floor.name;
            floor.Name_en = floor.name;
            floor.FuncAreas = floor.funcAreas;
            floor.PubPoint = floor.pubPoint;

            //floor.rect = IDM.GeomUtil.getBoundingRect(floor.Outline[0][0]);
            points = parseWKT(floor.shape, baseCenter);
            shapeRect = getRect(points);
            floor.rect = new Rect(shapeRect.minx, shapeRect.miny, shapeRect.maxx, shapeRect.maxy);

            floor.High = heightToScene(sceneRealRatio, floor.high);

            if(is3d) { // for 3d model
                var floorObj = new THREE.Object3D();

                //floorHeight = floor.High / scale;
                floorHeight = heightToScene(sceneRealRatio, floor.high) / scale;
                if (floorHeight == 0.0) { //if it's 0, set to 50.0
                    floorHeight = 50.0;
                }
                buildingHeight += floorHeight;
                //points = parsePoints(floor.Outline[0][0]);
                //points = parseWKT(floor.shape);
                //shape = new THREE.Shape(points);
                shape = buildShapes(points);

                for(var n = 0; n< shape.length; n++){
                    geometry = new THREE.ShapeGeometry(shape[n]);
                    mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial(theme.floor));
                    //mesh.position.set(0, 0, -5);
                    floorObj.add(mesh);
                }

                floorObj.height = floorHeight;
                //floorObj.add(mesh);
                floorObj.points = [];
                floorObj._id = floor._id;
                floorObj.position.set(0, 0, -5);

                mall.floors.push(floorObj);
            }else{//for 2d model
                floor.strokeStyle = theme.strokeStyle.color;
                floor.fillColor = theme.floor.color;
                mall.floors.push(floor);
            }

            //funcArea geometry
            for(var j=0; j<floor.funcAreas.length; j++){

                var funcArea = floor.funcAreas[j], shapeRect;
                //funcArea.rect = IDM.GeomUtil.getBoundingRect(funcArea.Outline[0][0]);
                points = parseWKT(funcArea.shape);
                shapeRect = getRect(points);
                funcArea.rect = new Rect(shapeRect.minx, shapeRect.miny, shapeRect.maxx, shapeRect.maxy);

                funcArea.Type = funcArea.type;
                funcArea.Category = funcArea.category;
                funcArea._id = funcArea.id;
                funcArea.Name = funcArea.name;
                funcArea.Name_en = funcArea.name;
                var center = [(shapeRect.minx + shapeRect.maxx)/2, (shapeRect.miny + shapeRect.maxy)/2];
                funcArea.Center = center;

                if(is3d) {
                    //points = parsePoints(funcArea.Outline[0][0]);
                    points = parseWKT(funcArea.shape);
                    //shape = new THREE.Shape(points);
                    shape = buildShapes(points);

                    //var center = funcArea.Center;
                    //floorObj.points.push({ name: funcArea.Name, type: funcArea.Type, position: new THREE.Vector3(center[0] * scale, floorHeight * scale, -center[1] * scale)});

                    floorObj.points.push({ name: funcArea.name, type: funcArea.type, dataInfo: funcArea, position: new THREE.Vector3(center[0] * scale, floorHeight * scale, -center[1] * scale)});

                    for(var k = 0; k< shape.length; k++) {
                        //solid model
                        extrudeSettings = {amount: floorHeight, bevelEnabled: false};
                        geometry = new THREE.ExtrudeGeometry(shape[k], extrudeSettings);
                        material = new THREE.MeshLambertMaterial(theme.room(parseInt(funcArea.type), funcArea.category));
                        mesh = new THREE.Mesh(geometry, material);
                        mesh.type = "solidroom";
                        mesh.id = funcArea.id;
                        mesh.dataInfo = funcArea;

                        floorObj.add(mesh);

                        //top wireframe
                        geometry = shape[k].createPointsGeometry();
                        wire = new THREE.Line(geometry, new THREE.LineBasicMaterial(theme.strokeStyle));
                        wire.position.set(0, 0, floorHeight);

                        floorObj.add(wire);
                    }
                }else{
                    funcArea.fillColor = theme.room(parseInt(funcArea.type), funcArea.category).color;
                    funcArea.strokeColor = theme.strokeStyle.color;
                }
            }

            if(is3d) {
                //pubPoint geometry
                for (var m = 0; m < floor.pubPoint.length; m++) {
                    var pubPoint = floor.pubPoint[m];
                    //var point = parsePoints(pubPoint.Outline[0][0])[0];
                    //floorObj.points.push({name: pubPoint.Name, type: pubPoint.Type, position: new THREE.Vector3(point.x * scale, floorHeight * scale, -point.y * scale)});
                    var points = parseWKT(pubPoint.shape);
                    var point = points[0][0][0];
                    floorObj.points.push({name: pubPoint.name, type: pubPoint.type, dataInfo: pubPoint, position: new THREE.Vector3(point.x * scale, floorHeight * scale, -point.y * scale)});

                    pubPoint._id = pubPoint.id;
                    pubPoint.Type = pubPoint.type;
                    pubPoint.Name = pubPoint.name;
                    pubPoint.Name_en = pubPoint.name;
                    pubPoint.Outline = [[point]];
                }
            }
        }

        if(is3d) {
            mall.root = new THREE.Object3D(); //if is 3d, create a root object3D

            if(basePoints.length > 0){
                shape = buildShapes(basePoints);

                if(shape.length === 1){
                    extrudeSettings = {amount: buildingHeight, bevelEnabled: false};
                    geometry = new THREE.ExtrudeGeometry(shape[0], extrudeSettings);
                    mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial(theme.building));
                    mall.building = mesh;
                }else{
                    var buildingObj = new THREE.Object3D();

                    for(var i = 0; i< shape.length; i++){
                        extrudeSettings = {amount: buildingHeight, bevelEnabled: false};
                        geometry = new THREE.ExtrudeGeometry(shape[0], extrudeSettings);
                        mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial(theme.building));
                        buildingObj.add(mesh);
                    }

                    mall.building = buildingObj;
                }
            }

            //scale the mall
            mall.root.scale.set(scale, scale, scale);
            mall.root.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
        }

        return mall;
    };

    //parse the points to THREE.Vector2 (remove duplicated points)
    function parsePoints(pointArray){
        var shapePoints = [];
        for(var i=0; i < pointArray.length; i+=2){
            var point = new THREE.Vector2(pointArray[i], pointArray[i+1]);
            if(i>0) {
                var lastpoint = shapePoints[shapePoints.length - 1];
                if (point.x != lastpoint.x || point.y != lastpoint.y) { //there are some duplicate points in the original data
                    shapePoints.push(point);
                }
            }else{
                shapePoints.push(point);
            }
        }
        return shapePoints;
    }

    function parseWKT(wktString){
        var shapePoints = [],
            pointArray = getWKTPoints(wktString);

        var coordsLength = pointArray.length;
            //rect = getRect(pointArray),
            //center = {x: (rect.minx + rect.maxx)/2, y: (rect.miny + rect.maxy)/2};

        if(!sceneRealRatio){
            //var rect = getRect(pointArray);
            sceneRealRatio = getSceneRealRatio(rect, sceneSize);
        }

        if(!baseCenter){
            var baseRect = getRect(basePoints);
            baseCenter = {x: (baseRect.minx + baseRect.maxx)/2, y: (baseRect.miny + baseRect.maxy)/2};
        }

        for(var j = 0; j < coordsLength; j++){
            var polygonPoints = [];
            shapePoints.push(polygonPoints);

            for(var i=0; i < pointArray[j].length; i++){
                var path = [];
                polygonPoints.push(path);

                for(var k=0; k < pointArray[j][i].length; k++) {
                    var pointObj = coordsToScene(sceneRealRatio, {x: pointArray[j][i][k][1] - baseCenter.x, y: pointArray[j][i][k][0] - baseCenter.y});
                    var point = new THREE.Vector2(pointObj.x, pointObj.y);//coordTranslater
                    if (k > 0) {
                        var lastpoint = path[path.length - 1];
                        if (point.x != lastpoint.x || point.y != lastpoint.y) { //there are some duplicate points in the original data
                            path.push(point);
                        }
                    } else {
                        path.push(point);
                    }
                }
            }
        }

        return shapePoints;
    }

    function getWKTPoints(wktString){
        var parseResult = Z.WktParser.wkt2Array(wktString),
            pointArray = [];

        if(parseResult.type === "MultiPolygon"){
            pointArray = parseResult.coords;
        }else if(parseResult.type === "Polygon"){
            pointArray = [parseResult.coords];
        }else if(parseResult.type === "MultiPoint"){
            pointArray = [[parseResult.coords]];
        }else if(parseResult.type === "Point"){
            pointArray = [[[parseResult.coords]]];
        }

        return pointArray;
    }

    function getRect(pointArray){
        var coordsLength = pointArray.length,minx,miny,maxx,maxy;

        for(var i = 0; i < coordsLength; i++){
            for(var j=0; j < pointArray[i].length; j++){
                for(var k=0; k < pointArray[i][j].length; k++){
                    var x, y;

                    if(pointArray[i][j][k] instanceof Array){
                        x = pointArray[i][j][k][1];
                        y = pointArray[i][j][k][0];
                    }else if(pointArray[i][j][k].x !== undefined && pointArray[i][j][k].y !== undefined){
                        x = pointArray[i][j][k].x;
                        y = pointArray[i][j][k].y;
                    }else{
                        continue;
                    }

                    if(minx === undefined){
                        minx = maxx = x;
                        miny = maxy = y;
                    }else{
                        minx = Math.min(x, minx);
                        maxx = Math.max(x, maxx);
                        miny = Math.min(y, miny);
                        maxy = Math.max(y, maxy);
                    }
                }
            }
        }

        return {minx: minx, miny: miny, maxx: maxx, maxy: maxy};
    }

    function getSceneRealRatio(realBbox, sceneSize){
        var sceneRealHeightRatio = sceneSize ? sceneSize.height / (realBbox.maxy - realBbox.miny) : 1,
            sceneRealWidthRatio = sceneSize ? sceneSize.width / (realBbox.maxx - realBbox.minx) : 1;

        return {width: sceneRealWidthRatio, height: sceneRealHeightRatio};
    }

    function coordsToScene(sceneRealRatio, point){
        return {x: point.x * sceneRealRatio.width, y: point.y * sceneRealRatio.height};
    }

    function heightToScene(sceneRealRatio, height){
        if(sceneRealRatio){
            var crs = Z.CRS.EPSG4326,
                latLngOffset = crs.unprojectLatLngOffset(new Z.Point(0, height)),
                sceneLatLngRatio = sceneRealRatio.height;

            return Math.abs(latLngOffset.lat * sceneLatLngRatio);
        }else{
            return height;
        }
    }

    function buildShapes(points){
        var shapes = [];

        for(var i = 0; i < points.length; i++){
            var bounds = [], holes = [];

            for(var j = 0; j < points[i].length; j++){
                if(isClockWise(points[i][j])){
                    holes.push(new THREE.Path(points[i][j]));
                }else{
                    bounds.push(points[i][j]);
                }
            }

            if(bounds.length < 1){
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
    }

    function isClockWise(path){
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

        return a < 0;
    }

    return parse();
}
//-----------------------------the IndoorMap class ------------------------------------

var IndoorMap = function (params) {
    var _this = this;
    var _mapDiv, _uiRoot, _uiSelected;
    var _fullScreen = false;
    this.is3d = true;
    var _indoorMap;

    //initialization
    function init(params) {

        //parse the parameters
        if(params != undefined){
            //if the map container is specified
            if (params.hasOwnProperty("mapDiv")) {
                _mapDiv = document.getElementById(params.mapDiv);
                _fullScreen = false;
            }
            //if the map size is specified
            else if(params.hasOwnProperty("size") && params.size.length == 2){
                createMapDiv(params.size);
                _fullScreen = false;
            }
            //else create a full screen map
            else{
                createMapDiv([window.innerWidth,window.innerHeight]);
                _fullScreen = true;
            }
            // 2d or 3d view
            if(params.hasOwnProperty("dim")){
                _this.is3d = params.dim == "2d" ? false : true;
            }else{
                _this.is3d = true;
            }
        }else{
            createMapDiv([window.innerWidth,window.innerHeight]);
            _fullScreen = true;
        }

        // create 2d or 3d map by webgl detection
        if (_this.is3d && Detector.webgl) {
            _indoorMap = new IndoorMap3d(_mapDiv);
        } else {
            _indoorMap = new IndoorMap2d(_mapDiv);
            _this.is3d = false;
        }

        //var marker = document.createElement("image");
        //marker.style.position = "absolute";
        //marker.style.src = System.imgPath+"/marker.png";
        //marker.visibility = false;
        //marker.style.width = "39px";
        //marker.style.height = "54px";
        //document.body.appendChild(marker);
        ////_indoorMap.setSelectionMarker(marker);

    }

    function createMapDiv(size){
        _mapDiv = document.createElement("div");
        _mapDiv.style.width = size[0] + "px";
        _mapDiv.style.height = size[1] + "px";
        _mapDiv.style.top = "0px";
        _mapDiv.style.left = "0px";
        _mapDiv.style.position = "absolute";
        _mapDiv.id = "indoor3d";
        document.body.appendChild(_mapDiv);
        document.body.style.margin = "0";
    }


    function updateUI() {
        if(_uiRoot == null){
            return;
        }
        var ulChildren = _uiRoot.children;
        if(ulChildren.length == 0){
            return;
        }
        if(_uiSelected != null){
            _uiSelected.className = "";
        }
        var curid = _this.mall.getCurFloorId();
        if( curid == 0){
            _uiSelected = _uiRoot.children[0];
        }else{
            for(var i = 0; i < ulChildren.length; i++){
                if(ulChildren[i].innerText == _this.mall.getCurFloorId().toString() ){
                    _uiSelected = ulChildren[i];
                }
            }
        }
        if(_uiSelected != null){
            _uiSelected.className = "selected";
        }
    }

    //function coordTranslater(){}

    init(params);
    return _indoorMap;
}

//get the UI
IndoorMap.getUI = function(indoorMap){
    var _indoorMap = indoorMap;
    if(_indoorMap == undefined || _indoorMap.mall == null){
        console.error("the data has not been loaded yet. please call this function in callback")
        return null;
    }
    //create the ul list
    _uiRoot = document.createElement('ul');
    _uiRoot.className = 'floorsUI';

    if(_indoorMap.is3d) {
        var li = document.createElement('li');
        var text = document.createTextNode('All');

        li.appendChild(text);
        _uiRoot.appendChild(li);
        li.onclick = function () {
            _indoorMap.showAllFloors();
        }
    }

    var floors = _indoorMap.mall.jsonData.data.Floors;
    for(var i = 0; i < floors.length; i++){
        (function(arg){
            li = document.createElement('li');
            text = document.createTextNode(floors[arg].Name);
            li.appendChild(text);
            li.onclick = function () {
                _indoorMap.showFloor(floors[arg]._id);
            }
            _uiRoot.appendChild(li);
        })(i);
    }
    return _uiRoot;
}