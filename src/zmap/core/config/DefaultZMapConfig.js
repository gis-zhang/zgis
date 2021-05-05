/**
 * Created by Administrator on 2015/10/24.
 */
var DefaultZMapConfig = {
    center:{x:100, y:30},  //地图中心点坐标
    bounds:{minx:80, miny: 20, maxx:130, maxy:50},      //地图初始显示范围
    //maxBounds:{minx:80, miny: 20, maxx:130, maxy:50},      //地图最大可显示范围
    maxBounds:{minx:-180, miny: -90, maxx:180, maxy:90},      //地图最大可显示范围
    //crs:'EPSG3857',              //地图坐标系
    crs:'EPSG4326',              //地图坐标系
    //projection: 'LatLng',
    initZoom:6,            //初始显示级别
    minZoom:1,             //最小可显示级别
    maxZoom:18,            //最大可显示级别
    selectionMutex: true,
    showFrameRate: false,
    //pyramidId: "TDT",
    pyramidId: "TDT_UNLIMIT",
    pyramidDefine:null,
    //pyramidDefine: {
    //    type: "FixedMultiple",
    //    crsId: "EPSG3857",
    //    params: {}
    //},
    sceneType:'2D',            //场景类型：'2d'、'3d'、'mixed'
    sceneConfig:{            //场景配置
        miniMap:false,                          //是否显示鹰眼
        miniMapLayer:[{type:'TDTVector',url:'',params:{},minZoom:1,maxZoom:18,label:'天地图矢量底图',bounds:{}}],            //鹰眼中显示的地图图层
        baseLayer:[],            //基础底图
        baseOverLayer:[],            //基础叠加图层（显示到基础地图上）
        zoomSlider:'small',            //级别工具条：'small'、'slider'、'false'
        scaleControl:false            //b是否显示比例尺
    }
};