/**
 * Created by Administrator on 2015/12/2.
 */
var ExtrudeGraphicBuilder = (function(){
    function getOptionsValue(object, opsItem){
        return Z.Util.getConfigValue(object, opsItem);
    }

    function getShape(object, spatialItem){
        var coords = getOptionsValue(object, spatialItem),//object[spatialProp],
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
    }

    function getHeight(object, heightItem){
        var height = 0;
        heightItem = heightItem || "";
        height = getOptionsValue(object, heightItem);

        if(typeof height === "number"){
            return height;
        }else if(typeof height === "string"){
            return parseFloat(height);
        }else{
            return 0;
        }
    }

    function getGraphicOptions(buildingData, buildingOptions){
        var ops = {};

        if(buildingData && buildingOptions){
            var title = getOptionsValue(buildingData, buildingOptions.title),
                tip = getOptionsValue(buildingData, buildingOptions.desc),
                titleSymbol = getOptionsValue(buildingData, buildingOptions.titleSymbol),
                iconSymbol = getOptionsValue(buildingData, buildingOptions.iconSymbol);

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
    }

    function getSymbol(buildingData, buildingOptions){
        var symbol = buildingOptions.symbol || new Z.ExtrudeSymbol();

        symbol.topColor = getOptionsValue(buildingData, buildingOptions.topColor) || symbol.topColor;
        symbol.wallColor = getOptionsValue(buildingData, buildingOptions.wallColor) || symbol.wallColor;
        symbol.opacity = getOptionsValue(buildingData, buildingOptions.opacity) || symbol.opacity;
        symbol.wire = getOptionsValue(buildingData, buildingOptions.wire) || false;

        return symbol;
    }

    return {
        buildGraphic: function(buildingData, buildingOptions){
            if(!buildingData || !buildingOptions){
                return null;
            }

            var coords = getShape(buildingData, buildingOptions.shape),
                height = getHeight(buildingData, buildingOptions.height),
                baseHeight = getHeight(buildingData, buildingOptions.baseHeight),
                graphicOptions = getGraphicOptions(buildingData, buildingOptions);

            if(!coords){
                return null;
            }

            var geometry = new Z.Extrude(null, coords, height, baseHeight, graphicOptions),
                feature = new Z.Feature(buildingData, geometry, graphicOptions),
                symbol = getSymbol(buildingData, buildingOptions),
                graphic;

            graphic = new Z.Graphic(feature, symbol, graphicOptions);

            graphic._id = getOptionsValue(buildingData, buildingOptions.id) || ((new Date()).getMilliseconds() + "" + Math.random() * 1000000);
            graphic.id = graphic._id;
            graphic.name = graphicOptions.titleText || graphic.id || graphic.name;
            graphic.desc = getOptionsValue(buildingData, buildingOptions.desc) || graphic.desc;

            //graphics.push(graphic);

            return graphic;
        }
    }
})();
