/**
 * Created by Administrator on 2015/11/2.
 */
//Z.WMTSTileRender3D = Z.TileRender3D.extend({
Z.WMTSTileRender3D = Z.TileAggregatedRender3D.extend({
    //initialize: function(urls, options){
    //    //Z.TileRender3D.prototype.initialize.apply(this, arguments);
    //    //Z.Util.applyOptions(this._options, options, true);
    //    Z.TileAggregatedRender3D.prototype.initialize.apply(this, arguments);
    //},

    getTileUrl: function(level, row, col){
        var url = this._urls[(row + col)%this._urls.length],
            params = this._getWMTSGetTileParams(level, row, col);

        return url + Z.Util.getParamString(params);
    },

    _getWMTSGetTileParams: function(level, row, col){
        var params = {
            service: 'WMTS',
            request: 'GetTile',
            version: '1.0.0',
            layer: '',
            style: 'default',
            tilematrixSet: '',
            format: 'image/jpeg'
        };

        Z.Util.applyOptions(params, this._options.params, false);

        params.tileMatrix = level;
        params.tileRow = row;
        params.tileCol = col;
        params.format = params.format || this._options.tileInfo.format;

        return params;
    }
});