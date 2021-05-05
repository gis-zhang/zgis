L.TileLayer.TDT = L.TileLayer.WMTS.extend({
    urlArray: [],

    tdtOptions: {},

    initialize: function (url, options) { // (String, Object)
        //L.CustomTileLayer.initialize.call(this, url, options);

        this._url = this.urlArray;
        options = this.tdtOptions;

        var wmtsParams = L.extend({}, this.defaultWmtsParams),
        tileSize = options.tileSize || this.options.tileSize;
        if (options.detectRetina && L.Browser.retina) {
            wmtsParams.width = wmtsParams.height = tileSize * 2;
        } else {
            wmtsParams.width = wmtsParams.height = tileSize;
        }
        for (var i in options) {
            // all keys that are not TileLayer options go to WMTS params
            if (!this.options.hasOwnProperty(i) && i != "matrixIds") {
                wmtsParams[i] = options[i];
            }
        }
        this.wmtsParams = wmtsParams;
        L.setOptions(this, options);

        this.options.tileWidth = this.options.tileWidth || this.options.tileSize;
        this.options.tileHeight = this.options.tileHeight || this.options.tileSize;

        //this.options.tileHeight *= 0.5;
    }
});

L.TileLayer.TDT.Vector = L.TileLayer.TDT.extend({
    urlArray: ["http://t0.tianditu.com/vec_c/wmts",
        "http://t1.tianditu.com/vec_c/wmts",
        "http://t2.tianditu.com/vec_c/wmts",
        "http://t3.tianditu.com/vec_c/wmts"],

    tdtOptions: {
        layer: 'vec',
        style: 'default',
        format: 'tiles',
        tilematrixSet: 'c'//,
        //attribution: '天地图'
    }
});

L.TileLayer.TDT.VectorAnno = L.TileLayer.TDT.extend({
    urlArray: ["http://t0.tianditu.com/cva_c/wmts", 
        "http://t1.tianditu.com/cva_c/wmts", 
        "http://t2.tianditu.com/cva_c/wmts",
        "http://t3.tianditu.com/cva_c/wmts"],

    tdtOptions: {
        layer: 'cva',
        style: 'default',
        format: 'tiles',
        tilematrixSet: 'c'//,
        //attribution: '天地图'
    }
});

L.TileLayer.TDT.Raster = L.TileLayer.TDT.extend({
    urlArray: ["http://t0.tianditu.com/img_c/wmts",
        "http://t1.tianditu.com/img_c/wmts",
        "http://t2.tianditu.com/img_c/wmts",
        "http://t3.tianditu.com/img_c/wmts"],

    tdtOptions: {
        layer: 'img',
        style: 'default',
        format: 'tiles',
        tilematrixSet: 'c'//,
        //attribution: '天地图'
    }
});

L.TileLayer.TDT.RasterAnno = L.TileLayer.TDT.extend({
    urlArray: ["http://t0.tianditu.com/cia_c/wmts",
        "http://t1.tianditu.com/cia_c/wmts",
        "http://t2.tianditu.com/cia_c/wmts",
        "http://t3.tianditu.com/cia_c/wmts"],

    tdtOptions: {
        layer: 'cia',
        style: 'default',
        format: 'tiles',
        tilematrixSet: 'c'//,
        //attribution: '天地图'
    }
});


