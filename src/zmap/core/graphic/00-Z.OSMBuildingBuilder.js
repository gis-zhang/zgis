/**
 * Created by Administrator on 2015/12/2.
 */
Z.OSMBuildingBuilder = (function(){
    function getSymbol(props){
        var symbol = new Z.ExtrudeSymbol();

        symbol.topColor = props.roofColor || props.color || getOSMMaterialColor(props.material) || symbol.topColor;
        symbol.wallColor = props.wallColor || props.color || getOSMMaterialColor(props.material) || symbol.wallColor;
        //symbol.opacity = this._getOptionsValue(buildingData, buildingOptions.opacity) || symbol.opacity;
        //symbol.wire = false;

        return symbol;
    }

    function getOSMMaterialColor(materialKey){
        if(!materialKey){
            return null;
        }

        if (typeof materialKey !== 'string') {
            return null;
        }

        materialKey = materialKey.toLowerCase();
        if (materialKey[0] === '#') {
            return materialKey;
        }
        return OSMConfig.MATERIAL_COLORS[OSMConfig.BASE_MATERIALS[materialKey] || materialKey] || null;
    }

    function guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

    return {
        buildGraphic: function(buildingData, buildingOptions){
            if(!buildingData){
                return null;
            }

            if(!buildingData.geometry){
                return null;
            }

            var geoType = buildingData.geometry.type;

            if(geoType !== "Polygon" && geoType !== "MultiPolygon"){
                return null;
            }

            var props = buildingData.properties,
                geoData = buildingData.geometry.coordinates,
                height = props.height || (props.levels ? props.levels * Z.Globe.Building.METERS_PER_LEVEL : Z.Globe.Building.DEFAULT_HEIGHT),
                baseHeight = props.minHeight || (props.minLevel ? props.minLevel* Z.Globe.Building.METERS_PER_LEVEL : 0);
            //roofHeight = props.roofHeight || Z.Globe.Building.DEFAULT_ROOF_HEIGHT;

            if(!Array.isArray(geoData)){
                return null;
            }

            //var id = buildingData.id || props.id;
            var id = guid();

            var geometry = new Z.Extrude(null, geoData, height, baseHeight, {lngStart: true, ignoreCw: true}),
                feature = new Z.Feature(props, geometry),
                symbol = getSymbol(props),
                graphic;

            //graphic = concreteFunc(feature, symbol, graphicOptions);
            graphic = new Z.Graphic(feature, symbol);
            graphic.id = id;

            return graphic;
        }
    }
})();
