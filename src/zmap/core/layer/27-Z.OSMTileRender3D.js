/**
 * Created by Administrator on 2015/11/2.
 */
Z.OSMTileRender3D = Z.TileAggregatedRender3D.extend({
    getTileUrl: function(level, row, col){
        var url = this._urls[(row + col)%this._urls.length];

        return url + "/" + level + "/" + col + "/" + row + ".png";
    }
});