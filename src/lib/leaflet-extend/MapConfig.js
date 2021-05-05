application_url_prefix = "http://localhost:808";

//application_url_prefix = window.location.protocol + "://" + window.location.host + 
//                            window.location.port?window.location.port:"";
   
    /**
     * 地图配置
     */
    MapConfig = {
        crs: 'perspective',                  //EPSG3857, EPSG4326, simple, custom、perspective
        //center: { lat: 36.86, lng: 117 },        //y,x
        //center: { lat: 31.5788, lng: 120.2978 },
        center: { lat: 32.0362, lng: 118.7304 },
        zoom: 16,
        minZoom: 1,
        maxZoom: 20/*,
        maxBounds: [[30, 100], [44, 135]] */       //[[south, west],[north, east]]
    };

    /**
    * 底图配置
    */
    MapConfig.baseLayers = [
        {
            label: '矢量',
            layer: [
                { type: 'TDTVector', url: '', params: {} },          //type:WMTS、WMS、TDTVector、TDTVectorAnno、TDTRaster、TDTRasterAnno
                {type: 'TDTVectorAnno', url: '', params: {} } 
            ]
        }, {
            label: '影像',
            layer: [
                { type: 'TDTRaster', url: '', params: {} },
                { type: 'TDTRasterAnno', url: '', params: {} }
            ]
        }, {
            label: '三维',
            link: 'http://'
        }
    ];

    /**
    * 鹰眼配置
    */
    MapConfig.miniMap = {
        show: true,
        layer: { type: 'TDTVector', url: '', params: {} }
    }

    /**
    * 地图原点与缩放级别配置
    */
    MapConfig.levelDefine = {
        origin: {
            lat:90, lng: -180
        },
        lod:[
                { "level": 0, "resolution": 1.40782880508533, "scale": 591658710.9 },
                { "level": 1, "resolution": 0.70312500000011879, "scale": 295497593.05879998 },
                { "level": 2, "resolution": 0.3515625000000594, "scale": 147748796.52939999 },
                { "level": 3, "resolution": 0.1757812500000297, "scale": 73874398.264699996 },
                { "level": 4, "resolution": 0.087890625000014849, "scale": 36937199.132349998 },
                { "level": 5, "resolution": 0.043945312500007425, "scale": 18468599.566174999 },
                { "level": 6, "resolution": 0.021972656250003712, "scale": 9234299.7830874994 },
                { "level": 7, "resolution": 0.010986328125001856, "scale": 4617149.8915437497 },
                { "level": 8, "resolution": 0.0054931640625009281, "scale": 2308574.9457718749 },
                { "level": 9, "resolution": 0.002746582031250464, "scale": 1154287.4728859374 },
                { "level": 10, "resolution": 0.001373291015625232, "scale": 577143.73644296871 },
                { "level": 11, "resolution": 0.00068664550781261601, "scale": 288571.86822148436 },
                { "level": 12, "resolution": 0.000343322753906308, "scale": 144285.934110742183 },
                { "level": 13, "resolution": 0.000171661376953154, "scale": 72142.967055371089 },
                { "level": 14, "resolution": 8.5830688476577001e-005, "scale": 36071.483527685545 },
                { "level": 15, "resolution": 4.2915344238288501e-005, "scale": 18035.741763842772 },
                { "level": 16, "resolution": 2.145767211914425e-005, "scale": 9017.8708819213862 },
                { "level": 17, "resolution": 1.0728836059572125e-005, "scale": 4508.9354409606931 },
                { "level": 18, "resolution": 5.3644180297860626e-006, "scale": 2254.4677204803465 },
                { "level": 19, "resolution": 2.6822090148930313e-006, "scale": 1127.2338602401733 },
                { "level": 20, "resolution": 1.3411045074465156e-006, "scale": 563.61693012008664 },
                { "level": 21, "resolution": 0.6705522537232578e-006, "scale": 281.80846506004332 },
                { "level": 22, "resolution": 0.3352761268616289e-006, "scale": 140.90423253002166 },
                { "level": 23, "resolution": 0.16763806343081445e-006, "scale": 70.45211626501083 }
            ]
    }

    /**
    * 控件
    */
    MapConfig.zoomSlider = {
        type:'slider'               //small、silder、false
    }