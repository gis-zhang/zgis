/**
 * Created by Administrator on 2015/11/2.
 */
Z.TDTVectorAnnoLayer = Z.AbstractTDTLayer.extend({
    initialize: function(){
        var urlArray = [(Z.Globe.proxy || "") + "/cva_c/wmts"];

        var tdtOptions = {
            layer: 'cva',
            style: 'default',
            format: 'tiles',
            tilematrixSet: 'c'//,
            //attribution: '天地图'
        };

        Z.AbstractTDTLayer.prototype.initialize.call(this, urlArray, tdtOptions);
    }
});