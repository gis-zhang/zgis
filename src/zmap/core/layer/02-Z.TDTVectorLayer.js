/**
 * Created by Administrator on 2015/11/2.
 */
//Z.TDTVectorLayer = Z.TileLayer.extend({
Z.TDTVectorLayer = Z.AbstractTDTLayer.extend({
    initialize: function(token){
        var urlArray = [(Z.Globe.TDTProxy || "") + "/vec_c/wmts"];

        var tdtOptions = {
            layer: 'vec',
            style: 'default',
            format: 'tiles',
            tilematrixSet: 'c'//,
            //attribution: '天地图'
        };

        if(token){
            tdtOptions.token = token;
        }

        Z.AbstractTDTLayer.prototype.initialize.call(this, urlArray, tdtOptions);
    }
});