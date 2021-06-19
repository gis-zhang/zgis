/**
 * Created by Administrator on 2015/11/2.
 */
Z.TDTRasterLayer = Z.AbstractTDTLayer.extend({
    initialize: function(token){
        var urlArray = [(Z.Globe.TDTProxy || "") + "/img_c/wmts"];

        var tdtOptions = {
            layer: 'img',
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