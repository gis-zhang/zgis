/**
 * Created by Administrator on 2015/11/2.
 */
//Z.WMTSTileRender3D = Z.TileRender3D.extend({
Z.TDTTileRender3D = Z.WMTSTileRender3D.extend({
    //initialize: function(urls, options){
    //    //Z.TileRender3D.prototype.initialize.apply(this, arguments);
    //    //Z.Util.applyOptions(this._options, options, true);
    //    Z.TileAggregatedRender3D.prototype.initialize.apply(this, arguments);
    //},

    getTileUrl: function(level, row, col){
        // var url = this._urls[(row + col)%this._urls.length],
        //     params = this._getWMTSGetTileParams(level, row, col);

        // return url + Z.Util.getParamString(params);
        var url = Z.WMTSTileRender3D.prototype.getTileUrl.apply(this, arguments);
        
        if(this._options.params.token){
            url += ("&tk=" + this._options.params.token);
        }

        return url;
    }
});