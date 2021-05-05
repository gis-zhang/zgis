/**
 * Created by Administrator on 2015/11/2.
 */
Z.OSMTileLayer = Z.TileLayer.extend({
    initialize: function(urls, options){
        urls = ["/v3/osmbuildings.kbpalbpk"];

        //var tileInfo = {
        //    //origin:new Z.LatLng(85.05113, -180),   //85.05112877980659
        //    origin:new Z.LatLng(20037508.3427892, -20037508.3427892),   //85.05112877980659
        //    tileWidth: 256,
        //    tileHeight: 256
        //    //levelDefine: [
        //    //    { "level": 0, "resolution": 1.40782880508533, "scale": 591658710.9 },
        //    //    { "level": 1, "resolution": 0.70312500000011879, "scale": 295497593.05879998 },
        //    //    { "level": 2, "resolution": 0.3515625000000594, "scale": 147748796.52939999 },
        //    //    { "level": 3, "resolution": 0.1757812500000297, "scale": 73874398.264699996 },
        //    //    { "level": 4, "resolution": 0.087890625000014849, "scale": 36937199.132349998 },
        //    //    { "level": 5, "resolution": 0.043945312500007425, "scale": 18468599.566174999 },
        //    //    { "level": 6, "resolution": 0.021972656250003712, "scale": 9234299.7830874994 },
        //    //    { "level": 7, "resolution": 0.010986328125001856, "scale": 4617149.8915437497 },
        //    //    { "level": 8, "resolution": 0.0054931640625009281, "scale": 2308574.9457718749 },
        //    //    { "level": 9, "resolution": 0.002746582031250464, "scale": 1154287.4728859374 },
        //    //    { "level": 10, "resolution": 0.001373291015625232, "scale": 577143.73644296871 },
        //    //    { "level": 11, "resolution": 0.00068664550781261601, "scale": 288571.86822148436 },
        //    //    { "level": 12, "resolution": 0.000343322753906308, "scale": 144285.934110742183 },
        //    //    { "level": 13, "resolution": 0.000171661376953154, "scale": 72142.967055371089 },
        //    //    { "level": 14, "resolution": 8.5830688476577001e-005, "scale": 36071.483527685545 },
        //    //    { "level": 15, "resolution": 4.2915344238288501e-005, "scale": 18035.741763842772 },
        //    //    { "level": 16, "resolution": 2.145767211914425e-005, "scale": 9017.8708819213862 },
        //    //    { "level": 17, "resolution": 1.0728836059572125e-005, "scale": 4508.9354409606931 },
        //    //    { "level": 18, "resolution": 5.3644180297860626e-006, "scale": 2254.4677204803465 },
        //    //    { "level": 19, "resolution": 2.6822090148930313e-006, "scale": 1127.2338602401733 },
        //    //    { "level": 20, "resolution": 1.3411045074465156e-006, "scale": 563.61693012008664 }
        //    //]
        //};
        //
        //options = options || {};
        //options.tileInfo = tileInfo;
        //options.crs = "EPSG3857";

        options = options || {};
        options.pyramidId = "OSM";

        Z.TileLayer.prototype.initialize.call(this, urls, options);    //调用超类的构造函数
    },

    getTileRender2D: function(urls, options){
        //return new Z.WMTSTileRender2D(urls, options);
        throw Error("不支持的操作");
    },

    getTileRender3D: function(urls, options){
        return new Z.OSMTileRender3D(urls, options);
    }
});