/**
 * Created by Administrator on 2015/12/2.
 */
Z.JsonBuildingLoader = Z.AbstractBuildingLoader.extend({
    initialize: function(json, root){
        this.json = json || "";
        this.root = root;
    },

    load: function(callback, recursive){
        if(!(callback instanceof Function)){
            return;
        }

        var data = this.json;

        if(typeof data === "string" && data.length > 0){
            if(JSON){
                data = JSON.parse(data);
            }else{
                data = eval('(' + data + ')');
            }
        }

        if(this.root && data[this.root]){
            data = data[this.root];
        }

        if(!(data instanceof Array)){
            data = [data];
        }

        callback(data);
    }
});
