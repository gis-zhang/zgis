/**
 * Created by Administrator on 2015/11/2.
 */
//Z.WMTSTileRender3D = Z.TileRender3D.extend({
Z.TemplateTileRender3D = Z.TileAggregatedRender3D.extend({
    //initialize: function(urls, options){
    //    //Z.TileRender3D.prototype.initialize.apply(this, arguments);
    //    //Z.Util.applyOptions(this._options, options, true);
    //    Z.TileAggregatedRender3D.prototype.initialize.apply(this, arguments);
    //},

    getTileUrl: function(level, row, col){
        var url = this._urls[(row + col)%this._urls.length];
            //params = this._getWMTSGetTileParams(level, row, col);

        //return url + Z.Util.getParamString(params);
        url = url.replace("{level}", this._getLevelExpress(level));
        url = url.replace("{row}" , this._getRowExpress(row));
        url = url.replace("{col}" , this._getColExpress(col));

        return url;
    },

    _getLevelExpress: function(level){
        var levelString = level + "";

        if(levelString.length === 1){
            return "L0" + levelString;
        }else{
            return "L" + levelString
        }
    },

    _getRowExpress: function(row){
        var rowString = row.toString(16) + "";

        if(rowString.length > 8){
            return "R" + rowString;
        }else{
            var count = 8 - rowString.length;

            for(var i = 0; i < count; i++){
                rowString = "0" + rowString;
            }

            return "R" + rowString;
        }
    },

    _getColExpress: function(col){
        var colString = col.toString(16) + "";

        if(colString.length > 8){
            return "C" + colString;
        }else{
            var count = 8 - colString.length;

            for(var i = 0; i < count; i++){
                colString = "0" + colString;
            }

            return "C" + colString;
        }
    },

    //_getWMTSGetTileParams: function(level, row, col){
    //    var params = {
    //        service: 'WMTS',
    //        request: 'GetTile',
    //        version: '1.0.0',
    //        layer: '',
    //        style: 'default',
    //        tilematrixSet: '',
    //        format: 'image/jpeg'
    //    };
    //
    //    Z.Util.applyOptions(params, this._options.params, false);
    //
    //    params.tileMatrix = level;
    //    params.tileRow = row;
    //    params.tileCol = col;
    //    params.format = params.format || this._options.tileInfo.format;
    //
    //    return params;
    //}
});