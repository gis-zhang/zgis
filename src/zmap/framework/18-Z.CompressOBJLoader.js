//var COMPRESS = {};
Z.CompressOBJLoader = function (encode,zip) {
    this.encoded = encode;
    this.zip = zip;
    this.vertices = [];
    this.normals = [];
    this.textures = [];
    this.material = {};
    this.meshes = [];
    this.state = {};
};

Z.CompressOBJLoader.prototype = {
    decodeForInt:function(str){
        var scope = this;
        if(!scope.encoded){
            return parseInt(str);
        }
        return parseInt(str,36);
    },
    decodeForFloatTail:function(str){
        var scope = this;
        var p = parseInt(str, 36) + '';
        var newp = '';
        if (p.length < 4) {
            for (var i = 0; i < 4 - p.length; ++i) {
                newp += '0';
            }
            newp += p;
        }else{
            newp = p;
        }
        return newp;

    },

    decodeForDecimal:function(str){
        var scope = this;
        if(!scope.encoded){
            return parseFloat(str);
        }
        var scope = this;
        var news = str;
        var after = '';
        if(news[0] == '-'){
            after += '-';
            news = str.substring(1);
        }

        var dots = news.split('.');
        after += scope.decodeForInt(dots[0]);
        after +='.';
        //after += dots[1];
        after += scope.decodeForFloatTail(dots[1]);
        return parseFloat(after);
    },
    decode:function(str){
        var scope = this;
        if(str[0] == '+'){
            return parseFloat(str.substring(1));
        }
        if(str.indexOf('.') >= 0){
            return scope.decodeForDecimal(str);
        }else{
            return scope.decodeForInt(str);
        }
    },
    adapt2Three: function () {
        var scope = this;
        var meshes = scope.meshes;
        var state = {};
        scope.state = state;
        state.objects = [];
        for(var meshIndex = 0 ; meshIndex < meshes.length ; ++meshIndex){
            var mesh = meshes[meshIndex];
            var object = {};
            object.name = mesh.name;
            object.geometry = {};
            object.materials =[];
            //object.geometry.vertices=[];
            object.geometry.position=[];
            object.geometry.normal=[];
            object.geometry.uv=[];
            object.geometry.groups=[];
            state.objects.push(object);
            var lastIndex = 0;
            for(var gIndex = 0 ; gIndex < mesh.groups.length ; ++gIndex){
                var curGroup = mesh.groups[gIndex];
                //var material = {
                //    name:curGroup.material,
                //    index: gIndex,
                //    mtllib: '',
                //    smooth: false,
                //    groupStart: lastIndex,
                //    groupEnd: lastIndex + curGroup.face.length * 3,
                //    groupCount: curGroup.face.length * 3,
                //    inherited: false
                //};
                var material = {
                    name:curGroup.material,
                    matInfo: scope.material[curGroup.material]
                };
                object.materials.push(material);
                object.geometry.groups.push({
                    count: curGroup.face.length * 3,
                    materialIndex: object.materials.length - 1,
                    start: lastIndex
                });
                lastIndex += curGroup.face.length * 3;
                for(var findex = 0 ; findex < curGroup.face.length;++findex){
                    var curFace = curGroup.face[findex];
                    for(var vi = 0; vi < curFace.v.length ; ++vi){
                        var vx = curFace.v[vi];
                        //object.geometry.vertices.push(scope.vertices[vx].x);
                        //object.geometry.vertices.push(scope.vertices[vx].y);
                        //object.geometry.vertices.push(scope.vertices[vx].z);
                        object.geometry.position.push(scope.vertices[vx].x);
                        object.geometry.position.push(scope.vertices[vx].y);
                        object.geometry.position.push(scope.vertices[vx].z);
                    }

                    if(scope.normals.length > 0){
                        for(var ni = 0; ni < curFace.n.length ; ++ni){
                            var nx = curFace.n[ni];
                            object.geometry.normal.push(scope.normals[nx].x);
                            object.geometry.normal.push(scope.normals[nx].y);
                            object.geometry.normal.push(scope.normals[nx].z);
                        }
                    }

                    for(var ti = 0; ti < curFace.t.length ; ++ti){
                        var tx = curFace.t[ti];
                        object.geometry.uv.push(scope.textures[tx].u);
                        object.geometry.uv.push(scope.textures[tx].v);
                    }

                }
            }

        }

        //var material = scope.material;
        //
        //for(var mi in material){
        //    var curMaterial = material[mi];
        //    for(var key in curMaterial){
        //        if ( key != 'ka' && key != 'kd' && key != 'ks' ) {
        //            if(curMaterial[key] instanceof Array ){
        //                curMaterial[key] = curMaterial[key].join(' ');
        //            }
        //        }
        //    }
        //}

    },
    paseVertex: function (text, start, num) {
        var scope = this;
        for(var vi = start ; vi < start + num ; ++vi){
            var line = text[vi];
            var tree = line.split(';');
            var z = scope.decode(tree[0]);
            var ys = [];
            for(var yi = 1 ; yi < tree.length ; ++yi){
                var y0 = tree[yi];
                var yxx = y0.split(' ');
                var y = scope.decode(yxx[0]);
                for(var xi = 1 ; xi < yxx.length ; ++xi){
                    var x = scope.decode(yxx[xi]);
                    var xyz = {
                        x: x,
                        y:y,
                        z:z
                    };
                    scope.vertices.push(xyz);
                }

            }
        }
        return start + num;
    },
    paseNormal: function (text, start, num) {
        var scope = this;
        for(var vi = start ; vi < start + num ; ++vi){
            var line = text[vi];
            var tree = line.split(';');
            var z = scope.decode(tree[0]);
            var ys = [];
            for(var yi = 1 ; yi < tree.length ; ++yi){
                var y0 = tree[yi];
                var yxx = y0.split(' ');
                var y = scope.decode(yxx[0]);
                for(var xi = 1 ; xi < yxx.length ; ++xi){
                    var x = scope.decode(yxx[xi]);
                    var xyz = {
                        x: x,
                        y:y,
                        z:z
                    };
                    scope.normals.push(xyz);
                }

            }
        }
        return start + num;

    },
    paseTexture: function (text, start, num) {
        var scope = this;
        for(var vi = start ; vi < start + num ; ++vi){
            var line = text[vi];
            var tree = line.split(';');
            var z = scope.decode(tree[0]);
            //var z =parseFloat(tree[0]);
            var ys = [];
            for(var yi = 1 ; yi < tree.length ; ++yi){
                var y0 = tree[yi];
                var yxx = y0.split(' ');
                var y = scope.decode(yxx[0]);
                //var y = parseFloat(yxx[0]);
                for(var xi = 1 ; xi < yxx.length ; ++xi){
                    //var x = parseFloat(yxx[xi]);
                    var x = scope.decode(yxx[xi]);
                    var xyz = {
                        u: x,
                        v: y,
                        w: z
                    };
                    scope.textures.push(xyz);
                }

            }
        }
        return start + num;
    },
    paseGroup: function (text, start,name, num) {
        var scope = this;
        var endIndex=0;
        var mesh = {};
        scope.meshes.push(mesh);
        mesh.name = name;
        var curGroups = mesh.groups=[];
        for(var gi = 0 ; gi < num ; ++gi){
            var line = text[start];
            var header = line.split(' ');
            if(header[0] == 'UM'){
                var facesNum = scope.decode(header[2]);
                var umIndex = scope.decode(header[1]);
                var faceBase = header[3].split('/');
                var baseV = scope.decode(faceBase[0]);
                var baseT =  scope.decode(faceBase[2]);
                var baseN =  scope.decode(faceBase[1]);
                var g ={};
                curGroups.push(g);
                g.material = umIndex;
                g.face =[];
                ++start;
                endIndex = start + facesNum;
                for(var mi = start ; mi < endIndex ; ++mi){
                    var face = text[mi];
                    if(typeof(face) == 'undefined'){
                        console.log('');
                    }
                    var faceUnit = face.split(' ');

                    if (faceUnit.length == 3) {
                        var f = {};
                        f.v = [];
                        f.n = [];
                        f.t = [];
                        for (var vi = 0; vi < faceUnit.length; ++vi) {
                            var v = faceUnit[vi];
                            var vd = v.split('/');
                            var vv =  scope.decode(vd[0]) + baseV;
                            var vn =  scope.decode(vd[1]) + baseN;
                            var vt =  scope.decode(vd[2]) + baseT;
                            f.v.push(vv);
                            f.n.push(vn);
                            f.t.push(vt);
                        }
                        g.face.push(f);

                    } else if (faceUnit.length == 4) {
                        var tmp_v = [] , tmp_n = [] , tmp_t =[];
                        for (var vi = 0; vi < faceUnit.length; ++vi) {
                            var v = faceUnit[vi];
                            var vd = v.split('/');
                            var vv =  scope.decode(vd[0]) + baseV;
                            var vn =  scope.decode(vd[1]) + baseN;
                            var vt =  scope.decode(vd[2]) + baseT;
                            tmp_v.push(vv);
                            tmp_n.push(vn);
                            tmp_t.push(vt);
                        }
                        var f0 = {};
                        f0.v = [];
                        f0.n = [];
                        f0.t = [];
                        f0.v.push(tmp_v[0]);
                        f0.v.push(tmp_v[1]);
                        f0.v.push(tmp_v[3]);

                        f0.n.push(tmp_n[0]);
                        f0.n.push(tmp_n[1]);
                        f0.n.push(tmp_n[3]);

                        f0.t.push(tmp_t[0]);
                        f0.t.push(tmp_t[1]);
                        f0.t.push(tmp_t[3]);

                        g.face.push(f0);
                        var f1 = {};
                        f1.v = [];
                        f1.n = [];
                        f1.t = [];

                        f1.v.push(tmp_v[1]);
                        f1.v.push(tmp_v[2]);
                        f1.v.push(tmp_v[3]);

                        f1.n.push(tmp_n[1]);
                        f1.n.push(tmp_n[2]);
                        f1.n.push(tmp_n[3]);

                        f1.t.push(tmp_t[1]);
                        f1.t.push(tmp_t[2]);
                        f1.t.push(tmp_t[3]);

                        g.face.push(f1);

                    } else {

                    }
                }
                start = endIndex;
            }
        }
        return endIndex - 1;
    },
    //vertices: [],
    //normals: [],
    //textures: [],
    //material: {},
    //meshes:[],
    //state:{},
    paseMtl: function (text, start, dictNum, mtlNum) {
        var scope = this;
        var dict_unit_size = [];
        var dict_unit_key = [];
        var dict_unit_vals = {};
        var materialsInfo = {};

        var dictEndIndex = start + dictNum;
        var mtlEndIndex = start + dictNum + mtlNum;
        for (var hIndex = start; hIndex < dictEndIndex; ++hIndex) {
            var mh = text[hIndex];
            var mhs = mh.split(',');
            var kk = mhs[0].toLowerCase();
            dict_unit_key.push(kk);

            dict_unit_size.push(parseInt(mhs[1]));
            for (var inIndex = 2; inIndex < mhs.length; ++inIndex) {
                if (!dict_unit_vals.hasOwnProperty(kk)) {
                    dict_unit_vals[kk] = [];
                }
                dict_unit_vals[kk].push(mhs[inIndex]);
            }
        }

        for (var lIndex = start + dictNum; lIndex < mtlEndIndex; ++lIndex) {
            var m = text[lIndex];
            var ms = m.split(' ');
            var materialIndex = lIndex - start - dictNum;
            var info = { name: materialIndex + '' };
            for (var ai = 0; ai < ms.length; ++ai) {
                if (ms[ai] == '#') continue;
                var curIndex = parseInt(ms[ai]);
                var unitSize = dict_unit_size[ai];
                if (unitSize > 1) {
                    info[dict_unit_key[ai]] = [];
                    for (var keyIndex = 0; keyIndex < unitSize; ++keyIndex) {
                        var tmpIndex = curIndex * unitSize + keyIndex;
                        var tmpVal = dict_unit_vals[dict_unit_key[ai]][tmpIndex];
                        info[dict_unit_key[ai]].push(tmpVal);
                    }
                } else {
                    info[dict_unit_key[ai]] = dict_unit_vals[dict_unit_key[ai]][curIndex];
                }

            }
            materialsInfo[materialIndex] = info;
        }
        scope.material = materialsInfo;
        return mtlEndIndex;

    },
    parse: function (text) {
        var scope = this;
        var MTL_TAG = 'MTL',
            VERTEX_DATA = 'VD',
            VERTEX = 'V',
            NORMAL = 'N',
            TEXTURE = 'T',
            VERTEX_FACE = 'VF';

        var model = {};
        if (text.indexOf('\r\n') !== - 1) {

            // This is faster than String.split with regex that splits on both
            text = text.replace(/\r\n/g, '\n');

        }

        var lines = text.split('\n');
        var line = '', lineFirstChar = '', lineSecondChar = '';
        var lineLength = 0;
        var result = [];

        // Faster to just trim left side of the line. Use if available.
        var trimLeft = (typeof ''.trimLeft === 'function');

        var startIndex = 0;

        line = lines[startIndex];
        var header = line.split(' ');
        if (header[0] == MTL_TAG) {
            startIndex = scope.paseMtl(lines, startIndex + 1, parseInt(header[1]), parseInt(header[2]));
        }
        line = lines[startIndex];
        if (line == 'VD') {
            startIndex = startIndex + 1;
            line = lines[startIndex];
            header = line.split(' ');
            if (header[0] == 'V') {
                startIndex = scope.paseVertex(lines, startIndex + 1, parseInt(header[1]));
            }

            line = lines[startIndex];
            header = line.split(' ');
            if (header[0] == 'N') {
                startIndex = scope.paseNormal(lines, startIndex + 1, parseInt(header[1]));
            }

            line = lines[startIndex];
            header = line.split(' ');
            if (header[0] == 'T') {
                startIndex = scope.paseTexture(lines, startIndex + 1, parseInt(header[1]));
            }

        }
        line = lines[startIndex];
        header = line.split(' ');
        if(header[0] == 'VF'){
            var meshNum = scope.decode(header[1]);
            for(var mi = 0 ; mi < meshNum ; ++mi){
                startIndex += 1;
                line = lines[startIndex];
                header = line.split(' ');
                if(header[0] == 'G'){
                    startIndex = scope.paseGroup(lines, startIndex + 1, header[1],scope.decode(header[2]));
                }
            }
        }


    },

    noCompressLoad: function (url, onLoad, onProgress, onError) {
        var start = new Date().getTime();
        if (url === undefined) url = '';

        if (this.path !== undefined) url = this.path + url;

        var scope = this;
        var request = new XMLHttpRequest();
        request.open('GET', url, true);

        request.addEventListener('load', function (event) {

            var response = event.target.response;

            if (this.status === 200) {
                scope.parse(response);
                var after = scope.adapt2Three();
                if (onLoad) onLoad(scope);
                var end = new Date().getTime();
                console.log("during:" + (end - start));

            } else if (this.status === 0) {

                // Some browsers return HTTP Status 0 when using non-http protocol
                // e.g. 'file://' or 'data://'. Handle as success.

                console.warn('BaseLoader: HTTP Status 0 received.');

                if (onLoad) onLoad(response);

            } else {

                if (onError) onError(event);

            }

        }, false);

        if (onProgress !== undefined) {

            request.addEventListener('progress', function (event) {

                onProgress(event);

            }, false);

        }

        request.addEventListener('error', function (event) {

            if (onError) onError(event);

        }, false);

        if (this.responseType !== undefined) request.responseType = this.responseType;
        if (this.withCredentials !== undefined) request.withCredentials = this.withCredentials;

        if (request.overrideMimeType) request.overrideMimeType(this.mimeType !== undefined ? this.mimeType : 'text/plain');

        for (var header in this.requestHeader) {

            request.setRequestHeader(header, this.requestHeader[header]);

        }

        request.send(null);

        return request;

    },
    load: function (url,onLoad, onProgress, onError,zipdoc) {
        var scope = this;
        if(!this.zip){
            scope.noCompressLoad(url, onLoad, onProgress, onError);
            return;
        }
        var start = new Date().getTime();
        JSZipUtils.getBinaryContent(url, function (err, data) {
            if (err) {
                throw err; // or handle err
            }
            var decompressStart = new Date().getTime();
            JSZip.loadAsync(data).then(function (zip) {
                var zipObj = null;

                if(zipdoc){
                    zipObj = zip.file(zipdoc);
                }else{
                    for(var key in zip.files){
                        if(zip.files[key]){
                            zipObj = zip.files[key];
                            break;
                        }
                    }
                }

                if(!zipObj){
                    var decompressEnd = new Date().getTime();
                    console.log("decompress:"+(decompressEnd - decompressStart));
                    if (onLoad) onLoad(scope);
                    var end = new Date().getTime();
                    console.log("during:"+(end-start));
                }else{
                    zipObj.async("string").then(function (data) {
                        scope.parse(data);
                        var after = scope.adapt2Three();
                        var decompressEnd = new Date().getTime();
                        console.log("decompress:"+(decompressEnd - decompressStart));
                        if (onLoad) onLoad(scope);
                        var end = new Date().getTime();
                        console.log("during:"+(end-start));
                    });
                }
            });
        });
    }
};