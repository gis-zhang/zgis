/**
 * Created by Administrator on 2015/11/2.
 */
//Z.TDTVectorLayer = Z.TileLayer.extend({
Z.TDTVectorLayer = Z.AbstractTDTLayer.extend({
    initialize: function(){
        var urlArray = [(Z.Globe.proxy || "") + "/vec_c/wmts"];

        var tdtOptions = {
            layer: 'vec',
            style: 'default',
            format: 'tiles',
            tilematrixSet: 'c'//,
            //attribution: '天地图'
        };

        Z.AbstractTDTLayer.prototype.initialize.call(this, urlArray, tdtOptions);
    }
});