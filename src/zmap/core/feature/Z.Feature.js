/**
 * Created by Administrator on 2015/12/2.
 */
Z.Feature = Z.Class.extend({
    initialize: function(props, shape, options){
        this.props = props || {};
        this.shape = shape;
        //this.options = options || {};
        //this.options =  Z.Util.applyOptions({
        //    cw: false   //cw为false表示坐标顺序为逆时针，否则为顺时针
        //}, options, true);
    },

    clone: function(){
        var newProps = {};

        if(this.props){
            for(var key in this.props){
                newProps[key] = this.props[key];
            }
        }

        var newShape = null;

        if(this.shape){
            newShape = this.shape.clone();
        }

        var newOptions = Z.Util.applyOptions({}, this.options, true);
        var newFeature = new Z.Feature(newProps, newShape, newOptions);

        return newFeature;
    }
});