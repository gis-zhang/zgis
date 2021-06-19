/**
 * Created by Administrator on 2015/11/2.
 */
Z.TDTRasterAnnoLayer = Z.AbstractTDTLayer.extend({
    initialize: function(token){
        var urlArray = [(Z.Globe.TDTProxy || "") + "/cia_c/wmts"];

        var tdtOptions = {
            layer: 'cia',
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