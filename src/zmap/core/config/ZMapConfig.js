/**
 * Created by Administrator on 2015/10/24.
 */
var ZMapConfig = {
    center:{x:100, y:30},  //地图中心点坐标
    bounds:{minx:80, miny: 20, maxx:130, maxy:50},      //地图初始显示范围
    maxBounds:{minx:80, miny: 20, maxx:130, maxy:50},      //地图最大可显示范围
    //crs:'EPSG4326',              //地图坐标系
    crs:'EPSG4326',              //地图坐标系
    //projection: 'LatLng',
    initZoom:1,            //初始显示级别
    minZoom:6,             //最小可显示级别
    maxZoom:18,            //最大可显示级别
    selectionMutex: true,    //不同图层间的要素选择是否互斥，如果设为true，则每次只能选中单个要素
    showFrameRate: false,     //在网页右上角显示场景刷新率图标（仅对三维场景有效）
    pyramidId: "OSM",
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