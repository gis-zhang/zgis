//L.TileLayer.WMTS = L.TileLayer.extend({
L.TileLayer.WMTS = L.CustomTileLayer.extend({
    defaultWmtsParams: {
        service: 'WMTS',
        request: 'GetTile',
        version: '1.0.0',
        layer: '',
        style: '',
        tilematrixSet: '',
        format: 'image/jpeg'
    },

    initialize: function (url, options) { // (String, Object)
        //L.CustomTileLayer.initialize.call(this, url, options);

        this._url = url instanceof Array ? url : [url];
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

        this.options.tileWidth = this.options.tileWidth || this.options.tileSize || tileSize || 256;
        this.options.tileHeight = this.options.tileHeight || this.options.tileSize || tileSize || 256;
    },

    onAdd: function (map) {
        L.TileLayer.prototype.onAdd.call(this, map);
    },

    getTileUrl: function (tilePoint) {
        var url = this._url[(tilePoint.x + tilePoint.y) % this._url.length];
        return url + L.Util.getParamString(this.wmtsParams, url) +
            "&tilematrix=" + tilePoint.z +
            "&tilerow=" + tilePoint.y +
            "&tilecol=" + tilePoint.x;
    },

    setParams: function (params, noRedraw) {
        L.extend(this.wmtsParams, params);
        if (!noRedraw) {
            this.redraw();
        }
        return this;
    }
});

L.tileLayer.wmts = function (url, options) {
    return new L.TileLayer.WMTS(url, options);
};
