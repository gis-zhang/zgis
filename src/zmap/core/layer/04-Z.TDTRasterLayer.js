/**
 * Created by Administrator on 2015/11/2.
 */
Z.TDTRasterLayer = Z.AbstractTDTLayer.extend({
    initialize: function(){
        var urlArray = [(Z.Globe.proxy || "") + "/img_c/wmts"];

        var tdtOptions = {
            layer: 'img',
            style: 'default',
            format: 'tiles',
            tilematrixSet: 'c'//,
            //attribution: '天地图'
        };


        Z.AbstractTDTLayer.prototype.initialize.call(this, urlArray, tdtOptions);
    }
});