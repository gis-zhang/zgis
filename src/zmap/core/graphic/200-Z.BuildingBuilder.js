/**
 * Created by Administrator on 2015/12/2.
 */
Z.BuildingBuilder = (function(){
    return {
        buildBuilding: function(buildingData, buildingOptions){
            var buildings = this._buildGraphics(null, buildingData, buildingOptions, function(feature, symbol, graphicOptions){
                return new Z.Building(feature, symbol, graphicOptions);
            });

            return buildings;
        },

        buildFloor: function(buildingGraphic, floorData, floorOptions){
            if(floorOptions.floorIndex){
                floorOptions.id = floorOptions.floorIndex;
            }

            var floors = this._buildGraphics(buildingGraphic, floorData, floorOptions, function(feature, symbol, graphicOptions){
                var newFloor = new Z.Floor(feature, symbol, graphicOptions);

                return newFloor;
            });

            floors.sort(function(a, b){
                var aIndex = parseInt(a._id),
                    bIndex = parseInt(b._id);

                return aIndex - bIndex;
            });

            //创建地上部分的楼层
            var totalHeight = 0,
                groundFloorIndex = undefined;

            for(var i = 0; i < floors.length; i++){
                var curIndex = parseInt(floors[i].feature.props[floorOptions.id]);

                if(curIndex < 0){
                    continue;
                }else if(groundFloorIndex === undefined){
                    groundFloorIndex = i;
                }

                var cueHeight = parseFloat(this._getHeight(floors[i].feature.props, floorOptions.height));

                //floors[i].feature.shape.baseHeight = buildingGraphic.feature.shape.baseHeight + totalHeight;
                //floors[i].feature.shape.baseHeight = totalHeight;
                floors[i].baseHeight = totalHeight;
                totalHeight += cueHeight;
            }

            //创建地下部分的楼层
            totalHeight = 0;

            for(var i = groundFloorIndex - 1; i >= 0; i--){
                cueHeight = parseFloat(this._getHeight(floors[i].feature.props, floorOptions.height));

                totalHeight -= cueHeight;
                //floors[i].feature.shape.baseHeight = buildingGraphic.feature.shape.baseHeight + totalHeight;
                //floors[i].feature.shape.baseHeight = totalHeight;
                floors[i].baseHeight = totalHeight;
            }

            return floors;
        },

        buildCell: function(floorGraphic, cellData, cellOptions){
            return this._buildGraphics(floorGraphic, cellData, cellOptions, function(feature, symbol, graphicOptions){
                //feature.shape.baseHeight = floorGraphic.feature.shape.baseHeight;

                var cell = new Z.Cell(feature, symbol, graphicOptions);
                //cell.setBaseHeight(floorGraphic.feature.shape.baseHeight);
                return cell;
            });
        },

        _buildGraphics: function(parent, buildingData, buildingOptions, concreteFunc){
            if(!buildingData || !buildingOptions || !concreteFunc){
                return null;
            }

            buildingData = (buildingData instanceof Array) ? buildingData : [buildingData];
            var graphics = [];

            for(var i = 0; i < buildingData.length; i++){
                var props = this._getProps(buildingData[i], buildingOptions);
                var graphic = this._buildOneGraphic(parent, props, buildingOptions, concreteFunc);

                if(graphic){
                    graphic.partsLoader = this._buildingLoader(buildingData[i], buildingOptions);
                    graphics.push(graphic);
                }
            }

            return graphics;
        },

        _getProps: function(data, options){
            if(options.props){
                return this._getOptionsValue(data, options.props);
            }else{
                return data;
            }
        },

        _buildOneGraphic: function(parent, buildingData, buildingOptions, concreteFunc){
            if(!buildingData || !buildingOptions || !concreteFunc){
                return null;
            }

            var coords = this._getShape(buildingData, buildingOptions.shape),
                height = this._getHeight(buildingData, buildingOptions.height),
                baseHeight = this._getHeight(buildingData, buildingOptions.baseHeight),
                graphicOptions = this._getGraphicOptions(buildingData, buildingOptions);

            if(!coords && parent){
                coords = parent.feature.shape.paths;
            }

            if(!coords){
                return null;
            }

            var geometry = new Z.Extrude(null, coords, height, baseHeight, graphicOptions),
                feature = new Z.Feature(buildingData, geometry, graphicOptions),
                symbol = this._getSymbol(buildingData, buildingOptions),
                graphic;

            graphic = concreteFunc(feature, symbol, graphicOptions);

            if(graphic && !(graphic instanceof Z.AbstractBuilding)){
                throw error("_getGraphicObjet(feature, symbol, graphicOptions)方法的返回结果应继承自Z.AbstractBuilding类");
            }

            graphic._id = this._getOptionsValue(buildingData, buildingOptions.id) || ((new Date()).getMilliseconds() + "" + Math.random() * 1000000);
            graphic.id = graphic._id;
            graphic.name = graphicOptions.titleText || graphic.id || graphic.name;
            graphic.desc = this._getOptionsValue(buildingData, buildingOptions.desc) || graphic.desc;

            //graphics.push(graphic);

            return graphic;
        },

        _getShape: function(object, spatialItem){
            var coords = this._getOptionsValue(object, spatialItem),//object[spatialProp],
                parseResult = Z.WktParser.wkt2Array(coords),
                shapes = [];

            if(!parseResult){
                return null;
            }

            if(parseResult.type === "MultiPolygon"){
                shapes = parseResult.coords;
            }else if(parseResult.type === "Polygon"){
                shapes = [parseResult.coords];
            }

            return shapes;
        },

        _getHeight: function(object, heightItem){
            var height = 0;
            heightItem = heightItem || "";
            height = this._getOptionsValue(object, heightItem);

            if(typeof height === "number"){
                return height;
            }else if(typeof height === "string"){
                return parseFloat(height);
            }else{
                return 0;
            }
        },

        _getGraphicOptions: function(buildingData, buildingOptions){
            var ops = {};

            if(buildingData && buildingOptions){
                var title = this._getOptionsValue(buildingData, buildingOptions.title),
                    tip = this._getOptionsValue(buildingData, buildingOptions.desc),
                    titleSymbol = this._getOptionsValue(buildingData, buildingOptions.titleSymbol),
                    iconSymbol = this._getOptionsValue(buildingData, buildingOptions.iconSymbol);

                ops = {
                    title: title ? (title + "") : "",
                    tip: tip ? (tip + "") : "",
                    titleSymbol: titleSymbol,
                    iconSymbol: iconSymbol
                };

                ops.enableTitle = title ? true : false;

                if(buildingOptions.iconSymbol){
                    //ops.iconSymbol = new Z.PictureMarkerSymbol({
                    //    anchor:'bottomCenter',
                    //    url: this._getOptionsValue(buildingData, buildingOptions.icon)
                    //});

                    ops.iconSymbol = buildingOptions.iconSymbol;
                    ops.enableIcon = true;
                }
            }

            var options = Z.Util.applyOptions({}, buildingOptions, true);
            return Z.Util.applyOptions(options, ops, true);
        },

        _getOptionsValue: function(object, opsItem){
            return Z.Util.getConfigValue(object, opsItem);
        },

        _getSymbol: function(buildingData, buildingOptions){
            var symbol = buildingOptions.symbol || new Z.ExtrudeSymbol();

            symbol.topColor = this._getOptionsValue(buildingData, buildingOptions.topColor) || symbol.topColor;
            symbol.wallColor = this._getOptionsValue(buildingData, buildingOptions.wallColor) || symbol.wallColor;
            symbol.opacity = this._getOptionsValue(buildingData, buildingOptions.opacity) || symbol.opacity;
            symbol.wire = this._getOptionsValue(buildingData, buildingOptions.wire) || false;

            return symbol;
        },

        _buildingLoader: function(data, options){
            var loader = null,
                data = data || {},
                options = options || {};

            if(options.partsLoader){
                loader = options.partsLoader;
            }else{
                loader = new Z.JsonBuildingLoader(this._getOptionsValue(data, options.partsData));
            }

            return loader;
        }
    }
})();
