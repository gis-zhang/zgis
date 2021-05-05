/**
 * Created by Administrator on 2015/11/2.
 */
Z.BDTileRender3D = Z.TileAggregatedRender3D.extend({
    getTileUrl: function(level, row, col){
        var url = this._urls[(row + col)%this._urls.length];

        //http://online1.map.bdimg.com/onlinelabel/?qt=tile&x=1649&y=444&z=13&styles=pl&udt=20170216&scaler=1&p=0

        row = row >= 0 ? row : ("M" + Math.abs(row));
        col = col >= 0 ? col : ("M" + Math.abs(col));

        return url + "?qt=tile" +
            "&x=" + col +
            "&y=" + row +
            "&z=" + level +
            "&styles=pl&scalear=1&p=0";
    }
});