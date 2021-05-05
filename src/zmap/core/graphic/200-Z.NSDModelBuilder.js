/**
 * Created by Administrator on 2015/12/2.
 */
Z.NSDModelBuilder = (function(){
    return {
        colorSetting : {
            ////"Arch_Element_Floor": 0xFFF68F,
            //"Arch_Element_Wall": 0x556B2F,
            //"Arch_Element_RectStair": 0xEE9572,
            //"Arch_Element_HandRail": 0xFFE4C4,
            //"Arch_Element_LineStair": 0x6959CD,
            //"Arch_Element_Slab": 0x008B8B,
            //"Arch_Element_Column": 0xCDB5CD,
            //"Arch_Element_Opening": 0x8B0000
            "Arch_Element_Floor": 0x464547,//0x6D5826,
            "Arch_Element_Wall": 0xF2EADA,
            "Arch_Element_RectStair": 0x9D9087,
            "Arch_Element_HandRail": 0x999D9C,
            "Arch_Element_LineStair": 0x415555,//0x6959CD,
            "Arch_Element_Slab": 0x415555,//0x008B8B,
            "Arch_Element_Column": 0xD1C7B7,
            "Arch_Element_Opening": 0xD3C6A6,
            "Arch_Space_RoomSpace": 0xFFE4C4
        },

        opacitySetting : {
            "Arch_Element_Opening": 0.6
        },

        types: {
            "Arch_Element_Floor": "地板",
            "Arch_Element_Wall": "墙",
            "Arch_Element_RectStair": "双跑楼梯",
            "Arch_Element_HandRail": "扶手",
            "Arch_Element_LineStair": "直线梯段",
            "Arch_Element_Slab": "平台",
            "Arch_Element_Column": "柱",
            "Arch_Element_Opening": "开启物",
            "Arch_Space_RoomSpace": "房间"
        },

        symbolSetting: {
            select: {color: 0xff0000, opacity: 1},
            mouseover: {color: 0xffff00, opacity: 1}
        },

        titleProp: "图元名",

        parse : function(content, transformation){
            if(!content){
                return null;
            }

            var domObject = content;

            if(typeof content === "string"){
                domObject = this.text2dom(content);
            }

            var root = domObject.documentElement;
            var jsonObject = this.parseNode(root);
            jsonObject.entities = {};
            jsonObject.relations = [];

            var entities = domObject.getElementsByTagName("ArchEntity");

            for(var i = 0; i < entities.length; i++){//console.info("i=" + i);if(i === 38){debugger;}
                var curEntity = this.parseEntity(entities[i], transformation);
                jsonObject.entities[curEntity.ID] = curEntity;
            }

            var relations = domObject.getElementsByTagName("ArchRelation");

            for(var i = 0; i < relations.length; i++){
                jsonObject.relations.push(this.parseRelation(relations[i]));
            }

            //jsonObject.groups = this.buildObjectRelation(jsonObject.entities, jsonObject.relations);

            return jsonObject;
        },

        text2dom : function(text){
            var dom = null;

            if(document.all){
                dom = new ActiveXObject("Microsoft.XMLDOM");
                dom.async = "false";
                dom.loadXML(text);
            }else if(DOMParser){
                var parser = new DOMParser();
                dom = parser.parseFromString(text, "text/xml");
            }

            return dom;
        },

        getAttributeValue : function(node, name){
            for(var i = 0; i < node.attributes.length; i++){
                var nodeName = node.attributes[i].nodeName;

                if(nodeName == name){
                    var nodeValue = node.attributes[i].nodeValue;

                    return nodeValue;
                }
            }

            return "";
        },

        getNodeName : function(node){
            return node.nodeName;
        },

        parseNode : function(node){
            if(!node){
                return null;
            }

            var nodeType = node.nodeType;

            if(nodeType === 2 || nodeType === 3){
                return node.nodeValue;
            }else if(nodeType === 1){
                var nodeObject = {},
                    childNodes = node.childNodes,
                    attributeNodes = node.attributes;

                for(var i = 0; i < attributeNodes.length; i++){
                    if(!attributeNodes[i]){
                        continue;
                    }

                    var childNodeName = this.getNodeName(attributeNodes[i]);
                    var childNodeValue = attributeNodes[i].nodeValue;

                    this.createObjectProperty(nodeObject, childNodeName, childNodeValue);
                }

                for(i = 0; i < childNodes.length; i++){
                    if(!childNodes[i] || childNodes[i].nodeType !== 1){
                        continue;
                    }

                    childNodeName = this.getNodeName(childNodes[i]),
                        //childNodeValue = this.parseNode(childNodes[i]);
                        childNodeValue = childNodes[i].textContent;

                    if(childNodeName == "ArchEntitys" || childNodeName == "ArcRelations"){
                        continue;
                    }

                    if(childNodeName == "Version" ||
                        childNodeName == "Data" ||
                        childNodeName == "DataSource" ||
                        childNodeName == "TopSpace") {
                        this.createObjectProperty(nodeObject, childNodeName, childNodeValue);
                    }
                }

                return nodeObject;
            }else{
                return null;
            }
        },

        createObjectProperty : function(object, propName, propValue){
            if(propName){
                object[propName] = propValue;
            }
        },

        parseEntity : function(entityNode, transformation){
            if(!entityNode){
                return null;
            }

            var id = this.getAttributeValue(entityNode, "ID"),
                type = this.getAttributeValue(entityNode, "Type"),
                properties = {},
                mesh;

            if(entityNode.childNodes.length > 0){
                for(var childIndex = 0; childIndex < entityNode.childNodes.length; childIndex++){
                    var curNode = entityNode.childNodes[childIndex];

                    if(curNode.nodeType !== 1){
                        continue;
                    }

                    var curNodeName = this.getNodeName(curNode);
                    var geometryNodes = curNode.childNodes;

                    if(curNodeName === "ArchGeometries"){
                        for(var i = 0; i < geometryNodes.length; i++){
                            if(geometryNodes[i].nodeType !== 1){
                                continue;
                            }

                            var geoType = this.getAttributeValue(geometryNodes[i], "GeoType");

                            if(geoType === "stl3D"){
                                mesh = this.parseStl3DNode(geometryNodes[i], type);
                                mesh.feature.shape.transformation = transformation;
                            }
                        }
                    }else if(curNodeName === "ArchProperties"){
                        for(var i = 0; i < geometryNodes.length; i++){
                            if(geometryNodes[i].nodeType !== 1){
                                continue;
                            }

                            var nodeName = geometryNodes[i].nodeName;

                            if(nodeName !== "ArchProperty"){
                                continue;
                            }

                            //var propName = this.getAttributeValue(geometryNodes[i], "ArchProperty"),
                            //    propValue = geometryNodes[i].nodeValue;
                            var propName = this.getAttributeValue(geometryNodes[i], "Name"),
                                propValue = geometryNodes[i].textContent;

                            if(propName === "高度" || propName === "楼层高度"){
                                propName = "height";
                            }else if(propName === "向下联通"){
                                propName = "crossdown";
                            }else if(propName === "楼层位置"){
                                propName = "floorIndex";
                            }

                            properties[propName] = propValue;
                        }
                    }
                }
            }

            if(mesh){
                mesh.feature.props = properties;
            }

            return {
                ID: id,
                Type: type,
                Properties: properties,
                ArchGeometry2D: null,
                ArchGeometry3D: mesh
            }
        },

        parseStl3DNode : function(stl3DNode, elementType){
            var value = stl3DNode.textContent;

            if(value && value.length > 0){
                var lines = value.split( "\n"),
                    isHeader = true,
                    vertices = [],
                    faces = [],
                    normals = [],
                    phrase = -1;

                for(var i = 0; i < lines.length; i++){
                    var lineText = lines[i].toLowerCase().replace(/\s+/, " ");
                    lineText = lineText.replace(/(^\s*)|(\s*$)/g, "");

                    if(lineText.length === 0){
                        continue;
                    }

                    if(isHeader && lines[i] && lines[i].indexOf("end_header") >= 0){
                        isHeader = false;
                        continue;
                    }

                    if(isHeader){
                        continue;
                    }

                    if(lines[i].indexOf("---") >= 0){
                        continue;
                    }

                    var splits = lineText.split(" ");

                    if(splits.length === 3){
                        if(phrase === -1){
                            phrase = 0;
                        }else if(phrase === 1){
                            phrase = 2;
                        }

                        if(phrase === 0){
                            //vertices.push(new THREE.Vector3(parseFloat(splits[0]), parseFloat(splits[1]), parseFloat(splits[2])));
                            vertices.splice(vertices.length, 0, parseFloat(splits[0]), parseFloat(splits[1]), parseFloat(splits[2]));
                        }else if(phrase == 2){
                            ////normals.push(new THREE.Vector3(parseFloat(splits[0]), parseFloat(splits[1]), parseFloat(splits[2])));
                            //normals.splice(normals.length, 0, parseFloat(splits[0]), parseFloat(splits[1]), parseFloat(splits[2]));
                        }
                    }else if(splits.length === 4){
                        if(phrase === 0){
                            phrase = 1;
                        }

                        if(phrase === 1){
                            //faces.push(new THREE.Vector3(parseFloat(splits[1]), parseFloat(splits[2]), parseFloat(splits[3])));
                            faces.splice(faces.length, 0, parseFloat(splits[1]), parseFloat(splits[2]), parseFloat(splits[3]));
                        }
                    }
                }

                //var bufferGeometry = new THREE.BufferGeometry();
                ////bufferGeometry.name = geo.name;
                //bufferGeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array(vertices), 3 ) );
                //
                ////bufferGeometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array(normals), 3 ) );
                //
                //if ( faces.length > 65535 ) {
                //
                //    bufferGeometry.setIndex( new THREE.BufferAttribute( new Uint32Array( faces ), 1 ) );
                //
                //} else {
                //
                //    bufferGeometry.setIndex( new THREE.BufferAttribute( new Uint16Array( faces ), 1 ) );
                //
                //}
                //
                //bufferGeometry.verticesNeedUpdate = true;
                //bufferGeometry.computeBoundingSphere();
                //bufferGeometry.computeBoundingBox();
                var geometry = new Z.ModelGeometry(null, {
                    vertices: vertices,
                    faces: faces
                });

                var color = this.getElementColor(elementType);
                var opacity = this.getElementOpacity(elementType);
                //var geometry = new THREE.Geometry().fromBufferGeometry( bufferGeometry );
                //geometry.computeFaceNormals();
                ////var material = new THREE.MeshLambertMaterial( { color: 0x3300ff } );
                //var material = new THREE.MeshLambertMaterial( { color: color, transparent: true, opacity: opacity} );

                //if(elementType === "Arch_Element_Wall"){
                //    material.polygonOffset = true;
                //    material.polygonOffsetFactor = 1;
                //    material.polygonOffsetUnits = 1;
                //}else if(elementType === "Arch_Element_Floor"){
                //    material.polygonOffset = true;
                //    material.polygonOffsetFactor = -1;
                //    material.polygonOffsetUnits = -1;
                //}
                //
                ////var material = new THREE.MeshBasicMaterial( { color: color } );
                ////var material = new THREE.MeshPhongMaterial( { color: 0xaaaa00 } );
                //material.side = THREE.DoubleSide;
                var symbol = new Z.SimpleFillSymbol({color: color, opacity: opacity}),
                    selectSymbol = new Z.SimpleFillSymbol(this.symbolSetting.select),
                    mouseoverSymbol = new Z.SimpleFillSymbol(this.symbolSetting.mouseover);

                //return new THREE.Mesh( geometry, material );
                return new Z.Graphic(new Z.Feature({}, geometry), symbol, {
                    selectSymbol: selectSymbol,
                    mouseoverSymbol: mouseoverSymbol,
                    title: "#{" + this.titleProp + "}"
                });
            }else{
                return null;
            }
        },

        getElementColor : function(elementType){
            return this.colorSetting[elementType] || 0xaaaa00;
        },

        getElementOpacity : function(elementType){
            return this.opacitySetting[elementType] || 1;
        },

        parseRelation : function(relationNode){
            var id = this.getAttributeValue(relationNode, "ID"),
                type = this.getAttributeValue(relationNode, "Type"),
                first = this.getAttributeValue(relationNode, "EntityFirst"),
                second = this.getAttributeValue(relationNode, "EntitySecond");

            return {
                ID: id,
                Type: type,
                EntityFirst: first,
                EntitySecond: second
            }
        },

        buildObjectRelation : function(entities, relations){
            var allObjects = {},
                rootObjects = {};

            for(var i = 0; i < relations.length; i++){
                var first = relations[i].EntityFirst,
                    second = relations[i].EntitySecond,
                    type = relations[i].Type;

                if(type === "Arch_Relation_Aggregation"){
                    if(!allObjects[first]){
                        allObjects[first] = {
                            entity:entities[first],
                            parent: null,
                            children: []
                        };
                    }

                    if(!allObjects[second]){
                        allObjects[second] = {
                            entity:entities[second],
                            parent: null,
                            children: []
                        };
                    }

                    allObjects[second].children.push(allObjects[first]);

                    if(rootObjects[first]){
                        delete rootObjects[first];
                    }

                    if(!rootObjects[second]){
                        rootObjects[second] = allObjects[second];
                    }
                }
            }

            var roots = [];

            for(var key in rootObjects){
                roots.push(rootObjects[key]);
            }

            return roots;
        },

        findFloors : function(entities){
            var floors = {},
                storeyIndexes = {};;

            for(var key in entities){
                var entity = entities[key];

                if(entity.Type === "Arch_Space_FloorSpace"){
                    var floorIndex = entity.Properties["floorIndex"],
                        storeyIndex = entity.Properties["StoreyIndex"];

                    //var floorElements = this.findFloorElements(entities, storeyIndex);

                    floors[floorIndex] = {
                        entity: entity,
                        elements: []
                    }

                    storeyIndexes[storeyIndex] = floorIndex;
                }
            }

            for(key in entities){
                entity = entities[key];

                if(entity.Type === "Arch_Space_FloorSpace"){
                    continue;
                }

                storeyIndex = entity.Properties["StoreyIndex"];

                if(!storeyIndex){
                    continue;
                }

                floorIndex = storeyIndexes[storeyIndex];

                if(!floorIndex || !floors[floorIndex]){
                    continue;
                }

                floors[floorIndex].elements.push(entity);
            }

            return floors;
        }
    }
})();
